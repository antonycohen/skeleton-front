---
name: api-request-guide
description: Explains how to implement API requests in packages/core-api. Covers endpoint classes, TanStack Query hooks (queries and mutations), cache invalidation, and the full wiring from endpoint to exported hook.
disable-model-invocation: true
argument-hint: [entity-name]
---

# How to Implement API Requests in core-api

This guide covers the two layers of `packages/core-api`:

1. **Endpoint classes** (`lib/endpoints/<entity>.ts`) - low-level API calls via `ApiClient`
2. **Query hooks** (`lib/queries/<entity>/use-*.ts`) - TanStack Query wrappers consumed by components

## Architecture Overview

```
Component
  -> useGetServiceAccounts(params)           # TanStack Query hook
    -> skeletonApi.serviceAccounts.getServiceAccounts(params)  # Endpoint method
      -> apiClient.getCollection(...)           # ApiClient HTTP call
```

The singleton `skeletonApi` (defined in `lib/api.ts`) aggregates all endpoint classes. Query hooks import `skeletonApi` and wrap endpoint methods with `useQuery` or `useMutation`.

## Shared Types

Defined in `lib/types.ts`, these types are used across all endpoints and queries:

```typescript
// Collection response with pagination headers
type ApiCollectionResponse<T> = {
  data: T[];
  pagination: { count: number; offset: number; limit: number; };
};

// Params for getById queries
type GetQueryByIdParams<T, Q = undefined> = {
  fields?: FieldQuery<T>;
  id: string;
  staticParams?: Q;
};

// Params for collection queries
type GetCollectionQueryParams<T, Q = undefined> = {
  fields?: FieldQuery<T>;
  offset: number;
  limit: number;
  filters?: QueryParams;
  staticParams?: Q;
  sort?: { field: keyof T; direction: 'asc' | 'desc'; };
};

// Sparse fieldset selection (nested field projection)
type FieldQuery<T> = { [K in keyof T]?: FieldQueryValue<T[K]> };
```

## Part 1: Endpoint Classes

Location: `packages/core-api/src/lib/endpoints/<entity>.ts`

### Basic Endpoint Class

```typescript
import { Entity, CreateEntity, UpdateEntity } from '@skeleton/core-api-models';
import { ApiClient } from '../api-client/api-client';
import { ApiCollectionResponse, GetCollectionQueryParams, GetQueryByIdParams } from '../types';

// Optional: define filter interfaces for collection queries
export interface GetEntitiesFilter {
  organizationId?: string;
}

export class EntitiesEndpoint {
  constructor(private client: ApiClient) {}

  // GET by ID
  async getEntity(params: GetQueryByIdParams<Entity>): Promise<Entity> {
    return this.client.getById<Entity>(
      `/api/v1/entities/${params.id}`,
      params.fields,
    );
  }

  // GET collection
  async getEntities(
    params: GetCollectionQueryParams<Entity, GetEntitiesFilter>,
  ): Promise<ApiCollectionResponse<Entity>> {
    const { fields, offset, limit, filters, staticParams } = params;
    return this.client.getCollection<Entity>('/api/v1/entities', fields, {
      offset,
      limit,
      ...filters,
      ...staticParams,
    });
  }

  // POST create
  async createEntity(data: CreateEntity): Promise<Entity> {
    return this.client.post<Entity>('/api/v1/entities', data);
  }

  // PUT full update
  async updateEntity(id: string, data: UpdateEntity): Promise<Entity> {
    return this.client.put<Entity>(`/api/v1/entities/${id}`, data);
  }

  // PATCH partial update
  async patchEntity(id: string, data: Partial<UpdateEntity>): Promise<Entity> {
    return this.client.patch<Entity>(`/api/v1/entities/${id}`, data);
  }

  // DELETE
  async deleteEntity(id: string): Promise<void> {
    return this.client.delete<void>(`/api/v1/entities/${id}`);
  }
}
```

### ApiClient Methods

The `ApiClient` provides these HTTP methods:

| Method | Signature | Use case |
|--------|-----------|----------|
| `getById<T>(url, fields?, config?)` | `Promise<T>` | Single resource |
| `getCollection<T>(url, fields?, query?, config?)` | `Promise<ApiCollectionResponse<T>>` | Paginated list |
| `post<T>(url, data?, config?)` | `Promise<T>` | Create / actions |
| `put<T>(url, data?, config?)` | `Promise<T>` | Full update |
| `patch<T>(url, data?, config?)` | `Promise<T>` | Partial update |
| `delete<T>(url, config?)` | `Promise<T>` | Delete |
| `postStream(url, data?, onEvent?, onError?, onComplete?)` | `Promise<void>` | SSE streaming |

