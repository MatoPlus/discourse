import { Box, Flex, Heading } from "@chakra-ui/layout";
import Link from "next/link";
import { Button, Link as ChakraLink } from "@chakra-ui/react";
import { useQuery, useQueryClient } from "react-query";
import { fetchMe, logoutUser } from "../api/routes/users";
import { setAccessToken } from "../accessToken";
import { DarkModeSwitch } from "./DarkModeSwitch";

export const Navigation = ({ bg }: { bg: string }) => {
  const queryClient = useQueryClient();
  const { data } = useQuery("me", fetchMe);

  let body = (
    <>
      <Link href="/login">
        <ChakraLink mr={2}>login</ChakraLink>
      </Link>
      <Link href="/register">
        <ChakraLink mr={4}>register</ChakraLink>
      </Link>
    </>
  );

  if (data && data.data.username) {
    body = (
      <>
        <Box mr={2}>{(data as any).data.username}</Box>
        <Button
          onClick={async () => {
            await logoutUser();
            setAccessToken("");
            queryClient.invalidateQueries("me");
          }}
          variant="link"
          mr={4}
        >
          logout
        </Button>
      </>
    );
  }

  return (
    <Flex zIndex={1} position="sticky" top={0} p={3} bg={bg}>
      <Flex flex={1} m="auto" align="center" maxW={800}>
        <Link href="/">
          <ChakraLink>
            <Heading>discourse</Heading>
          </ChakraLink>
        </Link>
        <Box ml="auto">
          <Flex align="center">
            <Link href="/rooms">
              <ChakraLink mr={4}>rooms</ChakraLink>
            </Link>
            {body}
            <DarkModeSwitch />
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};
