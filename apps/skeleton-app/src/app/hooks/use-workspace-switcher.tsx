import {useEffect, useState} from 'react';
import {keepPreviousData} from '@tanstack/react-query';
import {GalleryVerticalEnd} from 'lucide-react';
import {useGetUserOrganizations} from '@skeleton/core-api';
import {useCurrentOrganization} from '@skeleton/core-workspace';
import {CommandInput, TeamSwitcherProps} from '@skeleton/web-components';
import {useTranslation} from '@skeleton/core-translations';

/**
 * Above this many workspaces the switcher's static list stops being usable, so
 * it turns into an autocomplete: a search input is injected into the switcher
 * and the visible list is resolved remotely from the typed term.
 */
export const WORKSPACE_SWITCHER_REMOTE_SEARCH_THRESHOLD = 20;

const ORGANIZATION_FIELDS = {id: null, name: null};

type UseWorkspaceSwitcherParams = {
  userId: string;
  selectedWorkspaceId: string;
  settingsUrl: string;
  onAddWorkspace: () => void;
};

/**
 * Debounced, uncontrolled-from-the-outside search input: keystrokes only
 * re-render this component, and the term is propagated upstream (triggering
 * the remote query and a layout re-render) at most once per pause. A cmdk
 * `CommandInput` — the switcher renders it inside its `Command`, giving
 * arrows + Enter keyboard navigation over the results.
 */
function WorkspaceSearchInput({onSearch}: {onSearch: (term: string) => void}) {
  const {t} = useTranslation();
  const [value, setValue] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => onSearch(value), 300);
    return () => clearTimeout(handle);
  }, [value, onSearch]);

  return (
    <CommandInput
      value={value}
      onValueChange={setValue}
      placeholder={t('app.workspaceSwitcher.search')}
      autoFocus
    />
  );
}

/**
 * Builds the layout's `TeamSwitcher` props for the connected user's workspaces.
 * The first `WORKSPACE_SWITCHER_REMOTE_SEARCH_THRESHOLD` workspaces are always
 * fetched; when the total exceeds the threshold, a debounced search input is
 * passed to the switcher (which stays presentation-only) and the displayed
 * list comes from a remote `term` search instead.
 */
export function useWorkspaceSwitcher({
  userId,
  selectedWorkspaceId,
  settingsUrl,
  onAddWorkspace,
}: UseWorkspaceSwitcherParams): TeamSwitcherProps {
  const {t} = useTranslation();
  const [term, setTerm] = useState('');
  const currentOrganization = useCurrentOrganization();

  const {data: firstPage} = useGetUserOrganizations({
    staticParams: {userId},
    fields: ORGANIZATION_FIELDS,
    offset: 0,
    limit: WORKSPACE_SWITCHER_REMOTE_SEARCH_THRESHOLD,
  });

  const totalCount = firstPage?.pagination.count ?? 0;
  const hasRemoteSearch = totalCount > WORKSPACE_SWITCHER_REMOTE_SEARCH_THRESHOLD;
  const searchTerm = hasRemoteSearch ? term.trim() : '';

  const {data: searchPage} = useGetUserOrganizations(
    {
      staticParams: {userId},
      fields: ORGANIZATION_FIELDS,
      offset: 0,
      limit: WORKSPACE_SWITCHER_REMOTE_SEARCH_THRESHOLD,
      filters: {term: searchTerm},
    },
    // keepPreviousData avoids a "No workspaces found" flash between keystrokes.
    {enabled: searchTerm !== '', placeholderData: keepPreviousData},
  );

  const displayedPage = searchTerm !== '' ? searchPage : firstPage;

  const workspaces = (displayedPage?.data ?? []).map((organization) => ({
    name: organization.name ?? t('app.workspaceSwitcher.defaultName'),
    logo: GalleryVerticalEnd,
    id: organization.id ?? '',
    urlPrefix: `/w/${organization.id}/`,
  }));

  // The selected workspace can fall outside the first page; pin it on top so
  // it stays visible (and checked) in the list. Search results are left as-is.
  if (searchTerm === '' && !workspaces.some((w) => w.id === selectedWorkspaceId)) {
    workspaces.unshift({
      name: currentOrganization?.name ?? t('app.workspaceSwitcher.defaultName'),
      logo: GalleryVerticalEnd,
      id: selectedWorkspaceId,
      urlPrefix: `/w/${selectedWorkspaceId}/`,
    });
  }

  return {
    onAddWorkspace,
    selectedWorkspaceId,
    settingsUrl,
    // Keeps the trigger on the current workspace while the list is loading or
    // narrowed by a search term that excludes it.
    activeWorkspace: {
      name: currentOrganization?.name ?? t('app.workspaceSwitcher.defaultName'),
      logo: GalleryVerticalEnd,
    },
    searchInput: hasRemoteSearch ? <WorkspaceSearchInput onSearch={setTerm} /> : undefined,
    // Total behind the displayed list (overall, or matching the search term),
    // so the switcher can flag that the listing is truncated.
    totalCount: displayedPage?.pagination.count,
    workspaces,
  };
}
