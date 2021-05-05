import { Flex } from "@chakra-ui/layout";
import React from "react";

export const CenterWrapper: React.FC = ({ children }) => {
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="flex-start"
      height="80vh"
    >
      {children}
    </Flex>
  );
};
