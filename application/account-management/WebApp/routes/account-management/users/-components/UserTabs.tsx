import { useApi } from "@/shared/lib/api/elysia";
import { Badge } from "@repo/ui/components/Badge";
import { Tab, TabList, Tabs } from "@repo/ui/components/Tabs";

export function UserTabs() {
  const { data } = useApi("/account-management/api/users/query", {
    query: {
      pageSize: 1
    }
  });

  return (
    <Tabs>
      <TabList aria-label="User Categories">
        <Tab id="allUsers" href="/account-management/users">
          All Users <Badge variant="secondary">{data?.total}</Badge>
        </Tab>
        <Tab id="invitedUsers" href="/account-management/users">
          Invited Users <Badge variant="secondary">2</Badge>
        </Tab>
        <Tab id="userGroups" href="/account-management/users">
          User Groups <Badge variant="secondary">5</Badge>
        </Tab>
      </TabList>
    </Tabs>
  );
}
