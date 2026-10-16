import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tooltip, TooltipContent, TooltipTrigger } from "@skeleton/web-components";
import { useInviteOrganizationMemberForm } from "../hooks/use-invite-organization-member-form";
import { Controller } from "react-hook-form";
import { useTranslation } from "@skeleton/core-translations";

export const InviteFormSection = ({ organizationId }: {
  organizationId: string;
}) => {
  const { t, tNode } = useTranslation();
  const { form, isLoading, handleSubmit } = useInviteOrganizationMemberForm(organizationId);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm">
              {t("teams.invite.help")}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-left">
            <ul className="space-y-1">
              <li>{tNode("teams.invite.roleHelp.admin")}</li>
              <li>{tNode("teams.invite.roleHelp.editor")}</li>
              <li>{tNode("teams.invite.roleHelp.viewer")}</li>
            </ul>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="bg-muted rounded-md px-6 py-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="font-semibold text-base whitespace-nowrap">
            {t("teams.invite.title")}
          </span>
          <div className="flex-1 flex items-center gap-2">
            <Input
              placeholder={t("teams.invite.emailPlaceholder")}
              {...form.register('email')}
              className="flex-1"
            />
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder={t("teams.role")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">{t("teams.roles.viewer")}</SelectItem>
                    <SelectItem value="editor">{t("teams.roles.editor")}</SelectItem>
                    <SelectItem value="admin">{t("teams.roles.admin")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <Button
              type="submit"
              disabled={!form.formState.isValid}
              isLoading={isLoading}
            >
              {t("teams.invite.submit")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
