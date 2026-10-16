'use client';

import {Fragment} from 'react';
import {DotsVerticalIcon} from '@radix-ui/react-icons';
import {Row} from '@tanstack/react-table';

import {
  ActionMenuItem,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@skeleton/web-components';

import {cn, useDialogState} from '@skeleton/core-utils';
import {useTranslation} from '@skeleton/core-translations';

import {Link} from 'react-router-dom';
import {ComponentType} from 'react';

interface CommonAction {
  className?: string;
  label: string;
  group?: string;
  icon: ComponentType<{ size?: number }>;
  /**
   * When set, the item is rendered greyed out with this text as its tooltip
   * instead of being hidden — the user learns why the action is unavailable.
   */
  disabledReason?: string | null;
}

interface LinkAction<T> extends CommonAction {
  linkTo: (row: T) => string;
}

interface DialogAction<T> extends CommonAction {
  dialog: {
    id: string;
    component: ComponentType<{
      row: T;
      open: boolean;
      onOpenChange: (open: boolean) => void;
    }>;
  };
}

interface OnClickAction<T> extends CommonAction {
  onClick: (row: T) => void;
}

type Action<T> = LinkAction<T> | DialogAction<T> | OnClickAction<T>;

const isDialogAction = <T,>(action: Action<T>): action is DialogAction<T> => {
  return (action as DialogAction<T>).dialog !== undefined;
};

const isOnClickAction = <T,>(action: Action<T>): action is OnClickAction<T> => {
  return (action as OnClickAction<T>).onClick !== undefined;
};

const filterDialogActions = <T,>(actions: Action<T>[]): DialogAction<T>[] => {
  return actions.filter(isDialogAction);
};

interface Props<T> {
  row: Row<T>;
  actions: Action<T>[];
}

export function CollectionRowActions<T>({ row, actions }: Props<T>) {
  const { t } = useTranslation();
  const [open, setOpen] = useDialogState<string>(null);

  const renderDialogActionMenuItem = (
    action: DialogAction<T>,
    index: number,
  ) => {
    const Icon = action.icon;
    return (
      <DropdownMenuItem
        className={cn('' ,action.className)}
        key={index}
        onClick={() => setOpen(action.dialog.id)}
      >
        <Icon size={16} />
        {action.label}
      </DropdownMenuItem>
    );
  };

  const renderLinkActionMenuItem = (action: LinkAction<T>, index: number) => {
    const Icon = action.icon;
    return (
      <DropdownMenuItem className={action.className} key={index} asChild>
        <Link to={action.linkTo(row.original)}>
          <Icon size={16} />
          {action.label}
        </Link>
      </DropdownMenuItem>
    );
  };

  const renderOnClickActionMenuItem = (
    action: OnClickAction<T>,
    index: number,
  ) => {
    const Icon = action.icon;
    return (
      <DropdownMenuItem
        className={action.className}
        key={index}
        onClick={() => action.onClick(row.original)}
      >
        <Icon size={16} />
        {action.label}
      </DropdownMenuItem>
    );
  };

  const renderDisabledActionMenuItem = (action: Action<T>, index: number, reason: string) => {
    const Icon = action.icon;
    return (
      <ActionMenuItem
        key={index}
        className={action.className}
        blockedReason={reason}
        onSelect={() => undefined}
      >
        <Icon size={16} />
        {action.label}
      </ActionMenuItem>
    );
  };

  const renderActionMenuItem = (action: Action<T>, index: number) => {
    if (action.disabledReason) {
      return renderDisabledActionMenuItem(action, index, action.disabledReason);
    }
    if (isDialogAction(action)) {
      return renderDialogActionMenuItem(action, index);
    }
    if (isOnClickAction(action)) {
      return renderOnClickActionMenuItem(action, index);
    }
    return renderLinkActionMenuItem(action, index);
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
          >
            <DotsVerticalIcon className="h-4 w-4" />
            <span className="sr-only">{t('collection.rowActions.openMenu')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[224px]">
          {actions.map((action, index) => {
            const needsSeparator =
              index > 0 && action.group !== actions[index - 1].group;
            return (
              <Fragment key={index}>
                {needsSeparator && (
                  <DropdownMenuSeparator />
                )}
                {renderActionMenuItem(action, index)}
              </Fragment>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {filterDialogActions(actions).map((action, index) => {
        const DialogComponent = action.dialog.component;
        return (
          <DialogComponent
            key={`${action.dialog.id}-${index}`}
            row={row.original}
            open={open === action.dialog.id}
            onOpenChange={() => setOpen(action.dialog.id)}
          />
        );
      })}
    </>
  );
}
