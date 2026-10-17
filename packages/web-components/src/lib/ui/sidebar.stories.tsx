import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BuildingIcon,
  ChartLineIcon,
  ChevronsUpDownIcon,
  EllipsisIcon,
  HomeIcon,
  CreditCardIcon,
  FolderIcon,
  PlusIcon,
  SettingsIcon,
  UsersIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback } from './avatar';
import { Separator } from './separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from './sidebar';

type DemoProps = {
  defaultOpen?: boolean;
  variant?: ComponentProps<typeof Sidebar>['variant'];
  collapsible?: ComponentProps<typeof Sidebar>['collapsible'];
  side?: ComponentProps<typeof Sidebar>['side'];
  loading?: boolean;
};

function SidebarDemo({ defaultOpen = true, variant, collapsible = 'icon', side, loading }: DemoProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar variant={variant} collapsible={collapsible} side={side}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <Avatar className="size-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">A</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-medium">Acme Corporation</span>
                  <span className="truncate text-xs text-muted-foreground">Pro plan</span>
                </div>
                <ChevronsUpDownIcon className="ml-auto" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarInput placeholder="Search…" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive tooltip="Home"><HomeIcon /><span>Home</span></SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Analytics"><ChartLineIcon /><span>Analytics</span></SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Work</SidebarGroupLabel>
            <SidebarGroupAction title="New project"><PlusIcon /><span className="sr-only">New project</span></SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                {loading ? (
                  Array.from({ length: 3 }, (_, i) => (
                    <SidebarMenuItem key={i}><SidebarMenuSkeleton showIcon /></SidebarMenuItem>
                  ))
                ) : (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip="Projects"><FolderIcon /><span>Projects</span></SidebarMenuButton>
                      <SidebarMenuBadge>5</SidebarMenuBadge>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="#" isActive>Q4 Roadmap</SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="#">Website redesign</SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip="Teams"><UsersIcon /><span>Teams</span></SidebarMenuButton>
                      <SidebarMenuAction showOnHover><EllipsisIcon /><span className="sr-only">More</span></SidebarMenuAction>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip="Companies"><BuildingIcon /><span>Companies</span></SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Billing"><CreditCardIcon /><span>Billing</span></SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Settings"><SettingsIcon /><span>Settings</span></SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <Avatar className="size-8">
                  <AvatarFallback>JC</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-medium">Jane Cooper</span>
                  <span className="truncate text-xs text-muted-foreground">jane@acme.com</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-13 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <span className="text-sm font-medium">Home</span>
        </header>
        <div className="grid flex-1 gap-4 p-4 md:grid-cols-3">
          {['Active projects', 'Sessions', 'Activation rate'].map((label) => (
            <div key={label} className="aspect-video rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">{label}</div>
          ))}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

const meta = {
  title: 'Components/UI/Sidebar',
  component: SidebarDemo,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['sidebar', 'floating', 'inset'] },
    collapsible: { control: 'inline-radio', options: ['offcanvas', 'icon', 'none'] },
    side: { control: 'inline-radio', options: ['left', 'right'] },
  },
} satisfies Meta<typeof SidebarDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A full SidebarProvider layout: header, menu groups, sub-menu, badge, footer, inset content. */
export const Default: Story = {};

/** Collapsed to icons; hovering an item shows its tooltip. Toggle with ⌘B. */
export const Collapsed: Story = { args: { defaultOpen: false } };

export const Floating: Story = { args: { variant: 'floating' } };

export const Inset: Story = { args: { variant: 'inset' } };

export const Right: Story = { args: { side: 'right' } };

export const Loading: Story = { args: { loading: true } };
