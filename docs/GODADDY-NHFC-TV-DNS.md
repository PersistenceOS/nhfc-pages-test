# Fix nhfc.tv DNS for GitHub Pages (GoDaddy)

**Error you had:** "Both nhfc.tv and its alternate name are improperly configured" / NotServedByPagesError — domain does not resolve to the GitHub Pages server.

**Cause:** Right now nhfc.tv and www.nhfc.tv point to other IPs (e.g. GoDaddy parking/forwarding), not GitHub.

---

## 1. Turn off forwarding in GoDaddy

- Go to [GoDaddy](https://www.godaddy.com) → **My Products** → **nhfc.tv** → **DNS** or **Manage**.
- If you have **Domain Forwarding** or **Forwarding** enabled for nhfc.tv or www.nhfc.tv, **turn it off**. Forwarding overrides DNS and stops GitHub from working.

---

## 2. Set DNS records in GoDaddy

In **DNS Management** for nhfc.tv:

### Apex (nhfc.tv – no www)

- **Delete** any existing **A** records for **@** that point to anything other than GitHub (e.g. 76.223.105.230, 13.248.243.5).
- **Add** these **4 A records** (one per row):

| Type | Name | Value           | TTL   |
|------|------|-----------------|--------|
| A    | @    | 185.199.108.153 | 600    |
| A    | @    | 185.199.109.153 | 600    |
| A    | @    | 185.199.110.153 | 600    |
| A    | @    | 185.199.111.153 | 600    |

- If GoDaddy only lets you add one **@** A record, add the other three as well (some UIs allow multiple same name/type).

### www (www.nhfc.tv)

- **Delete** any **CNAME** or **A** record for **www** that points elsewhere or to the apex.
- **Add** one **CNAME** record:

| Type  | Name | Value                  | TTL   |
|-------|------|------------------------|--------|
| CNAME | www  | PersistenceOS.github.io | 600  |

- **Value must be exactly:** `PersistenceOS.github.io` (your GitHub username; no `https://`, no path).

---

## 3. GitHub Settings

- Repo: **PersistenceOS/nhfc-pages-test** → **Settings** → **Pages**.
- **Custom domain:** Use **nhfc.tv** (apex) or **www.nhfc.tv** (www). Pick one as the primary; the other can still work if DNS is set as above.
- Click **Save**. Wait for DNS to propagate (often 10–30 minutes, sometimes up to 24 hours), then re-check.

---

## 4. Verify

After 15–30 minutes:

- **Apex:** `nslookup nhfc.tv` should show the four IPs: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153.
- **www:** `nslookup www.nhfc.tv` should show a CNAME to `PersistenceOS.github.io` (or an alias that resolves to GitHub).

Then GitHub’s “Check” should succeed and the error should go away.
