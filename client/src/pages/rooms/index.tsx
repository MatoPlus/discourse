import { Button } from "@chakra-ui/button";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { Link as ChakraLink } from "@chakra-ui/layout";
import { useDisclosure } from "@chakra-ui/react";
import { chakra } from "@chakra-ui/system";
import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import Link from "next/link";
import React, { useMemo, useRef, useState } from "react";
import { Column, useSortBy, useTable } from "react-table";
import { fetchRooms } from "../../api/routes/rooms";
import { Container } from "../../components/Container";
import { Hero } from "../../components/Hero";
import { JoinRoomDialog } from "../../components/JoinRoomDialog";

export interface RoomProps {
  name: string;
  host: string;
  maxUsers: number;
  currentUsers: [{ userId: string }];
  content: string;
  mode: string;
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
  const data = useMemo<RoomProps[]>(() => [...rooms], []);
  const columns = useMemo<Column<RoomProps>[]>(
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
        Header: "Max Users",
        accessor: "maxUsers",
        isNumeric: true,
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
  const [roomData, setRoomData] = useState({ roomId: "" });

  return (
    <>
      <Container height="100vh">
        <Hero title={"Rooms"} />
        <Link href="/rooms/create">
          <Button mb={2} as={ChakraLink} colorScheme="teal">
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
                            setRoomData({
                              roomId: rooms[row.index]._id.toString(),
                            });
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
        {...roomData}
        cancelRef={cancelRef}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  );
};

export default Rooms;
