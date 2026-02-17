/** @jsxImportSource jsx-slack */
import type { KnownBlock } from "@slack/types";
import JSXSlack, { Actions, Blocks, Button, Section } from "jsx-slack";

export function buildHelpReminderBlocks(threadTs: string): KnownBlock[] {
  return JSXSlack(
    <Blocks>
      <Section>
        :rac_info: Ah, hello! While we wait for a human to come and help you
        out, I&apos;ve been told to remind you to:
        {"\n\n"}• Have a read of the{" "}
        <a href="https://hackatime.hackclub.com/docs">docs</a> - it might have
        the answer you&apos;re looking for
        {"\n\n"}• Once your question is answered, hit the button below!
      </Section>
      <Actions>
        <Button actionId="resolve_ticket" style="primary" value={threadTs}>
          resolve!
        </Button>
      </Actions>
    </Blocks>,
  ) as KnownBlock[];
}
