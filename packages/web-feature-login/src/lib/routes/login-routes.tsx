import {Route, Routes} from 'react-router-dom';
import LoginPage from '../pages/login-page/login-page';
import {OauthCallbackPage} from '../pages/oauth-callback-page/oauth-callback-page';
import {DispatcherPage} from '../pages/dipatcher-page/dispatcher-page';
import {AccessDeniedPage} from '../pages/access-denied-page/access-denied-page';

export const LoginRoutes = () => {
  return (
    <Routes>
      <Route index element={<LoginPage />} />
      <Route path="callback" element={<OauthCallbackPage />} />
      <Route path="dispatcher" element={<DispatcherPage />} />
      <Route path="denied" element={<AccessDeniedPage />} />
    </Routes>
  );
};
