import { describe, expect, it } from "vitest";
import {
  buildFieldViews,
  fieldProgress,
  type ConfirmedFieldInput,
  type SuggestionInput,
} from "./field-states";

describe("buildFieldViews", () => {
  it("prioritises confirmed field over suggestions", () => {
    const confirmed: ConfirmedFieldInput[] = [
      {
        fieldKey: "patientName",
        value: "Rajendra Pawar",
        confirmedBy: { name: "Arjun Patil" },
        confirmedAt: new Date("2026-11-08T09:00:00Z"),
      },
    ];

    const suggestions: SuggestionInput[] = [
      {
        id: "sug-1",
        fieldKey: "patientName",
        value: "Rajendra Shankar Pawar",
        confidence: 0.95,
        sourceSnippet: "Name: Rajendra Shankar Pawar",
        document: { fileName: "notes.pdf" },
      },
    ];

    const views = buildFieldViews(confirmed, suggestions);
    const patientView = views.find((v) => v.key === "patientName");

    expect(patientView).toBeDefined();
    expect(patientView?.state).toBe("CONFIRMED");
    if (patientView?.state === "CONFIRMED") {
      expect(patientView.value).toBe("Rajendra Pawar");
      expect(patientView.confirmedBy).toBe("Arjun Patil");
    }
  });

  it("collapses identical normalised values from multiple documents into one option", () => {
    const suggestions: SuggestionInput[] = [
      {
        id: "sug-1",
        fieldKey: "estimatedCost",
        value: "Rs. 85,000",
        confidence: 0.85,
        sourceSnippet: "Total: Rs. 85,000",
        document: { fileName: "estimate.pdf" },
      },
      {
        id: "sug-2",
        fieldKey: "estimatedCost",
        value: "₹ 85,000.00",
        confidence: 0.95,
        sourceSnippet: "Estimated Cost: ₹ 85,000.00",
        document: { fileName: "preauth-form.pdf" },
      },
    ];

    const views = buildFieldViews([], suggestions);
    const costView = views.find((v) => v.key === "estimatedCost");

    expect(costView?.state).toBe("SUGGESTED");
    if (costView?.state === "SUGGESTED") {
      expect(costView.options).toHaveLength(1);
      expect(costView.options[0]?.value).toBe("85000");
      expect(costView.options[0]?.confidence).toBe(0.95);
    }
  });

  it("surfaces disagreement as multiple options sorted by confidence", () => {
    const suggestions: SuggestionInput[] = [
      {
        id: "sug-1",
        fieldKey: "age",
        value: "33 yrs",
        confidence: 0.8,
        sourceSnippet: "Age: 33 yrs",
        document: { fileName: "id.pdf" },
      },
      {
        id: "sug-2",
        fieldKey: "age",
        value: "34",
        confidence: 0.95,
        sourceSnippet: "Age: 34",
        document: { fileName: "notes.pdf" },
      },
    ];

    const views = buildFieldViews([], suggestions);
    const ageView = views.find((v) => v.key === "age");

    expect(ageView?.state).toBe("SUGGESTED");
    if (ageView?.state === "SUGGESTED") {
      expect(ageView.options).toHaveLength(2);
      expect(ageView.options[0]?.value).toBe("34"); // higher confidence first
      expect(ageView.options[1]?.value).toBe("33");
    }
  });

  it("marks fields without confirmed value or suggestions as EMPTY", () => {
    const views = buildFieldViews([], []);
    const memberIdView = views.find((v) => v.key === "memberId");
    expect(memberIdView?.state).toBe("EMPTY");
  });

  it("calculates field progress correctly", () => {
    const confirmed: ConfirmedFieldInput[] = [
      {
        fieldKey: "patientName",
        value: "Rajendra Pawar",
        confirmedBy: { name: "Arjun" },
        confirmedAt: new Date(),
      },
      {
        fieldKey: "age",
        value: "54",
        confirmedBy: { name: "Arjun" },
        confirmedAt: new Date(),
      },
    ];

    const views = buildFieldViews(confirmed, []);
    const progress = fieldProgress(views);
    expect(progress.confirmed).toBe(2);
    expect(progress.total).toBe(12);
  });
});
