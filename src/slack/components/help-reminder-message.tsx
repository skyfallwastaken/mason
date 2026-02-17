/** @jsxImportSource jsx-slack */
import type { KnownBlock } from "@slack/types";
import JSXSlack, { Actions, Blocks, Button, Section } from "jsx-slack";

export function buildHelpReminderBlocks(threadTs: string): KnownBlock[] {
  return JSXSlack(
    <Blocks>
      <Section>
        :rac_info: Ah, hello! While we wait for a human to come and help you out, I've been told to
        remind you to:
        <ul>
          <li>
            Have a read of the <a href="https://hackatime.hackclub.com/docs">docs</a> - it might
            have the answer you're looking for
          </li>
          <li>Once your question is answered, hit the button below!</li>
        </ul>
      </Section>
      <Actions>
        <Button actionId="resolve_ticket" style="primary" value={threadTs}>
          resolve!
        </Button>
      </Actions>
    </Blocks>,
  ) as KnownBlock[];
}
