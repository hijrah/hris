import { Link } from '@inertiajs/react';
import { BookOpen, CalendarClock, ClipboardList, FolderGit2, LayoutGrid, Wallet } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import attendance from '@/routes/attendance';
import { dashboard } from '@/routes';
import kasbon from '@/routes/kasbon';
import leave from '@/routes/leave';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dasbor',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Absensi',
        href: attendance.index.url(),
        icon: CalendarClock,
    },
    {
        title: 'Kasbon',
        href: kasbon.index.url(),
        icon: Wallet,
    },
    {
        title: 'Izin & Cuti',
        href: leave.index.url(),
        icon: ClipboardList,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
