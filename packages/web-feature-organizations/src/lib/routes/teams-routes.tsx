import {Navigate, Route, Routes} from 'react-router-dom';
import {EditTeamPage} from '../pages/edit-team-page/edit-team-page';

export const TeamsRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<EditTeamPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};
