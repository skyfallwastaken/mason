import { DateTime } from "luxon";

import type { DailySummaryStats, StaleTicket } from "../db/tickets-repository";

function formatShortDate(date: Date): string {
  return DateTime.fromJSDate(date).setZone("Europe/London").toFormat("LLL d");
}

function staleTicketLine(ticket: StaleTicket, index: number): string {
  return `${index + 1}. ${ticket.title} (created ${formatShortDate(ticket.createdAt)}, last reply ${formatShortDate(ticket.lastActivityAt)})`;
}

export function buildDailySummaryText(stats: DailySummaryStats): string {
  const leaderboardLines =
    stats.leaderboard.length > 0
      ? stats.leaderboard.map(
          (entry, index) =>
            `${index + 1}. <@${entry.userId}> - ${entry.closedCount} closed tickets`,
        )
      : ["1. nobody has closed a ticket yet"];

  const staleLines =
    stats.staleTickets.length > 0
      ? stats.staleTickets.map(staleTicketLine)
      : ["1. no older open tickets right now"];

  return [
    "um, um, hi there! hope i'm not disturbing you, but i just wanted to let you know that i've got some stats for you! :rac_cute:",
    "",
    ":mc-clock: in the last 24 hours... (that's a day, right? right? that's a day, yeah ok)",
    `:rac_woah: ${stats.openedCount} total tickets were opened and you managed to close ${stats.closedCount} of them! congrats!! :D`,
    `:rac_info: ${stats.assignedOpenCount} tickets have been assigned to users, and ${stats.openCount} are still open`,
    `you managed to close a whopping ${stats.closedCount} tickets in the last 24 hours, well done!`,
    "",
    ":rac_info: today's leaderboard",
    ...leaderboardLines,
    "",
    ":rac_shy: tickets you could take a look at",
    "i found some older tickets that might be waiting for a response from someone...",
    ...staleLines,
  ].join("\n");
}
