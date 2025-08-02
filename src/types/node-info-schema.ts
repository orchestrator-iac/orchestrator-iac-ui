import { z } from "zod";

export const OptionSchema = z.object({
  label: z.string(),
  sub_label: z.string().nullable().optional(),
  value: z.string().nullable().optional(),
  disabled: z.boolean().optional(),
});

export const FieldSchema = z.object({
  depends_on: z.string().nullable().optional(),
  label: z.string(),
  sub_label: z.string().nullable().optional(),
  name: z.string(),
  type: z.string(),
  value: z.any().optional(),
  hint: z.string().nullable().optional(),
  error_text: z.string().nullable().optional(),
  size: z.number().optional(),
  required: z.union([z.boolean(), z.string()]).optional(),
  info: z.string().nullable().optional(),
  placeholder: z.string().nullable().optional(), // fixed typo from 'placehoder'
  options: z.array(OptionSchema).optional(),
});

export const FieldGroupSchema = z.object({
  label: z.string(),
  sub_label: z.string().nullable().optional(),
  info: z.string().nullable().optional(),
  type: z.string(),
  fields: z.array(FieldSchema).optional(),
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
  fields: z.array(FieldGroupSchema),
  footer: FooterSchema,
  handles: z.array(HandleSchema),
  values: z.record(z.string(), z.any()),
});

export const NodeInfoSchema = z.object({
  type: z.string(),
  component_name: z.string(),
  data: NodeDataSchema,
});
