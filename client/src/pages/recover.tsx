import { Button } from "@chakra-ui/button";
import { Box } from "@chakra-ui/layout";
import { Form, Formik } from "formik";
import { Container } from "../components/Container";
import { InputField } from "../components/InputField";

const Recover = () => (
  <Container height="100vh">
    <Box m="auto">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={(values) => {
          console.log(values);
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
            recover
          </Button>
        </Form>
      </Formik>
    </Box>
  </Container>
);

export default Recover;
