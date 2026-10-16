import { useCallback, useEffect, useRef } from 'react';
import { Row, Table } from '@tanstack/react-table';
import { dequal } from 'dequal';

type SelectionMode = 'single' | 'multiple';

interface UseCollectionSelectionProps<T> {
  table: Table<T>;
  mode: SelectionMode;
  selection?: T | T[] | null;
  onSelectionChange?: ((selected: T) => void) | ((selected: T[]) => void);
  setRowSelection: (selection: Record<string, boolean>) => void;
  rowSelection: Record<string, boolean>;
}

function getItemId<T>(item: T): string | undefined {
  return (item as { id?: string }).id;
}

function getSelectionIds<T>(selection: T | T[] | null | undefined): string[] {
  if (selection === null || selection === undefined) return [];
  const items = Array.isArray(selection) ? selection : [selection];
  return items.map(getItemId).filter((id): id is string => !!id);
}

export function useCollectionSelection<T>({
  table,
  mode,
  selection,
  onSelectionChange,
  setRowSelection,
  rowSelection,
}: UseCollectionSelectionProps<T>) {
  const isControlled = selection !== undefined;
  const lastSyncedIdsRef = useRef<string>('');
  const lastNotifiedIdsRef = useRef<string>('');
  const isInternalUpdateRef = useRef(false);

  // Sync controlled selection → internal row selection
  useEffect(() => {
    if (!isControlled) return;

    const selectionIds = getSelectionIds(selection);
    const idsKey = selectionIds.sort().join(',');

    // Skip if already synced
    if (idsKey === lastSyncedIdsRef.current) return;
    lastSyncedIdsRef.current = idsKey;

    const newRowSelection: Record<string, boolean> = {};
    selectionIds.forEach(id => {
      newRowSelection[id] = true;
    });

    setRowSelection(newRowSelection);
  }, [selection, isControlled, setRowSelection]);

  // Handle row click selection
  const handleRowSelect = useCallback((row: Row<T>) => {
    isInternalUpdateRef.current = true;

    if (mode === 'single') {
      table.toggleAllRowsSelected(false);
      row.toggleSelected(true);
    } else {
      row.toggleSelected();
    }
  }, [table, mode]);

  // Compute current selected IDs from rowSelection state (stable reference)
  const currentSelectedIdsKey = Object.keys(rowSelection).filter(id => rowSelection[id]).sort().join(',');

  // Watch for selection changes and notify parent
  useEffect(() => {
    if (!onSelectionChange) return;

    // Skip if we already notified for these IDs
    if (currentSelectedIdsKey === lastNotifiedIdsRef.current) return;

    // In controlled mode, only fire callback if this was an internal update (user action)
    if (isControlled) {
      const controlledIds = getSelectionIds(selection);
      const controlledIdsKey = controlledIds.sort().join(',');

      // Skip if selection matches the controlled prop
      if (currentSelectedIdsKey === controlledIdsKey) {
        lastNotifiedIdsRef.current = currentSelectedIdsKey;
        isInternalUpdateRef.current = false;
        return;
      }

      // Only fire if this was an internal update (user action)
      if (!isInternalUpdateRef.current) {
        return;
      }
    }

    lastNotifiedIdsRef.current = currentSelectedIdsKey;
    isInternalUpdateRef.current = false;

    const selectedRows = table.getSelectedRowModel().rows;
    const selected = selectedRows.map(row => row.original);

    if (mode === 'single') {
      (onSelectionChange as (selected: T) => void)(selected[0] ?? null as unknown as T);
    } else {
      (onSelectionChange as (selected: T[]) => void)(selected);
    }
  }, [currentSelectedIdsKey, onSelectionChange, isControlled, selection, mode, table]);

  // When table data refreshes, check if selected items' data changed and notify parent
  const selectedRows = table.getSelectedRowModel().rows;
  const selectedData = selectedRows.map(row => row.original);
  const lastSelectedDataRef = useRef<T[]>(selectedData);

  useEffect(() => {
    if (!onSelectionChange || selectedData.length === 0) return;
    if (dequal(lastSelectedDataRef.current, selectedData)) return;

    lastSelectedDataRef.current = selectedData;

    if (mode === 'single') {
      (onSelectionChange as (selected: T) => void)(selectedData[0]);
    } else {
      (onSelectionChange as (selected: T[]) => void)(selectedData);
    }
  }, [selectedData, onSelectionChange, mode]);

  return {
    handleRowSelect,
  };
}
