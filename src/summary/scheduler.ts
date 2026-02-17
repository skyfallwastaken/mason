import { DateTime } from "luxon";

import { millisecondsUntilNextMidnight } from "./time";

type Logger = {
  info: (message: string) => void;
  error: (message: string, error?: unknown) => void;
};

export function scheduleDailyAtMidnight(
  timezone: string,
  runTask: () => Promise<void>,
  logger: Logger,
): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const queueNext = () => {
    const delay = millisecondsUntilNextMidnight(DateTime.now(), timezone);
    timer = setTimeout(async () => {
      try {
        await runTask();
      } catch (error) {
        logger.error("Daily summary task failed", error);
      } finally {
        queueNext();
      }
    }, delay);

    logger.info(`Next daily summary scheduled in ${Math.round(delay / 1000)}s`);
  };

  queueNext();

  return () => {
    if (timer) {
      clearTimeout(timer);
    }
  };
}
