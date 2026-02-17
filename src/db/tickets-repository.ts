import { and, asc, desc, eq, gte, isNotNull, isNull, type SQL, sql } from "drizzle-orm";

import type { Database } from "./client";
import { type Ticket, tickets } from "./schema";

export type CreateTicketInput = {
  helpChannelId: string;
  threadTs: string;
  openerUserId: string;
  title: string;
  rootText: string;
};

export type LeaderboardEntry = {
  userId: string;
  closedCount: number;
};

export type StaleTicket = {
  title: string;
  createdAt: Date;
  lastActivityAt: Date;
};

export type DailySummaryStats = {
  openedCount: number;
  closedCount: number;
  assignedOpenCount: number;
  openCount: number;
  leaderboard: LeaderboardEntry[];
  staleTickets: StaleTicket[];
};

function asCount(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

export class TicketsRepository {
  constructor(private readonly db: Database) {}

  async createTicket(input: CreateTicketInput): Promise<Ticket> {
    const now = new Date();

    const inserted = await this.db
      .insert(tickets)
      .values({
        helpChannelId: input.helpChannelId,
        threadTs: input.threadTs,
        openerUserId: input.openerUserId,
        title: input.title,
        rootText: input.rootText,
        status: "open",
        createdAt: now,
        updatedAt: now,
        lastActivityAt: now,
      })
      .onConflictDoNothing({ target: tickets.threadTs })
      .returning();

    if (inserted[0]) {
      return inserted[0];
    }

    const existing = await this.getByThreadTs(input.threadTs);
    if (!existing) {
      throw new Error(`Ticket creation failed for thread ${input.threadTs}`);
    }

    return existing;
  }

  async getByThreadTs(threadTs: string): Promise<Ticket | null> {
    const row = await this.db.query.tickets.findFirst({
      where: eq(tickets.threadTs, threadTs),
    });

    return row ?? null;
  }

  async updateForwardedMessage(threadTs: string, forwardedMessageTs: string): Promise<void> {
    await this.db
      .update(tickets)
      .set({
        forwardedMessageTs,
        updatedAt: new Date(),
      })
      .where(eq(tickets.threadTs, threadTs));
  }

  async markThreadReply(threadTs: string): Promise<void> {
    const now = new Date();
    await this.db
      .update(tickets)
      .set({
        lastActivityAt: now,
        lastHumanReplyAt: now,
        updatedAt: now,
      })
      .where(eq(tickets.threadTs, threadTs));
  }

  async assignIfUnassigned(threadTs: string, assigneeUserId: string): Promise<void> {
    await this.db
      .update(tickets)
      .set({
        assigneeUserId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(tickets.threadTs, threadTs),
          eq(tickets.status, "open"),
          isNull(tickets.assigneeUserId),
        ),
      );
  }

  async resolveTicket(threadTs: string, resolverUserId: string): Promise<Ticket | null> {
    const now = new Date();

    const resolved = await this.db
      .update(tickets)
      .set({
        status: "resolved",
        resolvedAt: now,
        resolvedByUserId: resolverUserId,
        updatedAt: now,
        lastActivityAt: now,
      })
      .where(and(eq(tickets.threadTs, threadTs), eq(tickets.status, "open")))
      .returning();

    return resolved[0] ?? null;
  }

  async getDailySummaryStats(since: Date): Promise<DailySummaryStats> {
    const openedCount = await this.getCount(gte(tickets.createdAt, since));

    const closedCount = await this.getCount(gte(tickets.resolvedAt, since));

    const assignedOpenCount = await this.getCount(
      and(eq(tickets.status, "open"), isNotNull(tickets.assigneeUserId)),
    );

    const openCount = await this.getCount(eq(tickets.status, "open"));

    const leaderboardRows = await this.db
      .select({
        userId: tickets.resolvedByUserId,
        closedCount: sql<number>`cast(count(*) as integer)`,
      })
      .from(tickets)
      .where(and(gte(tickets.resolvedAt, since), isNotNull(tickets.resolvedByUserId)))
      .groupBy(tickets.resolvedByUserId)
      .orderBy(desc(sql`count(*)`))
      .limit(3);

    const leaderboard: LeaderboardEntry[] = leaderboardRows
      .filter((entry): entry is { userId: string; closedCount: number } => Boolean(entry.userId))
      .map((entry) => ({
        userId: entry.userId,
        closedCount: asCount(entry.closedCount),
      }));

    const staleRows = await this.db
      .select({
        title: tickets.title,
        createdAt: tickets.createdAt,
        lastActivityAt: tickets.lastActivityAt,
      })
      .from(tickets)
      .where(eq(tickets.status, "open"))
      .orderBy(asc(tickets.lastActivityAt))
      .limit(5);

    const staleTickets: StaleTicket[] = staleRows
      .filter((row): row is { title: string; createdAt: Date; lastActivityAt: Date } => {
        return Boolean(row.title && row.createdAt && row.lastActivityAt);
      })
      .map((row) => ({
        title: row.title,
        createdAt: row.createdAt,
        lastActivityAt: row.lastActivityAt,
      }));

    return {
      openedCount,
      closedCount,
      assignedOpenCount,
      openCount,
      leaderboard,
      staleTickets,
    };
  }

  private async getCount(where: SQL<unknown> | undefined): Promise<number> {
    if (!where) {
      return 0;
    }

    const rows = await this.db
      .select({
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(tickets)
      .where(where);

    return asCount(rows[0]?.count);
  }
}
