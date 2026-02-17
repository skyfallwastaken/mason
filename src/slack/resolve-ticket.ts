import type { BotConfig } from "../config/bot-config";
import type { TicketsRepository } from "../db/tickets-repository";
import type { ChannelMembershipService } from "./channel-membership";
import type { SlackClient } from "./client-types";
import { isResolverAuthorized } from "./permissions";

export type ResolveOutcome = "resolved" | "already_resolved" | "unauthorized" | "not_found";

export type ResolveResult = {
  outcome: ResolveOutcome;
  message: string;
};

type ResolveTicketServiceOptions = {
  repo: TicketsRepository;
  membershipService: ChannelMembershipService;
  config: BotConfig;
};

export class ResolveTicketService {
  constructor(private readonly options: ResolveTicketServiceOptions) {}

  async resolve(
    client: SlackClient,
    threadTs: string,
    resolverUserId: string,
  ): Promise<ResolveResult> {
    const ticket = await this.options.repo.getByThreadTs(threadTs);

    if (!ticket) {
      return {
        outcome: "not_found",
        message: "I couldn't find that thread in my ticket list.",
      };
    }

    const isThreadOpener = ticket.openerUserId === resolverUserId;
    const isBtsMember = await this.options.membershipService.isInBts(resolverUserId);

    if (!isResolverAuthorized({ isBtsMember, isThreadOpener })) {
      return {
        outcome: "unauthorized",
        message: "Only help BTS folks or the user who opened this thread can resolve it.",
      };
    }

    if (ticket.status !== "open") {
      return {
        outcome: "already_resolved",
        message: "This thread is already resolved.",
      };
    }

    const resolved = await this.options.repo.resolveTicket(threadTs, resolverUserId);
    if (!resolved) {
      return {
        outcome: "already_resolved",
        message: "This thread is already resolved.",
      };
    }

    await this.tryRemoveReaction(client, ticket.helpChannelId, threadTs, "thinking_face");
    await this.tryAddReaction(client, ticket.helpChannelId, threadTs, "tw_white_check_mark");

    await client.chat.postMessage({
      channel: ticket.helpChannelId,
      thread_ts: threadTs,
      text: `:white_check_mark: Resolved by <@${resolverUserId}>.`,
    });

    if (ticket.forwardedMessageTs) {
      await this.tryDeleteForwardedMessage(client, ticket.forwardedMessageTs);
    }

    return {
      outcome: "resolved",
      message: "Thread resolved.",
    };
  }

  private async tryAddReaction(
    client: SlackClient,
    channel: string,
    timestamp: string,
    name: string,
  ): Promise<void> {
    try {
      await client.reactions.add({
        channel,
        timestamp,
        name,
      });
    } catch {
      // Slack throws on duplicate reactions; it's safe to ignore.
    }
  }

  private async tryRemoveReaction(
    client: SlackClient,
    channel: string,
    timestamp: string,
    name: string,
  ): Promise<void> {
    try {
      await client.reactions.remove({
        channel,
        timestamp,
        name,
      });
    } catch {
      // Safe to ignore if the reaction does not exist.
    }
  }

  private async tryDeleteForwardedMessage(client: SlackClient, ts: string): Promise<void> {
    try {
      await client.chat.delete({
        channel: this.options.config.ticketsChannelId,
        ts,
      });
    } catch {
      // It's safe if the forwarded message was already removed.
    }
  }
}
