export interface NodeInfo {
  type: string;
  component_name: string;
  data: NodeData;
}

export interface NodeData {
  header: Header;
  fields: Array<FieldGroup>; // Using Array<Type> is a common way to denote arrays of a specific type.
  footer: Footer;
  handles: Array<Handle>;
  values: {
    [x: string]: any; // This allows for dynamic keys where the value can be of any type.
  };
}

export interface Header {
  icon?: string; // Properties can be made optional using the '?' operator.
  label: string;
  sub_label?: string;
  info?: string;
}

export interface FieldGroup {
  label: string;
  sub_label?: string;
  info?: string;
  type: string;
  fields: Array<Field>;
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
  size?: number;
  required?: boolean | string; // Using a union type `boolean | string` allows the property to be either a boolean or a string
  info?: string;
  placeholder?: string;
  options?: Array<Option>;
}

export interface Option {
  label: string;
  sub_label?: string;
  value?: string;
  disabled?: boolean;
}

export interface Footer {
  notes?: string;
}

export interface Handle {
  position: string;
  type: string;
}
