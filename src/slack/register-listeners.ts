import type { App } from "@slack/bolt";

import type { BotConfig } from "../config/bot-config";
import type { TicketsRepository } from "../db/tickets-repository";
import type { MacroRegistry } from "../macros/registry";
import type { ThreadTitleSummarizer } from "../openai/thread-title-summarizer";
import type { ChannelMembershipService } from "./channel-membership";
import type { SlackClient } from "./client-types";
import { buildForwardedTicketBlocks } from "./components/forwarded-ticket-message";
import { buildHelpReminderBlocks } from "./components/help-reminder-message";
import { toUserMessageEvent } from "./message-types";
import type { ResolveTicketService } from "./resolve-ticket";

type RegisterSlackListenersOptions = {
  app: App;
  config: BotConfig;
  repo: TicketsRepository;
  membershipService: ChannelMembershipService;
  summarizer: ThreadTitleSummarizer;
  resolveService: ResolveTicketService;
  macros: MacroRegistry;
};

export function registerSlackListeners(
  options: RegisterSlackListenersOptions,
): void {
  const {
    app,
    config,
    repo,
    membershipService,
    summarizer,
    resolveService,
    macros,
  } = options;

  app.event("message", async ({ event, client, logger }) => {
    try {
      const message = toUserMessageEvent(
        event as unknown as Record<string, unknown>,
      );
      if (!message || message.channel !== config.helpChannelId) {
        return;
      }

      const slackClient = client as unknown as SlackClient;

      if (!message.thread_ts) {
        await handleNewHelpMessage({
          message,
          client: slackClient,
          config,
          repo,
          summarizer,
          logger,
        });
        return;
      }

      await repo.markThreadReply(message.thread_ts);

      const isBts = await membershipService.isInBts(message.user);
      if (isBts) {
        await repo.assignIfUnassigned(message.thread_ts, message.user);
      }

      await macros.run(message.text, {
        message,
        client: slackClient,
        config,
        isBtsMember: async (userId: string) =>
          membershipService.isInBts(userId),
        resolveThread: async (macroClient, threadTs, resolverUserId) => {
          return resolveService.resolve(macroClient, threadTs, resolverUserId);
        },
      });

      logger.debug(`Processed thread message ${message.ts}`);
    } catch (error) {
      logger.error("Failed to process message event", error);
    }
  });

  app.action("resolve_ticket", async ({ ack, body, client }) => {
    await ack();

    const slackClient = client as unknown as SlackClient;
    const castBody = body as {
      user?: { id?: string };
      channel?: { id?: string };
      message?: { thread_ts?: string; ts?: string };
      actions?: Array<{ value?: string }>;
    };

    const resolverUserId = castBody.user?.id;
    const channelId = castBody.channel?.id;
    const threadTs =
      castBody.actions?.[0]?.value ??
      castBody.message?.thread_ts ??
      castBody.message?.ts;

    if (!resolverUserId || !threadTs || !channelId) {
      return;
    }

    const result = await resolveService.resolve(
      slackClient,
      threadTs,
      resolverUserId,
    );
    if (result.outcome !== "resolved") {
      await slackClient.chat.postMessage({
        channel: channelId,
        thread_ts: threadTs,
        text: `:rac_info: ${result.message}`,
      });
    }
  });
}

type NewHelpMessageOptions = {
  message: {
    channel: string;
    user: string;
    text: string;
    ts: string;
  };
  client: SlackClient;
  config: BotConfig;
  repo: TicketsRepository;
  summarizer: ThreadTitleSummarizer;
  logger: {
    error: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
  };
};

async function handleNewHelpMessage(
  options: NewHelpMessageOptions,
): Promise<void> {
  const { message, client, config, repo, summarizer, logger } = options;

  await tryAddThinkingReaction(client, message.channel, message.ts);

  const title = await summarizer.summarize(message.text);
  let ticketCreated = false;
  try {
    await repo.createTicket({
      helpChannelId: message.channel,
      threadTs: message.ts,
      openerUserId: message.user,
      title,
      rootText: message.text,
    });
    ticketCreated = true;
  } catch (error) {
    logger.error("Failed to persist ticket record", error);
  }

  await client.chat.postMessage({
    channel: message.channel,
    thread_ts: message.ts,
    text: ":rac_info: Ah, hello! I've posted some guidance and a resolve button below.",
    blocks: buildHelpReminderBlocks(message.ts),
  });

  const permalink = await getPermalink(client, message.channel, message.ts);

  const forwarded = await client.chat.postMessage({
    channel: config.ticketsChannelId,
    text: `New help ticket from <@${message.user}>: ${title}`,
    blocks: buildForwardedTicketBlocks({
      openerUserId: message.user,
      title,
      permalink,
    }),
  });

  if (forwarded.ts && ticketCreated) {
    try {
      await repo.updateForwardedMessage(message.ts, forwarded.ts);
    } catch (error) {
      logger.warn(
        "Forwarded message sent, but failed to store forwarded_message_ts",
        error,
      );
    }
  }
}

async function tryAddThinkingReaction(
  client: SlackClient,
  channel: string,
  ts: string,
): Promise<void> {
  try {
    await client.reactions.add({
      channel,
      timestamp: ts,
      name: "thinking_face",
    });
  } catch {
    // Safe to ignore duplicate/missing reaction errors.
  }
}

async function getPermalink(
  client: SlackClient,
  channel: string,
  ts: string,
): Promise<string> {
  try {
    const response = await client.chat.getPermalink({
      channel,
      message_ts: ts,
    });

    if (response.permalink) {
      return response.permalink;
    }
  } catch {
    // Fall back to a direct Slack deep link format.
  }

  return `https://slack.com/archives/${channel}/p${ts.replace(".", "")}`;
}
