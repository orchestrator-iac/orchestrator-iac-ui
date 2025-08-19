import { z } from "zod";

export const OptionSchema = z.object({
  label: z.string(),
  sub_label: z.string().nullable().optional(),
  value: z.any().nullable().optional(),
  disabled: z.boolean().nullable().optional(),
  name: z.string().nullable().optional(),
});

export const FieldConfigSchema = z.record(z.string(), z.any());

export const FieldSchema = z.object({
  depends_on: z.string().nullable().optional(),
  label: z.string(),
  sub_label: z.string().nullable().optional(),
  name: z.string(),
  type: z.string(),
  value: z.any().nullable().optional(),
  hint: z.string().nullable().optional(),
  error_text: z.string().nullable().optional(),
  size: z.union([z.number(), z.string()]).nullable().optional(),
  required: z.union([z.boolean(), z.string()]).nullable().optional(),
  info: z.string().nullable().optional(),
  placeholder: z.string().nullable().optional(),
  options: z.array(OptionSchema).nullable().optional(),
  disabled: z.boolean().nullable().optional(),
  config: FieldConfigSchema.nullable().optional(),
});

export const FieldGroupSchema = z.object({
  label: z.string(),
  sub_label: z.string().nullable().optional(),
  info: z.string().nullable().optional(),
  type: z.string(),
  fields: z.array(FieldSchema).nullable().optional(),
});

export const HeaderSchema = z.object({
  icon: z.string().nullable().optional(),
  label: z.string(),
  sub_label: z.string().nullable().optional(),
  info: z.string().nullable().optional(),
});

export const FooterSchema = z.object({
  notes: z.string().nullable().optional(),
});

export const HandleSchema = z.object({
  position: z.string(),
  type: z.string(),
});

export const NodeDataSchema = z.object({
  header: HeaderSchema,
  fields: z.array(FieldGroupSchema).nullable().optional(),
  footer: FooterSchema.nullable().optional(),
  handles: z.array(HandleSchema).nullable().optional(),
  values: z.record(z.string(), z.any().nullable()).nullable().optional(),
});

export const NodeInfoSchema = z.object({
  type: z.string(),
  component_name: z.string(),
  data: NodeDataSchema,
});
