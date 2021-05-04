import { Box } from "@chakra-ui/react";
import React from "react";
import { Navigation } from "./Navigation";
import { Wrapper, WrapperVariant } from "./Wrapper";

type ContainerProps = {
  disableStickyNav?: boolean;
  variant?: WrapperVariant;
  isSingleView?: boolean;
};

export const Container: React.FC<ContainerProps> = ({
  children,
  disableStickyNav = false,
  variant = "regular",
  isSingleView = false,
}) => {
  return (
    <Box height={isSingleView ? "100vh" : undefined}>
      <Navigation disableSticky={disableStickyNav} />
      <Wrapper variant={variant}>{children}</Wrapper>
    </Box>
  );
};
