## � Prompt Engineering & Evaluation

The AI tutor's system prompt (20 teaching principles) is rigorously tested using **[Promptfoo](https://promptfoo.dev/)** — an open-source LLM evaluation framework.

### Test Suite

**22 test cases** covering all 20 teaching principles:

| Category | What's Tested |
| :--- | :--- |
| Socratic Method | Refuses to spoon-feed full solutions |
| Progressive Hints | Escalates hints L1 → L2 → L3 only when user stays stuck |
| Code Review | Acknowledges effort first, then identifies specific bugs |
| Frustration Handling | Encourages, rephrases, and simplifies when user says "I don't know" |
| TLE Detection | Proactively warns about O(n²) on large constraints |
| Syntax vs Logic | Separates syntax errors from algorithmic feedback |
| Topic Switching | Redirects off-topic questions to new sessions |
| Conciseness | Enforces ≤150-word responses |
| Rich Formatting | Validates bold, bullets, backtick usage |

### Results

| Metric | v1 | v2 (Current) |
| :--- | :--- | :--- |
| **Passed** | 13/22 | **17/22** |
| **Pass Rate** | 59% | **77%** |

### Key Improvements Applied (v1 → v2)

- `[HIGH PRIORITY]` tags on **Principles 12, 15, 16** — factual questions, TLE warnings, and syntax errors are now answered **directly first**, overriding Socratic deflection.
- **Premature optimization redirects** made firmer — model no longer validates complex approaches (BSTs, segment trees) when brute-force hasn't been attempted.
- **Hard 150-word limit** replacing vague "2-3 paragraphs" — with explicit instruction that numbered lists count as length.
- **Bug identification made mandatory** — code reviews must pinpoint exact bugs, not just acknowledge effort.
- **Concept explanations must redirect** — every foundational concept answer connects back to the current problem.
- **Backtick formatting enforced** — variable names (`nums`, `target`) must always use inline code.

```bash
# Run the eval yourself
export OPENROUTER_API_KEY=your_key
npx promptfoo@latest eval
npx promptfoo@latest view   # opens browser dashboard
```

