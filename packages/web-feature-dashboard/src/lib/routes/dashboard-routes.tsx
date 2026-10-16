import { Route, Routes } from 'react-router-dom';
import { DashboardPage } from '../pages/dashboard-page/dashboard-page';

export const DashboardRoutes = () => {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
    </Routes>
  );
};
