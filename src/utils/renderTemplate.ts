import { Eta } from "eta";

const eta = new Eta({
  tags: ["{{", "}}"],
});

// Security note (S1523): `expression` originates from admin/catalog-authored
// field templates (resource + template definitions shipped with the app),
// never from free-form end-user input. `context` only supplies data values
// (userInfo/templateInfo) that are substituted into those author-controlled
// expressions - it cannot introduce new code to execute. `new Function` here
// therefore evaluates a small, trusted expression grammar (similar in scope
// to `with`-based template interpolation), not arbitrary user-supplied code.
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
    return result === undefined ? `{{${expression}}}` : result;
  } catch {
    return `{{${expression}}}`;
  }
}

function preprocess(template: string) {
  return template.replace(/\{\{([\s\S]*?)\}\}/g, (match, expr: string) => {
    // Leave Eta's own directive tags ({{= }}, {{~ }}, {{# }}, {{/ }}) untouched.
    if (/^[=~#/]/.test(expr)) {
      return match;
    }
    return `{{= it.__etaEval(${JSON.stringify(expr.trim())}) }}`;
  });
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
