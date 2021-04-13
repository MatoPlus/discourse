import { Button } from "@chakra-ui/button";
import { Box } from "@chakra-ui/layout";
import { Form, Formik } from "formik";
import { Container } from "../../components/Container";
import { InputField } from "../../components/InputField";
import { getErrorMap } from "../../utils/getErrorMap";
import { useRouter } from "next/router";

const CreateRoom = () => {
  const router = useRouter();

  return (
    <Container height="100vh">
      <Box m="auto">
        <Formik
          initialValues={{ usernameOrEmail: "", password: "" }}
          onSubmit={async (values, { setErrors }) => {
            console.log("create room with values:", values);
            router.push("/rooms");
          }}
        >
          <Form>
            <InputField name="title" placeholder="title" label="Title" />
            <Box mt={4}>
              <InputField
                inputType="number"
                name="maxUsers"
                placeholder="max users"
                label="Max users"
                defaultValue={1}
                min={1}
                max={32}
              />
            </Box>
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Optional password"
                type="password"
              />
            </Box>
            <Button mt={4} type="submit" colorScheme="teal">
              create room
            </Button>
          </Form>
        </Formik>
      </Box>
    </Container>
  );
};

export default CreateRoom;
