import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SignedIn } from "@repo/infrastructure/auth/SignedIn";
import { SignedOut } from "@repo/infrastructure/auth/SignedOut";
import { RedirectToSignIn } from "@repo/infrastructure/auth/RedirectToSignIn";
import { SharedSideMenu } from "@/shared/components/SharedSideMenu";
import { Menu } from "./account-management/users/-components/Menu";
import { useTenantInfo } from "@repo/infrastructure/auth/hooks";
import { Button } from "@repo/ui/components/Button";

export const Route = createFileRoute("/account-management")({
  component: AccountManagementLayout
});

function AccountManagementLayout() {
  const tenantInfo = useTenantInfo();
  return (
    <>
      <SignedIn>
        <div className="flex gap-4 w-full h-full">
          <SharedSideMenu />
          <div className="flex flex-col gap-4 px-2 sm:px-4 py-2 md:py-4 w-full">
            <Menu />
            {tenantInfo?.status === "TRIAL" && <UpgradeBanner />}
            <Outlet />
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function UpgradeBanner() {
  return (
    <div className="flex justify-between p-1 bg-secondary text-secondary-foreground items-center">
      <div className="flex w-full items-center justify-center text-sm">
        Your trial expires in 5 days, maintain access to premium features, upgrade to Pro
      </div>
      <Button size="sm" variant="ghost">
        Upgrade
      </Button>
    </div>
  );
}
