import {CircleUserIcon, LogOutIcon, UserPlusIcon} from "lucide-react";
import {NavItem} from "@skeleton/web-components";
import {useTranslation} from "@skeleton/core-translations";

export const useUserNavigation = (baseWorkspaceUrl: string, suffixUrl?: string) : NavItem[] => {
  const {t} = useTranslation();

  const baseUrl = suffixUrl ? `${baseWorkspaceUrl}${suffixUrl}` : baseWorkspaceUrl;

  return [
    { type: 'link', title: t('navigation.user.profile'), to: `${baseUrl}/account/profile`, icon: <CircleUserIcon /> },
    { type: 'link', title: t('navigation.user.inviteMember'), to: `${baseWorkspaceUrl}/settings/teams`, icon: <UserPlusIcon /> },
    { type: "separator"},
    { type: 'link', title: t('navigation.user.signOut'), to: '/logout', icon: <LogOutIcon /> },
  ]
}
