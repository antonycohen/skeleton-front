import {Navigate, Route, Routes} from 'react-router-dom';
import {ListServiceAccountPage} from '../pages/list-service-account-page/list-service-account-page';

export const ServiceAccountsRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ListServiceAccountPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};
