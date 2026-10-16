---
name: api-model-guide
description: Explains how core-api-models should be written in this project. Use when the user asks about model conventions, how to structure Zod schemas, or needs guidance on creating new API models.
argument-hint: [entity-name]
---

# How to Write core-api-models

This guide explains the conventions for defining API models in `packages/core-api-models/src/lib/`.

## File Structure

Each domain entity gets its own directory:

```
packages/core-api-models/src/lib/<entity>/
  models.ts   # Zod schemas + inferred TypeScript types (required)
  mocks.ts    # Mock data for testing (optional)
  shapes.ts   # Default/empty shape objects for form initialization (optional)
  index.ts    # Barrel exports (required)
```

The `index.ts` re-exports everything:

```typescript
export * from './models';
export * from './mocks';   // if exists
export * from './shapes';  // if exists
```

After creating the directory, update the main package index at `packages/core-api-models/src/index.ts` to export the new entity.

## Schema Structure in models.ts

Every entity model file follows a strict layered pattern. Each layer serves a different purpose.

### Import Convention

Always import Zod as a namespace:

```typescript
import * as z from 'zod';
```

Import ref schemas from other entities when you need relations:

```typescript
import { organizationRefSchema, readOrganizationRefSchema } from '../organizations';
```

### Layer 0: Enums (if needed)

Define enums at the top of the file using `z.enum()`:

```typescript
export const entityStatusEnum = z.enum(['active', 'inactive', 'pending']);
export type EntityStatus = z.infer<typeof entityStatusEnum>;
```

Naming: `<camelCaseName>Enum` or just descriptive like `entityStatus`.

### Layer 1: readEntityRefSchema (Reference with label)

Used for **dropdowns, selects, autocomplete, and links** where you need an ID plus a human-readable label.

```typescript
export const readEntityRefSchema = z.object({
  id: z.uuid(),          // Always non-null
  name: z.string(),      // The display label field
});
export type ReadEntityRef = z.infer<typeof readEntityRefSchema>;
```

Rules:
- `id` is always `z.uuid()` (non-nullable)
- Include the field used as the display label (usually `name`, but can be `email`, `tag`, etc.)
- May include additional useful display fields (e.g., `profileImage` on `readUserRefSchema`)

### Layer 2: entityRefSchema (Minimal reference)

Used for **foreign key references** in create/update payloads. Contains only the ID.

```typescript
export const entityRefSchema = z.object({
  id: z.uuid(),          // Always non-null
});
export type EntityRef = z.infer<typeof entityRefSchema>;
```

### Layer 3: readEntitySchema (Full read schema)

The complete entity as returned by the API. **All fields are nullable** because the API may return partial data.

```typescript
export const readEntitySchema = z.object({
  id: z.uuid().nullable(),
  name: z.string().nullable(),
  status: entityStatusEnum.nullable(),
  organization: z.lazy(() => readOrganizationRefSchema).nullable(),
  items: z.array(itemSchema).nullable(),
  createdAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime().nullable(),
});
export type ReadEntity = z.infer<typeof readEntitySchema>;
```

Rules:
- **Every field is `.nullable()`** - API responses can have null for any field
- Use `z.lazy(() => schema)` for circular references or cross-entity references
- Use `z.iso.datetime()` for date fields (not `z.date()`)
- Use `z.uuid()` for ID fields
- Nested objects can be inline `z.object({...}).nullable()` or reference other schemas
- Arrays use `z.array(itemSchema).nullable()`

### Layer 4: createEntitySchema (Create payload)

Fields required to create a new entity. Matches the backend DTO serialization groups.

```typescript
export const createEntitySchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(250, 'Name must not exceed 250 characters'),
  organization: z.lazy(() => organizationRefSchema),  // FK reference
  status: entityStatusEnum.optional(),
  description: z.string().optional(),
});
export type CreateEntity = z.infer<typeof createEntitySchema>;
```

Rules:
- Required fields have **no** `.optional()` or `.nullable()`
- Optional fields use `.optional()`
- Relations use the minimal `*RefSchema` (Layer 2), not the read ref
- Add validation messages for min/max/format constraints
- Images use `updateImageSchema.nullable().optional()`

### Layer 5: updateEntitySchema (Update payload)

Fields that can be updated. Usually a subset or partial of create.

```typescript
export const updateEntitySchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(250, 'Name must not exceed 250 characters')
    .optional(),
  description: z.string().optional(),
});
export type UpdateEntity = z.infer<typeof updateEntitySchema>;
```

Or if update is simply a partial of create:

```typescript
export const updateEntitySchema = createEntitySchema.partial();
export type UpdateEntity = z.infer<typeof updateEntitySchema>;
```

### Layer 6: Legacy Exports (for backward compatibility)

