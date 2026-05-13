# Tests

These tests were also produced with AI assistance and then run locally as part of the final review. They focus on the audit engine because that is the product's trust layer.

## Automated Tests

Run:

```bash
npm test
```

Current test file:

`tests/audit-engine.test.ts`

Coverage:

1. Normal solo Cursor Pro usage does not manufacture savings.
2. Annualized spend entered into the monthly field triggers spend normalization.
3. Cursor + GitHub Copilot detects overlapping coding assistant coverage.
4. ChatGPT + Claude detects overlapping general assistant subscriptions.
5. Purchased seats exceeding team size triggers seat-efficiency savings.
6. GitHub Copilot Enterprise for a small team triggers enterprise overkill.

These tests focus on the audit engine because it is the core trust layer of the product.

## CI

`.github/workflows/ci.yml` runs on pushes to `main`:

```bash
npm run lint
npm test
npm run build
```

## Manual Smoke Tests

Before submission:

1. Create a normal low-savings audit and confirm the report does not overclaim.
2. Create a high-savings audit and confirm the Credex CTA appears.
3. Reload the audit form and confirm draft state persists.
4. Submit lead capture and confirm Supabase receives a row.
5. Confirm Resend email delivery or a clear fallback status.
6. Download the PDF and confirm it opens cleanly.
7. Paste a report URL into a preview tool for Open Graph/Twitter metadata.
8. Visit an invalid report ID and confirm graceful fallback.
