import { useColorMode } from "@chakra-ui/color-mode";
import { Box, Heading } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/select";
import { Spinner } from "@chakra-ui/spinner";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/solarized.css";
import React, { useEffect, useState } from "react";
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
import { JoinRoomPage } from "../../components/rooms/JoinRoomPage";
import { codeMirrorModes } from "../../constants";
import { requireSSRCodeMirror } from "../../utils/requireSSRCodeMirror";
import { useGetId } from "../../utils/useGetId";

// Require all languages, key maps, and themes used for code mirror
requireSSRCodeMirror();

const SAVE_INTERVAL_MS = 1000;

const Room = () => {
  const id = useGetId();
  const { data: verifiedData } = useQuery(
    "verified",
    () => verifyUserForRoom(id as string),
    { enabled: id !== "-1" }
  );
  const { data: roomData, isLoading, isError } = useQuery(
    "room",
    () => fetchRoom(id as string),
    {
      enabled: id !== "-1",
      cacheTime: 0,
    }
  );

  const { colorMode } = useColorMode();
  const [content, setContent] = useState<string>();
  const [indent, setIndent] = useState<number>(4);
  const [language, setLanguage] = useState<string>();
  const [keybinding, setKeybinding] = useState<string>("default");
  const [docLoaded, setDocLoaded] = useState<boolean>(false);
  const [room, setRoom] = useState<RoomProps>();
  const [socket, setSocket] = useState<
    Socket<DefaultEventsMap, DefaultEventsMap>
  >();

  // Socket + room setup
  useEffect(() => {
    if (id === "-1") return;

    const soc = io(process.env.NEXT_PUBLIC_API_URL as string, {
      query: { roomId: id },
    });
    setSocket(soc);

    return () => {
      soc.disconnect();
      leaveRoom(id).catch((err) => console.log(err));
    };
  }, [id]);

  // Room content setup
  useEffect(() => {
    setRoom(roomData?.data);
    setContent(roomData?.data.content);
    setLanguage(roomData?.data.mode);
    setDocLoaded(true);
  }, [roomData]);

  // Receiving boardcast from socket
  useEffect(() => {
    if (socket == null) return;

    socket.on("receive-content-change", (value) => {
      setContent(value);
    });
    socket.on("receive-mode-change", (language) => {
      setLanguage(language);
    });
  }, [socket]);

  // Auto save content in intervals
  useEffect(() => {
    if (socket == null || content == null) return;

    const interval = setTimeout(() => {
      socket.emit("save-content", content);
    }, SAVE_INTERVAL_MS);

    return () => {
      clearTimeout(interval);
    };
  }, [socket, content]);

  if (isError) {
    return (
      <Container height="100vh">
        <Hero title="Room not found"></Hero>
      </Container>
    );
  }

  if (isLoading || !room) {
    return (
      <Container height="100vh">
        <Spinner size="xl" m="auto" />
      </Container>
    );
  }

  if (!verifiedData?.data.verified) {
    return (
      <Container height="100vh">
        <JoinRoomPage roomId={id} room={room} />
      </Container>
    );
  }

  return (
    <Container height="100vh" disableStickyNav>
      <Box width="100%" padding={5}>
        <CodeMirror
          onBeforeChange={(editor, data, value) => {
            if (socket) {
              socket.emit("send-content-change", value);
              setContent(value);
            }
          }}
          value={content as string}
          options={{
            lineNumbers: true,
            lineWrapping: true,
            lint: true,
            indentUnit: indent,
            mode: language,
            theme: `solarized ${colorMode}`,
            keyMap: keybinding,
            readOnly: !docLoaded,
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
          const newLanguage = event.target.value;
          if (socket) {
            socket.emit("send-mode-change", newLanguage);
            setLanguage(newLanguage);
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
