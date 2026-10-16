import {useCreateSubscriptionCancelSession} from "@skeleton/core-api";
import {CustomerPortalSessionResponse} from "@skeleton/core-api-models";
import {useLocation} from "react-router-dom";
import {useCurrentOrganization} from "@skeleton/core-workspace";

export const useSubscriptionCancel = () => {
  const location = useLocation();
  const currentOrganization = useCurrentOrganization();
  const { mutate: createPortalSession, isPending } = useCreateSubscriptionCancelSession({
    onSuccess: (data: CustomerPortalSessionResponse) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  })

  const handleSubscriptionCancel = () => {
    const baseUrl = window.location.origin;
    const currentPath = location.pathname;

    createPortalSession({
      returnUrl: `${baseUrl}${currentPath}`,
      organizationId: currentOrganization.id ?? '',
    })
  };

  return { handleSubscriptionCancel, isPending };
}
