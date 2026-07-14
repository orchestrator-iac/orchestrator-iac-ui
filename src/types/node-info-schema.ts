import { HandleType, Position } from "@xyflow/react";
import { z } from "zod";

/** ---------- Field / Options ---------- */
export const OptionSchema = z.object({
  label: z.string(),
  sub_label: z.string().nullable().optional(),
  value: z.any().nullable().optional(),
  disabled: z.boolean().nullable().optional(),
  name: z.string().nullable().optional(),
});

const depExpr: z.ZodType<any> = z.lazy(() =>
  z.union([
    z.object({ eq: z.tuple([z.string(), z.any()]) }),
    z.object({ ne: z.tuple([z.string(), z.any()]) }),
    z.object({ in: z.tuple([z.string(), z.array(z.any())]) }),
    z.object({ exists: z.string() }),
    z.object({ all: z.array(depExpr) }),
    z.object({ any: z.array(depExpr) }),
    z.object({ not: depExpr }),
  ]),
);

export const FieldConfigSchema = z.record(z.string(), z.any());

const validateValueShapeForType = (
  fieldType: string,
  value: unknown,
  ctx: z.RefinementCtx,
  path: (string | number)[],
) => {
  if (value == null) {
    return;
  }

  if (fieldType === "list<text>" || fieldType === "list<select+text>") {
    if (!Array.isArray(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path,
        message: `${fieldType} fields require an array value.`,
      });
    }
    return;
  }

  if (fieldType === "select" && Array.isArray(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path,
      message: "select fields require a scalar value.",
    });
    return;
  }

  if (fieldType === "switch" && typeof value !== "boolean") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path,
      message: "switch fields require a boolean value.",
    });
    return;
  }

  if (fieldType === "number" && typeof value !== "number" && value !== "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path,
      message: "number fields require a numeric value.",
    });
  }
};

export const FieldSchema = z
  .object({
    depends_on: z.union([z.string(), depExpr]).optional().nullable(),
    label: z.string(),
    sub_label: z.string().nullable().optional(),
    name: z.string(),
    type: z.string(),
    value: z.any().nullable().optional(),
    hint: z.string().nullable().optional(),
    error_text: z.string().nullable().optional(),
    size: z.union([z.number(), z.string()]).nullable().optional(),
    required: z.union([z.boolean(), z.string(), depExpr]).nullable().optional(),
    info: z.string().nullable().optional(),
    placeholder: z.string().nullable().optional(),
    options: z.union([z.array(OptionSchema), z.string()]).nullable().optional(),
    disabled: z.boolean().nullable().optional(),
    allowDuplicates: z.boolean().nullable().optional(),
    config: FieldConfigSchema.nullable().optional(),
  })
  .superRefine((field, ctx) => {
    validateValueShapeForType(field.type, field.value, ctx, ["value"]);
  });

export const FieldGroupSchema = z.object({
  label: z.string(),
  sub_label: z.string().nullable().optional(),
  info: z.string().nullable().optional(),
  type: z.string(),
  isCollapsible: z.boolean().nullable().optional(),
  fields: z.array(FieldSchema).nullable().optional(),
});

/** ---------- Header / Footer ---------- */
export const HeaderSchema = z.object({
  icon: z.string().nullable().optional(),
  label: z.string(),
  sub_label: z.string().nullable().optional(),
  info: z.string().nullable().optional(),
});

export const FooterSchema = z.object({
  notes: z.string().nullable().optional(),
});

/** ---------- Handles ---------- */
export const HandleSchema = z.object({
  position: z.enum(Position),
  type: z.string() as z.ZodType<HandleType>,
});

/** ---------- Links (NEW) ---------- */
export const LinkRuleSchema = z.object({
  /** form field that stores the linked source node id */
  bind: z.string(),

  /** which source node types are allowed to connect to this node for this relation */
  fromTypes: z.array(z.string()).min(1),

  /**
   * max number of incoming links for this relation; supports:
   *  - integer (e.g., 1, 10)
   *  - string: "many", "*", or range "min..max" (e.g., "1..10")
   */
  cardinality: z.union([z.number(), z.string()]).optional(),

  /** output name from source module (e.g., 'vpc_id' becomes 'module.vpc_instance.vpc_id') */
  outputRef: z
    .union([z.string(), z.record(z.string(), z.string())])
    .optional()
    .nullable(),

  /** anything you want stamped onto the edge data */
  edgeData: z.record(z.string(), z.any()).optional(),
});

/** ---------- Node Data ---------- */
export const NodeDataSchema = z
  .object({
    header: HeaderSchema,
    fields: z.array(FieldGroupSchema).nullable().optional(),
    footer: FooterSchema.nullable().optional(),
    handles: z.array(HandleSchema).nullable().optional(),
    values: z.record(z.string(), z.any().nullable()).nullable().optional(),
    links: z.array(LinkRuleSchema).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const fieldMap = new Map<string, z.infer<typeof FieldSchema>>();

    for (const group of data.fields ?? []) {
      for (const field of group.fields ?? []) {
        fieldMap.set(field.name, field);
      }
    }

    for (const [name, value] of Object.entries(data.values ?? {})) {
      const field = fieldMap.get(name);
      if (!field) {
        continue;
      }
      validateValueShapeForType(field.type, value, ctx, ["values", name]);
    }
  });

/** ---------- NodeInfo ---------- */
export const NodeInfoSchema = z.object({
  type: z.string(),
  component_name: z.string(),
  data: NodeDataSchema,
});

/** ---------- Types (handy) ---------- */
export type Option = z.infer<typeof OptionSchema>;
export type Field = z.infer<typeof FieldSchema>;
export type FieldGroup = z.infer<typeof FieldGroupSchema>;
export type LinkRule = z.infer<typeof LinkRuleSchema>;
export type NodeData = z.infer<typeof NodeDataSchema>;
export type NodeInfo = z.infer<typeof NodeInfoSchema>;
