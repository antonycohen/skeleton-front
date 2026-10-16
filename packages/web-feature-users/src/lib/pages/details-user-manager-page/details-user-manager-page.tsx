import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  LayoutContent,
  LayoutHeader,
  LayoutTopbar,
  useBreadcrumb,
} from '@skeleton/web-layout';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@skeleton/web-components';
import { useGetUserById } from '@skeleton/core-api';
import type { ReadUser } from '@skeleton/core-api-models';
import { useTranslation } from '@skeleton/core-translations';
import { UserStatusBadge } from '../shared';
import { ResetUserMfaModal } from './modals/reset-user-mfa-modal';

function getFullName(user: Pick<ReadUser, 'firstName' | 'lastName'>): string | null {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return name.length > 0 ? name : null;
}

function getInitials(user: Pick<ReadUser, 'firstName' | 'lastName' | 'email'>): string {
  const first = user.firstName?.trim()?.[0] ?? '';
  const last = user.lastName?.trim()?.[0] ?? '';
  const initials = `${first}${last}`.toUpperCase();
  if (initials.length > 0) return initials;
  return user.email?.trim()?.[0]?.toUpperCase() ?? '?';
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-2">
      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm text-foreground break-words">{value}</span>
    </div>
  );
}

export function UserDetailManagerPage() {
  const { userId = '' } = useParams<{ userId: string }>();
  const [resetMfaOpen, setResetMfaOpen] = useState(false);
  const { t, isKeyExist } = useTranslation();

  const {
    data: user,
    isLoading,
    isError,
  } = useGetUserById({
    id: userId,
    fields: {
      id: null,
      firstName: null,
      lastName: null,
      email: null,
      status: null,
      // Filled for the user themself and for back-office super admins only
      mfaEnabled: null,
      mfaEnabledAt: null,
      createdAt: null,
      updatedAt: null,
      localizationPreferences: null,
      notificationsPreferences: null,
      profileImage: {
        fields: {
          id: null,
          url: null,
        },
      },
    },
  });

  const fullName = user ? getFullName(user) : null;

  const breadcrumbs = useBreadcrumb(
    [
      { label: t('adminUsers.breadcrumb.home'), to: '/' },
      { label: t('adminUsers.breadcrumb.users'), to: '/users' },
      { label: fullName ?? user?.email ?? userId },
    ],
    true,
  );

  if (isLoading) {
    return (
      <div>
        <header className="sticky top-0 z-30">
          <LayoutTopbar breadcrumbs={breadcrumbs} />
        </header>
        <LayoutContent>
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </LayoutContent>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div>
        <header className="sticky top-0 z-30">
          <LayoutTopbar breadcrumbs={breadcrumbs} />
        </header>
        <LayoutContent>
          <LayoutHeader
            pageTitle={t('adminUsers.detail.notFoundTitle')}
            pageDescription={t('adminUsers.detail.notFoundDescription')}
          />
        </LayoutContent>
      </div>
    );
  }

  const profileImageUrl = user.profileImage?.url ?? undefined;
  const localization = user.localizationPreferences;
  const notifications = user.notificationsPreferences;
  const hasLocalization =
    !!localization &&
    (!!localization.language || !!localization.timezone || !!localization.dateFormat);
  const hasNotifications = !!notifications?.channels;
  const hasPreferences = hasLocalization || hasNotifications;
  const languageKey = `common.language.${localization?.language}`;
  const languageLabel = localization?.language
    ? isKeyExist(languageKey)
      ? t(languageKey)
      : localization.language
    : '-';
  const enabledLabel = (enabled: boolean | undefined) =>
    enabled ? t('adminUsers.detail.enabled') : t('adminUsers.detail.disabled');

  return (
    <div>
      <header className="sticky top-0 z-30">
        <LayoutTopbar breadcrumbs={breadcrumbs} />
      </header>
      <LayoutContent>
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            {profileImageUrl && (
              <AvatarImage src={profileImageUrl} alt={fullName ?? user.email ?? ''} />
            )}
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-foreground text-3xl font-semibold leading-9">
                {fullName ?? user.email ?? t('adminUsers.detail.fallbackName')}
              </h1>
              {user.status && <UserStatusBadge status={user.status} />}
            </div>
            {user.email && (
              <span className="text-muted-foreground text-sm">{user.email}</span>
            )}
            <span className="text-muted-foreground text-xs">
              {t('adminUsers.detail.createdUpdated', {
                created: formatDate(user.createdAt),
                updated: formatDate(user.updatedAt),
              })}
            </span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('adminUsers.detail.account.title')}</CardTitle>
            <CardDescription>{t('adminUsers.detail.account.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <DetailRow label={t('adminUsers.detail.account.id')} value={user.id ?? '-'} />
              <DetailRow label={t('adminUsers.detail.account.email')} value={user.email ?? '-'} />
              <DetailRow
                label={t('adminUsers.detail.account.status')}
                value={<UserStatusBadge status={user.status} />}
              />
              <DetailRow label={t('adminUsers.detail.account.created')} value={formatDate(user.createdAt)} />
              <DetailRow label={t('adminUsers.detail.account.updated')} value={formatDate(user.updatedAt)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('adminUsers.detail.mfa.title')}</CardTitle>
            <CardDescription>
              {t('adminUsers.detail.mfa.description')}
            </CardDescription>
            <CardAction>
              <Button
                type="button"
                variant="outline"
                className="text-destructive hover:text-destructive"
                disabled={user.mfaEnabled !== true}
                onClick={() => setResetMfaOpen(true)}
              >
                {t('adminUsers.resetMfa.submit')}
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <DetailRow
                label={t('adminUsers.detail.mfa.label')}
                value={
                  user.mfaEnabled == null ? (
                    '-'
                  ) : user.mfaEnabled ? (
                    <Badge variant="success">{t('adminUsers.detail.mfa.on')}</Badge>
                  ) : (
                    <Badge variant="outline">{t('adminUsers.detail.mfa.off')}</Badge>
                  )
                }
              />
              <DetailRow
                label={t('adminUsers.detail.mfa.enabledSince')}
                value={user.mfaEnabled ? formatDate(user.mfaEnabledAt) : '-'}
              />
            </div>
          </CardContent>
        </Card>

        {hasPreferences && (
          <Card>
            <CardHeader>
              <CardTitle>{t('adminUsers.detail.preferences.title')}</CardTitle>
              <CardDescription>
                {t('adminUsers.detail.preferences.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasLocalization && (
                <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                  <DetailRow
                    label={t('adminUsers.detail.preferences.language')}
                    value={languageLabel}
                  />
                  <DetailRow
                    label={t('adminUsers.detail.preferences.timezone')}
                    value={localization?.timezone ?? '-'}
                  />
                  <DetailRow
                    label={t('adminUsers.detail.preferences.dateFormat')}
                    value={localization?.dateFormat ?? '-'}
                  />
                </div>
              )}
              {hasNotifications && (
                <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                  <DetailRow
                    label={t('adminUsers.detail.preferences.productNotifications')}
                    value={enabledLabel(notifications?.channels.products)}
                  />
                  <DetailRow
                    label={t('adminUsers.detail.preferences.newsNotifications')}
                    value={enabledLabel(notifications?.channels.news)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </LayoutContent>

      {resetMfaOpen && (
        <ResetUserMfaModal
          open={resetMfaOpen}
          onOpenChange={(open) => !open && setResetMfaOpen(false)}
          user={user}
        />
      )}
    </div>
  );
}
