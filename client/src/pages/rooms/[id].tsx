import { useColorMode } from "@chakra-ui/color-mode";
import { Box, Center, Heading, Text } from "@chakra-ui/layout";
import { Button, useToast } from "@chakra-ui/react";
import { Select } from "@chakra-ui/select";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/solarized.css";
import { Formik, Form } from "formik";
import router from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import { useQuery, useQueryClient } from "react-query";
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io-client/build/typed-events";
import { RoomProps } from ".";
import {
  enterRoom,
  fetchRoom,
  leaveRoom,
  verifyUserForRoom,
} from "../../api/routes/rooms";
import { Container } from "../../components/Container";
import { Hero } from "../../components/Hero";
import { InputField } from "../../components/InputField";
import { codeMirrorModes } from "../../constants";
import { getErrorMap } from "../../utils/getErrorMap";
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
  const { data: roomData, isLoading, error } = useQuery(
    "room",
    () => fetchRoom(id as string),
    { enabled: id !== "-1", cacheTime: 0 }
  );

  const queryClient = useQueryClient();
  const { colorMode } = useColorMode();
  const toast = useToast();
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
    const soc = io(process.env.NEXT_PUBLIC_API_URL as string, {
      query: { roomId: id },
    });
    setSocket(soc);

    return () => {
      soc.disconnect();
      leaveRoom(id).catch((err) => console.log(err));
    };
  }, []);

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

  if (error) {
    return (
      <Container height="100vh">
        <Hero title="Room not found"></Hero>
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
    return (
      <Container height="100vh">
        <Box m="auto">
          <Heading mb={4} size="lg">
            {room.name}
          </Heading>
          <Text mb={6}>
            {`Users: ${room.currentUsers.length}/${room.maxUsers}`}
          </Text>
          <Formik
            initialValues={{ password: "" }}
            onSubmit={async (values, { setErrors }) => {
              const response = await enterRoom(id, values).catch((err) => {
                (err.response.data.errors as string[]).forEach((error) => {
                  if ((error as any).status) {
                    toast({
                      title: (error as any).status,
                      status: "error",
                      duration: 2000,
                      isClosable: true,
                    });
                  }
                });
                setErrors(getErrorMap(err.response.data.errors));
              });
              if (response && response.data.errors) {
                router.push("/rooms/");
              } else if (response && response.data) {
                queryClient.invalidateQueries("verified");
              }
            }}
          >
            <Form>
              {room.hasPassword ? (
                <InputField
                  name="password"
                  placeholder="password"
                  label="Password"
                  type="password"
                />
              ) : null}
              <Button mt={4} onClick={() => router.push("/rooms/")}>
                cancel
              </Button>
              <Button mt={4} ml={4} type="submit" colorScheme="teal">
                join
              </Button>
            </Form>
          </Formik>
        </Box>
      </Container>
    );
  }

  return (
    <Container height="100%" disableStickyNav>
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
