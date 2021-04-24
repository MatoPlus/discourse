import { useColorMode } from "@chakra-ui/color-mode";
import { Box, Heading } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/select";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/solarized.css";
import React, { useEffect, useRef, useState } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import { useQuery } from "react-query";
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io-client/build/typed-events";
import { RoomProps } from ".";
import { fetchRoom, leaveRoom } from "../../api/routes/rooms";
import { fetchMe } from "../../api/routes/users";
import { Container } from "../../components/Container";
import { codeMirrorModes } from "../../constants";
import { requireSSRCodeMirror } from "../../utils/requireSSRCodeMirror";

// Require all languages, key maps, and themes used for code mirror
requireSSRCodeMirror();

// ! we don't really want user side rendering...
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

  // Ensure that requesting user is in the list of current users before continuing. Otherwise, redirect to Rooms

  const socketRef = useRef<Socket<DefaultEventsMap, DefaultEventsMap>>();
  const { colorMode } = useColorMode();
  const [code, setCode] = useState({ value: room.content });
  const [indent, setIndent] = useState(4);
  const [language, setLanguage] = useState(room.mode);
  const [keybinding, setKeybinding] = useState("default");

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL as string, {
      query: { roomId: room._id },
    });
    socketRef.current.on("code edit", (value) => {
      setCode({ value });
    });
    socketRef.current.on("setting edit language", (language) => {
      setLanguage(language);
    });

    return () => {
      if (socketRef.current) {
        leaveRoom(room._id).catch((err) => console.log(err));
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <Container height="100%" disableStickyNav>
      <Box width="100%" padding={5}>
        <CodeMirror
          onBeforeChange={(editor, data, value) => {
            if (socketRef.current) {
              socketRef.current.emit("code edit", value);
            }
            setCode({ value });
          }}
          value={code.value}
          options={{
            lineNumbers: true,
            lineWrapping: true,
            lint: true,
            indentUnit: indent,
            mode: language,
            theme: `solarized ${colorMode}`,
            keyMap: keybinding,
          }}
        />
      </Box>
      <Heading pl={5} mr="auto" size="lg">
        {room.name}
      </Heading>
      <Select
        size="sm"
        width={150}
        name="language"
        value={language}
        onChange={(event) => {
          let newLanguage = event.target.value;
          setLanguage(newLanguage);
          if (socketRef.current) {
            socketRef.current.emit("setting edit language", newLanguage);
          }
        }}
      >
        {codeMirrorModes.map((mode) => (
          <option value={mode}>{mode}</option>
        ))}
      </Select>
      <Select
        size="sm"
        width={150}
        name="keybinding"
        value={keybinding}
        onChange={(event) => setKeybinding(event.target.value)}
      >
        <option value="default">default</option>
        <option value="vim">vim</option>
        <option value="emacs">emacs</option>
      </Select>
    </Container>
  );
};

export default Room;
