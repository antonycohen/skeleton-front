import {useCreatePortalSession} from "@skeleton/core-api";
import {CustomerPortalSessionResponse} from "@skeleton/core-api-models";
import {useLocation} from "react-router-dom";
import {useCurrentOrganization} from "@skeleton/core-workspace";

export const useManageSubscription = () => {
  const location = useLocation();
  const currentOrganization = useCurrentOrganization();
  const { mutate: createPortalSession, isPending } = useCreatePortalSession({
    onSuccess: (data: CustomerPortalSessionResponse) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  })

  const handleManageSubscription = () => {
    const baseUrl = window.location.origin;
    const currentPath = location.pathname;

    createPortalSession({
      returnUrl: `${baseUrl}${currentPath}`,
      organizationId: currentOrganization.id ?? '',
    })
  };

  return { handleManageSubscription, isPending };
}
