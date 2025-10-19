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
  /** Optional compact architecture view configuration */
  architectureView?: ArchitectureViewConfig;
  
  /** Accordion expanded state - saved to preserve UI state across sessions */
  isExpanded?: boolean;
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

/** ============ Architecture View ============ */
export interface ArchitectureViewConfig {
  /** Text displayed as the primary title in architecture mode */
  primaryText?: string;
  /** Dot-notation key resolved from values to use as the primary title */
  primaryKey?: string;
  /** Secondary text displayed beneath the primary title */
  secondaryText?: string;
  /** Dot-notation key resolved from values for the secondary text */
  secondaryKey?: string;
  /** Optional descriptive paragraph */
  description?: string;
  /** Collection of tag chips rendered beside the header */
  tags?: ArchitectureTag[];
  /** Key/value facts displayed in compact list form */
  fields?: ArchitectureField[];
}

export interface ArchitectureTag {
  /** Label displayed before the value, e.g., "Issues" */
  label?: string;
  /** Explicit value to render inside the chip */
  value?: string | number;
  /** Dot-notation key resolved from values when value is not provided */
  valueKey?: string;
  /** Optional color token recognised by MUI chip (e.g., "primary") */
  color?: string;
}

export interface ArchitectureField {
  label: string;
  /** Explicit value to display */
  value?: string | number | boolean;
  /** Dot-notation key resolved from values when value is not provided */
  valueKey?: string;
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
