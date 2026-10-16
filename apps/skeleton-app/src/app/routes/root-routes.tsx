import {Route, Routes} from 'react-router-dom';
import {LoginRoutes, LogoutRoutes, SignupPage} from '@skeleton/web-feature-login';
import {ProtectedRoutes} from './protected-routes';
import {ProtectedPage} from '@skeleton/core-store-session';

export const RootRoutes = () => {
  return (
    <Routes>
      <Route path="/login/*" element={<LoginRoutes />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/logout/*" element={<LogoutRoutes />} />
      <Route element={<ProtectedPage />}>
        <Route path="*" element={<ProtectedRoutes />} />
      </Route>
    </Routes>
  );
};
