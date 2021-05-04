import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import React from "react";

export interface MessageProps {
  value: string;
  timestamp: string;
  username: string;
}

export const Message: React.FC<MessageProps> = ({
  value,
  timestamp,
  username,
}) => {
  const messageContainerColor = useColorModeValue("gray.200", "gray.700");

  // Message -> message : { value: string, date: Date, username: string }

  return (
    <Box bg={messageContainerColor} borderRadius={5} m={2} p={2}>
      <Flex align="center">
        <Text fontWeight="bold">{username}</Text>
        <Text fontWeight="thin" ml="auto">
          {timestamp}
        </Text>
      </Flex>
      <Text>{value}</Text>
    </Box>
  );
};
