import {Navigate, Route, Routes, useLocation, useParams} from 'react-router-dom';
import {useConnectedUser} from '@skeleton/core-store-session';
import {WorkspaceRoutes} from './workspace-routes';
import {Fragment} from 'react';
import {WorkspaceProvider} from "@skeleton/core-workspace";
import {useGetUserOrganizations} from "@skeleton/core-api";
import {User} from "@skeleton/core-api-models";
import {JobAlertProvider} from "@skeleton/web-layout";
import {NoWorkspacePage} from './no-workspace-page';
import {useSyncLanguage} from "@skeleton/core-translations";

const refusedOnTheWay = (state: unknown): string[] => {
  const ids = (state as { refusedWorkspaceIds?: unknown } | null)?.refusedWorkspaceIds;
  return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : [];
};

const WorkspaceRoutesWrapper = () => {
  const connectedUser = useConnectedUser() as User;
  const { organizationId } = useParams<{ organizationId?: string }>();
  const location = useLocation();
  const { data: results } = useGetUserOrganizations({
    staticParams : {
      userId: connectedUser.id as string,
    },
    fields: {
      id: null,
      name: null,
    },
    offset: 0,
    limit: 100,
  });

  if (!results) {
    return null;
  }

  if (results.data.length === 0) {
    return <NoWorkspacePage />;
  }

  if (!organizationId) {
    return <Navigate to={`/w/${results.data[0].id}/dispatch`} />;
  }

  // The workspace of the URL is refused (the person left it, was removed or suspended): go to
  // another one they still have. The workspaces refused on the way here travel in the navigation state, so that two refused
  // workspaces do not send the person back and forth forever.
  const refused = [...refusedOnTheWay(location.state), organizationId];
  const otherWorkspace = results.data.find((organization) => !refused.includes(organization.id as string));

  return (
    <WorkspaceProvider
      selectedWorkspaceId={organizationId}
      unavailable={
        otherWorkspace
          ? <Navigate to={`/w/${otherWorkspace.id}/dispatch`} state={{ refusedWorkspaceIds: refused }} replace />
          : <NoWorkspacePage />
      }
    >
      <WorkspaceRoutes />
    </WorkspaceProvider>
  );
};

export const ProtectedRoutes = () => {
  const connectedUser = useConnectedUser();
  // The UI follows the language saved in the user's preferences.
  useSyncLanguage(connectedUser?.localizationPreferences?.language);

  if (!connectedUser) {
    return null;
  }
  // Job alerts are authenticated-app chrome — public routes (login) must stay
  // free of them.
  return (
    <JobAlertProvider>
      <Routes>
        <Fragment>
          <Route path={'w/:organizationId?/*'} element={<WorkspaceRoutesWrapper />} />
          <Route path={'*'} element={<Navigate to={'/w/'} />} />
        </Fragment>
      </Routes>
    </JobAlertProvider>
  );
};