At the bottom of the file, add legacy aliases:

```typescript
export const entitySchema = readEntitySchema;
export type Entity = ReadEntity;
```

## Common Patterns

### Nested/Embedded Schemas

For JSONB or embedded objects that don't have their own endpoint:

```typescript
export const addressSchema = z.object({
  street: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
});
export type Address = z.infer<typeof addressSchema>;
```

Then use in the parent: `address: addressSchema.nullable(),`

### Composable Image Schemas

Images use a special pattern. Import from `../images`:

```typescript
import { readImageSchema, updateImageSchema } from '../images';

// In read schemas (readImageSchema is a plain object, not z.object):
logo: z.object(readImageSchema).nullable(),

// In create/update schemas:
logo: updateImageSchema.nullable().optional(),
```

### Cross-Entity References with z.lazy()

Always wrap cross-entity schema references in `z.lazy()` to avoid circular dependency issues:

```typescript
organization: z.lazy(() => readOrganizationRefSchema).nullable(),
members: z.array(z.lazy(() => readOrganizationMemberSchema)).nullable(),
```

### Validation Messages

Form-facing schemas carry validation messages as **translation keys** (`validation.*`), never English text. `FieldError` translates them with `tIfKey`. Add each new key to `packages/core-translations/src/lib/translations/{en,fr}/validation.json` (see the `translations` rule):

```typescript
name: z.string()
  .min(1, 'validation.common.nameRequired')
  .max(250, 'validation.<entity>.nameTooLong'),
email: z.email('validation.common.invalidEmail'),
```

### Union/Discriminated Types

For schemas with multiple valid shapes:

```typescript
export const importItemSchema = z.union([
  importByIdSchema,
  importByDomainSchema,
]);
export type ImportItem = z.infer<typeof importItemSchema>;
```

### Custom Refinements

For cross-field validation:

```typescript
export const changePasswordSchema = z.object({
  newPassword: z.string().min(8),
  repeatNewPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.repeatNewPassword, {
  message: 'Passwords do not match.',
  path: ['repeatNewPassword'],
});
```

## Complete Minimal Example

For a new entity called `project`:

```typescript
// packages/core-api-models/src/lib/projects/models.ts
import * as z from 'zod';
import { organizationRefSchema, readOrganizationRefSchema } from '../organizations';

// Enums
export const projectStatusEnum = z.enum(['draft', 'active', 'archived']);
export type ProjectStatus = z.infer<typeof projectStatusEnum>;

// 1. Reference schema with label field
export const readProjectRefSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});
export type ReadProjectRef = z.infer<typeof readProjectRefSchema>;

// 2. Minimal reference schema (for foreign keys)
export const projectRefSchema = z.object({
  id: z.uuid(),
});
export type ProjectRef = z.infer<typeof projectRefSchema>;

// 3. Read schema - all properties nullable
export const readProjectSchema = z.object({
  id: z.uuid().nullable(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  status: projectStatusEnum.nullable(),
  organization: z.lazy(() => readOrganizationRefSchema).nullable(),
  createdAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime().nullable(),
});
export type ReadProject = z.infer<typeof readProjectSchema>;

// 4. Create schema
export const createProjectSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(250, 'Name must not exceed 250 characters'),
  description: z.string().optional(),
  organization: z.lazy(() => organizationRefSchema),
});
export type CreateProject = z.infer<typeof createProjectSchema>;

// 5. Update schema
export const updateProjectSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(250, 'Name must not exceed 250 characters')
    .optional(),
  description: z.string().optional(),
  status: projectStatusEnum.optional(),
});
export type UpdateProject = z.infer<typeof updateProjectSchema>;

// Legacy exports
export const projectSchema = readProjectSchema;
export type Project = ReadProject;
```

```typescript
// packages/core-api-models/src/lib/projects/index.ts
export * from './models';
```

Then add to `packages/core-api-models/src/index.ts`:

```typescript
export * from './lib/projects';
```

## Checklist

When creating a new model, verify:

- [ ] File is at `packages/core-api-models/src/lib/<entity>/models.ts`
- [ ] `index.ts` barrel file exists and re-exports
- [ ] Main package `src/index.ts` exports the new entity
- [ ] Import is `import * as z from 'zod'`
- [ ] `readEntityRefSchema` has non-null `id` + display label
- [ ] `entityRefSchema` has non-null `id` only
- [ ] `readEntitySchema` has all fields `.nullable()`
- [ ] Dates use `z.iso.datetime()`, IDs use `z.uuid()`
- [ ] Cross-entity references use `z.lazy()`
- [ ] Create/update schemas have validation messages
- [ ] Legacy exports exist at the bottom
- [ ] `npx nx typecheck @skeleton/core-api-models` passes
