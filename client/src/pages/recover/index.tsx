import { Button } from "@chakra-ui/button";
import { Box } from "@chakra-ui/layout";
import { Form, Formik } from "formik";
import { useState } from "react";
import { recoverUserPassword } from "../../api/routes/users";
import { Container } from "../../components/Container";
import { InputField } from "../../components/InputField";
import { getErrorMap } from "../../utils/getErrorMap";

const Recover = () => {
  const [requested, setRequested] = useState(false);
  return (
    <Container height="100vh">
      <Box m="auto">
        <Formik
          initialValues={{ email: "" }}
          onSubmit={async (values, { setErrors }) => {
            const response = await recoverUserPassword(values).catch((err) => {
              setErrors(getErrorMap(err.response.data.errors));
            });
            if (response && response.data) {
              setRequested(true);
            }
          }}
        >
          {requested ? (
            <Box>
              If an account with that email exists, we sent you a recovery email
            </Box>
          ) : (
            <Form>
              <InputField name="email" placeholder="email" label="Email" />
              <Button mt={4} type="submit" colorScheme="teal">
                recover
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default Recover;
