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
import { useApi } from "@/shared/lib/api/elysia";
import { useNavigate, useSearch } from "@tanstack/react-router";

enum RowId {
  firstName = "firstName",
  email = "email",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  role = "role"
}

export function UserTable() {
  const navigate = useNavigate();
  const { orderBy, pageOffset, sortOrder } = useSearch({ strict: false });

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>(() => ({
    column: orderBy,
    direction: sortOrder === "asc" ? "ascending" : "descending"
  }));

  const { data } = useApi("/account-management/api/users/query", {
    query: {
      pageOffset: pageOffset,
      orderBy: orderBy,
      sortOrder: sortOrder
    }
  });

  const handlePageChange = useCallback(
    (pageOffset: number) => {
      navigate({
        search: (prev) => ({
          ...prev,
          pageOffset: pageOffset
        })
      });
    },
    [navigate]
  );

  const handleSortChange = useCallback(
    (newSortDescriptor: SortDescriptor) => {
      console.log(newSortDescriptor);
      setSortDescriptor(newSortDescriptor);
      navigate({
        search: (prev) => ({
          ...prev,
          orderBy: (newSortDescriptor.column?.toString() as RowId) ?? "createdAt",
          sortOrder: newSortDescriptor.direction === "ascending" ? "asc" : "desc"
        })
      });
    },
    [navigate]
  );

  const currentPage = (data?.pageOffset ?? 0) + 1;

  return (
    <div className="flex flex-col gap-2 h-full w-full">
      <Table
        selectionMode="multiple"
        selectionBehavior="toggle"
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange}
        aria-label="Users"
      >
        <TableHeader>
          <Column minWidth={50} defaultWidth={200} allowsSorting id={RowId.firstName} isRowHeader>
            Name
          </Column>
          <Column minWidth={50} allowsSorting id={RowId.email}>
            Email
          </Column>
          <Column minWidth={55} allowsSorting id={RowId.createdAt}>
            Added
          </Column>
          <Column minWidth={55} allowsSorting id={RowId.updatedAt}>
            Last Seen
          </Column>
          <Column minWidth={75} allowsSorting id={RowId.role}>
            Role
          </Column>
          <Column minWidth={114} defaultWidth={114}>
            Actions
          </Column>
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
                    <div className="truncate">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-muted-foreground truncate">{user.title ?? ""}</div>
                  </div>
                </div>
              </Cell>
              <Cell>{user.email}</Cell>
              <Cell>{toFormattedDate(user.createdAt)}</Cell>
              <Cell>{toFormattedDate(user.updatedAt)}</Cell>
              <Cell>
                <Badge variant="outline">{user.role.toLowerCase()}</Badge>
              </Cell>
              <Cell>
                <div className="group flex gap-2 w-full">
                  <Button
                    variant="icon"
                    className="group-hover:opacity-100 opacity-0 duration-300 transition-opacity ease-in-out"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                  <MenuTrigger>
                    <Button variant="icon" aria-label="Menu">
                      <EllipsisVerticalIcon className="w-4 h-4" />
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
      <Pagination
        size={5}
        currentPage={currentPage}
        totalPages={data?.total ?? 1}
        onPageChange={handlePageChange}
        className="w-full pr-12 sm:hidden"
      />
      <Pagination
        size={7}
        nextLabel="Next"
        previousLabel="Previous"
        currentPage={currentPage}
        totalPages={data?.total ?? 1}
        onPageChange={handlePageChange}
        className="hidden sm:flex w-full"
      />
    </div>
  );
}

function toFormattedDate(input: string | undefined | null) {
  if (!input) return "";
  const date = new Date(input);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function getInitials(
  firstName: string | undefined | null,
  lastName: string | undefined | null,
  email: string | undefined
) {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`;
  if (email == null) return "";
  return email.split("@")[0].slice(0, 2).toUpperCase();
}
