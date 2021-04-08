import { Container } from "../../components/Container";
import { DarkModeSwitch } from "../../components/DarkModeSwitch";
import { Hero } from "../../components/Hero";
import { fetchRooms } from "../../api/rooms";
import { Table, Tbody, Th, Thead, Tr, Td } from "@chakra-ui/table";
import React, { useMemo } from "react";
import { useTable, useSortBy, Column } from "react-table";
import { chakra } from "@chakra-ui/system";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { Link as ChakraLink } from "@chakra-ui/layout";

export interface RoomProps {
  name: string;
  host: string;
  maxUsers: number;
  _id: string;
}

export async function getServerSideProps(_: any) {
  const { data } = await fetchRooms();
  return {
    props: {
      rooms: data,
    },
  };
}

const Room = ({ rooms }: { rooms: [RoomProps] }) => {
  console.log("rooms", rooms);

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

  return (
    <Container height="100vh">
      <Hero title={"Rooms"} />
      <DarkModeSwitch />
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
                      <Link
                        href="/rooms/[id]"
                        as={`/rooms/${rooms[row.index]._id}`}
                      >
                        <ChakraLink>{cell.render("Cell")}</ChakraLink>
                      </Link>
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
  );
};

export default Room;
