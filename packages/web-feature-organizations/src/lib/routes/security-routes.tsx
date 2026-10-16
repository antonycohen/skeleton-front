import {Navigate, Route, Routes} from 'react-router-dom';
import {EditSecurityPage} from '../pages/edit-security-page/edit-security-page';

export const SecurityRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<EditSecurityPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};
