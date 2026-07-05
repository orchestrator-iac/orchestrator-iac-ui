import { Eta } from "eta";

const eta = new Eta({
  tags: ["{{", "}}"],
});

function evaluateTemplateExpression(
  expression: string,
  context: Record<string, any>,
) {
  try {
    const evaluator = new Function(
      "it",
      `with (it) { return (${expression}); }`,
    ) as (scope: Record<string, any>) => unknown;

    const result = evaluator(context);
    return typeof result === "undefined" ? `{{${expression}}}` : result;
  } catch {
    return `{{${expression}}}`;
  }
}

function preprocess(template: string) {
  return template.replace(
    /\{\{\s*(?![=~#/])([\s\S]*?)\s*\}\}/g,
    (_match, expr) => `{{= it.__etaEval(${JSON.stringify(expr.trim())}) }}`,
  );
}

function renderValue<T>(value: T, context: Record<string, any>): T {
  if (typeof value === "string") {
    const rendered = eta.renderString(preprocess(value), {
      ...context,
      __etaEval: (expression: string) =>
        evaluateTemplateExpression(expression, context),
    });

    if (rendered == null) {
      throw new Error("Eta render failed");
    }

    return rendered as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => renderValue(item, context)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        renderValue(nestedValue, context),
      ]),
    ) as T;
  }

  return value;
}

export function renderTemplate<T>(
  template: T,
  context: Record<string, any>,
): T {
  return renderValue(template, context);
}
