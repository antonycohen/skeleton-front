# @skeleton/storybook

The catalogue of the Skeleton UI: design tokens, every component and every screen, with a mock API so
screens render without a backend.

```bash
npx nx storybook @skeleton/storybook          # dev server on http://localhost:6006
npx nx build-storybook @skeleton/storybook    # static build in apps/storybook/dist
npx nx typecheck @skeleton/storybook          # typechecks the app and every *.stories.tsx
node apps/storybook/scripts/smoke.mjs [id-prefix…]   # renders stories headlessly (Storybook must be running)
```

In dev, Tailwind may miss the classes of a file created after the server started: save
`src/styles.css` (or restart) to rescan. Builds always scan everything.

## Where things live

| What | Where |
|---|---|
| Storybook config, global decorators | `.storybook/main.ts`, `.storybook/preview.tsx` |
| Foundations (tokens) | `src/foundations/*.mdx` |
| Providers, app shell | `packages/storybook-support/src/providers.tsx`, `app-shell.tsx` |
| Mock API | `packages/storybook-support/src/msw/` (`api.ts` helpers, `handlers/<domain>.ts`) |
| Fixtures | `packages/storybook-support/src/fixtures/<domain>.ts` |
| Stories | **next to the component**: `packages/<pkg>/src/**/<name>.stories.tsx` |

Stories import the support code as `@skeleton/storybook-support` (`packages/storybook-support`). Package
builds exclude `*.stories.tsx` (see each `tsconfig.lib.json`); the stories are typechecked by this app
instead. Because the support package imports the packages back (app shell, providers), every package
with stories declares `"implicitDependencies": ["!@skeleton/storybook-support"]` in its `package.json`
so the Nx graph stays acyclic — add it when a package gets its first story.

## Sidebar hierarchy

- `Foundations/…` tokens
- `Components/UI/<Name>` shadcn primitives (`web-components/src/lib/ui`)
- `Components/Custom/<Name>` product components (`web-components/src/lib/custom`, `shadcn-io`)
- `Components/Pro blocks/<Name>` (`web-components/src/lib/pro-blocks`)
- `Patterns/Form|Collection|AI|Funnel/<Name>` (`web-form`, `web-collection`, `web-ai`, `web-funnel`)
- `Layout/<Name>` (`web-layout`)
- `Screens/<Area>/<Page>` every page of the `web-feature-*` packages; back-office pages under
  `Screens/Back office/<Area>/<Page>`
- `Prototypes/<Feature>/<Screen>` concept screens, in Storybook only (`src/prototypes/`)

## Writing a component story

CSF 3, `satisfies Meta<typeof Component>`, one story per meaningful state. Reference:
`packages/web-components/src/lib/ui/button.stories.tsx`.

- cva components: one story per variant plus a `Matrix` of variants × sizes; `argTypes` list the
  variant options.
- Overlays (dialog, sheet, popover, dropdown…): add an `Open` story with `open` / `defaultOpen`.
- Event props: `fn()` from `storybook/test`.
- A router is always there (`parameters.router = { url, path }` to set the address / params).
- `parameters: { layout: 'centered' | 'padded' }` for small components (the default is fullscreen).

## Writing a screen story

Reference: `packages/web-feature-users/src/lib/pages/list-users-manager-page/users-list-manager-page.stories.tsx`
(back office, bare) and `.../account-settings-page/account-settings-page.stories.tsx` (in the app shell,
with tabs as child routes).

```ts
parameters: {
  screen: { path: 'assistant/:conversationId', url: `assistant/${CONVERSATION_ID}` } satisfies ScreenParameters,
}
```

- `path` is the route the page is declared under (copy it from the package's `*-routes.tsx`, keep its
  params so `useParams` works); `url` the address it opens at. Relative = under `/w/<workspace id>/`;
  start with `/` for an absolute route.
- `layout: 'bare'` renders the page without the signed-in shell (full-screen views, login,
  back office). `workspace: false` skips the workspace provider (login, back office).
- Pages whose tabs are child routes: render the package's `*Routes` component with `path: 'x/*'`.
- `parameters.workspace`: `'default' | 'free' | 'overQuota' | 'other'` (or a full
  organization). `parameters.session: 'anonymous'` for logged-out screens.
- Standard stories: `Default`, then `Loading`, `Empty`, `Error` where the page has them, then any
  state worth seeing (plan, status, feature flag…).
- A page that redirects on mount shows a "Navigated away" placeholder with the target address.

- Never `export const Error` (it shadows the global `Error` in the module): export `Failed` with
  `name: 'Error'`.
- Write a meta's `parameters` (notably `screen`) as a literal object, not the result of a helper
  call: it was observed being dropped at meta level (fine at story level).
- Pages under `settings/` get the settings shell (back link, settings navigation) automatically.
- Controlled inputs: `decorators: [withForm]` and `parameters.form = { defaultValues, errors }`.

## Mocking the API

Every request to the API goes to `VITE_API_URL` (`https://api.storybook.local`) and is answered by MSW.

- Default handlers per domain in `packages/storybook-support/src/msw/handlers/<domain>.ts`, registered in
  `handlers/index.ts`. Session handlers (connected user, workspace, app config) come first, the
  fallback last: it answers any unmocked call (`{ id }` for a path ending with an id, an empty
  collection otherwise, writes echo their body) and logs `[storybook-msw] no handler for …`.
- Routes: copy them from `packages/core-api/src/lib/endpoints/*.ts`; use `api('/organizations/:organizationId/members')`.
- Responses: `json(body)` (fixtures are camelCase, converted to snake_case like the real wire
  format), `collection(items, request)` (bare array + `X-Total-Count`/`X-Limit`/`X-Offset` headers,
  which is what the API sends), `problem(status)`.
- Story overrides go in `parameters.msw` and win over the defaults:
  `mock.loading(path)`, `mock.empty(path)`, `mock.error(path, status)`, `mock.body(path, body)`,
  `mock.collection(path, items)`, or any `http.get(api(...), …)` handler.
- Fixtures: `make(readXSchema, { …overrides })` fills every key of the read schema with `null`, then
  applies the overrides. Ids: `uuid(n, '<domain prefix>')`. Dates: `daysAgo(n)` / `daysFromNow(n)`
  (fixed "today", so stories never drift).
