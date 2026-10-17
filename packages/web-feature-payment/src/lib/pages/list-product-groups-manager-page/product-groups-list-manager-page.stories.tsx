import type { Meta, StoryObj } from '@storybook/react-vite';
import { mock, type ScreenParameters } from '@skeleton/storybook-support';
import { ProductGroupsListManagerPage } from './product-groups-list-manager-page';

/** Back office › Payment › Product groups: the Stripe catalogue, one group per pricing family. */
const meta = {
  title: 'Screens/Back office/Product groups/List',
  component: ProductGroupsListManagerPage,
  parameters: {
    screen: { path: '/payment/product-groups', layout: 'bare', workspace: false } satisfies ScreenParameters,
  },
} satisfies Meta<typeof ProductGroupsListManagerPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The self-serve plans the paywall sells, Enterprise, and a retired group. */
export const Default: Story = {};

export const Loading: Story = { parameters: { msw: [mock.loading('/product-groups')] } };

export const Empty: Story = { parameters: { msw: [mock.empty('/product-groups')] } };

export const Failed: Story = { name: 'Error', parameters: { msw: [mock.error('/product-groups')] } };
