import { HandleType, Position } from "@xyflow/react";

/** ============ NodeInfo ============ */
export interface NodeInfo {
  type: string;
  component_name: string;
  data: NodeData;
}

/** ============ NodeData ============ */
export interface NodeData {
  header: Header;
  fields: Array<FieldGroup>;
  footer: Footer;
  handles: Array<Handle>;
  values: {
    [x: string]: any;
  };

  /** NEW: schema-driven link rules for validating edges & binding form fields */
  links?: Array<LinkRule>;
}

/** How a field binds to a graph relationship (generic) */
export interface LinkRule {
  /** Form field name that stores the linked source node id (e.g., "vpc_id") */
  bind: string;

  /** Allowed source node types for incoming edges to this node (e.g., ["vpc"]) */
  fromTypes: string[];

  /** Max incoming edges for this relation; default behaves like "1" */
  cardinality?: "1" | "many";

  /** Arbitrary metadata to stamp onto the edge (e.g., { kind: "vpc-link" }) */
  edgeData?: Record<string, any>;
}

/** ============ Header / Footer ============ */
export interface Header {
  icon?: string;
  label: string;
  sub_label?: string;
  info?: string;
}

export interface Footer {
  notes?: string;
}

/** ============ Field Groups ============ */
export interface FieldGroup {
  label: string;
  sub_label?: string;
  info?: string;
  type: string;
  fields?: Array<Field>;
}

export type DepExpr =
  | { eq: [string, any] }
  | { ne: [string, any] }
  | { in: [string, any[]] }
  | { exists: string }
  | { all: DepExpr[] }
  | { any: DepExpr[] }
  | { not: DepExpr };

/** ============ Fields ============ */
export interface Field {
  depends_on?: string | DepExpr;
  label: string;
  sub_label?: string;
  name: string;
  type: string;
  value?: any;
  hint?: string;
  error_text?: string;
  size?: number | string;
  required?: boolean;
  info?: string;
  placeholder?: string;

  /**
   * Options can be:
   *  - a static array of {label,value} items, OR
   *  - a dynamic rule string resolved from the graph, e.g. "from:nodes:type=vpc"
   */
  options?: Array<Option> | string;

  disabled?: boolean;
  allowDuplicates?: boolean;
  config?: FieldConfig;
}

export interface Option {
  label: string;
  sub_label?: string;
  value?: any;
  disabled?: boolean;
  name?: string;
}

export interface FieldConfig {
  [key: string]: any;
}

/** ============ Handles ============ */
export interface Handle {
  position: Position;
  type: HandleType;
}
