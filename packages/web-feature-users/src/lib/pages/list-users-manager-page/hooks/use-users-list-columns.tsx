import {ColumnDef} from '@tanstack/react-table';
import {User} from '@skeleton/core-api-models';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  LongText,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@skeleton/web-components';
import {CollectionColumnHeader, CollectionRowActions,} from '@skeleton/web-collection';
import {Link} from 'react-router-dom';
import {format} from 'date-fns';
import {IconEye} from '@tabler/icons-react';
import {useTranslation} from '@skeleton/core-translations';
import {SOCIAL_PROVIDERS, UserStatusBadge} from '../../shared';

const getInitials = (user: User) =>
  [user.firstName, user.lastName]
    .filter(Boolean)
    .map((part) => part?.[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

export function useUsersListColumns(): ColumnDef<User>[] {
  const {t} = useTranslation();

  return [
    {
      id: 'profileImage',
      header: () => <span className="sr-only">{t('adminUsers.columns.profileImage')}</span>,
      cell: ({ row }) => {
        const user = row.original;
        const url = user.profileImage?.url;
        return (
          <Avatar className="size-8">
            {url && (
              <AvatarImage
                src={url}
                alt={`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()}
              />
            )}
            <AvatarFallback className="text-xs">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 56,
    },
    {
      id: 'fullName',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminUsers.columns.name')} />
      ),
      cell: ({ row }) => {
        const { firstName, lastName } = row.original;
        const fullName = `${firstName} ${lastName}`;
        return (
          <Button variant="link" className="underline" asChild>
            <Link to={`/users/${row.original.id}`}>
              <LongText className="max-w-36">{fullName}</LongText>
            </Link>
          </Button>
        );
      },
      meta: { className: 'w-36' },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminUsers.columns.email')} />
      ),
      cell: ({ row }) => (
        <div className="w-fit text-nowrap">{row.getValue('email')}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminUsers.columns.status')} />
      ),
      cell: ({ row }) => <UserStatusBadge status={row.original.status} />,
      filterFn: 'equals',
    },
    {
      id: 'socialIdentifiers',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminUsers.columns.sso')} />
      ),
      cell: ({ row }) => {
        const identifiers = row.original.socialIdentifiers ?? {};
        const connected = SOCIAL_PROVIDERS.filter(
          ({ key }) => identifiers[key],
        );
        if (connected.length === 0) {
          return <span className="text-muted-foreground">-</span>;
        }
        return (
          <div className="flex items-center gap-1.5">
            {connected.map(({ key, name, Logo }) => (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <span>
                    <Logo className="size-5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {name}: {identifiers[key]}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminUsers.columns.registeredDate')} />
      ),
      cell: ({ row }) => (
        <div className="w-fit text-nowrap">
          {row.getValue('createdAt')
            ? format(row.getValue('createdAt'), 'dd MMM, yyyy')
            : ''}
        </div>
      ),
      enableSorting: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <CollectionRowActions
          row={row}
          actions={[
            {
              // `/users/:id` is a read-only detail page; `EditUserManagerPage`
              // exists but is mounted nowhere. Point this at a real edit route
              // once there is one.
              label: t('adminUsers.actions.view'),
              icon: IconEye,
              linkTo: (user: User) => `/users/${user.id}`,
            },
            // "Delete User" was dropped: it carried the same `linkTo` as View
            // User, so it navigated to the detail page instead of deleting.
            // `useDeleteUser` exists in core-api — bring it back with that
            // mutation and a confirmation modal.
          ]}
        />
      ),
    },
  ];
}
