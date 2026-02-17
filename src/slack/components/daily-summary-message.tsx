/** @jsxImportSource jsx-slack */
import type { KnownBlock } from "@slack/types";
import JSXSlack, { Blocks, Section } from "jsx-slack";

export function buildDailySummaryBlocks(text: string): KnownBlock[] {
  return JSXSlack(
    <Blocks>
      <Section>{text}</Section>
    </Blocks>,
  ) as KnownBlock[];
}
