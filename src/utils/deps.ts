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

/** Coerces `lhs`/`rhs` to booleans when `rhs` is a boolean, otherwise leaves them as-is. */
const coerceForComparison = (lhs: any, rhs: any): [any, any] =>
  typeof rhs === "boolean" ? [toBool(lhs), Boolean(rhs)] : [lhs, rhs];

/** True when `v` is present and, if a string, non-blank. */
const hasMeaningfulValue = (v: unknown): boolean =>
  v !== undefined && v !== null && !(typeof v === "string" && v.trim() === "");

/**
 * Evaluate a safe JSON predicate expression against values.
 */
export const evalJsonPredicate = (expr: DepExpr, vals: Values): boolean => {
  if ("eq" in expr) {
    const [path, rhs] = expr.eq;
    const [L, R] = coerceForComparison(getPath(vals, path), rhs);
    return L === R;
  }
  if ("ne" in expr) {
    const [path, rhs] = expr.ne;
    const [L, R] = coerceForComparison(getPath(vals, path), rhs);
    return L !== R;
  }
  if ("in" in expr) {
    const [path, arr] = expr.in;
    return (arr ?? []).includes(getPath(vals, path));
  }
  if ("exists" in expr) {
    return hasMeaningfulValue(getPath(vals, expr.exists));
  }
  if ("all" in expr) return expr.all.every((e) => evalJsonPredicate(e, vals));
  if ("any" in expr) return expr.any.some((e) => evalJsonPredicate(e, vals));
  if ("not" in expr) return !evalJsonPredicate(expr.not, vals);
  return true;
};

// Split from the (formerly single, overly complex) legacy-expression regex:
// the outer pattern just locates `values.<path> <op> <literal text>`, and
// `parseLegacyLiteral` below decides whether that literal text is one of the
// supported shapes (bool/null/number/quoted string).
const LEGACY_EXPR_PATTERN =
  /^\s*values\.([a-zA-Z0-9_.]+)\s*(===|==|!==|!=)\s*(.+)$/;
const NUMBER_LITERAL_PATTERN = /^\d+(\.\d+)?$/;

/** Parses a legacy literal token (`true`, `false`, `null`, a number, or a quoted string). */
const parseLegacyLiteral = (raw: string): unknown => {
  const lit = raw.trim();
  if (lit === "true" || lit === "false") return lit === "true";
  if (lit === "null") return null;
  if (NUMBER_LITERAL_PATTERN.test(lit)) return Number(lit);

  const isQuoted =
    lit.length >= 2 &&
    ((lit.startsWith("'") && lit.endsWith("'")) ||
      (lit.startsWith('"') && lit.endsWith('"')));
  return isQuoted ? lit.slice(1, -1) : undefined;
};

/**
 * Minimal legacy string evaluator to keep existing configs working.
 * Supports: values.<path> (===|==|!==|!=) <literal>
 * Literals: true|false|null|number|'string'|"string"
 */
export const evalLegacyString = (dep: string, vals: Values): boolean => {
  const match = LEGACY_EXPR_PATTERN.exec(dep);
  if (!match) return false;

  const [, path, opRaw, rawLiteral] = match;
  const op = opRaw as "===" | "==" | "!==" | "!=";
  const rhs = parseLegacyLiteral(rawLiteral);

  if (!path || !op || rhs === undefined) return false;

  const lhsRaw = getPath(vals, path);
  const lhs = typeof rhs === "boolean" ? toBool(lhsRaw) : lhsRaw;

  switch (op) {
    case "===":
      return lhs === rhs;
    case "!==":
      return lhs !== rhs;
    case "==":
      return lhs == rhs;
    case "!=":
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

/**
 * Decide whether a field should be marked required.
 * Supports plain booleans plus the same predicate shapes used by depends_on.
 */
export const isFieldRequired = (
  required: unknown,
  vals: Values = {},
): boolean => {
  if (typeof required === "boolean") return required;
  if (!required) return false;

  try {
    if (typeof required === "object") {
      return evalJsonPredicate(required as DepExpr, vals);
    }
    if (typeof required === "string") {
      return evalLegacyString(required, vals);
    }
  } catch {
    return false;
  }

  return false;
};
