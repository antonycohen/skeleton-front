import { Link, useSearchParams } from 'react-router-dom';
import { Button, ErrorPlaceholder } from '@skeleton/web-components';
import { useStaticAssetsUrl } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import { asSignInRefusal, SIGN_IN_REFUSALS } from '../shared';

/** Wording for the errors this app raises itself (the authorization server sends its own `error_description`). */
const LOCAL_ERROR_DESCRIPTIONS: Record<string, { i18nKey: string }> = {
  session_unavailable: { i18nKey: 'login.denied.sessionUnavailable' },
};

/**
 * Terminal page of a refused login: the authorization server answered `/login/callback` with an
 * error (`access_denied` when the account lacks back-office access), or the session could not be
 * set up on a token the server did issue. No automatic redirect, so the login never loops; signing
 * out ends the portal session so another account can log in.
 */
export const AccessDeniedPage = () => {
  const [searchParams] = useSearchParams();
  const assetsUrl = useStaticAssetsUrl();
  const { t } = useTranslation();

  const error = searchParams.get('error') ?? '';
  const rawDescription = searchParams.get('error_description');
  // The callback page settles these on the login instead of here, but a refusal can still land on
  // this page (a link opened again, a retry already spent): say it in words rather than show the
  // server's token.
  const refusal = asSignInRefusal(rawDescription);
  const localDescription = LOCAL_ERROR_DESCRIPTIONS[error];
  const description = refusal
    ? t(SIGN_IN_REFUSALS[refusal].i18nKey)
    : (rawDescription ??
      (localDescription ? t(localDescription.i18nKey) : t('login.denied.defaultDescription')));

  return (
    <div className="h-screen">
      <ErrorPlaceholder
        image={
          <img
            src={`${assetsUrl}/error-illustration.svg`}
            alt=""
            className="w-[280px] object-cover"
          />
        }
        title={t('login.denied.title')}
        description={description}
        actions={
          <Button asChild>
            <Link to="/logout">{t('login.denied.signOut')}</Link>
          </Button>
        }
      />
    </div>
  );
};

export default AccessDeniedPage;
