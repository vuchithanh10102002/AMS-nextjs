"use client";

import { ExternalLink, LogOutIcon, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLoadingRouter } from "@/hooks/use-loading-router";
import { logout } from "@/lib/actions/auth";

export function UserTab({ name, email, image, siteUrl }: { name: string; email: string; image?: string; siteUrl: string }) {
  const router = useLoadingRouter();
  const avatar = (
    <Avatar>
      {image && <AvatarImage src={image} alt={name} />}
      <AvatarFallback className="rounded-lg">{name.charAt(0).toUpperCase() || "A"}</AvatarFallback>
    </Avatar>
  );

  return (
    <div className="ml-auto">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="flex items-center gap-2 sm:hover:bg-muted py-1 px-2 rounded-lg">
              {avatar}
              <div className="hidden sm:grid flex-1 text-left text-sm leading-tight select-none">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs">{email}</span>
              </div>
            </button>
          }
        />
        <DropdownMenuContent align="end" className="min-w-56 rounded-lg">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                {avatar}
                <div className="grid flex-1 text-left text-sm leading-tight select-none">
                  <span className="truncate font-medium">{name}</span>
                  <span className="truncate text-xs text-muted-foreground">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.open(siteUrl, "_blank")}>
              <ExternalLink />
              Xem website
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/admin/account/profile")}>
              <Settings />
              Thông tin tài khoản
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => logout()}>
              <LogOutIcon />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
