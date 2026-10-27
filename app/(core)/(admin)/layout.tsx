import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserTab } from "@/components/user-tab";
import { Input } from "@/components/ui/input";
import { RouteLoaderBar } from "@/components/router-loader-bar";
import { BreadcrumbProvider } from "@/components/provider/breadcrumb-provider";
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb";
import { requireAdmin } from "@/lib/session";
import { getBadges, getSettings, mediaUrl, siteUrl } from "@/lib/site";
import { menuFor } from "@/lib/menu";
import { can } from "@/lib/perm";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [settings, badges] = await Promise.all([getSettings(), getBadges()]);

  return (
    <SidebarProvider>
      <AppSidebar menu={menuFor((p) => can(admin, p, "list"))} siteName={settings.site_name || settings.title || "Website"} badges={badges} />
      <SidebarInset className="min-w-0">
        <BreadcrumbProvider>
          <main className="flex-1 min-w-0 p-0 md:p-2 bg-sidebar shadow-md">
            <div className="w-full min-h-full bg-background rounded-none md:rounded-lg relative flex-1">
              <header className="bg-background shadow-sm flex h-12 border-b shrink-0 items-center gap-2 sticky top-0 z-50 w-full pr-1 rounded-tl-lg rounded-tr-lg">
                <SidebarTrigger className="ml-2" />
                <div className="bg-border shrink-0 w-px h-6" />
                <DashboardBreadcrumb />
                <div className="ml-auto flex items-center gap-2">
                  <form action="/admin/search" className="hidden md:block">
                    <Input name="s" placeholder="Tìm kiếm..." className="h-8 w-56" />
                  </form>
                  <UserTab
                    name={admin.fullname || admin.username}
                    email={admin.email || admin.username}
                    image={mediaUrl(admin.image) || undefined}
                    siteUrl={siteUrl()}
                  />
                </div>
              </header>
              <div className="relative flex-1 h-full mt-0">
                <RouteLoaderBar />
                <div className="md:hidden w-full h-4" />
                {children}
              </div>
            </div>
          </main>
        </BreadcrumbProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
