import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Link as ChakraLink,
} from "@chakra-ui/react";
import Link from "next/link";
import React from "react";

type JoinRoomDialogProps = {
  onClose: () => void;
  isOpen: boolean;
  roomId: string;
  cancelRef: React.MutableRefObject<null>;
};

export const JoinRoomDialog: React.FC<JoinRoomDialogProps> = ({
  roomId,
  isOpen,
  onClose,
  cancelRef,
}) => {
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
        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose}>
            Cancel
          </Button>
          <Link href={`/rooms/${roomId}`}>
            <Button colorScheme="teal" ml={3} as={ChakraLink}>
              Join
            </Button>
          </Link>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
