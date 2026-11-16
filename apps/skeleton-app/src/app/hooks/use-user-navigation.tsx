import {CircleUserIcon, ContrastIcon, LogOutIcon, UserPlusIcon} from "lucide-react";
import {NavItem} from "@skeleton/web-components";
import {useTranslation} from "@skeleton/core-translations";
import {useTheme} from "next-themes";

const THEMES = [
  { value: 'light', labelKey: 'navigation.user.appearance.light' },
  { value: 'dark', labelKey: 'navigation.user.appearance.dark' },
  { value: 'system', labelKey: 'navigation.user.appearance.system' },
] as const;

export const useUserNavigation = (baseWorkspaceUrl: string, suffixUrl?: string) : NavItem[] => {
  const {t} = useTranslation();

  const baseUrl = suffixUrl ? `${baseWorkspaceUrl}${suffixUrl}` : baseWorkspaceUrl;
  // "system" (the default) follows the computer's setting; the choice is kept in this browser.
  const { theme, setTheme } = useTheme();

  return [
    { type: 'link', title: t('navigation.user.profile'), to: `${baseUrl}/account/profile`, icon: <CircleUserIcon /> },
    { type: 'link', title: t('navigation.user.inviteMember'), to: `${baseWorkspaceUrl}/settings/teams`, icon: <UserPlusIcon /> },
    {
      type: 'dropdown',
      title: t('navigation.user.appearance'),
      icon: <ContrastIcon />,
      items: THEMES.map(({ value, labelKey }) => ({
        type: 'link',
        title: t(labelKey),
        checked: (theme ?? 'system') === value,
        onClick: () => setTheme(value),
      })),
    },
    { type: "separator"},
    { type: 'link', title: t('navigation.user.signOut'), to: '/logout', icon: <LogOutIcon /> },
  ]
}
