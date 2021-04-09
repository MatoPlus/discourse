import { Button } from "@chakra-ui/button";
import { Box } from "@chakra-ui/layout";
import { Form, Formik } from "formik";
import { registerUser } from "../api/users";
import { Container } from "../components/Container";
import { DarkModeSwitch } from "../components/DarkModeSwitch";
import { InputField } from "../components/InputField";
import { getErrorMap } from "../utils/getErrorMap";

const Register = () => (
  <Container height="100vh">
    <Box m="auto">
      <Formik
        initialValues={{ username: "", email: "", password: "" }}
        onSubmit={(values, { setErrors }) => {
          registerUser(values).catch((err) => {
            setErrors(getErrorMap(err.response.data.errors));
          });
        }}
      >
        <Form>
          <InputField name="username" placeholder="username" label="Username" />
          <Box mt={4}>
            <InputField name="email" placeholder="email" label="Email" />
          </Box>
          <Box mt={4}>
            <InputField
              name="password"
              placeholder="password"
              label="Password"
              type="password"
            />
          </Box>
          <Button mt={4} type="submit" colorScheme="teal">
            register
          </Button>
        </Form>
      </Formik>
    </Box>
    <DarkModeSwitch />
  </Container>
);

export default Register;
