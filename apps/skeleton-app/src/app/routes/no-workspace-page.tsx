import {useNavigate} from 'react-router-dom';
import {AppLogo, Button, ErrorPlaceholder} from '@skeleton/web-components';
import {useTranslation} from '@skeleton/core-translations';

/**
 * A signed-in person who belongs to no workspace any more (removed, suspended, their last workspace
 * deleted). The layout, and its user menu, only exist inside a workspace: without this page they
 * had a blank screen and no way to sign out.
 */
export const NoWorkspacePage = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="h-screen">
      <ErrorPlaceholder
        image={<AppLogo />}
        title={t('app.noWorkspace.title')}
        description={t('app.noWorkspace.description')}
        actions={
          <Button size="sm" onClick={() => navigate('/logout')}>
            {t('navigation.user.signOut')}
          </Button>
        }
      />
    </div>
  );
};
