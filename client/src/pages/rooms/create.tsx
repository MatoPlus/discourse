import { Button } from "@chakra-ui/button";
import { Box } from "@chakra-ui/layout";
import { Form, Formik } from "formik";
import { Container } from "../../components/Container";
import { InputField } from "../../components/InputField";
import { getErrorMap } from "../../utils/getErrorMap";
import { useRouter } from "next/router";
import { createRoom } from "../../api/routes/rooms";
import { useIsAuth } from "../../utils/useIsAuth";

const CreateRoom = () => {
  useIsAuth();
  const router = useRouter();
  return (
    <Container height="100vh">
      <Box m="auto">
        <Formik
          initialValues={{ name: "", maxUsers: 1, password: "" }}
          onSubmit={async (values, { setErrors }) => {
            const { password, ...restValues } = values;
            const response = await createRoom({
              password: password.length > 0 ? password : undefined,
              ...restValues,
            }).catch((err) => {
              setErrors(getErrorMap(err.response.data.errors));
            });
            if (response && response.data) {
              router.push("/rooms");
            }
          }}
        >
          <Form>
            <InputField name="name" placeholder="name" label="Room name" />
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
