import { DateTime } from "luxon";

export function millisecondsUntilNextMidnight(now: DateTime, timezone: string): number {
  const zoned = now.setZone(timezone);
  const nextMidnight = zoned.plus({ days: 1 }).startOf("day");
  return Math.max(0, nextMidnight.toMillis() - zoned.toMillis());
}

export function londonNow(): DateTime {
  return DateTime.now().setZone("Europe/London");
}
