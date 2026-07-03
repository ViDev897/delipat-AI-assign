# Running Delipat Lead Management Locally in VS Code

This walks through getting the app running on your machine end-to-end: cloning, installing, configuring the database and AI key, and launching inside VS Code.

## 0. Prerequisites

Install these once, if you don't already have them:

| Tool | Check you have it | Install |
|---|---|---|
| Node.js 18+ | `node -v` | [nodejs.org](https://nodejs.org) |
| npm | `npm -v` (comes with Node) | — |
| MySQL 8+ | `mysql --version` | [dev.mysql.com](https://dev.mysql.com/downloads/) or use a free cloud instance (Railway/PlanetScale) — see Step 3 |
| VS Code | — | [code.visualstudio.com](https://code.visualstudio.com) |
| Git | `git --version` | [git-scm.com](https://git-scm.com) |

## 1. Get the code into VS Code

**Option A — unzip the provided file:**
```bash
unzip delipat-lead-system.zip
cd delipat-lead-system
code .
```

**Option B — if you've pushed it to GitHub already:**
```bash
git clone https://github.com/<your-username>/delipat-lead-system.git
cd delipat-lead-system
code .
```

`code .` opens the folder in VS Code. If that command isn't recognized, open VS Code manually and use **File → Open Folder**.

## 2. Recommended VS Code extensions

VS Code will likely prompt you automatically, but install these for the best experience:

- **Prisma** (`Prisma.prisma`) — syntax highlighting + autocomplete for `schema.prisma`
- **ESLint** (`dbaeumer.vscode-eslint`) — surfaces the lint rules in `.eslintrc.json` inline
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) — autocomplete for the utility classes used throughout `components/` and `app/`

Install via the Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`) and search each name, or run:
```bash
code --install-extension Prisma.prisma
code --install-extension dbaeumer.vscode-eslint
code --install-extension bradlc.vscode-tailwindcss
```

## 3. Set up MySQL

**Fastest path (no local install): a free cloud MySQL instance**
1. Go to [railway.app](https://railway.app) → **New Project → Provision MySQL**
2. Copy the connection string it gives you (looks like `mysql://root:pass@containers-us-west-x.railway.app:1234/railway`)

**Local install path:**
```bash
# macOS (Homebrew)
brew install mysql
brew services start mysql

# Then create a database:
mysql -u root -p
mysql> CREATE DATABASE delipat_leads;
mysql> exit
```
Your connection string will be: `mysql://root:<your-password>@localhost:3306/delipat_leads`

## 4. Configure environment variables

In the VS Code terminal (`` Ctrl+` ``):
```bash
cp .env.example .env.local
```

Open `.env.local` in the editor and fill in:
```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/delipat_leads"
ANTHROPIC_API_KEY="sk-ant-..."          # from console.anthropic.com
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="youremail@gmail.com"
SMTP_PASS="your-16-char-app-password"    # NOT your regular Gmail password
SENDER_EMAIL="youremail@gmail.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Getting a Gmail app password** (needed because Gmail blocks regular-password SMTP login):
1. Enable 2-Step Verification on your Google account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generate a password for "Mail" — use that 16-character string as `SMTP_PASS`

**Getting an Anthropic API key:**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up / log in → **API Keys → Create Key**
3. Paste it as `ANTHROPIC_API_KEY`

> `.env.local` is already in `.gitignore` — it will never get committed. Never share this file or commit real keys.

## 5. Install dependencies

```bash
npm install
```

This installs Next.js, React, Prisma, the Anthropic SDK, Tailwind, and everything else in `package.json`.

## 6. Create the database tables

```bash
npm run prisma:migrate
```

This reads `prisma/schema.prisma` and creates the `Lead`, `Qualification`, `Email`, and `Metrics` tables in your MySQL database. You'll be prompted to name the migration — anything like `init` works.

To visually confirm the tables exist:
```bash
npm run prisma:studio
```
This opens a browser GUI at `http://localhost:5555` showing your empty tables.

## 7. Run the app

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
```

Open **http://localhost:3000** in your browser. Submit a test lead through the form, then visit **http://localhost:3000/crm** to see it show up with an AI-generated score.

## 8. Debugging inside VS Code (optional but useful)

Create `.vscode/launch.json` so you can set breakpoints directly in your API routes:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    }
  ]
}
```

Then use **Run → Start Debugging** (`F5`). You can now set a breakpoint inside `app/api/leads/route.ts` or `lib/ai-service.ts` and step through what happens when a lead is submitted.

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| `Error: P1001: Can't reach database server` | MySQL isn't running, or `DATABASE_URL` is wrong | Confirm MySQL is running (`brew services list`) and the connection string matches |
| Form submits but no AI score appears | `ANTHROPIC_API_KEY` missing/invalid, or rate-limited | Check terminal logs for the error; lead creation still succeeds even if AI qualification fails (by design) |
| No acknowledgement email arrives | Wrong `SMTP_PASS` (using regular password instead of app password), or landed in spam | Double check the 16-character app password; check spam folder |
| `Module not found` errors on `npm run dev` | `npm install` didn't finish or `node_modules` is stale | Delete `node_modules` and `package-lock.json`, re-run `npm install` |
| Port 3000 already in use | Another process is using it | `npm run dev -- -p 3001` to use a different port |

## Quick command reference

```bash
npm run dev              # start local dev server (localhost:3000)
npm run build            # production build (run this before deploying)
npm run start            # run the production build locally
npm run prisma:studio    # visual database browser
npm run prisma:migrate   # apply schema changes to the database
npm run lint             # check code against .eslintrc.json rules
```
