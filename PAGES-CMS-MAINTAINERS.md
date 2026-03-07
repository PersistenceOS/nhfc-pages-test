# Pages CMS – Maintainer setup

This repo is configured so **maintainers** can manage the NHFC tournament (roster, matches, event settings) via [Pages CMS](https://app.pagescms.org/) instead of editing JSON by hand.

## What maintainers can do in the CMS

- **Roster** – Add/remove fighters, set names, roles, records, OSRS name, Discord fields, bio, eliminated.
- **Matches** – Edit the bracket (match IDs, rounds, fighter1/fighter2), set the **winner** when a match is decided.
- **Event config** – Set series number, rounds per fight, round duration, championship rounds.

## How to add a maintainer

1. **Give them access to the GitHub repo**
   - Repo: [PersistenceOS/nhfc-pages-test](https://github.com/PersistenceOS/nhfc-pages-test)
   - Go to **Settings** → **Collaborators** (or **Collaborators and teams**).
   - Click **Add people** and add their **GitHub username** or email.
   - Choose role **Write** (or **Maintain** if your repo has that). They need push access so the CMS can commit changes.

2. **They open the CMS**
   - They go to **[https://app.pagescms.org/](https://app.pagescms.org/)** and sign in with **GitHub**.
   - After signing in, they choose the repo **PersistenceOS/nhfc-pages-test** and branch **main**.
   - They'll see **Roster**, **Matches**, and **Event config** in the sidebar. Edits are saved as commits to the repo.

3. **Optional: send them the direct link**
   - [https://app.pagescms.org/PersistenceOS/nhfc-pages-test/main](https://app.pagescms.org/PersistenceOS/nhfc-pages-test/main) – they must be logged in with a GitHub account that has access to the repo.

## Notes

- **Discord sync**: If you use the "Sync Discord roster" GitHub Action, it updates `roster.json` from Discord. The CMS uses **merge** mode so fields the sync adds (e.g. Discord name/avatar) are kept when a maintainer edits other fields.
- **Fighter names in matches**: In **Matches**, **Fighter 1** and **Fighter 2** must match the **Name** of a fighter in **Roster** so the site can show avatars and records. **Winner** must match one of those two names when the match is decided.
