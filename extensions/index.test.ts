import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import piWorktree, { isDelegatedChild } from "./index.js";

test("guides commits through direct git while retaining worktree_commit", async () => {
  const [indexSource, skillSource, toolsSource] = await Promise.all([
    readFile(new URL("./index.ts", import.meta.url), "utf8"),
    readFile(new URL("../skills/worktree-router/SKILL.md", import.meta.url), "utf8"),
    readFile(new URL("./tools.ts", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(indexSource, /Use worktree_diff, worktree_sync, worktree_commit, and worktree_stop/);
  assert.match(indexSource, /Commit with direct git commit; create PRs with gh pr create/);
  assert.doesNotMatch(skillSource, /Use `worktree_commit` only after explicit confirmation/);
  assert.match(skillSource, /Commit with direct `git commit`; create PRs with `gh pr create`/);
  assert.match(toolsSource, /name: "worktree_commit"/);
});

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
