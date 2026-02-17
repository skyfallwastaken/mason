import { describe, expect, it } from "bun:test";

import { parseMacro } from "../src/macros/parser";

describe("parseMacro", () => {
  it("parses resolve macro", () => {
    expect(parseMacro("?resolve")).toEqual({
      name: "resolve",
      args: [],
    });
  });

  it("parses macros with args", () => {
    expect(parseMacro("?dev please")).toEqual({
      name: "dev",
      args: ["please"],
    });
  });

  it("returns null when text is not macro", () => {
    expect(parseMacro("hello")).toBeNull();
  });
});
