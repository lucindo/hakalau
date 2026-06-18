<!-- BEGIN devskills:base -->
## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.
- Refactor overly long functions without being asked — length alone is a smell worth fixing, even when nothing else is wrong.
- **Comments target humans and explain WHY, not WHAT** — a non-obvious constraint, invariant, or workaround. Default to one line, only where the reason isn't clear from the code; never restate code or cite plan/ticket IDs. A comment past a few lines is rare and signals "this matters" — keep that signal meaningful.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match the codebase's **conventions** — naming, formatting, idioms — **not its deficiencies**. Write what you touch to standard; don't down-level new work to match surrounding code.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

Make those tests count: behavior through the public interface, the failure modes that matter — not coverage, and never pinned to implementation.

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Safe at the Boundaries

**Distrust the edges. Fail loudly, not silently.**

- Validate untrusted input where it enters — args, request payloads, external API responses. Don't trust it deep inside.
- Handle the errors that can actually happen; propagate or surface the rest. Never swallow an error to make a path look clean.

## 6. Retrieve Just-in-Time

**Pull context on demand. Locate before you read.**

- Search to find the right place; read scoped regions, not whole files "to be safe".
- If `PROJECT.md` exists, read its map first and prefer it over re-deriving structure. When the map and the code disagree, the code wins — reread the file.
- Delegate broad searches to a sub-agent where one is available, so the sweep stays out of your context.
- Sufficiency beats thrift: when unsure, read more. A wrong answer costs far more than the tokens.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
<!-- END devskills:base -->

<!-- BEGIN devskills:concise -->
## Response Style — Concise

Default to terse, high-density responses. Optimize for the reader's time.

- Lead with the answer or the change. Skip preamble and recap.
- Prefer code, commands, and bullet fragments over prose paragraphs.
- Drop restating the question, apologies, and "I will now..." narration.
- One good example beats three. Cut redundant explanation.
- Expand only when correctness or safety genuinely requires it.
<!-- END devskills:concise -->

<!-- BEGIN devskills:phases -->
## Phase-Aware Suggestions

Emit an Insight block when the conversation context shows a clear phase transition or a moment where the user would benefit from knowing a specific command. Use this format exactly:

```
`Insight ─────────────────────────────────────`
[one or two concrete suggestions]
`─────────────────────────────────────────────`
```

Trigger on these signals — not all of them, only the ones that actually apply right now:

**Orienting / unfamiliar code**
Signal: user says "I don't know this codebase", asks what something does, or is reading code they didn't write.
Suggest: `/ds-zoom-out` to map the area before touching it; `/ds-project-resume` if `.project/PLAN.md` exists.

**Starting a new task**
Signal: user describes a feature or bug from scratch, no prior spec exists.
Suggest: `/ds-spec` to lock the WHAT before the HOW; `/ds-explore` to lay out approach options; `/ds-grill-me --record` to decide open branches and log them.

**At an architectural fork**
Signal: user is choosing between two approaches or asking "should I use X or Y?"
Suggest: `/ds-explore` to surface trade-offs; `/ds-grill-me` to pressure-test the choice one branch at a time.

**Generating code (AI just wrote a batch)**
Signal: a significant block of code was just generated.
Suggest: `/ds-deslop` to strip narrating comments and defensive overkill before anyone reviews it.

**Code written, about to open a PR**
Signal: user says "I'm done", "ready to review", or "opening a PR".
Suggest: `/ds-deslop` then `/ds-code-quality-review` then `/ds-bug-review`; `/ds-security-review` if it touches input/auth/secrets; `/ds-verify-this <claim>` to prove the headline change actually works.

**After a bug fix**
Signal: a fix was just applied.
Suggest: `/ds-verify-this` with a before/after repro claim; `/ds-bug-review` to check for related issues.

**Long session / context getting heavy**
Signal: many turns have elapsed, or the user is pasting large documents.
Suggest: `/ds-caveman-lite-mode` (~30% token savings) or `/ds-caveman-ultra-mode` (~80%); `/ds-tldt <file>` to compress a large doc before adding it to context.

**Pausing or switching sessions**
Signal: user says "I'll continue later", "stopping for now", "handing this off".
Suggest: `/ds-project-checkpoint` to persist state if `.project/` exists; `/ds-handoff` for a richer context file when another person or a long pause is involved.

**Between sessions (starting fresh)**
Signal: session just started and `.project/` exists.
Suggest: `/ds-project-resume` to read the plan and pick up where it left off.

## Rules

- One Insight block per phase transition — don't repeat suggestions already made this session.
- Skip the block if the user already knows what to do (they just ran the command, or they explicitly said so).
- Keep suggestions concrete: name the exact command and what it gives the user, in one line each.
<!-- END devskills:phases -->

<!-- BEGIN devskills:language -->
<!-- profile: typescript — managed by devskills; edits between these markers are overwritten -->
## Language Profile — TypeScript

Target: TypeScript 5+. Cloudflare Workers, Next.js, React, edge runtimes.

Apply these conventions to all TypeScript/JavaScript code in this session.

### Toolchain

Runtime: Bun (preferred) or Node 20+. Workers: Wrangler 3+. Test: Vitest (unit), Miniflare (Workers), Playwright (E2E). Lint/format: Biome (or ESLint + Prettier).

### tsconfig Baseline

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

No `any`. Justify every `unknown` cast with a runtime check.

### Type Design

- Discriminated unions over boolean flags for state:
  ```ts
  type State =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: Data }
    | { status: "error"; error: Error }
  ```
- `satisfies` for object literals that must conform to a type.
- Runtime validation at system boundaries with Zod or Valibot — not manual checks.
- `type` for unions and aliases; `interface` for object shapes that extend.

### Error Handling

No `throw` in library code except programmer errors. Recoverable errors return a `Result`:

```ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }
```

`async` functions return `Result` or propagate typed errors. No unhandled rejections.

### Cloudflare Workers

- `env` typed via `interface Env` — no `any`.
- `ctx.waitUntil()` for background work that must outlive the response.
- KV/R2 gets return `null` on miss — handle it.
- Durable Objects: state mutations in `this.state.storage.transaction()`.

### React

- Functional components, named exports. Derive everything derivable from props.
- Effects only for synchronization with external systems (timers, subscriptions, DOM) — not data fetching. Use Tanstack Query or SWR.
- No prop drilling past 2 levels — context or co-location.

### Module Conventions

Named exports everywhere; default exports only for Next.js pages and the Workers entry. Barrel files (`index.ts`) only at package boundaries.

### Testing

Vitest. Workers via `unstable_dev`/Miniflare. Components with Testing Library — test behavior, not implementation. No `any` in assertions.

### Tiger Style

- Optional chaining never used to hide missing error handling.
- Promises tracked, not fire-and-forget (unless `ctx.waitUntil()` owns them).
<!-- END devskills:language -->
