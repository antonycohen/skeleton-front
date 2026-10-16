import { ColumnDef } from '@tanstack/react-table';
import { OrganizationMember } from '@skeleton/core-api-models';
import {
  Avatar,
  AvatarFallback,
  Badge,
  BadgeStatus,
  Button,
  LongText,
} from '@skeleton/web-components';
import {
  CollectionColumnHeader,
  CollectionRowActions,
} from '@skeleton/web-collection';
import { Link } from 'react-router-dom';
import { IconEye, IconShieldCheck, IconShieldOff } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useTranslation } from '@skeleton/core-translations';

const mfaVariants: Record<'on' | 'off', 'success' | 'warning'> = {
  on: 'success',
  off: 'warning',
};

const getInitials = (firstName?: string | null, lastName?: string | null, email?: string | null) => {
  const first = (firstName ?? '').trim().charAt(0);
  const last = (lastName ?? '').trim().charAt(0);
  if (first || last) return `${first}${last}`.toUpperCase();
  return (email ?? '?').charAt(0).toUpperCase();
};

const getFullName = (member: OrganizationMember) => {
  const name = [member.firstName, member.lastName].filter(Boolean).join(' ').trim();
  return name || member.email || '-';
};

export function useOrganizationMembersColumns(): ColumnDef<OrganizationMember>[] {
  const { t } = useTranslation();
  return [
    {
      id: 'member',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.members.columns.member')} />
      ),
      cell: ({ row }) => {
        const member = row.original;
        const userId = member.user?.id;
        const fullName = getFullName(member);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback>
                {getInitials(member.firstName, member.lastName, member.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              {/* A member invited by email has no user account yet, so there is
                  nothing to link to until they accept. */}
              {userId ? (
                <Button variant="link" className="h-auto justify-start p-0" asChild>
                  <Link to={`/users/${userId}`}>
                    <LongText className="max-w-48 font-semibold">
                      {fullName}
                    </LongText>
                  </Link>
                </Button>
              ) : (
                <LongText className="max-w-48 font-semibold">{fullName}</LongText>
              )}
              {member.email ? (
                <span className="text-xs text-muted-foreground truncate">
                  {member.email}
                </span>
              ) : null}
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.members.columns.role')} />
      ),
      cell: ({ row }) => {
        const role = row.getValue('role') as string | null;
        return role ? (
          <Badge variant="outline" className="capitalize">
            {role.toLowerCase()}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
      filterFn: 'equals',
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.members.columns.status')} />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string | null;
        if (status === 'active')
          return <BadgeStatus variant="green">{t('adminOrganizations.members.status.active')}</BadgeStatus>;
        if (status === 'invited' || status === 'pending')
          return <BadgeStatus variant="yellow">{t('adminOrganizations.members.status.pending')}</BadgeStatus>;
        if (status === 'suspended')
          return <BadgeStatus variant="red">{t('adminOrganizations.members.status.suspended')}</BadgeStatus>;
        return status ? (
          <Badge variant="outline" className="capitalize">
            {status.toLowerCase()}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
      filterFn: 'equals',
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.members.columns.joined')} />
      ),
      cell: ({ row }) => {
        const value = row.getValue('createdAt') as string | null;
        return <div>{value ? format(new Date(value), 'dd/MM/yyyy') : '-'}</div>;
      },
    },
    {
      accessorKey: 'mfaEnabled',
      header: () => <span>{t('adminOrganizations.members.columns.mfa')}</span>,
      // The API fills this for the workspace's admins and for back-office super admins.
      cell: ({ row }) => {
        const { mfaEnabled, status } = row.original;
        if (mfaEnabled == null || status === 'invited') {
          return <span className="text-muted-foreground">-</span>;
        }
        return mfaEnabled ? (
          <Badge variant={mfaVariants.on}>
            <IconShieldCheck />
            {t('adminOrganizations.members.mfa.on')}
          </Badge>
        ) : (
          <Badge variant={mfaVariants.off}>
            <IconShieldOff />
            {t('adminOrganizations.members.mfa.off')}
          </Badge>
        );
      },
      enableSorting: false,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">{t('common.actions')}</div>,
      cell: ({ row }) => {
        const userId = row.original.user?.id;
        if (!userId) return null;
        return (
          <div className="flex justify-end">
            <CollectionRowActions
              row={row}
              actions={[
                {
                  label: t('adminOrganizations.members.viewUser'),
                  icon: IconEye,
                  linkTo: () => `/users/${userId}`,
                },
              ]}
            />
          </div>
        );
      },
      size: 80,
    },
  ];
}
