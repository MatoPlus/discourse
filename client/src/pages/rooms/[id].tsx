import { Box, Heading } from "@chakra-ui/layout";
import { Container } from "../../components/Container";
import React from "react";
import { RoomProps } from ".";
import { fetchRoom } from "../../api/routes/rooms";
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
      </Container>
    );
  }

  return (
    <Container height="100vh">
      <Heading mt={2} mb={2} size="lg">
        {room.name}
      </Heading>
      <Editor height="75vh" defaultLanguage="javascript" theme={"vs-dark"} />
    </Container>
  );
};

export default Room;
