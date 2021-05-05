import { Button } from "@chakra-ui/button";
import { Box } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { editRoom, fetchRoom } from "../../../api/routes/rooms";
import { Container } from "../../../components/Container";
import { InputField } from "../../../components/InputField";
import { getErrorMap } from "../../../utils/getErrorMap";
import { setErrorStatusToast } from "../../../utils/setErrorStatusToast";
import { useGetId } from "../../../utils/useGetId";
import { useIsAuth } from "../../../utils/useIsAuth";

const EditRoom = () => {
  useIsAuth();
  const id = useGetId();
  const toast = useToast();
  const { data: roomData, isLoading, isError } = useQuery(
    "room",
    () => fetchRoom(id as string),
    {
      enabled: id !== "-1",
    }
  );

  if (isLoading) {
    return <Container isLoading></Container>;
  }

  if (isError) {
    return <Container>Something went wrong...</Container>;
  }

  const router = useRouter();
  return (
    <Container>
      <Box m="auto">
        <Formik
          initialValues={{
            name: roomData?.data.name,
            maxUsers: roomData?.data.maxUsers,
            password: "",
          }}
          onSubmit={async (values, { setErrors }) => {
            const { password, ...restValues } = values;
            const response = await editRoom(id, {
              password: password.length > 0 ? password : undefined,
              ...restValues,
            }).catch((err) => {
              setErrorStatusToast(err.response.data.errors, toast);
              setErrors(getErrorMap(err.response.data.errors));
            });
            if (response && response.data) {
              router.push("/rooms");
            }
          }}
        >
          {({ isSubmitting }) => (
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
              <Button
                mt={4}
                type="submit"
                colorScheme="teal"
                isLoading={isSubmitting}
              >
                update room
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default EditRoom;
