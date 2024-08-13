import { createFileRoute, Navigate } from "@tanstack/react-router";
import { getVerificationInfo } from "./-shared/verificationState";
import { Button } from "@repo/ui/components/Button";
import { ToggleButton } from "@repo/ui/components/ToggleButton";
import { Link } from "@repo/ui/components/Link";
import { Plural, Trans } from "@lingui/macro";
import logoMarkUrl from "@/shared/images/logo-mark.svg";
import poweredByUrl from "@/shared/images/powered-by.svg";
import { HorizontalHeroLayout } from "@/shared/layouts/HorizontalHeroLayout";
import { useState } from "react";
import { Form } from "@repo/ui/components/Form";
import { useExpirationTimeout } from "@repo/ui/hooks/useExpiration";
import { useFormState } from "react-dom";
import { serverAction } from "@/shared/lib/api/elysia";
import { signedInPath } from "@repo/infrastructure/auth/constants";
import { FormErrorMessage } from "@repo/ui/components/FormErrorMessage";
import { Avatar } from "@repo/ui/components/Avatar";
import { ArrowRightIcon } from "lucide-react";

export const Route = createFileRoute("/login/select-tenant")({
  component: () => (
    <HorizontalHeroLayout>
      <SelectTenantPage />
    </HorizontalHeroLayout>
  )
});

function SelectTenantPage() {
  const { email, tenants, expireAt, code } = getVerificationInfo();
  const { expiresInString, isExpired } = useExpirationTimeout(expireAt);
  const [{ success, title, message, errors, data }, action] = useFormState(serverAction("/authentication/otp/verify"), {
    success: null
  });
  const [tenant, setTenant] = useState<string | null>(null);

  if (isExpired) return <Navigate to="/login/expired" />;

  if (success) return <Navigate to={signedInPath} />;

  return (
    <Form action={action} validationErrors={errors} className="flex flex-col w-full max-w-sm space-y-3">
      <input type="hidden" name="tenantId" value={tenant ?? ""} />
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="oneTimePassword" value={code} />
      <div className="flex w-full flex-col gap-4 rounded-lg px-6 pt-8 pb-4">
        <div className="flex justify-center">
          <Link href="/">
            <img src={logoMarkUrl} className="h-12 w-12" alt="logo mark" />
          </Link>
        </div>
        <h1 className="mb-3 w-full text-center text-2xl">
          <Trans>Welcome back!</Trans>
        </h1>
        <div className="text-center text-gray-500 text-sm">
          <Trans>
            Choose an account below to get back to your team. If you don't see your account, try another email.
          </Trans>
        </div>
        <div className="flex flex-col max-h-96 overflow-y-auto gap-2">
          {tenants?.map((t) => (
            <ToggleButton
              key={t.id}
              variant="outline"
              className="w-full text-center h-fit justify-between gap-2"
              isSelected={t.id === tenant}
              onPress={() => {
                setTenant(t.id);
              }}
            >
              <Avatar avatarUrl={t.logoSquareUrl} initials={getTenantInitials(t.name)} />
              <div className="flex flex-col w-full items-start h-full justify-between">
                <div className="text-lg font-medium">{t.name}</div>
                <div className="flex gap-2 items-end">
                  {t.users.slice(0, 4).map((u) => (
                    <Avatar
                      key={`${t.id}_${u.avatarUrl}`}
                      avatarUrl={u.avatarUrl}
                      initials={u.initials}
                      size="xs"
                      className="h-4 w-4"
                    />
                  ))}
                  <div className="text-xs text-muted-foreground">
                    <Plural value={t.members} one="# member" other="# members" />
                  </div>
                </div>
              </div>
              <ArrowRightIcon className="w-4 h-4" />
            </ToggleButton>
          ))}
        </div>
        <FormErrorMessage title={title} message={message} />
        <Button type="submit" className="mt-4 w-full text-center" isDisabled={tenant == null}>
          <Trans>Continue</Trans>
        </Button>
        <div className="flex flex-col items-center gap-6 text-neutral-500">
          <p className="text-xs ">
            <Trans>Can't find your account? Try another email</Trans>
          </p>
          <img src={poweredByUrl} alt="powered by" />
        </div>
      </div>
    </Form>
  );
}

function getTenantInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("");
}
