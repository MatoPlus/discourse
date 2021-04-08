import { Box, Heading } from "@chakra-ui/layout";
import { Container } from "next/app";
import React from "react";
import { RoomProps } from ".";
import { fetchRoom } from "../../api/rooms";
import { DarkModeSwitch } from "../../components/DarkModeSwitch";
import Editor from "@monaco-editor/react";

export async function getServerSideProps(context: any) {
  const { id } = context.query;
  const { data } = await fetchRoom(id as string);
  return {
    props: {
      room: data,
    },
  };
}

const Room = ({ room }: { room: RoomProps }) => {
  if (!room) {
    return (
      <Container height="100vh">
        <Box>could not find post</Box>
        <DarkModeSwitch />
      </Container>
    );
  }

  return (
    <Container height="100vh">
      <Heading mb={4}>{room.name}</Heading>
      <Editor height="75vh" defaultLanguage="javascript" theme={"vs-dark"} />
      <DarkModeSwitch />
    </Container>
  );
};

export default Room;
