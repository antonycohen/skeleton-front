import { ServiceAccountPermissionCatalogEntry } from './models';

/**
 * Joins each catalog entry's resource pattern with its actions into the
 * short-form permission strings the create endpoint expects
 * (`buyer:*` + `read` -> `buyer:*:read`).
 */
export const flattenServiceAccountPermissionCatalog = (
  catalog: ServiceAccountPermissionCatalogEntry[],
): string[] =>
  catalog.flatMap((entry) =>
    entry.actions.map((action) => `${entry.resource}:${action}`),
  );

/**
 * The API stores permissions in canonical long form (`organization:<uuid>:...`);
 * strip the prefix for display.
 */
export const toShortPermission = (permission: string): string =>
  permission.replace(/^organization:[0-9a-f-]{36}:/, '');

/**
 * Splits a short-form permission into its catalog coordinates: the action is
 * the last segment, the resource pattern is everything before it
 * (`member:*:update` -> { resource: `member:*`, action: `update` }).
 */
export const splitShortPermission = (
  permission: string,
): { resource: string; action: string } => {
  const separatorIndex = permission.lastIndexOf(':');
  return {
    resource: permission.slice(0, separatorIndex),
    action: permission.slice(separatorIndex + 1),
  };
};
