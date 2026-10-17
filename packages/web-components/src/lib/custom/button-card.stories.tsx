import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { FilePlus2Icon, LayoutTemplateIcon, UploadIcon } from 'lucide-react';
import { ButtonCard } from './button-card';

const meta = {
  title: 'Components/Custom/ButtonCard',
  component: ButtonCard,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div className="w-[420px]"><Story /></div>],
  args: {
    icon: <UploadIcon className="size-5" />,
    title: 'Import a project',
    description: 'Bring your data from a spreadsheet or another tool.',
    onClick: fn(),
  },
} satisfies Meta<typeof ButtonCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pending: Story = { args: { isPending: true } };

export const Disabled: Story = { args: { disabled: true } };

/** The choice list of a "new project" dialog. */
export const ChoiceList: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <ButtonCard {...args} />
      <ButtonCard icon={<LayoutTemplateIcon className="size-5" />} title="Start from a template" description="Sections, fields and permissions already set up." onClick={fn()} />
      <ButtonCard icon={<FilePlus2Icon className="size-5" />} title="Start from scratch" description="An empty project you build at your own pace." onClick={fn()} />
    </div>
  ),
};
