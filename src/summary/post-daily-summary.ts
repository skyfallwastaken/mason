import { DateTime } from "luxon";

import type { TicketsRepository } from "../db/tickets-repository";
import type { SlackClient } from "../slack/client-types";
import { buildDailySummaryBlocks } from "../slack/components/daily-summary-message";
import { buildDailySummaryText } from "./build-summary-copy";

type PostDailySummaryOptions = {
  client: SlackClient;
  repo: TicketsRepository;
  btsChannelId: string;
  timezone: string;
};

export async function postDailySummary(options: PostDailySummaryOptions): Promise<void> {
  const now = DateTime.now().setZone(options.timezone);
  const since = now.minus({ hours: 24 }).toJSDate();

  const stats = await options.repo.getDailySummaryStats(since);
  const text = buildDailySummaryText(stats);

  await options.client.chat.postMessage({
    channel: options.btsChannelId,
    text,
    blocks: buildDailySummaryBlocks(stats),
  });
}
