import { createFileRoute } from "@tanstack/react-router";
import { RedirectToSignedOut } from "@repo/infrastructure/auth/RedirectToSignedOut";
import { fetchApi } from "@/shared/lib/api/elysia";

export const Route = createFileRoute("/logout/")({
  component: LogoutPage
});


function LogoutPage() {
  fetchApi("/authentication/sign-out", { method: "POST" });
  return <RedirectToSignedOut />;
}
