import {Button, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from '@skeleton/web-components';
import {OrganizationMember, UpdateOrganizationMemberRole} from '@skeleton/core-api-models';
import {useChangeMemberRoleForm} from '../hooks/use-change-member-role-form';
import {IconCircleCheck} from '@tabler/icons-react';
import {createConnectedInputHelpers} from "@skeleton/web-form";
import {FormProvider} from "react-hook-form";
import {useTranslation} from '@skeleton/core-translations';

type ChangeMemberRoleModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  member: OrganizationMember;
};

const roleLabelKeys: Record<string, string> = {
  admin: 'teams.roles.admin',
  editor: 'teams.roles.editor',
  viewer: 'teams.roles.viewer',
};

export const ChangeMemberRoleModal = ({
  open,
  onOpenChange,
  organizationId,
  member,
}: ChangeMemberRoleModalProps) => {
  const { t } = useTranslation();
  const { form, handleSubmit, isLoading, currentRole } = useChangeMemberRoleForm({
    organizationId,
    member,
    onSuccess: () => onOpenChange(false),
    onConflict: () => onOpenChange(false),
  });

  const { ControlledSelectInput } = createConnectedInputHelpers<UpdateOrganizationMemberRole>()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('teams.changeRole.title')}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="contents">
            <DialogBody className="flex flex-col gap-4">
              <div className="flex gap-3 items-center rounded-lg border px-4 py-3">
                <div className="pt-0.5">
                  <IconCircleCheck className="size-4" />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <p className="label">
                    {t('teams.changeRole.member')} <span className="font-medium">{member.email}</span>
                  </p>
                  <p className="body text-muted-foreground">
                    {t('teams.changeRole.currentRole', {
                      role: currentRole && roleLabelKeys[currentRole] ? t(roleLabelKeys[currentRole]) : '-',
                    })}
                  </p>
                </div>
              </div>

              <ControlledSelectInput direction="vertical" name={"role"} label={t('teams.changeRole.newRole')} options={[
                { value: 'viewer', label: t('teams.roles.viewer') },
                { value: 'editor', label: t('teams.roles.editor') },
                { value: 'admin', label: t('teams.roles.admin') },
              ]} />
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {t('teams.actions.changeRole')}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
