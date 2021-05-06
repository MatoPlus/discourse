import React from "react";
import Link from "next/link";
import { Box, IconButton, Link as ChakraLink } from "@chakra-ui/react";
import { useQuery, useQueryClient } from "react-query";
import { fetchMe } from "../api/routes/users";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { useMutation } from "react-query";
import { deleteRoom } from "../api/routes/rooms";

interface EditDeleteRoomButtonsProps {
  id: string;
  creatorName: string;
}

export const EditDeleteRoomButtons: React.FC<EditDeleteRoomButtonsProps> = ({
  id,
  creatorName,
}) => {
  const queryClient = useQueryClient();
  const { data: meData, error } = useQuery("me", fetchMe, {
    retry: 2,
  });
  const deleteRoomMutation = useMutation(deleteRoom, {
    onSuccess: () => {
      queryClient.invalidateQueries("rooms");
      queryClient.invalidateQueries("room");
    },
  });

  if (meData?.data.username !== creatorName) {
    return null;
  }

  return (
    <Box>
      <Link href="/rooms/edit/[id]" as={`/rooms/edit/${id}`}>
        <IconButton
          as={ChakraLink}
          mr={2}
          icon={<EditIcon />}
          aria-label="Edit room"
          size="sm"
        />
      </Link>
      <IconButton
        size="sm"
        icon={<DeleteIcon />}
        aria-label="Delete room"
        onClick={() => {
          deleteRoomMutation.mutate(id);
        }}
      />
    </Box>
  );
};
