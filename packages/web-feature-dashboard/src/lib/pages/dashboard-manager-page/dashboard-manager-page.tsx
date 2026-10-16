import {Link} from 'react-router-dom';
import {LayoutGridIcon, TagIcon, UsersIcon} from 'lucide-react';
import {Card, CardDescription, CardHeader, CardTitle} from '@skeleton/web-components';
import {LayoutContent, LayoutHeader, LayoutTopbar, useBreadcrumb} from '@skeleton/web-layout';
import {useTranslation} from '@skeleton/core-translations';

export function DashboardManagerPage() {
  const {t} = useTranslation();
  const breadcrumbs = useBreadcrumb([{ label: t('dashboard.title') }], true);

  const shortcuts = [
    {title: t('dashboard.admin.workspaces.title'), description: t('dashboard.admin.workspaces.description'), url: '/workspaces', icon: LayoutGridIcon},
    {title: t('dashboard.admin.users.title'), description: t('dashboard.admin.users.description'), url: '/users', icon: UsersIcon},
    {title: t('dashboard.admin.productGroups.title'), description: t('dashboard.admin.productGroups.description'), url: '/payment/product-groups', icon: TagIcon},
  ];

  return (
    <div>
      <header className="sticky top-0 z-30">
        <LayoutTopbar breadcrumbs={breadcrumbs} />
      </header>
      <LayoutContent>
        <LayoutHeader pageTitle={t('dashboard.title')} pageDescription={t('dashboard.admin.description')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((shortcut) => (
            <Link key={shortcut.url} to={shortcut.url}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <shortcut.icon className="size-5 text-muted-foreground" />
                  <CardTitle>{shortcut.title}</CardTitle>
                  <CardDescription>{shortcut.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </LayoutContent>
    </div>
  );
}
