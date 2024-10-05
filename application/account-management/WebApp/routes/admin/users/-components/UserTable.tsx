import { EllipsisVerticalIcon, Trash2Icon, UserIcon } from "lucide-react";
import type { SortDescriptor } from "react-aria-components";
import { MenuTrigger, TableBody } from "react-aria-components";
import { useCallback, useState } from "react";
import { Cell, Column, Row, Table, TableHeader } from "@repo/ui/components/Table";
import { Badge } from "@repo/ui/components/Badge";
import { Pagination } from "@repo/ui/components/Pagination";
import { Popover } from "@repo/ui/components/Popover";
import { Menu, MenuItem, MenuSeparator } from "@repo/ui/components/Menu";
import { Button } from "@repo/ui/components/Button";
import { Avatar } from "@repo/ui/components/Avatar";
import { SortableUserProperties, SortOrder, useApi } from "@/shared/lib/api/client";
import { useNavigate, useSearch } from "@tanstack/react-router";

export function UserTable() {
  const navigate = useNavigate();
  const { orderBy, pageOffset, sortOrder } = useSearch({ strict: false });

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>(() => ({
    column: orderBy,
    direction: sortOrder === "Ascending" ? "ascending" : "descending"
  }));

  const { data } = useApi("/api/account-management/users", {
    params: {
      query: {
        PageOffset: pageOffset,
        OrderBy: orderBy,
        SortOrder: sortOrder
      }
    }
  });

  const handlePageChange = useCallback(
    (page: number) => {
      navigate({
        to: "/admin/users",
        search: (prev) => ({
          ...prev,
          pageOffset: page === 1 ? undefined : page - 1
        })
      });
    },
    [navigate]
  );

  const handleSortChange = useCallback(
    (newSortDescriptor: SortDescriptor) => {
      setSortDescriptor(newSortDescriptor);
      navigate({
        to: "/admin/users",
        search: (prev) => ({
          ...prev,
          pageOffset: undefined, // I Just added this to set the PageOffset to 0 when sorting
          orderBy: (newSortDescriptor.column?.toString() ?? "Name") as SortableUserProperties,
          sortOrder: newSortDescriptor.direction === "ascending" ? SortOrder.Ascending : SortOrder.Descending
        })
      });
    },
    [navigate]
  );

  const currentPage = (data?.currentPageOffset ?? 0) + 1;

  return (
    <div className="flex flex-col gap-2 h-full w-full">
      <Table
        key={`${orderBy}-${sortOrder}`}
        selectionMode="multiple"
        selectionBehavior="toggle"
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange}
        aria-label="Users"
      >
        <TableHeader>
          <Column minWidth={180} allowsSorting id={SortableUserProperties.Name} isRowHeader>
            Name
          </Column>
          <Column minWidth={120} allowsSorting id={SortableUserProperties.Email}>
            Email
          </Column>
          <Column minWidth={65} defaultWidth={110} allowsSorting id={SortableUserProperties.CreatedAt}>
            Added
          </Column>
          <Column minWidth={65} defaultWidth={120} allowsSorting id={SortableUserProperties.ModifiedAt}>
            Last Seen
          </Column>
          <Column minWidth={65} defaultWidth={75} allowsSorting id={SortableUserProperties.Role}>
            Role
          </Column>
          <Column width={114}>Actions</Column>
        </TableHeader>
        <TableBody>
          {data?.users.map((user) => (
            <Row key={user.id}>
              <Cell>
                <div className="flex h-14 items-center gap-2">
                  <Avatar
                    initials={getInitials(user.firstName, user.lastName, user.email)}
                    avatarUrl={user.avatarUrl}
                    size="sm"
                    isRound
                  />
                  <div className="flex flex-col truncate">
                    <div className="truncate text-foreground">
                      {user.firstName} {user.lastName}
                      {user.emailConfirmed ? "" : <Badge variant="outline">Pending</Badge>}
                    </div>
                    <div className="truncate">{user.title ?? ""}</div>
                  </div>
                </div>
              </Cell>
              <Cell>{user.email}</Cell>
              <Cell>{toFormattedDate(user.createdAt)}</Cell>
              <Cell>{toFormattedDate(user.modifiedAt)}</Cell>
              <Cell>
                <Badge variant="outline">{user.role}</Badge>
              </Cell>
              <Cell>
                <div className="group flex gap-2 w-full">
                  <Button
                    variant="icon"
                    className="group-hover:opacity-100 opacity-0 duration-300 transition-opacity ease-in-out"
                  >
                    <Trash2Icon className="w-5 h-5 text-muted-foreground" />
                  </Button>
                  <MenuTrigger>
                    <Button variant="icon" aria-label="Menu">
                      <EllipsisVerticalIcon className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <Popover>
                      <Menu>
                        <MenuItem onAction={() => alert("open")}>
                          <UserIcon className="w-4 h-4" />
                          View Profile
                        </MenuItem>
                        <MenuSeparator />
                        <MenuItem onAction={() => alert("rename")}>
                          <Trash2Icon className="w-4 h-4 text-destructive" />
                          <span className="text-destructive">Delete</span>
                        </MenuItem>
                      </Menu>
                    </Popover>
                  </MenuTrigger>
                </div>
              </Cell>
            </Row>
          ))}
        </TableBody>
      </Table>
      {data && (
        <>
          <Pagination
            paginationSize={5}
            currentPage={currentPage}
            totalPages={data?.totalPages ?? 1}
            onPageChange={handlePageChange}
            className="w-full pr-12 sm:hidden"
          />
          <Pagination
            paginationSize={9}
            currentPage={currentPage}
            totalPages={data?.totalPages ?? 1}
            onPageChange={handlePageChange}
            previousLabel="Previous"
            nextLabel="Next"
            className="hidden sm:flex w-full"
          />
        </>
      )}
    </div>
  );
}

function toFormattedDate(input: string | undefined | null) {
  if (!input) return "";
  const date = new Date(input);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function getInitials(firstName: string | undefined, lastName: string | undefined, email: string | undefined) {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`;
  if (email == null) return "";
  return email.split("@")[0].slice(0, 2).toUpperCase();
}
