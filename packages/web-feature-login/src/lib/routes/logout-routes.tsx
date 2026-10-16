import {Route, Routes} from 'react-router-dom';
import {LogoutPage} from '../pages/logout-page/logout-page';
import LogoutCallbackPage from "../pages/logout-page/logout-callback-page";

export const LogoutRoutes = () => {
  return (
    <Routes>
      <Route index element={<LogoutPage />} />
      <Route path="callback" element={<LogoutCallbackPage />} />
    </Routes>
  );
};
