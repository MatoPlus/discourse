import { Box } from "@chakra-ui/layout";
import React from "react";

export type WrapperVariant = "regular" | "large";

interface WrapperProps {
  variant?: WrapperVariant;
}

export const Wrapper: React.FC<WrapperProps> = ({
  children,
  variant = "regular",
}) => {
  return (
    <Box
      mt={4}
      mx="auto"
      w="100%"
      maxW={variant === "regular" ? "60vw" : "90vw"}
    >
      {children}
    </Box>
  );
};
