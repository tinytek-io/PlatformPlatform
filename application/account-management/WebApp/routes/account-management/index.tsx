import { createFileRoute } from "@tanstack/react-router";
import { Trans } from "@lingui/macro";
import { useApi } from "@/shared/lib/api/elysia";
import { TopMenu } from "@/shared/components/topMenu";
import { SharedSideMenu } from "@/shared/components/SharedSideMenu";

export const Route = createFileRoute("/account-management/")({
  component: Home
});

export default function Home() {
  const { data } = useApi("/account-management/api/users/query", { query: { pageSize: 1 } });

  return (
    <div className="flex flex-row">
      <div className="text-muted-foreground p-6 bg-white rounded-xl shadow-md w-1/3">
        <div className="text-sm text-gray-800">
          <Trans>Total Users</Trans>
        </div>
        <div className="text-sm text-gray-500">
          <Trans>Add more in the Users menu</Trans>
        </div>
        <div className="py-2 text-black text-2xl font-semibold">{data?.total ? <p>{data?.total}</p> : <p>-</p>}</div>
      </div>
      <div className="p-6 bg-white rounded-xl shadow-md w-1/3 mx-6">
        <div className="text-sm text-gray-800">
          <Trans>Active Users</Trans>
        </div>
        <div className="text-sm text-gray-500">
          <Trans>Active users the past 30 days</Trans>
        </div>
        <div className="py-2 text-black text-2xl font-semibold">{data?.total ? <p>{data?.total}</p> : <p>-</p>}</div>
      </div>
    </div>
  );
}
