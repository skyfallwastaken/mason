CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"help_channel_id" text NOT NULL,
	"thread_ts" text NOT NULL,
	"opener_user_id" text NOT NULL,
	"title" text NOT NULL,
	"root_text" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"assignee_user_id" text,
	"forwarded_message_ts" text,
	"resolved_at" timestamp with time zone,
	"resolved_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_human_reply_at" timestamp with time zone,
	CONSTRAINT "tickets_thread_ts_unique" UNIQUE("thread_ts")
);
