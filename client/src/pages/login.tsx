import { Button } from "@chakra-ui/button";
import { Box, Flex, Link as ChakraLink } from "@chakra-ui/layout";
import { Form, Formik } from "formik";
import { Container } from "../components/Container";
import { DarkModeSwitch } from "../components/DarkModeSwitch";
import { InputField } from "../components/InputField";
import Link from "next/link";
import { loginUser } from "../api/users";

const Login = () => (
  <Container height="100vh">
    <Box m="auto">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={(values) => {
          loginUser(values);
        }}
      >
        <Form>
          <InputField
            name="usernameOrEmail"
            placeholder="username or email"
            label="Username or Email"
          />
          <Box mt={4}>
            <InputField
              name="password"
              placeholder="password"
              label="Password"
              type="password"
            />
          </Box>
          <Flex mt={2}>
            <Link href="/recover">
              <ChakraLink ml="auto">forgot password?</ChakraLink>
            </Link>
          </Flex>
          <Button mt={4} type="submit" colorScheme="teal">
            login
          </Button>
        </Form>
      </Formik>
    </Box>
    <DarkModeSwitch />
  </Container>
);

export default Login;
