import { useTenantInfo } from "@repo/infrastructure/auth/hooks";
import { MenuButton, MenuSeparator, SideMenu } from "@repo/ui/components/SideMenu";
import { CircleUserIcon, HomeIcon, UsersIcon } from "lucide-react";

type SharedSideMenuProps = {
  children?: React.ReactNode;
};

export function SharedSideMenu({ children }: Readonly<SharedSideMenuProps>) {
  const tenantInfo = useTenantInfo();

  return (
    <SideMenu logoSquareUrl={tenantInfo?.logoSquareUrl} logoWideUrl={tenantInfo?.logoWideUrl}>
      <MenuButton icon={HomeIcon} label="Home" href="/account-management" />
      <MenuSeparator>Organisation</MenuSeparator>
      <MenuButton icon={CircleUserIcon} label="Account" href="/account-management/account" />
      <MenuButton icon={UsersIcon} label="Users" href="/account-management/users" />
      {children}
    </SideMenu>
  );
}
