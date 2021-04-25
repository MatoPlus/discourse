import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { enterRoom } from "../api/routes/rooms";
import { getErrorMap } from "../utils/getErrorMap";
import { InputField } from "./InputField";

type JoinRoomDialogProps = {
  onClose: () => void;
  isOpen: boolean;
  roomId: string;
  cancelRef: React.MutableRefObject<null>;
  hasPassword: boolean;
};

export const JoinRoomDialog: React.FC<JoinRoomDialogProps> = ({
  roomId,
  isOpen,
  onClose,
  cancelRef,
  hasPassword,
}) => {
  // I think we can have the button call the enter room endpoint with a password field
  // On success, we push to the room id and let the room logic handle redirection...
  const router = useRouter();

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
        <AlertDialogHeader>Join room?</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>
          Here is a desc of the room, enter the password...
        </AlertDialogBody>
        <AlertDialogFooter m="auto">
          {hasPassword ? (
            <Formik
              initialValues={{ password: "" }}
              onSubmit={async (values, { setErrors }) => {
                const response = await enterRoom(roomId, values).catch(
                  (err) => {
                    setErrors(getErrorMap(err.response.data.errors));
                  }
                );
                if (response && response.data && !response.data.errors) {
                  router.push(`/rooms/${roomId}`);
                }
              }}
            >
              <Form>
                <InputField
                  name="password"
                  placeholder="password"
                  label="Password"
                  type="password"
                />
                <Button mt={4} ref={cancelRef} onClick={onClose}>
                  cancel
                </Button>
                <Button mt={4} ml={4} type="submit" colorScheme="teal">
                  join
                </Button>
              </Form>
            </Formik>
          ) : (
            <>
              <Button ref={cancelRef} onClick={onClose}>
                cancel
              </Button>
              <Button
                colorScheme="teal"
                ml={3}
                onClick={async () => {
                  const response = await enterRoom(roomId, {}).catch((err) => {
                    console.log("can't enter room:", err);
                  });
                  console.log(response);
                  if (response && response.data && !response.data.errors) {
                    router.push(`/rooms/${roomId}`);
                  }
                }}
              >
                join
              </Button>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
