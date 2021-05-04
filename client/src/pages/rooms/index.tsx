import { Button } from "@chakra-ui/button";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { Flex, Heading, Link as ChakraLink, Text } from "@chakra-ui/layout";
import { Spinner, useDisclosure } from "@chakra-ui/react";
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
  const { data: roomData, isLoading } = useQuery("rooms", fetchRooms);
  const rooms = roomData?.data.rooms as [RoomProps];

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

  if (isLoading) {
    return (
      <Container>
        <Spinner size="xl" m="auto" />
      </Container>
    );
  }

  return (
    <>
      <Container variant="large">
        <Heading p={4} textAlign="center" size="2xl">
          <Text as="samp">Rooms</Text>
        </Heading>
        <Flex justifyContent="flex-end">
          <Link href="/rooms/create">
            <Button m={2} as={ChakraLink} colorScheme="teal">
              create room
            </Button>
          </Link>
          <Button
            m={2}
            onClick={() => queryClient.invalidateQueries("rooms")}
            colorScheme="teal"
          >
            refresh
          </Button>
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
