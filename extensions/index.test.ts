import assert from "node:assert/strict";
import test from "node:test";
import piWorktree, { isDelegatedChild } from "./index.js";

test("disables worktree routing for delegated children", () => {
  assert.equal(isDelegatedChild({ PI_SUBAGENT: "1" }), true);
  assert.equal(isDelegatedChild({ PI_SUBAGENT: "0" }), false);
  assert.equal(isDelegatedChild({}), false);
});


test("returns before registering delegated-child side effects", () => {
  const original = process.env.PI_SUBAGENT;
  const calls: string[] = [];
  try {
    process.env.PI_SUBAGENT = "1";
    piWorktree({
      on: () => calls.push("on"),
      registerTool: () => calls.push("registerTool"),
    } as any);
    assert.deepEqual(calls, []);
  } finally {
    if (original === undefined) delete process.env.PI_SUBAGENT;
    else process.env.PI_SUBAGENT = original;
  }
});
