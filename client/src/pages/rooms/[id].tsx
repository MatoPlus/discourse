import { useColorMode } from "@chakra-ui/color-mode";
import { Box, Flex, Heading, Text } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/select";
import { useToast } from "@chakra-ui/toast";
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
import { fetchMe } from "../../api/routes/users";
import { Container } from "../../components/Container";
import { EditDeleteRoomButtons } from "../../components/EditDeleteRoomButtons";
import { PageSpinner } from "../../components/PageSpinner";
import { Chat } from "../../components/rooms/Chat";
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
  const { data: meData } = useQuery("me", fetchMe);

  const { colorMode } = useColorMode();
  const toast = useToast();
  const [content, setContent] = useState<string>();
  const [verified, setVerified] = useState<boolean>(false);
  const [indent, setIndent] = useState<number>(4);
  const [language, setLanguage] = useState<string>();
  const [keybinding, setKeybinding] = useState<string>("default");
  const [docLoaded, setDocLoaded] = useState<boolean>(false);
  const [room, setRoom] = useState<RoomProps>();
  const [socket, setSocket] = useState<Socket<
    DefaultEventsMap,
    DefaultEventsMap
  > | null>(null);

  // Socket + room setup
  useEffect(() => {
    if (id === "-1" || !verified) return;

    const soc = io(process.env.NEXT_PUBLIC_API_URL as string, {
      query: { roomId: id, username: meData?.data.username },
    });
    setSocket(soc);

    return () => {
      soc.disconnect();
      leaveRoom(id).catch((err) => console.log(err));
      setVerified(false);
      setSocket(null);
    };
  }, [id, verified]);

  // Room content setup
  useEffect(() => {
    setVerified(verifiedData?.data.verified);
  }, [verifiedData]);

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

  // User communications
  useEffect(() => {
    if (socket == null) return;

    socket.on("user-join", (username) => {
      toast({
        title: `User "${username}" joined the room`,
        status: "info",
        position: "bottom-left",
        duration: 2000,
        isClosable: true,
      });
    });
    socket.on("user-leave", (username) => {
      toast({
        title: `User "${username}" left the room`,
        status: "info",
        duration: 2000,
        position: "bottom-left",
        isClosable: true,
      });
    });
  }, [socket]);

  if (isError) {
    return (
      <Container isCenter>
        <Box m="auto">
          <Heading fontSize="3xl">Room Not Found</Heading>
        </Box>
      </Container>
    );
  }

  if (isLoading || !room) {
    return <PageSpinner />;
  }

  if (!verified) {
    return (
      <Container isCenter>
        <JoinRoomPage roomId={id} room={room} />
      </Container>
    );
  }

  return (
    <Container disableStickyNav isSingleView variant="large">
      <Box width="100%" px={3} pb={2}>
        <Flex justifyContent="flex-end" align="center" pb={2}>
          <Flex mr="auto" align="center">
            <Heading px={3} size="md">
              {room.name}
            </Heading>
            <EditDeleteRoomButtons creatorName={room.host} id={id} />
          </Flex>
          <Text pr={2}>Language: </Text>
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
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </Select>
          <Text p={2}>Key Binding: </Text>
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
        </Flex>
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
      <Flex px={3} mr="auto" align="center">
        {socket ? <Chat socket={socket} /> : null}
      </Flex>
    </Container>
  );
};

export default Room;
