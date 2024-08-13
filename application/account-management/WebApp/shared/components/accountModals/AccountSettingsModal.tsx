import { serverAction, useApi } from "@/shared/lib/api/elysia";
import { useLingui } from "@lingui/react";
import { useAuthentication, useTenantInfo, useUserInfo } from "@repo/infrastructure/auth/hooks";
import { ImageField } from "@repo/ui/components/ImageField";
import { Button } from "@repo/ui/components/Button";
import { DomainInputField } from "@repo/ui/components/DomainInputField";
import { FormDialog } from "@repo/ui/components/FormDialog";
import { Modal } from "@repo/ui/components/Modal";
import { TextField } from "@repo/ui/components/TextField";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useFormState } from "react-dom";
import defaultLogoWideUrl from "@/shared/images/logo-wrap.svg";
import defaultLogoSquareUrl from "@/shared/images/logo-mark.svg";
import { Separator } from "@repo/ui/components/Separator";
import { Heading } from "@repo/ui/components/Heading";

type AccountSettingsModal = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDeleteAccount: () => void;
};

const { hostname } = new URL(import.meta.runtime_env.PUBLIC_URL);

export function AccountSettingsModal({ isOpen, onOpenChange, onDeleteAccount }: Readonly<AccountSettingsModal>) {
  const { i18n } = useLingui();
  const { reloadTenantInfo } = useAuthentication();
  const tenantInfo = useTenantInfo();
  const userInfo = useUserInfo();
  const [subdomain, setSubdomain] = useState(userInfo?.tenantId ?? "");
  if (!userInfo || !userInfo.isAuthenticated) return null;

  const { data: isSubdomainFree } = useApi(
    "/account-management/api/account-registration/is-subdomain-free",
    {
      query: {
        subdomain
      }
    },
    {
      autoFetch: subdomain.length > 3,
      debounceMs: 500
    }
  );

  const [{ success, title, message, errors, data }, action, isPending] = useFormState(
    serverAction("/account-management/api/tenants/update"),
    { success: null }
  );

  if (success) {
    reloadTenantInfo();
    onOpenChange(false);
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable>
      <FormDialog
        title="Account Settings"
        description="Manage your account here"
        actionLabel="Save changes"
        action={action}
        validationErrors={errors}
        onOpenChange={onOpenChange}
      >
        <input type="hidden" name="tenantId" value={userInfo.tenantId} />
        <ImageField
          name="logoSquare"
          label="Logo square"
          placeholder="Upload a logo (46x46px png)"
          imageUrl={tenantInfo?.logoSquareUrl ?? defaultLogoSquareUrl}
          height={46}
          width={46}
          acceptedFileTypes={["image/png"]}
        />
        <ImageField
          name="logoWide"
          label="Logo wide"
          placeholder="Upload a logo (216x32px png)"
          imageUrl={tenantInfo?.logoWideUrl ?? defaultLogoWideUrl}
          height={32}
          width={216}
          acceptedFileTypes={["image/png"]}
        />
        <TextField name="name" label="Name" placeholder="eg. A.C.M.E" defaultValue={tenantInfo?.name ?? ""} />
        <DomainInputField
          name="subdomain"
          domain={`.${hostname}`}
          label={i18n.t("Subdomain")}
          placeholder={i18n.t("subdomain")}
          isRequired
          value={subdomain}
          onChange={setSubdomain}
          isSubdomainFree={subdomain === userInfo.tenantId || isSubdomainFree}
          className="flex w-full flex-col"
          isDisabled
        />
        <Heading className="text-lg">Danger zone</Heading>
        <Separator />
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 text-foreground">
            <h4 className="text-sm pt-2">Delete Account</h4>
            <p className="text-xs font-normal">
              Deleting the account and all associated data.
              <br />
              This action is not reversible, so please continue with caution.
            </p>
          </div>
          <Button variant="destructive" onPress={onDeleteAccount}>
            <Trash2 />
            Delete Account
          </Button>
        </div>
        <Separator />
      </FormDialog>
    </Modal>
  );
}

export default AccountSettingsModal;
