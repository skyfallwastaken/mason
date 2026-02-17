import { App, LogLevel } from "@slack/bolt";

import { loadBotConfig } from "./config/bot-config";
import { loadEnv } from "./config/env";
import { createDatabase } from "./db/client";
import { ensureSchema } from "./db/init";
import { TicketsRepository } from "./db/tickets-repository";
import { createDevMacro } from "./macros/dev-macro";
import { MacroRegistry } from "./macros/registry";
import { createResolveMacro } from "./macros/resolve-macro";
import { ThreadTitleSummarizer } from "./openai/thread-title-summarizer";
import { ChannelMembershipService } from "./slack/channel-membership";
import type { SlackClient } from "./slack/client-types";
import { registerSlackListeners } from "./slack/register-listeners";
import { ResolveTicketService } from "./slack/resolve-ticket";
import { postDailySummary } from "./summary/post-daily-summary";
import { scheduleDailyAtMidnight } from "./summary/scheduler";

const env = loadEnv();
const config = await loadBotConfig(env.BOT_CONFIG_PATH);

const app = new App({
  token: env.SLACK_BOT_TOKEN,
  signingSecret: env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: env.SLACK_APP_TOKEN,
  logLevel: LogLevel.INFO,
});

const { db, sql } = createDatabase(env);
await ensureSchema(db);

const repo = new TicketsRepository(db);
const summarizer = new ThreadTitleSummarizer({
  apiKey: env.OPENAI_API_KEY,
  baseURL: env.OPENAI_API_URL,
  model: config.openaiModel,
});

const membershipService = new ChannelMembershipService(
  app.client as unknown as SlackClient,
  config.helpBtsChannelId,
);

const resolveService = new ResolveTicketService({
  repo,
  membershipService,
  config,
});

const macros = new MacroRegistry([createResolveMacro(), createDevMacro()]);

registerSlackListeners({
  app,
  config,
  repo,
  membershipService,
  summarizer,
  resolveService,
  macros,
});

const stopSummaryScheduler = scheduleDailyAtMidnight(
  config.summaryTimezone,
  async () => {
    await postDailySummary({
      client: app.client as unknown as SlackClient,
      repo,
      btsChannelId: config.helpBtsChannelId,
      timezone: config.summaryTimezone,
    });
  },
  {
    info: (message: string) => app.logger.info(message),
    error: (message: string, error?: unknown) => app.logger.error(message, error),
  },
);

await app.start();
app.logger.info("Help bot is running in Socket Mode.");

const shutdown = async () => {
  stopSummaryScheduler();
  await sql.end();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
