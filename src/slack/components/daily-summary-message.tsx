/** @jsxImportSource jsx-slack */
import type { KnownBlock } from "@slack/types";
import { DateTime } from "luxon";
import JSXSlack, { Blocks, Context, Divider, Header, Section } from "jsx-slack";

import type { DailySummaryStats, StaleTicket } from "../../db/tickets-repository";

function formatShortDate(date: Date): string {
  return DateTime.fromJSDate(date).setZone("Europe/London").toFormat("LLL d");
}

function StaleTicketItem({ ticket, index }: { ticket: StaleTicket; index: number }) {
  return (
    <li>
      {ticket.title} (created {formatShortDate(ticket.createdAt)}, last reply{" "}
      {formatShortDate(ticket.lastActivityAt)})
    </li>
  );
}

export function buildDailySummaryBlocks(stats: DailySummaryStats): KnownBlock[] {
  return JSXSlack(
    <Blocks>
      <Header>:mc-clock: daily summary</Header>

      <Section>
        um, um, hi there! hope i'm not disturbing you, but i just wanted to let you know that i've
        got some stats for you! :rac_cute:
      </Section>

      <Divider />

      <Section>
        :mc-clock: <b>in the last 24 hours...</b> (that's a day, right? right? that's a day, yeah
        ok)
        <br />
        <br />
        :rac_woah: <b>{stats.openedCount}</b> total tickets were opened and you managed to close{" "}
        <b>{stats.closedCount}</b> of them! congrats!! :D
        <br />
        :rac_info: <b>{stats.assignedOpenCount}</b> tickets have been assigned to users, and{" "}
        <b>{stats.openCount}</b> are still open
      </Section>

      <Context>
        you managed to close a whopping <b>{stats.closedCount}</b> tickets in the last 24 hours,
        well done!
      </Context>

      <Divider />

      <Section>
        :rac_info: <b>today's leaderboard</b>
        <br />
        <br />
        {stats.leaderboard.length > 0 ? (
          <ol>
            {stats.leaderboard.map((entry) => (
              <li>
                <a href={`@${entry.userId}`} /> - {entry.closedCount} closed tickets
              </li>
            ))}
          </ol>
        ) : (
          "nobody has closed a ticket yet"
        )}
      </Section>

      <Divider />

      <Section>
        :rac_shy: <b>tickets you could take a look at</b>
        <br />
        i found some older tickets that might be waiting for a response from someone...
        <br />
        <br />
        {stats.staleTickets.length > 0 ? (
          <ol>
            {stats.staleTickets.map((ticket, index) => (
              <StaleTicketItem ticket={ticket} index={index} />
            ))}
          </ol>
        ) : (
          "no older open tickets right now"
        )}
      </Section>
    </Blocks>,
  ) as KnownBlock[];
}
