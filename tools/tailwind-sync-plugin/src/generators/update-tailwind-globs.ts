import { createProjectGraphAsync, Tree } from '@nx/devkit';
import { join } from 'path';
import { SyncGeneratorResult } from 'nx/src/utils/sync-generators';

export async function updateTailwindGlobsGenerator(
  tree: Tree,
): Promise<SyncGeneratorResult> {
  const projectGraph = await createProjectGraphAsync();
  // Nx infers the Vite apps as libraries (no `projectType`): select them by
  // location, and only those that own a Tailwind entry stylesheet. Storybook
  // (`type:storybook`) scans every package itself and must not drag its support
  // package into the apps' stylesheets.
  const apps = Object.values(projectGraph.nodes).filter(
    (node) =>
      node.data.root.startsWith('apps/') &&
      !node.data.tags?.includes('type:storybook') &&
      tree.exists(`${node.data.root}/src/styles.css`),
  );

  // Get all dependencies of the apps
  const dependencies = new Set<string>();
  const queue = apps.map((app) => app.name);
  const visited = new Set<string>();

  // BFS to find all dependencies
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const deps = projectGraph.dependencies[current] || [];
    deps.forEach((dep) => {
      dependencies.add(dep.target);
      queue.push(dep.target);
    });
  }

  // Generate @source directives for each dependency
  const sourceDirectives: string[] = [];

  // Add patterns for each dependency
  dependencies.forEach((dep) => {
    const project = projectGraph.nodes[dep];
    if (project && project.data.root) {
      const relativePath = join('../../../', project.data.root);
      sourceDirectives.push(`@source "${relativePath}";`);
    }
  });

  // Sort for consistency
  sourceDirectives.sort();

  let updated = 0;
  for (let i = 0; i < apps.length; i++) {
    const app = apps[i];

    // Read current styles.css
    const stylesPath = `${app.data.root}/src/styles.css`;
    const currentContent = tree.read(stylesPath)?.toString() || '';

    // Find where to insert the @source directives (after @import "tailwindcss";)
    const importIndex = currentContent.indexOf('@import "tailwindcss";');
    if (importIndex === -1) {
      return {
        outOfSyncMessage: 'Could not find @import "tailwindcss"; in styles.css',
      };
    }

    // Only the @source directives of workspace packages are managed here;
    // others (e.g. a node_modules library) are left untouched.
    const managedSourceRegex = /\n@source\s+"\.\.\/\.\.\/\.\.\/packages\/[^"]+";/g;
    const existingSources = new Set(
      (currentContent.match(managedSourceRegex) || []).map((s) => s.trim()),
    );

    // Check if we need to update
    const needsUpdate =
      sourceDirectives.length !== existingSources.size ||
      sourceDirectives.some((directive) => !existingSources.has(directive));

    if (needsUpdate) {
      // Remove the managed @source lines (including newlines)
      const cleanedContent = currentContent.replace(managedSourceRegex, '');

      // Insert the block after the last @import line
      const lastImportIndex = cleanedContent.lastIndexOf('\n@import ');
      const insertIndex =
        lastImportIndex === -1
          ? cleanedContent.indexOf('\n', importIndex) + 1
          : cleanedContent.indexOf('\n', lastImportIndex + 1) + 1;

      const sourcesBlock =
        sourceDirectives.length > 0
          ? '\n' + sourceDirectives.join('\n') + '\n'
          : '';

      const newContent =
        cleanedContent.substring(0, insertIndex) +
        sourcesBlock +
        cleanedContent.substring(insertIndex);
      tree.write(stylesPath, newContent);

      updated++;
    }
  }

  if (updated) {
    return {
      outOfSyncMessage: `Tailwind @source directives updated. Added ${sourceDirectives.length} source directives.`,
    };
  } else {
    return {};
  }
}

export default updateTailwindGlobsGenerator;
