import {
  Box,
  Button,
  CloseButton,
  Flex,
  Heading,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React, { useEffect, useReducer, useState } from "react";
import { Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io-client/build/typed-events";
import { InputField } from "../InputField";
import { Message, MessageProps } from "./Message";

type ChatProps = {
  socket: Socket<DefaultEventsMap, DefaultEventsMap>;
};

export const Chat: React.FC<ChatProps> = ({ socket }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef(null);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const chatBoxColor = useColorModeValue("gray.100", "gray.800");
  const messageBoxColor = useColorModeValue("gray.50", "gray.900");

  // Receiving boardcast from socket
  useEffect(() => {
    if (socket == null) return;

    socket.on("receive-chat-message", (message) => {
      setMessages(
        messages.concat([
          {
            value: message.value,
            username: message.username,
            timestamp: new Date().toLocaleTimeString(),
          },
        ])
      );
    });
  }, [socket, messages]);

  return (
    <>
      {!isOpen ? (
        <Button ref={btnRef} colorScheme="teal" onClick={onOpen}>
          Chat
        </Button>
      ) : (
        <>
          <Button ref={btnRef} colorScheme="teal" onClick={onClose}>
            Hide Chat
          </Button>
          <Box
            position="absolute"
            h={600}
            w={80}
            bg={chatBoxColor}
            bottom={4}
            right={4}
            padding="4"
          >
            <Flex align="center" pb={2}>
              <Heading size="md">Chat</Heading>
              <CloseButton ml="auto" onClick={onClose} />
            </Flex>
            <Box h={480} py={2} bg={messageBoxColor} overflowY="scroll">
              {messages?.map((message: any) => {
                return <Message key={message.timestamp} {...message} />;
              })}
            </Box>
            <Formik
              initialValues={{ message: "" }}
              onSubmit={(values, { setValues }) => {
                socket.emit("send-chat-message", values.message);
                setValues({ message: "" });
              }}
            >
              <Form>
                <Flex align="center" pt={2}>
                  <InputField name="message" placeholder="message" />
                  <Button colorScheme="teal" type="submit">
                    send
                  </Button>
                </Flex>
              </Form>
            </Formik>
          </Box>
        </>
      )}
    </>
  );
};
