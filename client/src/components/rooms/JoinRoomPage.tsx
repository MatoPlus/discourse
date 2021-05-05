import { Box, Button, Heading, Text, useToast } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { useQueryClient } from "react-query";
import { enterRoom } from "../../api/routes/rooms";
import { RoomProps } from "../../pages/rooms";
import { getErrorMap } from "../../utils/getErrorMap";
import { setErrorStatusToast } from "../../utils/setErrorStatusToast";
import { InputField } from "../InputField";

type JoinRoomPageProps = {
  roomId: string;
  room: RoomProps;
};

export const JoinRoomPage: React.FC<JoinRoomPageProps> = ({ roomId, room }) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const router = useRouter();

  return (
    <Box m="auto">
      <Heading mb={4} size="lg">
        {room.name}
      </Heading>
      <Text>{`Users: ${room.currentUsers.length}/${room.maxUsers}`}</Text>
      <Formik
        initialValues={{ password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await enterRoom(roomId, values).catch((err) => {
            setErrorStatusToast(err.response.data.errors, toast);
            setErrors(getErrorMap(err.response.data.errors));
          });
          if (response && response.data.errors) {
            router.push("/rooms/");
          } else if (response && response.data) {
            queryClient.invalidateQueries("verified");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            {room.hasPassword ? (
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            ) : null}
            <Button mt={4} onClick={() => router.push("/rooms/")}>
              cancel
            </Button>
            <Button
              mt={4}
              ml={4}
              type="submit"
              colorScheme="teal"
              isLoading={isSubmitting}
            >
              join
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
};
