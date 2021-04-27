import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useToast,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { enterRoom } from "../api/routes/rooms";
import { RoomProps } from "../pages/rooms";
import { getErrorMap } from "../utils/getErrorMap";
import { InputField } from "./InputField";

type JoinRoomDialogProps = {
  onClose: () => void;
  isOpen: boolean;
  room: RoomProps;
  cancelRef: React.MutableRefObject<null>;
};

export const JoinRoomDialog: React.FC<JoinRoomDialogProps> = ({
  room,
  isOpen,
  onClose,
  cancelRef,
}) => {
  // I think we can have the button call the enter room endpoint with a password field
  // On success, we push to the room id and let the room logic handle redirection...
  const router = useRouter();
  const toast = useToast();

  return (
    <AlertDialog
      motionPreset="slideInBottom"
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isOpen={isOpen as boolean}
      isCentered
    >
      <AlertDialogOverlay />

      <AlertDialogContent>
        <AlertDialogHeader>{`Join room - "${room.name}"?`}</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>
          {`Users: ${room.currentUsers.length}/${room.maxUsers}`}
        </AlertDialogBody>
        <AlertDialogFooter m="auto">
          <Formik
            initialValues={{ password: "" }}
            onSubmit={async (values, { setErrors }) => {
              const response = await enterRoom(room._id, values).catch(
                (err) => {
                  (err.response.data.errors as string[]).forEach((error) => {
                    if ((error as any).status) {
                      toast({
                        title: (error as any).status,
                        status: "error",
                        duration: 2000,
                        isClosable: true,
                      });
                    }
                  });
                  setErrors(getErrorMap(err.response.data.errors));
                }
              );
              if (response && response.data && !response.data.errors) {
                router.push(`/rooms/${room._id}`);
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
                <Button mt={4} ref={cancelRef} onClick={onClose}>
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
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
