import { Button } from "@chakra-ui/button";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { Heading, Link as ChakraLink } from "@chakra-ui/layout";
import { useDisclosure } from "@chakra-ui/react";
import { chakra } from "@chakra-ui/system";
import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import Link from "next/link";
import React, { useMemo, useRef, useState } from "react";
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

export async function getServerSideProps(_: any) {
  const { data } = await fetchRooms();
  return {
    props: {
      rooms: data.rooms,
    },
  };
}

const Rooms = ({ rooms }: { rooms: [RoomProps] }) => {
  const roomsWithUserStatus: any = rooms.map((room) => {
    (room as any).activeUsers = `${room.currentUsers.length}/${room.maxUsers}`;
    return room;
  });
  const data = useMemo<(RoomProps & { activeUsers: string })[]>(
    () => [...roomsWithUserStatus],
    []
  );

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

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const [roomData, setRoomData] = useState<RoomProps>({
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
      <Container>
        <Heading p={4} mr="auto" size="2xl">
          Rooms
        </Heading>
        <Link href="/rooms/create">
          <Button m={4} ml="auto" as={ChakraLink} colorScheme="teal">
            create room
          </Button>
        </Link>
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
                            setRoomData(rooms[row.index]);
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
        room={roomData}
        cancelRef={cancelRef}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  );
};

export default Rooms;
