/** @jsxImportSource jsx-slack */
import type { KnownBlock } from "@slack/types";
import JSXSlack, { Actions, Blocks, Button, Section } from "jsx-slack";

export function buildHelpReminderBlocks(threadTs: string): KnownBlock[] {
  const reminderText =
    ":rac_info: Ah, hello! While we wait for a human to come and help you out, I've been told to remind you to:\n" +
    "• Have a read of the <https://hackatime.hackclub.com/docs|docs> - it might have the answer you're looking for\n" +
    "• Once your question is answered, hit the button below!";

  return JSXSlack(
    <Blocks>
      <Section>{reminderText}</Section>
      <Actions>
        <Button actionId="resolve_ticket" style="primary" value={threadTs}>
          resolve!
        </Button>
      </Actions>
    </Blocks>,
  ) as KnownBlock[];
}
