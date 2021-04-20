import "codemirror/lib/codemirror.css";
import "codemirror/theme/solarized.css";
import { io, Socket } from "socket.io-client";
import { Box, Heading } from "@chakra-ui/layout";
import { Container } from "../../components/Container";
import React, { useEffect, useRef, useState } from "react";
import { RoomProps } from ".";
import { fetchRoom } from "../../api/routes/rooms";
import { Controlled as CodeMirror } from "react-codemirror2";
import { useColorMode } from "@chakra-ui/color-mode";
import { Select } from "@chakra-ui/select";
import { DefaultEventsMap } from "socket.io-client/build/typed-events";

// A workaround for SSR
if (typeof window !== "undefined" && typeof window.navigator !== "undefined") {
  require("codemirror/mode/javascript/javascript");
  require("codemirror/mode/xml/xml");
  require("codemirror/mode/css/css");
  require("codemirror/keymap/vim");
  require("codemirror/keymap/emacs");
}

export async function getServerSideProps(context: any) {
  const { id } = context.query;
  const { data } = await fetchRoom(id as string);
  return {
    props: {
      room: data,
    },
  };
}

// TODO: We want an is auth method of some sort
const Room = ({ room }: { room: RoomProps }) => {
  if (!room) {
    return (
      <Container height="100vh">
        <Box>could not find post</Box>
      </Container>
    );
  }

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
        <option value="javascript">javascript</option>
        <option value="xml">xml</option>
        <option value="css">css</option>
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
