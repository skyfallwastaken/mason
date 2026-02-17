# Help Thread Bot (Bun + TypeScript)

Slack help-thread bot using Bun, Bolt, Drizzle ORM, Postgres, ArkType, OpenAI, and jsx-slack.

## Features

- Watches a help channel and reacts with `:thinking_face:` on new tickets
- Replies with guidance text and a green `resolve!` button
- Resolves tickets via button or `?resolve`
- On resolve, replaces `:thinking_face:` with `:tw_white_check_mark:` on the root message
- `?dev` macro for BTS users: points to `#hackatime-help` and resolves
- Forwards tickets to a tickets channel and deletes forwarded copy on resolve
- Daily summary message to BTS at midnight UK time
- Thread title summarization through `openai` package (API URL and key from env)
- Biome linting and GitHub Actions CI
- Bun tests

## Setup

1. Install dependencies:

```bash
bun install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Edit `config/bot.config.yml` with channel IDs and `openaiModel`.

4. Start bot:

```bash
bun run start
```

Slack app manifest template is available at `/Users/mahad/mason/slack.manifest.json`.

## Scripts

- `bun run dev` - run with watch mode
- `bun run lint` - Biome check
- `bun run lint:fix` - Biome autofix
- `bun run typecheck` - TypeScript checks
- `bun test` - run tests
- `bun run ci` - lint + typecheck + tests

## Environment variables

Sensitive values stay in env vars:

- `SLACK_BOT_TOKEN`
- `SLACK_SIGNING_SECRET`
- `SLACK_APP_TOKEN`
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `OPENAI_API_URL`
- `BOT_CONFIG_PATH`

Non-sensitive config stays in `config/bot.config.yml`.
