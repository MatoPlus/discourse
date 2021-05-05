import { Button } from "@chakra-ui/button";
import {
  AddIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RepeatIcon,
  TriangleDownIcon,
  TriangleUpIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Heading,
  Link as ChakraLink,
  Text,
} from "@chakra-ui/layout";
import { Tooltip, useDisclosure } from "@chakra-ui/react";
import { chakra } from "@chakra-ui/system";
import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import Link from "next/link";
import React, { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { Column, useSortBy, useTable } from "react-table";
import { fetchRooms } from "../../api/routes/rooms";
import { Container } from "../../components/Container";
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
          <Tooltip label="Create room">
            <Box>
              <Link href="/rooms/create">
                <Button m={2} as={ChakraLink} colorScheme="teal" size="sm">
                  <AddIcon />
                </Button>
              </Link>
            </Box>
          </Tooltip>
          <Tooltip label="Refresh rooms">
            <Button
              m={2}
              onClick={() => queryClient.invalidateQueries("rooms")}
              colorScheme="teal"
              size="sm"
            >
              <RepeatIcon />
            </Button>
          </Tooltip>
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
                          {cell.render("Cell")}
                        </ChakraLink>
                      ) : (
                        <>{cell.render("Cell")}</>
                      )}
                    </Td>
                  ))}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
        <Tooltip label="Previous page">
          <Button
            m={2}
            onClick={async () => {
              setPage((old) => Math.max(old - 1, 0));
            }}
            colorScheme="teal"
            disabled={page === 0}
            size="sm"
          >
            <ChevronLeftIcon />
          </Button>
        </Tooltip>
        <Tooltip label="Next page">
          <Button
            m={2}
            onClick={async () => {
              if (!isPreviousData && hasMore) {
                setPage((old) => old + 1);
              }
            }}
            colorScheme="teal"
            disabled={isPreviousData || !hasMore}
            size="sm"
          >
            <ChevronRightIcon />
          </Button>
        </Tooltip>
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
