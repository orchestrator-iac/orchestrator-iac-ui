// src/utils/deps.ts

/**
 * Predicate evaluation utilities for field dependencies (depends_on).
 * Supports:
 *  - JSON predicates: { eq: ["enable_flow_logs", true] }, { any:[...] }, etc.
 *  - Legacy strings:  "values.enable_flow_logs === 'true'"
 */

export type Values = Record<string, any>;

export type DepExpr =
  | { eq: [string, any] }
  | { ne: [string, any] }
  | { in: [string, any[]] }
  | { exists: string }
  | { all: DepExpr[] }
  | { any: DepExpr[] }
  | { not: DepExpr };

/**
 * Coerce various raw values to a strict boolean.
 */
export const toBool = (v: any): boolean => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.toLowerCase() === "true";
  return Boolean(v);
};

/**
 * Resolve a dotted path ("foo.bar") inside a values object.
 */
export const getPath = (vals: Values, path: string): any => {
  return path
    .split(".")
    .reduce((acc, key) => (acc == null ? acc : acc[key]), vals);
};

/**
 * Evaluate a safe JSON predicate expression against values.
 */
export const evalJsonPredicate = (expr: DepExpr, vals: Values): boolean => {
  if ("eq" in expr) {
    const [path, rhs] = expr.eq;
    const lhs = getPath(vals, path);
    const L = typeof rhs === "boolean" ? toBool(lhs) : lhs;
    const R = typeof rhs === "boolean" ? Boolean(rhs) : rhs;
    return L === R;
  }
  if ("ne" in expr) {
    const [path, rhs] = expr.ne;
    const lhs = getPath(vals, path);
    const L = typeof rhs === "boolean" ? toBool(lhs) : lhs;
    const R = typeof rhs === "boolean" ? Boolean(rhs) : rhs;
    return L !== R;
  }
  if ("in" in expr) {
    const [path, arr] = expr.in;
    const lhs = getPath(vals, path);
    return (arr ?? []).includes(lhs);
  }
  if ("exists" in expr) {
    const v = getPath(vals, expr.exists);
    return (
      v !== undefined &&
      v !== null &&
      !(typeof v === "string" && v.trim() === "")
    );
  }
  if ("all" in expr) return expr.all.every((e) => evalJsonPredicate(e, vals));
  if ("any" in expr) return expr.any.some((e) => evalJsonPredicate(e, vals));
  if ("not" in expr) return !evalJsonPredicate(expr.not, vals);
  return true;
};

/**
 * Minimal legacy string evaluator to keep existing configs working.
 * Supports: values.<path> (===|==|!==|!=) <literal>
 * Literals: true|false|null|number|'string'|"string"
 */
export const evalLegacyString = (dep: string, vals: Values): boolean => {
  const m =
    dep.match(
      /^\s*values\.([a-zA-Z0-9_.]+)\s*(===|==|!==|!=)\s*(true|false|null|\d+(\.\d+)?|'[^']*'|"[^"]*")\s*$/,
    ) || [];
  const path = m[1];
  const op = m[2] as "===" | "==" | "!==" | "!=";
  const lit = m[3];

  if (!path || !op || lit == null) return false;

  let rhs: any;
  if (lit === "true" || lit === "false") rhs = lit === "true";
  else if (lit === "null") rhs = null;
  else if (/^\d+(\.\d+)?$/.test(lit)) rhs = Number(lit);
  else rhs = String(lit.slice(1, -1)); // strip quotes

  const lhsRaw = getPath(vals, path);
  const lhs = typeof rhs === "boolean" ? toBool(lhsRaw) : lhsRaw;

  switch (op) {
    case "===":
      return lhs === rhs;
    case "!==":
      return lhs !== rhs;
    case "==":
      // eslint-disable-next-line eqeqeq
      return lhs == rhs;
    case "!=":
      // eslint-disable-next-line eqeqeq
      return lhs != rhs;
    default:
      return false;
  }
};

/**
 * Decide whether a field should be shown given its depends_on value.
 * `field` only needs to expose an optional `depends_on` property (string | object).
 */
export const validCondition = (
  field: { depends_on?: unknown },
  vals: Values = {},
): boolean => {
  const dep = field?.depends_on;
  if (!dep) return true;

  try {
    if (typeof dep === "object") {
      return evalJsonPredicate(dep as DepExpr, vals);
    }
    if (typeof dep === "string") {
      return evalLegacyString(dep, vals);
    }
  } catch {
    return false;
  }
  return true;
};
