<!-- BEGIN devskills:base -->
## 1. Think Before Coding

**State assumptions. Surface confusion and tradeoffs; don't pick silently.**

Before implementing:
- State your assumptions explicitly; when something's unclear, name it and ask.
- If multiple interpretations exist, present them — don't choose one silently.
- If a simpler approach exists, say so. Push back when warranted.

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
- If you notice unrelated dead code, mention it — don't delete it.

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
- If `.project/map.md` exists, read it first and prefer it over re-deriving structure. When the map and the code disagree, the code wins — reread the file.
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

Emit an Insight block when the conversation reaches a clear phase transition and a specific command would help — not on every turn. Use this format exactly:

```
`Insight ─────────────────────────────────────`
[one or two concrete suggestions]
`─────────────────────────────────────────────`
```

Trigger only on the signals that genuinely apply right now:

**Starting a new task** — user describes a feature or bug from scratch, no spec yet.
Suggest: `/ds-spec` to lock the WHAT before the HOW.

**At an architectural fork** — user is choosing between approaches or asks "should I use X or Y?"
Suggest: `/ds-explore` to surface trade-offs; `/ds-grill-me` to pressure-test the choice one branch at a time.

**Code just generated** — a significant block of code was just written.
Suggest: `/ds-deslop` to strip narrating comments and defensive overkill before anyone reviews it.

**Done / opening a PR** — user says "I'm done", "ready to review", or "opening a PR".
Suggest: `/ds-code-quality-review` then `/ds-bug-review`; `/ds-security-review` if it touches input/auth/secrets; `/ds-verify-this <claim>` to prove the headline change works.

## Rules

- One Insight block per transition; never repeat a suggestion already made this session, and skip it when the user already knows (they just ran the command or said so).
- Name the exact command and what it gives, one line each.
<!-- END devskills:phases -->

<!-- BEGIN devskills:language:typescript -->
<!-- profile: typescript — managed by devskills; edits between these markers are overwritten -->
## Language Profile — TypeScript

Target: TypeScript 5.5+. Cloudflare Workers, Next.js, React, edge runtimes.

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
- React 19: read promises/context with the `use` hook; `ref` is a plain prop (drop `forwardRef`). Manage form/mutation state with Actions (`useActionState`, `useOptimistic`, `useFormStatus`).
- With the React Compiler on, skip manual `useMemo`/`useCallback`/`React.memo` — let it memoize; add them only where profiling shows a gap.
- No prop drilling past 2 levels — context or co-location.

### Module Conventions

Named exports everywhere; default exports only for Next.js pages and the Workers entry. Barrel files (`index.ts`) only at package boundaries.

### Testing

Vitest. Workers via `unstable_dev`/Miniflare. Components with Testing Library — test behavior, not implementation. No `any` in assertions.

### Tiger Style

- Optional chaining never used to hide missing error handling.
- Promises tracked, not fire-and-forget (unless `ctx.waitUntil()` owns them).
<!-- END devskills:language:typescript -->
