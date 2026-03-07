/**
 * Sync Discord server members into roster.json.
 * Preserves existing roster fields (osrs_name, record, bio, role, tier, eliminated)
 * and updates/adds Discord name and avatar from the server.
 *
 * Requires: DISCORD_BOT_TOKEN, DISCORD_GUILD_ID
 * Optional: DISCORD_ROLE_NAME — only include members with this role (e.g. "Contender")
 *
 * Run from repo root: node scripts/sync-discord-roster.js
 */

const fs = require('fs');
const path = require('path');

const DISCORD_API = 'https://discord.com/api/v10';
const ROSTER_PATH = path.join(__dirname, '..', 'roster.json');

const token = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;
const roleNameFilter = process.env.DISCORD_ROLE_NAME || '';

if (!token || !guildId) {
  console.error('Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID');
  process.exit(1);
}

async function request(endpoint) {
  const res = await fetch(DISCORD_API + endpoint, {
    headers: { Authorization: `Bot ${token}` },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Discord API ${res.status}: ${t}`);
  }
  return res.json();
}

async function fetchAllMembers() {
  const members = [];
  let after = '0';
  while (true) {
    const list = await request(
      `/guilds/${guildId}/members?limit=1000&after=${after}`
    );
    if (list.length === 0) break;
    members.push(...list);
    after = list[list.length - 1].user.id;
    if (list.length < 1000) break;
  }
  return members;
}

async function fetchGuildRoles() {
  return request(`/guilds/${guildId}/roles`);
}

function hasRole(member, roleName, rolesById) {
  if (!roleName) return true;
  const nameLower = roleName.toLowerCase();
  for (const roleId of member.roles || []) {
    const r = rolesById[roleId];
    if (r && r.name && r.name.toLowerCase() === nameLower) return true;
  }
  return false;
}

function buildRosterEntry(member, existing) {
  const u = member.user || {};
  const id = (u.id || '').toString();
  const username = (u.username || '').trim() || 'Unknown';
  const displayName = (u.global_name || u.username || '').trim() || username;
  const avatar = (u.avatar || '').toString();

  const entry = {
    name: displayName,
    discord_user_id: id,
    discord_username: username,
    ...(avatar && { discord_avatar_hash: avatar }),
  };

  if (existing) {
    if (existing.role !== undefined) entry.role = existing.role;
    if (existing.tier !== undefined) entry.tier = existing.tier;
    if (existing.record !== undefined) entry.record = existing.record;
    if (existing.bio !== undefined) entry.bio = existing.bio;
    if (existing.osrs_name !== undefined) entry.osrs_name = existing.osrs_name;
    if (existing.eliminated !== undefined) entry.eliminated = existing.eliminated;
  } else {
    entry.role = 'Contender';
    entry.tier = 3;
  }

  return entry;
}

async function main() {
  let existingRoster = { entries: [] };
  try {
    const raw = fs.readFileSync(ROSTER_PATH, 'utf8');
    existingRoster = JSON.parse(raw);
  } catch (e) {
    console.warn('No existing roster.json or invalid JSON, starting fresh');
  }

  const existingByDiscordId = new Map();
  const manualEntries = [];
  for (const e of existingRoster.entries || []) {
    const id = (e.discord_user_id || '').toString();
    if (id) existingByDiscordId.set(id, e);
    else manualEntries.push(e);
  }

  const [members, roles] = await Promise.all([
    fetchAllMembers(),
    fetchGuildRoles(),
  ]);

  const rolesById = {};
  for (const r of roles || []) rolesById[r.id] = r;

  const filtered = roleNameFilter
    ? members.filter((m) => hasRole(m, roleNameFilter, rolesById))
    : members;

  const byId = new Map();
  for (const m of filtered) {
    const id = (m.user && m.user.id || '').toString();
    if (!id) continue;
    const existing = existingByDiscordId.get(id);
    byId.set(id, buildRosterEntry(m, existing));
  }

  const keptFromRoster = (existingRoster.entries || []).filter(
    (e) => e.discord_user_id && byId.has(String(e.discord_user_id))
  );
  const orderIds = keptFromRoster.map((e) => String(e.discord_user_id));
  const newIds = [...byId.keys()].filter((id) => !orderIds.includes(id));

  const entries = [...manualEntries];
  for (const id of orderIds) {
    if (byId.has(id)) entries.push(byId.get(id));
  }
  for (const id of newIds) {
    entries.push(byId.get(id));
  }

  const out = { entries };
  fs.writeFileSync(ROSTER_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(
    `Synced ${entries.length} member(s) to roster.json${roleNameFilter ? ` (role: ${roleNameFilter})` : ''}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
