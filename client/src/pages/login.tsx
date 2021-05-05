import { Button } from "@chakra-ui/button";
import { Box, Flex, Link as ChakraLink } from "@chakra-ui/layout";
import { Form, Formik } from "formik";
import { Container } from "../components/Container";
import { InputField } from "../components/InputField";
import Link from "next/link";
import { loginUser } from "../api/routes/users";
import { getErrorMap } from "../utils/getErrorMap";
import { setAccessToken } from "../accessToken";
import { useRouter } from "next/router";

const Login = () => {
  const router = useRouter();

  return (
    <Container isCenter>
      <Box m="auto">
        <Formik
          initialValues={{ usernameOrEmail: "", password: "" }}
          onSubmit={async (values, { setErrors }) => {
            const response = await loginUser(values).catch((err) => {
              setErrors(getErrorMap(err.response.data.errors));
            });
            if (response && response.data) {
              setAccessToken(response.data.token);
              router.push("/");
            }
          }}
        >
          {({ isSubmitting }) => (
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
              <Button
                mt={4}
                type="submit"
                colorScheme="teal"
                isLoading={isSubmitting}
              >
                login
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default Login;
