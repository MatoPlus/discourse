import { IconButton } from "@chakra-ui/button";
import {
  AddIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LockIcon,
  RepeatIcon,
  TriangleDownIcon,
  TriangleUpIcon,
} from "@chakra-ui/icons";
import { Flex, Heading, Link as ChakraLink, Text } from "@chakra-ui/layout";
import { useDisclosure } from "@chakra-ui/react";
import { chakra } from "@chakra-ui/system";
import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import Link from "next/link";
import React, { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { Column, useSortBy, useTable } from "react-table";
import { fetchRooms } from "../../api/routes/rooms";
import { Container } from "../../components/Container";
import { EditDeleteRoomButtons } from "../../components/EditDeleteRoomButtons";
import { JoinRoomDialog } from "../../components/JoinRoomDialog";

export interface RoomProps {
  name: string;
  host: string;
  maxUsers: number;
  currentUsers: [{ userId: string }?];
  content: string;
  mode: string;
  hasPassword: boolean;
  _id: string;
}

const Rooms = () => {
  const [page, setPage] = useState(0);

  // Look at specific useQuery for pagination (infinite query)
  const { data: roomData, isLoading, isPreviousData } = useQuery(
    ["rooms", page],
    () => fetchRooms(page)
  );
  let rooms = roomData?.data.rooms as RoomProps[];
  let hasMore = roomData?.data.hasMore as boolean;

  const data = useMemo<(RoomProps & { activeUsers: string })[]>(() => {
    if (!rooms) return [];

    const roomsWithUserStatus: any = rooms.map((room) => {
      (room as any).activeUsers = `${room.currentUsers.length}/${room.maxUsers}`;
      return room;
    });
    return [...roomsWithUserStatus];
  }, [rooms]);

  const columns = useMemo<Column<RoomProps & { activeUsers: string }>[]>(
    () => [
      {
        Header: "Room",
        accessor: "name",
      },
      {
        Header: "Host",
        accessor: "host",
      },
      {
        Header: "Users",
        accessor: "activeUsers",
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data }, useSortBy);

  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const [roomInfo, setRoomInfo] = useState<RoomProps>({
    _id: "",
    hasPassword: false,
    name: "",
    maxUsers: 1,
    currentUsers: [],
    host: "",
    content: "",
    mode: "",
  });

  return (
    <>
      <Container variant="large" isLoading={isLoading}>
        <Heading textAlign="center" size="lg">
          <Text as="samp">Rooms</Text>
        </Heading>
        <Flex justifyContent="flex-end">
          <Link href="/rooms/create">
            <IconButton
              m={2}
              as={ChakraLink}
              aria-label="Create room"
              colorScheme="teal"
              size="sm"
              icon={<AddIcon />}
            />
          </Link>
          <IconButton
            m={2}
            onClick={() => queryClient.invalidateQueries("rooms")}
            colorScheme="teal"
            size="sm"
            aria-label="Refresh rooms"
            icon={<RepeatIcon />}
          />
        </Flex>
        <Table {...getTableProps()}>
          <Thead>
            {headerGroups.map((headerGroup) => (
              <Tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <Th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    // @ts-ignore
                    isNumeric={column.isNumeric}
                  >
                    {column.render("Header")}
                    <chakra.span pl="4">
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          <TriangleDownIcon aria-label="sorted descending" />
                        ) : (
                          <TriangleUpIcon aria-label="sorted ascending" />
                        )
                      ) : null}
                    </chakra.span>
                  </Th>
                ))}
                <Th textAlign="right">Options</Th>
              </Tr>
            ))}
          </Thead>
          <Tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <Tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <Td
                      {...cell.getCellProps()}
                      // @ts-ignore
                      isNumeric={cell.column.isNumeric}
                    >
                      {cell.column.Header?.toString() === columns[0].Header ? (
                        <ChakraLink
                          onClick={() => {
                            setRoomInfo(rooms[row.index]);
                            onOpen();
                          }}
                        >
                          {rooms[row.index].hasPassword ? (
                            <LockIcon size="sm" pr={1} />
                          ) : null}
                          {cell.render("Cell")}
                        </ChakraLink>
                      ) : (
                        <>{cell.render("Cell")}</>
                      )}
                    </Td>
                  ))}
                  <Td textAlign="right">
                    <EditDeleteRoomButtons
                      id={rooms[row.index]._id}
                      creatorName={rooms[row.index].host}
                    />
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
        <Flex justifyContent="flex-end">
          <IconButton
            m={2}
            onClick={async () => {
              setPage((old) => Math.max(old - 1, 0));
            }}
            colorScheme="teal"
            aria-label="Previous page"
            disabled={page === 0}
            size="sm"
            icon={<ChevronLeftIcon />}
          />
          <IconButton
            m={2}
            onClick={async () => {
              if (!isPreviousData && hasMore) {
                setPage((old) => old + 1);
              }
            }}
            colorScheme="teal"
            aria-label="Next page"
            disabled={isPreviousData || !hasMore}
            size="sm"
            icon={<ChevronRightIcon />}
          />
        </Flex>
      </Container>

      <JoinRoomDialog
        room={roomInfo}
        cancelRef={cancelRef}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  );
};

export default Rooms;
