import { HandleType, Position } from "@xyflow/react";

export interface NodeInfo {
  type: string;
  component_name: string;
  data: NodeData;
}

export interface NodeData {
  header: Header;
  fields: Array<FieldGroup>;
  footer: Footer;
  handles: Array<Handle>;
  values: {
    [x: string]: any;
  };
}

export interface Header {
  icon?: string;
  label: string;
  sub_label?: string;
  info?: string;
}

export interface FieldGroup {
  label: string;
  sub_label?: string;
  info?: string;
  type: string;
  fields?: Array<Field>;
}

export interface Field {
  depends_on?: string;
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
  options?: Array<Option>;
  disabled?: boolean;
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

export interface Footer {
  notes?: string;
}

export interface Handle {
  position: Position;
  type: HandleType;
}
