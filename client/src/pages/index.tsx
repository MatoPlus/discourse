import { Search2Icon } from "@chakra-ui/icons";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { Container } from "../components/Container";
import { Footer } from "../components/Footer";
import { Hero } from "../components/Hero";

const Index = () => (
  <Container>
    <Hero />
    <Text m="auto" w="50vw" fontSize="2xl" pb="25vh">
      Code, collaborate, and chat together with discouse. The discourse platform
      that offers real-time, cooperative code rooms. Go beyond the generic code
      sharing platform, utilize powerful functionalities along with our simple
      and intuitive interface.
    </Text>
    <Flex align="center" pt={12}>
      <Heading>{`</>`}</Heading>
      <Text fontSize="larger" pl={8}>
        Choose from over 100 languages to give your code all your syntax
        highlighting needs as you type. Change the theme of your platform from
        light to dark, depending on your preference and needs.
      </Text>
    </Flex>
    <Flex align="center" pt={12}>
      <Heading>
        <Search2Icon />
      </Heading>
      <Text m="auto" fontSize="larger" pl={16}>
        Create private or public rooms for free, host a code party, invite
        friends! Use discourse to find rooms under our platform, discover and
        chat with new people in large public rooms.
      </Text>
    </Flex>
    <Footer>
      <Text m="auto">Copyright © discourse 2021</Text>
    </Footer>
  </Container>
);

export default Index;