Key behaviors:
- Request/response bodies are **automatically snake_case/camelCase converted**
- Auth token is injected via interceptor, with automatic 401 refresh
- Errors are wrapped in `ApiError`

### Sub-Resource Endpoints

For nested resources, define a static filter interface and access them through the parent:

```typescript
export interface GetEntityItemsStaticFilter {
  entityId: string;
}

// Inside the endpoint class:
async getEntityItems(
  params: GetCollectionQueryParams<Item, GetEntityItemsStaticFilter>,
): Promise<ApiCollectionResponse<Item>> {
  const { staticParams, fields, offset = 0, limit = 20, filters } = params;
  return this.client.getCollection<Item>(
    `/api/v1/entities/${staticParams?.entityId}/items`,
    fields,
    { offset, limit, ...filters },
  );
}
```

### Custom Actions (non-CRUD)

For RPC-style actions, use descriptive method names:

```typescript
// POST action (no body or custom body)
async publishEntity(id: string): Promise<Entity> {
  return this.client.post<Entity>(`/api/v1/entities/${id}/_publish`, {});
}

// PUT with extra path segment
async addStep(id: string, step: StepEnum): Promise<Entity> {
  return this.client.put<Entity>(`/api/v1/entities/${id}/step/${step}`, {});
}
```

### SSE Streaming Endpoints

For server-sent events (AI agents, live updates):

```typescript
async startEntityStream(
  entityId: string,
  onEvent?: (event: StreamEvent) => void,
  onError?: (error: ApiError) => void,
  onComplete?: () => void,
): Promise<void> {
  return this.client.postStream(
    `/api/v1/entities/${entityId}/stream`,
    {},
    onEvent,
    onError,
    onComplete,
  );
}
```

### Registering in SkeletonApi

After creating the endpoint class, register it in `lib/api.ts`:

```typescript
import { EntitiesEndpoint } from './endpoints/entities';

class SkeletonApi {
  public readonly entities: EntitiesEndpoint;

  constructor(config: ApiClientConfig) {
    this.client = new ApiClient(config);
    this.entities = new EntitiesEndpoint(this.client);
    // ... other endpoints
  }
}
```

---

## Part 2: Query Hooks

Location: `packages/core-api/src/lib/queries/<entity>/use-<action>.ts`

Each hook file exports:
1. A **standalone async function** (for use outside React)
2. A **React hook** wrapping it with TanStack Query

### File Naming Convention

| Operation | File name |
|-----------|-----------|
| Get by ID | `use-get-<entity>-by-id.ts` |
| Get collection | `use-get-<entities>.ts` |
| Create | `use-create-<entity>.ts` |
| Update (PUT) | `use-update-<entity>.ts` |
| Patch (PATCH) | `use-patch-<entity>.ts` |
| Delete | `use-delete-<entity>.ts` |
| Custom action | `use-<action-name>.ts` |
| Sub-resource | `use-get-<parent>-<children>.ts` |

### Query Hook: Get by ID

```typescript
import { GetQueryByIdParams } from '../../types';
import { Entity } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const getEntityById = async (
  params: GetQueryByIdParams<Entity>,
): Promise<Entity> => {
  return await skeletonApi.entities.getEntity(params);
};

export const useGetEntityById = (
  params: GetQueryByIdParams<Entity>,
  options?: Omit<UseQueryOptions<Entity, ApiError>, 'queryKey'>,
) =>
  useQuery({
    queryKey: ['entity', params.id, params.fields],
    queryFn: () => getEntityById(params),
    ...options,
  });
```

### Query Hook: Get Collection

```typescript
import { ApiCollectionResponse, GetCollectionQueryParams } from '../../types';
import { Entity } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { GetEntitiesFilter } from '../../endpoints/entities';

export const getEntities = async (
  params: GetCollectionQueryParams<Entity, GetEntitiesFilter>,
): Promise<ApiCollectionResponse<Entity>> => {
  return await skeletonApi.entities.getEntities(params);
};

export const useGetEntities = (
  params: GetCollectionQueryParams<Entity, GetEntitiesFilter>,
  options?: Omit<
    UseQueryOptions<ApiCollectionResponse<Entity>, ApiError>,
    'queryKey'
  >,
) =>
  useQuery({
    queryKey: ['entities', params],
    queryFn: () => getEntities(params),
    ...options,
  });
```

### Query Hook: Sub-Resource Collection

```typescript
export const useGetEntityItems = (
  params: GetCollectionQueryParams<Item, GetEntityItemsStaticFilter>,
  options?: Omit<
    UseQueryOptions<ApiCollectionResponse<Item>, ApiError>,
    'queryKey'
  >,
) =>
  useQuery({
    // Nest under parent key for targeted invalidation
    queryKey: ['entities', params.staticParams?.entityId, 'items', params],
    queryFn: () => getEntityItems(params),
    ...options,
  });
```

