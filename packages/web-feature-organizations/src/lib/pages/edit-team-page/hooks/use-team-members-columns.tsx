import {ColumnDef} from '@tanstack/react-table';
import {OrganizationMember} from '@skeleton/core-api-models';
import {Avatar, AvatarFallback, AvatarImage, Badge} from '@skeleton/web-components';
import {CollectionColumnHeader, CollectionRowActions,} from '@skeleton/web-collection';
import {format} from 'date-fns';
import {IconBan, IconCircleCheck, IconKey, IconShieldCheck, IconShieldOff} from '@tabler/icons-react';
import {Trash, UserCog} from "lucide-react";
import {useTranslation} from '@skeleton/core-translations';

const roleVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ADMIN: 'default',
  MEMBER: 'secondary',
  OWNER: 'default',
  VIEWER: 'secondary',
  EDITOR: 'secondary',
};

const mfaVariants: Record<'on' | 'off', 'success' | 'warning'> = {
  on: 'success',
  off: 'warning',
};

const statusColors: Record<string, string> = {
  accepted: 'bg-emerald-400',
  invited: 'bg-amber-400',
  suspended: 'bg-rose-500',
};

const statusLabelKeys: Record<string, string> = {
  accepted: 'teams.statuses.accepted',
  invited: 'teams.statuses.invited',
  suspended: 'teams.statuses.suspended',
};

const roleLabelKeys: Record<string, string> = {
  admin: 'teams.roles.admin',
  editor: 'teams.roles.editor',
  viewer: 'teams.roles.viewer',
};

export function SsoLinkedCell({ member }: { member: Pick<OrganizationMember, 'ssoLinked'> }) {
  if (!member.ssoLinked) return <span>-</span>;
  return (
    <Badge variant="important">
      <IconKey />
      SSO
    </Badge>
  );
}

type UseTeamMembersColumnsOptions = {
  organizationId: string;
  onChangeRole?: (member: OrganizationMember) => void;
  onSuspendMember?: (member: OrganizationMember) => void;
  onUnsuspendMember?: (member: OrganizationMember) => void;
  onRemoveMember?: (member: OrganizationMember) => void;
};

export function useTeamMembersColumns(
  options: UseTeamMembersColumnsOptions,
): ColumnDef<OrganizationMember>[] {
  const { t } = useTranslation();
  const { onChangeRole, onSuspendMember, onUnsuspendMember, onRemoveMember } = options;

  return [
    {
      id: 'email',
      accessorKey: 'email',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('teams.columns.member')} />
      ),
      cell: ({ row }) => {
        const { email, user } = row.original;
        const { firstName, lastName } = user || row.original;
        const fullName = firstName || lastName
          ? `${firstName ?? ''} ${lastName ?? ''}`.trim()
          : null;
        const initials = fullName
          ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          : email?.slice(0, 2).toUpperCase() ?? '??';

        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage src={user?.profileImage?.url ?? undefined} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{fullName ?? email}</span>
              {fullName && (
                <span className="text-xs text-muted-foreground">{email}</span>
              )}
            </div>
          </div>
        );
      },
      meta: { className: 'min-w-[200px]' },
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('teams.role')} />
      ),
      cell: ({ row }) => {
        const role = row.original.role;
        if (!role) return <span>-</span>;
        const roleLabelKey = roleLabelKeys[role.toLowerCase()];
        return (
          <Badge variant={roleVariants[role] ?? 'secondary'} className="capitalize">
            {roleLabelKey ? t(roleLabelKey) : role.toLowerCase()}
          </Badge>
        );
      },
      filterFn: 'equals',
      enableSorting: true,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('teams.status')} />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        if (!status) return <span>-</span>;
        return (
          <div className="flex items-center gap-1.5 bg-muted px-2 py-0.5 rounded-md w-fit">
            <div className={`size-2 rounded-full ${statusColors[status] ?? 'bg-gray-400'}`} />
            <span className="text-xs font-medium">
              {statusLabelKeys[status] ? t(statusLabelKeys[status]) : status.toLowerCase()}
            </span>
          </div>
        );
      },
      filterFn: 'equals',
      enableSorting: true,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('teams.columns.joined')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {row.getValue('createdAt')
            ? format(row.getValue('createdAt'), 'dd/MM/yyyy')
            : '-'}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'mfaEnabled',
      header: () => <span>2FA</span>,
      // The API fills this only for active admins of the workspace; everyone else gets null.
      cell: ({ row }) => {
        const { mfaEnabled, status } = row.original;
        if (mfaEnabled == null || status === 'invited') return <span>-</span>;
        return mfaEnabled ? (
          <Badge variant={mfaVariants.on}>
            <IconShieldCheck />
            {t('teams.mfa.on')}
          </Badge>
        ) : (
          <Badge variant={mfaVariants.off}>
            <IconShieldOff />
            {t('teams.mfa.off')}
          </Badge>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'ssoLinked',
      header: () => <span>SSO</span>,
      // Filled by the API for the workspace's admins only (null otherwise). A member who never
      // signed in through the connection has no badge: false says nothing about how they sign in.
      cell: ({ row }) => <SsoLinkedCell member={row.original} />,
      enableSorting: false,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">{t('common.actions')}</div>,
      cell: ({ row }) => {
        const isSuspended = row.original.status === 'suspended';

        return <div className="flex items-center justify-end gap-1">
          <CollectionRowActions
            row={row}
            actions={[
              {
                label: t('teams.actions.changeRole'),
                icon: UserCog,
                onClick: (member: OrganizationMember) => {
                  onChangeRole?.(member);
                },
              },
              isSuspended
                ? {
                    label: t('teams.actions.restoreAccess'),
                    icon: IconCircleCheck,
                    onClick: (member: OrganizationMember) => {
                      onUnsuspendMember?.(member);
                    },
                  }
                : {
                    label: t('teams.actions.suspendAccess'),
                    icon: IconBan,
                    onClick: (member: OrganizationMember) => {
                      onSuspendMember?.(member);
                    },
                  },
              {
                label: t('teams.actions.removeFromWorkspace'),
                icon: Trash,
                group: 'danger',
                className: 'text-red-500!',
                onClick: (member: OrganizationMember) => {
                  onRemoveMember?.(member);
                },
              },
            ]}
          />
        </div>
      }
    },
  ];
}
