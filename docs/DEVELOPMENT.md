# Development Guide

## Commands

### Development Server

```sh
npx nx dev @skeleton/skeleton-app        # Start skeleton-app on port 4200
npx nx dev @skeleton/skeleton-bo-app     # Start back-office app on port 4400
npx nx serve @skeleton/skeleton-app      # Alternative dev server command
```

Each app needs its `.env` (`cp apps/<app>/.env.example apps/<app>/.env`) and a running backend at `VITE_API_URL`.

### Build & Preview

```sh
npx nx build @skeleton/skeleton-app      # Production build
npx nx preview @skeleton/skeleton-app    # Preview production build
```

### Testing

```sh
npx nx test @skeleton/skeleton-app              # Run tests with Vitest
npx nx test @skeleton/skeleton-app --coverage   # Run tests with coverage
npx nx test <package-name>                # Run tests for specific package
```

### Code Quality

```sh
npx nx lint @skeleton/skeleton-app       # Run ESLint
npx nx typecheck @skeleton/skeleton-app  # Run TypeScript type checking
npx nx typecheck <package-name>    # Type check specific package
npx nx run-many -t lint,test,typecheck   # Same checks as CI
node scripts/check-translations.mjs      # Translation keys and locale parity
```

### Workspace Management

```sh
npx nx show projects               # List all projects
npx nx show project @skeleton/skeleton-app  # Show project configuration
npx nx graph                       # Visualize project dependencies
npx nx sync                        # Sync workspace configuration
```

## Creating New Packages

### Feature Package

```sh
npx nx g @nx/react:lib web-feature-<name> \
    --directory=packages/web-feature-<name> \
    --importPath=@skeleton/web-feature-<name> \
    --bundler=none \
    --unitTestRunner=none \
    --linter=eslint
```

### Core Package

```sh
npx nx g @nx/react:lib core-<name> \
    --directory=packages/core-<name> \
    --importPath=@skeleton/core-<name> \
    --bundler=none \
    --unitTestRunner=none \
    --linter=eslint
```

### Web Package

```sh
npx nx g @nx/react:lib web-<name> \
    --directory=packages/web-<name> \
    --importPath=@skeleton/web-<name> \
    --bundler=none \
    --unitTestRunner=none \
    --linter=eslint
```

### After Creating a Package

