# Connect Discord bot to nhfc-pages-test

The site does **not** talk to Discord directly. A **GitHub Action** uses your Discord bot token to fetch server members and update `roster.json`. The website then shows that data.

## Step 1: Get the workflow on GitHub

The sync workflow must be in the repo. Either:

**A) Push it (if you have workflow scope)**  
From the project folder:
```bash
gh auth refresh -h github.com -s workflow
```
Complete the browser login, then:
```bash
git push origin main
```

**B) Add it on GitHub**  
1. Open: https://github.com/PersistenceOS/nhfc-pages-test/new/main?filename=.github/workflows/sync-discord-roster.yml  
2. Paste the contents of `.github/workflows/sync-discord-roster.yml` from your local project.  
3. Commit to `main`.

## Step 2: Create the Discord bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications) → **New Application** → name it (e.g. "NHFC Roster").
2. Open **Bot** → **Add Bot**. Copy the **Token** (you'll add it as a secret; keep it private).
3. Under **Privileged Gateway Intents**, turn on **Server Members Intent** (needed to list members).
4. Open **OAuth2** → **URL Generator**.  
   - Scopes: `bot`.  
   - Bot permissions: e.g. **View Server Members** (or "Read Message History" as minimum).  
   Copy the generated URL, open it in a browser, choose your server, and add the bot.

## Step 3: Get your server ID

1. In Discord: **Settings** → **App Settings** → **Advanced** → enable **Developer Mode**.
2. Right‑click your **server name** in the left sidebar → **Copy Server ID**. This is `DISCORD_GUILD_ID`.

## Step 4: Add GitHub secrets

1. Open: https://github.com/PersistenceOS/nhfc-pages-test/settings/secrets/actions  
2. **New repository secret** for each:

| Name                 | Value                                      |
|----------------------|--------------------------------------------|
| `DISCORD_BOT_TOKEN`  | The bot token from Step 2                   |
| `DISCORD_GUILD_ID`   | The server ID from Step 3                   |
| `DISCORD_ROLE_NAME`  | (Optional) e.g. `Contender` to sync only that role |

## Step 5: Run the sync

1. Open: https://github.com/PersistenceOS/nhfc-pages-test/actions  
2. Click **Sync Discord roster** in the left sidebar.  
3. **Run workflow** → **Run workflow**.  
4. When it finishes, `roster.json` will be updated with Discord members (names and avatar hashes). The site at https://persistenceos.github.io/nhfc-pages-test/ will show them after the next Pages build (or on refresh).

The workflow also runs every 6 hours on a schedule.
