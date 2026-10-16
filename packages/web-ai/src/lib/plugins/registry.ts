import type { AiChatPlugin, BlockType } from '../types/plugin';

/**
 * Plugin registry for managing AiChat content block plugins.
 *
 * The registry maintains a mapping of plugins and their supported block types,
 * allowing for dynamic plugin registration and lookup.
 */
export class AiChatPluginRegistry {
  private plugins: Map<string, AiChatPlugin> = new Map();
  private typeToPlugin: Map<string, string> = new Map();

  /**
   * Register a plugin with the registry.
   *
   * @param plugin - The plugin to register
   * @throws Error if a plugin with the same ID already exists
   */
  register(plugin: AiChatPlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin with id "${plugin.id}" is already registered`);
    }

    this.plugins.set(plugin.id, plugin);

    // Map each block type to this plugin
    for (const blockType of plugin.blockTypes) {
      // Allow overriding existing type mappings (later registered plugins take precedence)
      this.typeToPlugin.set(blockType, plugin.id);
    }
  }

  /**
   * Unregister a plugin by ID.
   *
   * @param pluginId - The ID of the plugin to remove
   */
  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    // Remove type mappings for this plugin
    for (const blockType of plugin.blockTypes) {
      if (this.typeToPlugin.get(blockType) === pluginId) {
        this.typeToPlugin.delete(blockType);
      }
    }

    this.plugins.delete(pluginId);
  }

  /**
   * Get the plugin that handles a specific block type.
   *
   * @param blockType - The content block type
   * @returns The plugin for the block type, or undefined if not found
   */
  getPluginForType(blockType: string): AiChatPlugin | undefined {
    const pluginId = this.typeToPlugin.get(blockType);
    if (!pluginId) return undefined;
    return this.plugins.get(pluginId);
  }

  /**
   * Get a plugin by its ID.
   *
   * @param pluginId - The plugin ID
   * @returns The plugin, or undefined if not found
   */
  getPlugin(pluginId: string): AiChatPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all registered plugins, sorted by priority (highest first).
   *
   * @returns Array of all registered plugins
   */
  getAllPlugins(): AiChatPlugin[] {
    return Array.from(this.plugins.values()).sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
    );
  }

  /**
   * Check if a plugin is registered.
   *
   * @param pluginId - The plugin ID to check
   * @returns true if the plugin is registered
   */
  hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  /**
   * Clear all registered plugins.
   */
  clear(): void {
    this.plugins.clear();
    this.typeToPlugin.clear();
  }
}

/**
 * Create a new plugin registry instance.
 */
export function createPluginRegistry(): AiChatPluginRegistry {
  return new AiChatPluginRegistry();
}

/**
 * Helper to find a plugin for a block type from an array of plugins.
 * Searches in array order (plugins should be sorted by priority).
 *
 * @param blockType - The content block type
 * @param plugins - Array of plugins to search
 * @returns The matching plugin, or undefined if not found
 */
export function findPluginForType(
  blockType: BlockType,
  plugins: AiChatPlugin[]
): AiChatPlugin | undefined {
  return plugins.find((plugin) => plugin.blockTypes.includes(blockType));
}
