import {useEffect} from 'react';
import {useGetCurrentWorkspaceId} from "@skeleton/core-workspace";
import {useGetOrganizationById} from "@skeleton/core-api";
import {useNavigate} from "react-router-dom";
import {useTranslation} from '@skeleton/core-translations';

export const OrganizationDispatcherPage = () => {
  const { t } = useTranslation();
  const organizationId = useGetCurrentWorkspaceId() as string;
  const navigate = useNavigate();
  const {isFetched} = useGetOrganizationById({
    id: organizationId,
    fields: {
      name: null,
      domain: null,
      type: null,
    }
  })

  useEffect(() => {
    if(!isFetched) {
      return;
    }
    navigate(`/w/${organizationId}/dashboard`, {replace: true});
  }, [isFetched, navigate, organizationId])


  return (
    <div>
      <h1>{t('userWorkspaces.redirecting')}</h1>
    </div>
  );
};