### Mutation Hook: Create

```typescript
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { Entity, CreateEntity } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export const createEntity = async (data: CreateEntity): Promise<Entity> => {
  return await skeletonApi.entities.createEntity(data);
};

export const useCreateEntity = (
  options?: Omit<
    UseMutationOptions<Entity, ApiError, CreateEntity>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEntity,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
```

### Mutation Hook: Update / Patch

```typescript
export interface UpdateEntityParams {
  id: string;
  data: UpdateEntity;
}

export const updateEntity = async (params: UpdateEntityParams): Promise<Entity> => {
  return await skeletonApi.entities.updateEntity(params.id, params.data);
};

export const useUpdateEntity = (
  options?: Omit<
    UseMutationOptions<Entity, ApiError, UpdateEntityParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEntity,
    onSuccess: (...args) => {
      // Invalidate both the collection and the specific item
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      queryClient.invalidateQueries({ queryKey: ['entity', args[1].id] });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
```

### Mutation Hook: Delete

```typescript
export type DeleteEntityParams = {
  id: string;
};

export const deleteEntity = async (params: DeleteEntityParams): Promise<void> => {
  return await skeletonApi.entities.deleteEntity(params.id);
};

export const useDeleteEntity = (
  options?: Omit<
    UseMutationOptions<void, ApiError, DeleteEntityParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEntity,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      // Remove the deleted item from cache entirely
      queryClient.removeQueries({ queryKey: ['entity', args[1].id] });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
```

### Mutation Hook: Custom Action (id-only)

```typescript
export interface PublishEntityParams {
  id: string;
}

export const publishEntity = async (params: PublishEntityParams): Promise<Entity> => {
  return await skeletonApi.entities.publishEntity(params.id);
};

export const usePublishEntity = (
  options?: Omit<
    UseMutationOptions<Entity, ApiError, PublishEntityParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishEntity,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      queryClient.invalidateQueries({ queryKey: ['entity', args[1].id] });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
```

---

## Cache Key Conventions

| Pattern | Query key |
|---------|-----------|
| Collection | `['entities', params]` |
| Single item | `['entity', id, fields]` |
| Sub-resource | `['entities', parentId, 'children', params]` |

Rules:
- Collection key is the **plural** entity name
- Single item key is the **singular** entity name
- `params` object is included so different filter/pagination combos are cached separately
- `fields` is included in by-id keys since different field projections yield different data

## Cache Invalidation Rules

| Operation | Invalidate | Remove |
|-----------|-----------|--------|
| Create | `['entities']` (collection) | - |
| Update/Patch | `['entities']` + `['entity', id]` | - |
| Delete | `['entities']` | `['entity', id]` |
| Custom action | `['entities']` + `['entity', id]` | - |

Key pattern:
- Mutations always **invalidate** (refetch) the collection
- Update/action mutations also **invalidate** the specific item
- Delete mutations **remove** the specific item from cache (no refetch needed)
- `onSuccess` always calls the caller's `onSuccess` last via `onSuccess?.(...args)`

---

## Exports / Wiring

### 1. Package index (`packages/core-api/src/index.ts`)

Every query hook file is individually exported from the main index (no barrel files for queries):

```typescript
export * from './lib/queries/entities/use-get-entities';
export * from './lib/queries/entities/use-get-entity-by-id';
export * from './lib/queries/entities/use-create-entity';
export * from './lib/queries/entities/use-update-entity';
export * from './lib/queries/entities/use-delete-entity';
```

### 2. Endpoint registration in `lib/api.ts`

Add the endpoint instance to the `SkeletonApi` class (see above).

---

## Checklist for Adding a New Entity

- [ ] Create `lib/endpoints/<entity>.ts` with endpoint class
- [ ] Register endpoint in `lib/api.ts` (import, declare property, instantiate)
- [ ] Create `lib/queries/<entity>/` directory
- [ ] Add `use-get-<entity>-by-id.ts` (query)
- [ ] Add `use-get-<entities>.ts` (collection query)
- [ ] Add `use-create-<entity>.ts` (mutation)
- [ ] Add `use-update-<entity>.ts` and/or `use-patch-<entity>.ts` (mutations)
- [ ] Add `use-delete-<entity>.ts` if needed (mutation)
- [ ] Add any custom action hooks
- [ ] Export all hook files from `packages/core-api/src/index.ts`
- [ ] Verify cache keys follow naming conventions
- [ ] Verify all mutations invalidate/remove correct cache keys