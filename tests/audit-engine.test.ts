import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { runAudit } from "@/lib/audit-engine";
import type { AuditInput } from "@/types/audit";

function audit(input: AuditInput) {
  return runAudit(input);
}

describe("audit engine", () => {
  it("does not manufacture savings for a normal solo Cursor Pro workflow", () => {
    const result = audit({
      teamSize: 1,
      primaryUseCase: "Engineering productivity",
      tools: [{ tool: "Cursor", plan: "Pro", monthlySpend: 20, seats: 1 }],
    });

    assert.equal(result.monthlySavings, 0);
    assert.equal(result.primarySavingsDriver, "No major waste detected");
    assert.equal(result.recommendations[0].title, "Solo coding plan is near the benchmark");
  });

  it("flags annualized spend entered into a monthly field", () => {
    const result = audit({
      teamSize: 1,
      primaryUseCase: "Engineering productivity",
      tools: [{ tool: "Cursor", plan: "Pro", monthlySpend: 240, seats: 1 }],
    });

    assert.ok(result.monthlySavings > 0);
    assert.equal(result.recommendations[0].title, "Normalize billing period before acting");
    assert.equal(result.findings[0].category, "spend-normalization");
  });

  it("detects overlapping coding assistant spend", () => {
    const result = audit({
      teamSize: 8,
      primaryUseCase: "Engineering productivity",
      tools: [
        { tool: "Cursor", plan: "Business", monthlySpend: 320, seats: 8 },
        { tool: "GitHub Copilot", plan: "Business", monthlySpend: 152, seats: 8 },
      ],
    });

    assert.ok(result.findings.some((finding) => finding.category === "tool-overlap"));
    assert.ok(
      result.recommendations.some(
        (recommendation) => recommendation.title === "Standardize coding assistant usage",
      ),
    );
  });

  it("detects overlapping general assistant subscriptions", () => {
    const result = audit({
      teamSize: 12,
      primaryUseCase: "Mixed usage",
      tools: [
        { tool: "ChatGPT", plan: "Team", monthlySpend: 300, seats: 12 },
        { tool: "Claude", plan: "Team", monthlySpend: 300, seats: 12 },
      ],
    });

    assert.ok(result.monthlySavings > 0);
    assert.ok(
      result.recommendations.some(
        (recommendation) =>
          recommendation.title === "Consolidate overlapping assistant usage",
      ),
    );
  });

  it("detects purchased seats exceeding team size", () => {
    const result = audit({
      teamSize: 5,
      primaryUseCase: "Engineering productivity",
      tools: [{ tool: "GitHub Copilot", plan: "Business", monthlySpend: 380, seats: 20 }],
    });

    assert.ok(result.findings.some((finding) => finding.category === "seat-efficiency"));
    assert.ok(result.monthlySavings > 0);
  });

  it("flags enterprise plan overkill for small teams", () => {
    const result = audit({
      teamSize: 8,
      primaryUseCase: "Engineering productivity",
      tools: [
        { tool: "GitHub Copilot", plan: "Enterprise", monthlySpend: 312, seats: 8 },
      ],
    });

    assert.ok(
      result.findings.some((finding) => finding.category === "enterprise-overkill"),
    );
    assert.ok(result.monthlySavings > 0);
  });
});
