import { Box, Flex, Heading } from "@chakra-ui/layout";
import {
  Button,
  Link as ChakraLink,
  useColorModeValue,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "react-query";
import { setAccessToken } from "../accessToken";
import { fetchMe, logoutUser } from "../api/routes/users";
import { DarkModeSwitch } from "./DarkModeSwitch";

type NavigationProps = {
  disableSticky: boolean;
};

export const Navigation: React.FC<NavigationProps> = ({ disableSticky }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data, error } = useQuery("me", fetchMe, {
    retry: 2,
  });
  const color = useColorModeValue("gray.50", "gray.900");

  let body;

  if (data?.data.username && !error) {
    body = (
      <>
        <Box mr={2}>{data.data.username}</Box>
        <Button
          onClick={async () => {
            await logoutUser();
            setAccessToken("");
            queryClient.invalidateQueries("me");
            router.reload();
          }}
          variant="link"
          mr={4}
        >
          logout
        </Button>
      </>
    );
  } else {
    body = (
      <>
        <Link href="/login">
          <ChakraLink mr={2}>login</ChakraLink>
        </Link>
        <Link href="/register">
          <ChakraLink mr={4}>register</ChakraLink>
        </Link>
      </>
    );
  }

  return (
    <Flex
      zIndex={1}
      position={disableSticky ? undefined : "sticky"}
      top={0}
      p={3}
      bg={color}
    >
      <Flex flex={1} m="auto" align="center" maxW="60vw">
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
