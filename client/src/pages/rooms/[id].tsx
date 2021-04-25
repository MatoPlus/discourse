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
import {
  fetchRoom,
  leaveRoom,
  verifyUserForRoom,
} from "../../api/routes/rooms";
import { Container } from "../../components/Container";
import { Hero } from "../../components/Hero";
import { codeMirrorModes } from "../../constants";
import { requireSSRCodeMirror } from "../../utils/requireSSRCodeMirror";
import { useGetId } from "../../utils/useGetId";

// Require all languages, key maps, and themes used for code mirror
requireSSRCodeMirror();

const Room = () => {
  const id = useGetId();
  const { data: verifiedData } = useQuery("verified", () =>
    verifyUserForRoom(id as string)
  );
  const { data: roomData, isLoading, error } = useQuery(
    "room",
    () => fetchRoom(id as string),
    { enabled: id !== "-1" }
  );

  const socketRef = useRef<Socket<DefaultEventsMap, DefaultEventsMap>>();
  const { colorMode } = useColorMode();
  const [code, setCode] = useState({ value: roomData?.data.content });
  const [indent, setIndent] = useState(4);
  const [language, setLanguage] = useState(roomData?.data.mode);
  const [keybinding, setKeybinding] = useState("default");
  const [room, setRoom] = useState<RoomProps>();

  useEffect(() => {
    // Socket configuration
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL as string, {
      query: { roomId: roomData?.data._id },
    });
    socketRef.current.on("code edit", (value) => {
      setCode({ value });
    });
    socketRef.current.on("setting edit language", (language) => {
      setLanguage(language);
    });

    // Setting states
    setCode({ value: roomData?.data.content });
    setLanguage(roomData?.data.mode);
    setRoom(roomData?.data);

    return () => {
      if (socketRef.current) {
        leaveRoom(roomData?.data._id).catch((err) => console.log(err));
        socketRef.current.disconnect();
      }
    };
  }, [roomData]);

  if (error) {
    return (
      <Container height="100vh">
        <Hero title="Room Not Found"></Hero>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container height="100vh">
        <Hero title="Loading..."></Hero>
      </Container>
    );
  }

  if (!room) {
    return (
      <Container height="100vh">
        <Hero title="Room not found..."></Hero>
      </Container>
    );
  }

  if (!verifiedData?.data.verified) {
    // TODO: This should ideally show the password prompt for room
    return (
      <Container height="100vh">
        <Hero title="No Permission to Join Room"></Hero>
      </Container>
    );
  }

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
