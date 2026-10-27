"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LayoutDashboard } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { MenuGroup } from "@/lib/menu";

export function AppSidebar({
  menu,
  siteName,
  badges,
}: {
  menu: MenuGroup[];
  siteName: string;
  badges: Record<string, number>;
}) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const isActive = (url: string) =>
    url === "/admin" ? pathname === url : pathname === url || pathname.startsWith(url + "/");
  const close = () => setOpenMobile(false);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-2 text-sm font-medium">
        <Link href="/admin" className="flex items-center h-12 w-full gap-2 select-none" onClick={close}>
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center aspect-square text-background font-bold">
            {siteName.charAt(0).toUpperCase()}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight text-background">
            <span className="truncate font-medium">{siteName}</span>
            <span className="truncate text-xs">Quản trị website</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/admin")}
                  tooltip="Tổng quan"
                  render={<Link href="/admin" onClick={close} />}
                >
                  <LayoutDashboard />
                  <span>Tổng quan</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {menu.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const badge = item.badge ? badges[item.badge] ?? 0 : 0;
                  if (!item.add)
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          isActive={isActive(item.url)}
                          tooltip={item.title}
                          render={<Link href={item.url} onClick={close} />}
                        >
                          <DynamicIcon name={item.icon as IconName} />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                        {badge > 0 && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}
                      </SidebarMenuItem>
                    );
                  return (
                    <Collapsible key={item.url} defaultOpen={isActive(item.url)} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger
                          render={<SidebarMenuButton isActive={isActive(item.url)} tooltip={item.title} />}
                        >
                          <DynamicIcon name={item.icon as IconName} />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform group-data-[open]/collapsible:rotate-90" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                className="data-active:font-medium data-active:text-sidebar-primary-foreground"
                                isActive={pathname === item.url}
                                render={<Link href={item.url} onClick={close} />}
                              >
                                <span>Danh sách</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                className="data-active:font-medium data-active:text-sidebar-primary-foreground"
                                isActive={pathname === item.url + "/add"}
                                render={<Link href={item.url + "/add"} onClick={close} />}
                              >
                                <span>Thêm mới</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
