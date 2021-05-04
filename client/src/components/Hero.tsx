import { Flex, Heading, Text } from "@chakra-ui/react";

export const Hero = () => (
  <Flex
    justifyContent="center"
    alignItems="center"
    height="100vh"
    direction="column"
  >
    <Heading fontSize="6vw">discourse</Heading>
    <Text fontSize="2xl" as="samp">
      Code, Collaborate, Chat
    </Text>
  </Flex>
);
