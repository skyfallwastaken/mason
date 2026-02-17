import { index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const tickets = pgTable(
  "tickets",
  {
    id: serial("id").primaryKey(),
    helpChannelId: text("help_channel_id").notNull(),
    threadTs: text("thread_ts").notNull().unique(),
    openerUserId: text("opener_user_id").notNull(),
    title: text("title").notNull(),
    rootText: text("root_text").notNull(),
    status: text("status").notNull().default("open"),
    assigneeUserId: text("assignee_user_id"),
    forwardedMessageTs: text("forwarded_message_ts"),
    resolvedAt: timestamp("resolved_at", { mode: "date", withTimezone: true }),
    resolvedByUserId: text("resolved_by_user_id"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
    lastActivityAt: timestamp("last_activity_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
    lastHumanReplyAt: timestamp("last_human_reply_at", { mode: "date", withTimezone: true }),
  },
  (table) => ({
    statusIdx: index("tickets_status_idx").on(table.status),
    lastActivityIdx: index("tickets_last_activity_idx").on(table.lastActivityAt),
    resolvedAtIdx: index("tickets_resolved_at_idx").on(table.resolvedAt),
  }),
);

export type Ticket = typeof tickets.$inferSelect;
