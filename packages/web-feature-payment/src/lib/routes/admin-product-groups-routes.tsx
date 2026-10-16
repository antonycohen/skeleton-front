import { Navigate, Route, Routes } from 'react-router-dom';
import { ProductGroupsListManagerPage } from '../pages/list-product-groups-manager-page/product-groups-list-manager-page';
import { ProductGroupEditManagerPage } from '../pages/edit-product-group-manager-page/edit-product-group-manager-page';
import { EditProductGroupProfileTab } from '../pages/edit-product-group-manager-page/tabs/edit-product-group-profile-tab/edit-product-group-profile-tab';
import { ProductGroupProductsTab } from '../pages/edit-product-group-manager-page/tabs/product-group-products-tab/product-group-products-tab';

export const AdminProductGroupsRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ProductGroupsListManagerPage />} />
      <Route
        path=":productGroupId"
        element={<ProductGroupEditManagerPage />}
      >
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<EditProductGroupProfileTab />} />
        <Route path="products" element={<ProductGroupProductsTab />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};
