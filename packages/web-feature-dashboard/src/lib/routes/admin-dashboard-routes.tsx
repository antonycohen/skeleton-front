import {Route, Routes} from 'react-router-dom';
import {DashboardManagerPage} from '../pages/dashboard-manager-page/dashboard-manager-page';

export const AdminDashboardRoutes = () => {
  return (
    <Routes>
      <Route index element={<DashboardManagerPage />} />
    </Routes>
  );
};
