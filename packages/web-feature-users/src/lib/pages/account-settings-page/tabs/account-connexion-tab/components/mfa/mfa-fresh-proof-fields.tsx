import { MfaFreshProofRequest } from '@skeleton/core-api-models';
import { createConnectedInputHelpers } from '@skeleton/web-form';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from '@skeleton/core-translations';
import { MfaCodeInput } from './mfa-code-input';

const { ControlledPasswordInput } = createConnectedInputHelpers<MfaFreshProofRequest>();

type MfaFreshProofFieldsProps = {
  /** Offer a code as an alternative proof (social sign-in users may have no password). */
  allowCode: boolean;
};

/** The fields of a fresh-proof form, inside a `FormProvider`. Shows the form-level error too. */
export const MfaFreshProofFields = ({ allowCode }: MfaFreshProofFieldsProps) => {
  const { formState } = useFormContext<MfaFreshProofRequest>();
  const rootError = formState.errors.root?.message;
  const { t, tIfKey } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <ControlledPasswordInput name="currentPassword" label={t('account.password.current')} />
      {allowCode && (
        <MfaCodeInput
          name="code"
          kind="any"
          label={t('account.mfa.freshProof.codeLabel')}
          description={t('account.mfa.freshProof.codeDescription')}
        />
      )}
      {rootError && (
        <p role="alert" className="text-sm text-destructive">
          {tIfKey(rootError)}
        </p>
      )}
    </div>
  );
};
