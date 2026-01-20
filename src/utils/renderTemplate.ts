import { Eta } from "eta";

const eta = new Eta({
  tags: ["{{", "}}"],
});

function preprocess(template: string) {
  return template.replace(
    /\{\{\s*(?![=~#/])([\w.]+)\s*\}\}/g,
    (_match, expr) =>
      // If `it.expr` is defined, use it; otherwise, output the original placeholder
      `{{= (typeof it.${expr} !== "undefined" ? it.${expr} : "{{ expr }}") }}`,
  );
}

export function renderTemplate<T>(
  template: T,
  context: Record<string, any>,
): T {
  const json = JSON.stringify(template);
  const patched = preprocess(json);
  const out = eta.renderString(patched, context);
  if (out == null) throw new Error("Eta render failed");
  return JSON.parse(out);
}
