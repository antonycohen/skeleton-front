import type { Meta, StoryObj } from '@storybook/react-vite';
import { mock, PRO_PRODUCT_GROUP_ID, type ScreenParameters } from '@skeleton/storybook-support';
import { AdminProductGroupsRoutes } from '../../routes/admin-product-groups-routes';

/** The tabs are child routes: the story mounts the package's routes and opens each tab by its address. */
const tab = (url: string): ScreenParameters => ({
  path: '/payment/product-groups/*',
  url: `/payment/product-groups/${url}`,
  layout: 'bare',
  workspace: false,
});

const meta = {
  title: 'Screens/Back office/Product groups/Edit',
  component: AdminProductGroupsRoutes,
  parameters: {
    screen: {
      path: '/payment/product-groups/*',
      url: `/payment/product-groups/${PRO_PRODUCT_GROUP_ID}/profile`,
      layout: 'bare',
      workspace: false,
    } satisfies ScreenParameters,
  },
} satisfies Meta<typeof AdminProductGroupsRoutes>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Profile: Story = {};

/** Products (drag to reorder) and the selected product's prices: Pro, then Business with a retired price. */
export const Products: Story = { parameters: { screen: tab(`${PRO_PRODUCT_GROUP_ID}/products`) } };

/** A retired group with no product left. */
export const InactiveWithoutProducts: Story = { parameters: { screen: tab('pg_legacy_2025/products') } };

export const Loading: Story = { parameters: { msw: [mock.loading('/product-groups/:id')] } };