1. If the package contains styled components, add it to `@source` list in `apps/skeleton-app/src/styles.css` (and the back office's)
2. Run `npx nx sync` to update Tailwind configuration
3. Export main modules from `packages/<name>/src/index.ts`
4. For a feature package, export a `*Routes` component and mount it in the app routes

## Adding API Endpoints

The examples below use a placeholder `Entity`. For a real, complete example, look at service accounts: `packages/core-api-models/src/lib/service-accounts/`, `packages/core-api/src/lib/endpoints/service-accounts.ts` and `packages/core-api/src/lib/queries/service-accounts/`.

### 1. Create Models

In `packages/core-api-models/src/lib/<entity>/models.ts`:

```typescript
import * as z from 'zod';

export const readEntitySchema = z.object({
  id: z.uuid().nullable(),
  name: z.string().nullable(),
  createdAt: z.iso.datetime().nullable(),
});

export const createEntitySchema = z.object({
  // Validation messages are translation keys (validation.*)
  name: z.string().min(1, 'validation.common.nameRequired'),
});

export const updateEntitySchema = z.object({
  name: z.string().optional(),
});

export type Entity = z.infer<typeof readEntitySchema>;
export type CreateEntity = z.infer<typeof createEntitySchema>;
export type UpdateEntity = z.infer<typeof updateEntitySchema>;
```

### 2. Create Endpoint

In `packages/core-api/src/lib/endpoints/<entity>.ts`:

```typescript
import { Entity, CreateEntity, UpdateEntity } from '@skeleton/core-api-models';
import { ApiClient } from '../api-client/api-client';
import { ApiCollectionResponse, GetCollectionQueryParams, GetQueryByIdParams } from '../types';

export class EntityEndpoint {
  constructor(private client: ApiClient) {}

  async getEntities(
    params: GetCollectionQueryParams<Entity>,
  ): Promise<ApiCollectionResponse<Entity>> {
    const { fields, offset = 0, limit = 20, filters } = params;
    return this.client.getCollection<Entity>('/api/v1/entities', fields, {
      offset,
      limit,
      ...filters,
    });
  }

  async getEntity(params: GetQueryByIdParams<Entity>): Promise<Entity> {
    const { id, fields } = params;
    return this.client.getById<Entity>(`/api/v1/entities/${id}`, fields);
  }

  async createEntity(data: CreateEntity): Promise<Entity> {
    return this.client.post<Entity>('/api/v1/entities', data);
  }

  async updateEntity(id: string, data: UpdateEntity): Promise<Entity> {
    return this.client.put<Entity>(`/api/v1/entities/${id}`, data);
  }

  async deleteEntity(id: string): Promise<void> {
    return this.client.delete<void>(`/api/v1/entities/${id}`);
  }
}
```

Workspace-scoped resources live under `/api/v1/organizations/{organizationId}/…` and take the organization id through `staticParams` (see `ServiceAccountsEndpoint`).

### 3. Register Endpoint

In `packages/core-api/src/lib/api.ts`, add the endpoint to the `SkeletonApi` class.

### 4. Create Query Hooks

In `packages/core-api/src/lib/queries/<entity>/`:

```typescript
// use-get-entities.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Entity } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { ApiCollectionResponse, GetCollectionQueryParams } from '../../types';

export const useGetEntities = (
  params: GetCollectionQueryParams<Entity>,
  options?: Omit<UseQueryOptions<ApiCollectionResponse<Entity>, ApiError>, 'queryKey'>,
) =>
  useQuery({
    queryKey: ['entities', params],
    queryFn: () => skeletonApi.entities.getEntities(params),
    ...options,
  });
```

### 5. Create Mutation Hooks

```typescript
// use-create-entity.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Entity, CreateEntity } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export const useCreateEntity = () => {
  const queryClient = useQueryClient();
  return useMutation<Entity, ApiError, CreateEntity>({
    mutationFn: (data) => skeletonApi.entities.createEntity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
    },
  });
};
```

The full conventions (cache keys, invalidation, exports) are in the `api-request-guide` skill.

## Adding Pages

Pages live in `web-feature-*` packages under `src/lib/pages/<action>-<entity>-page/`, and are mounted by the feature's `*Routes` component. Back-office pages carry `manager` in their name (`list-users-manager-page`). See `.claude/rules/page-components.md`, `.claude/rules/routes.md` and the `create-page` skill. Good references:

- List (workspace): `web-feature-organizations/src/lib/pages/list-service-account-page`
- List (back office): `web-feature-users/src/lib/pages/list-users-manager-page`
- Tabbed edit (back office): `web-feature-organizations/src/lib/pages/edit-organization-manager-page`
- Tabbed settings with shared data (workspace): `web-feature-users/src/lib/pages/account-settings-page`

## Adding Translations

Every user-visible string goes through `t()`:

```tsx
import { useTranslation } from '@skeleton/core-translations';

const { t } = useTranslation();
<LayoutHeader pageTitle={t('serviceAccounts.list.title')} />
```

1. Add the key to the namespace file in **both** `packages/core-translations/src/lib/translations/en/` and `fr/` (create `<namespace>.json` in both if the namespace is new — files are picked up automatically).
2. Keys are flat and prefixed by their namespace; reuse `common.*` for generic labels.
3. Zod validation messages are `validation.*` keys.
4. Run `node scripts/check-translations.mjs`.

## Resources

- [Nx Documentation](https://nx.dev)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://zustand.docs.pmnd.rs)
- [Radix UI Documentation](https://www.radix-ui.com)
- [FormatJS / react-intl Documentation](https://formatjs.github.io/docs/react-intl)
