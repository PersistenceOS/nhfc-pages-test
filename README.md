# NHFC – No Honor Fighting Championship

Roster site for the NHFC, hosted on GitHub Pages and editable via [Pages CMS](https://pagescms.org/). Event and fighter roster follow an MMA-style format (series number, rounds, championship rounds).

## Local preview

Open `index.html` in a browser, or serve the folder with any static server (e.g. `npx serve .`). The roster is loaded from `roster.json` and event info (series, rounds) from `config.json`; if files are missing, placeholder data is used.

## Event config

Edit `config.json` to set the current series and round format:

- `series_number` – event/series number (e.g. 1 for NHFC 1)
- `rounds` – number of rounds per fight
- `round_duration_min` – minutes per round (e.g. 15 minute rounds)
- `championship_rounds` – rounds for championship bouts

## Roster data

Edit `roster.json` to add or remove fighters. In Pages CMS, users can enter names, titles, and the optional fields below. Each entry can have:

- `name` – display name (required for the card to show a name)
- `role` – optional; **default is "Contender"**. Title shown under the name (e.g. Veteran, Challenger, Champion).
- `tier` – optional number for tree order (1 = Champion, 2 = Veterans, 3 = Contenders, 4 = Challengers). If omitted, tier is inferred from `role` (default tier is 3, Contenders).
- `record` – optional; e.g. `"12-2-0"` (W-L-D), shown in accent color on the card
- `osrs_name` – optional; the player's OSRS in-game username. Shown as "OSRS: …" on roster and 1v1 match cards so matchups show Discord name vs Discord name with in-game names underneath.
- `bio` – optional; short description, shown below the record (max 2 lines)
- `avatar_url` – optional image URL for the fighter’s icon (can be any image URL, including Discord’s CDN; see below).
- **Discord** (optional): link the fighter’s icon to their Discord profile and/or use their Discord avatar:
  - `discord_username` – Discord username (e.g. `grixis105`). When set, the icon links to `https://discord.com/users/{username}`. Easiest if you only know the username.
  - `discord_user_id` – Discord numeric user ID. Use if the username-based link doesn’t work or for the avatar CDN. (Developer Mode → right‑click user → Copy User ID.)
  - `discord_profile_url` – full Discord profile URL. Used for the link if set (after `discord_user_id`, before `discord_username`).
  - `discord_avatar_hash` – with `discord_user_id`, the site loads the avatar from Discord’s CDN. Or set `avatar_url` to any image URL (e.g. Discord avatar image URL) to show their picture.
- `eliminated` – optional boolean; when true, the fighter card shows an "ELIMINATED" overlay and a smooth exit-style animation (dimmed, no hover).

Example:

```json
{
  "entries": [
    {
      "name": "PlayerName",
      "role": "Champion",
      "tier": 1,
      "record": "8-1-0",
      "bio": "Short description or tagline.",
      "avatar_url": "https://example.com/avatar.png",
      "discord_user_id": "123456789012345678",
      "discord_avatar_hash": "a1b2c3d4e5f6..."
    }
  ]
}
```

For Discord: use `discord_user_id` so the icon links to their profile. To get a user ID: enable Developer Mode in Discord (Settings → App Settings → Advanced), then right‑click the user → Copy User ID. For the avatar image, either set `avatar_url` to the Discord CDN URL (e.g. from a bot or copy image address) or set `discord_avatar_hash` with `discord_user_id` so the site loads the avatar from Discord’s CDN.

The roster is shown as a **tree layout**: one row per tier (Champion at top, then Veterans, Contenders, Challengers), with connector lines between tiers.

### Sync roster from Discord

You can have **contenders from your Discord server** appear on the roster with their **Discord name and profile picture** automatically. The site layout stays the same; the sync only fills in roster data from Discord.

1. **Create a Discord bot** (host or admin):
   - Go to [Discord Developer Portal](https://discord.com/developers/applications) → New Application → name it (e.g. “NHFC Roster”).
   - Open **Bot** → Add Bot. Copy the **Token** (you’ll add it as a secret).
   - Under **Privileged Gateway Intents**, enable **Server Members Intent** (required to list server members).
   - Open **OAuth2** → URL Generator. Scopes: `bot`. Bot permissions: **Read Message History** (or minimal you prefer; we only use “View Server Members” via the intent). Copy the generated URL, open it in a browser, and add the bot to your **Discord server** (the one where your contenders are).

2. **Get your server (guild) ID**:
   - In Discord: enable Developer Mode (Settings → App Settings → Advanced → Developer Mode).
   - Right‑click your server name in the left sidebar → **Copy Server ID**. That’s `DISCORD_GUILD_ID`.

3. **Add GitHub secrets** (repo → Settings → Secrets and variables → Actions):
   - `DISCORD_BOT_TOKEN` — the bot token from step 1.
   - `DISCORD_GUILD_ID` — the server ID from step 2.
   - (Optional) `DISCORD_ROLE_NAME` — e.g. `Contender`. If set, only members with this role are synced; if unset, all server members are synced.

4. **Run the sync**:
   - Push the repo (with the `.github/workflows/sync-discord-roster.yml` and `scripts/sync-discord-roster.js` files).
   - In GitHub: **Actions** → **Sync Discord roster** → **Run workflow**. The workflow will fetch members from Discord and update `roster.json`; it commits and pushes if anything changed.
   - The workflow also runs on a schedule (every 6 hours) so the roster stays in sync.

**Merge behavior:** Entries in `roster.json` that have **no** `discord_user_id` (manual-only) are left unchanged and stay on the roster. For everyone else: if someone is already in the roster with the same `discord_user_id`, their existing `osrs_name`, `record`, `bio`, `role`, `tier`, and `eliminated` are kept and only their Discord name and avatar are updated. New members from Discord get default `role: "Contender"` and `tier: 3`; you can edit those in Pages CMS or in `roster.json` after the sync.

**Local run (optional):** From the repo root, with the same env vars set:  
`node scripts/sync-discord-roster.js`

## Event lineup and matches

The **main page** shows an **Event Lineup** section first: all matches grouped by round (Quarterfinals → Semifinals → Final). Each match links to a **1v1 match page** (`match.html?id=<match_id>`).

Edit `matches.json` to define the bracket. Each match has:

- `id` – unique slug used in the URL (e.g. `q1`, `s1`, `final`)
- `round` – display label (e.g. "Quarterfinal 1", "Semifinal 1", "Final")
- `round_order` – 1 = Quarterfinals, 2 = Semifinals, 3 = Final (controls grouping on main page)
- `fighter1`, `fighter2` – fighter names (must match `name` in `roster.json` for avatar/record to show)
- `winner` – set to the winning fighter’s name when the match is decided; main page and match page then show the result and highlight the winner

When you set `winner` for a match, the main page shows “Winner: [name]” on that match card and the match page shows a WINNER badge on the winning fighter. Update winners as matches complete to show progression through to the final.

### How to record who won a bracket (e.g. Player 1 vs Player 2)

1. Open `matches.json` (or edit it via Pages CMS if you've set up a content type for it).
2. Find the match (e.g. the object with `"id": "q2"` for Quarterfinal 2).
3. Set `"winner"` to the **exact** winner's name as in the roster (e.g. `"winner": "Fighter Two"`). Spelling must match `roster.json` and `fighter1`/`fighter2`.
4. Save the file (or publish in Pages CMS). The site will show "Winner: [name]" on that match and the 1v1 page will highlight the winner.

**Example** — Quarterfinal 2 ends, Fighter Two wins:

```json
{
  "id": "q2",
  "round": "Quarterfinal 2",
  "round_order": 1,
  "fighter1": "Fighter Two",
  "fighter2": "Fighter Four",
  "winner": "Fighter Two"
}
```

No build step: update the JSON and refresh. For semifinals/final, you can also set `fighter1`/`fighter2` to the advancing fighters, then set `winner` when that match finishes.

## GitHub Pages

Enable GitHub Pages for this repo (Settings → Pages → source: main branch, root or `/docs`). The site will serve `index.html` and load `roster.json` from the same origin.

## Pages CMS

Connect this repository to [Pages CMS](https://pagescms.org/) and configure content types for:

- **roster.json** — add/remove fighters, set names, roles, records, avatars, eliminated status.
- **matches.json** — set match pairings and, when a match ends, set the `winner` field so the site shows who won that bracket.

Your team can then update the event and roster through the CMS without editing JSON or Git directly.

---

## Project overview

| What | Where |
|------|--------|
| Event info (series, rounds) | `config.json` |
| Match bracket + winners | `matches.json` — set `winner` per match when decided |
| Fighter list + titles, records | `roster.json` |
| Main page (lineup + roster) | `index.html` |
| 1v1 match page | `match.html?id=<match_id>` |

**Possible improvements:** Configure Pages CMS to edit `matches.json` so non-technical users can set winners via the CMS UI; add a `CONTRIBUTING.md` or admin cheat sheet for your event runners; optionally validate that `winner` equals `fighter1` or `fighter2` when displaying.
