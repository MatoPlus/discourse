import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { enterRoom } from "../api/routes/rooms";
import { RoomProps } from "../pages/rooms";
import { getErrorMap } from "../utils/getErrorMap";
import { setErrorStatusToast } from "../utils/setErrorStatusToast";
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
        <AlertDialogHeader>{`Join "${room.name}"?`}</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>
          <Text>Description: </Text>
          <Text as="samp">{room.description}</Text>
        </AlertDialogBody>
        <AlertDialogFooter m="auto">
          <Formik
            initialValues={{ password: "" }}
            onSubmit={async (values, { setErrors, setSubmitting }) => {
              const response = await enterRoom(room._id, values).catch(
                (err) => {
                  setErrorStatusToast(err.response.data.errors, toast);
                  setErrors(getErrorMap(err.response.data.errors));
                }
              );
              if (response && response.data && !response.data.errors) {
                setSubmitting(true);
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
