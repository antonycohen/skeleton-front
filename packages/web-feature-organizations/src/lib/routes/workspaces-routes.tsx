import {Route, Routes} from 'react-router-dom';
import {ListUserOrganizationsPage} from "../pages/list-user-organizations-page/list-user-organizations-page";

export const WorkspacesRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ListUserOrganizationsPage />} />
    </Routes>
  );
};
