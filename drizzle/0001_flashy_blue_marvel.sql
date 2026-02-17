CREATE INDEX "tickets_status_idx" ON "tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tickets_last_activity_idx" ON "tickets" USING btree ("last_activity_at");--> statement-breakpoint
CREATE INDEX "tickets_resolved_at_idx" ON "tickets" USING btree ("resolved_at");