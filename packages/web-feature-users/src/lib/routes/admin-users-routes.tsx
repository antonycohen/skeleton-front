import { Route, Routes } from 'react-router-dom';
import { UsersListManagerPage } from '../pages/list-users-manager-page/users-list-manager-page';
import { UserDetailManagerPage } from '../pages/details-user-manager-page/details-user-manager-page';

export const AdminUsersRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<UsersListManagerPage />} />
      <Route path="/:userId" element={<UserDetailManagerPage />} />
    </Routes>
  );
};
