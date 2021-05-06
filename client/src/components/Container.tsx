import { Box, Spinner } from "@chakra-ui/react";
import React from "react";
import { CenterWrapper } from "./CenterWrapper";
import { Navigation } from "./Navigation";
import { Wrapper, WrapperVariant } from "./Wrapper";

type ContainerProps = {
  disableStickyNav?: boolean;
  variant?: WrapperVariant;
  isSingleView?: boolean;
  isCenter?: boolean;
};

export const Container: React.FC<ContainerProps> = ({
  children,
  disableStickyNav = false,
  variant = "regular",
  isSingleView = false,
  isCenter = false,
}) => {
  return (
    <Box height={isSingleView ? "100vh" : undefined}>
      <Navigation disableSticky={disableStickyNav} />
      {isCenter ? (
        <CenterWrapper>{children}</CenterWrapper>
      ) : (
        <Wrapper variant={variant}>{children}</Wrapper>
      )}
    </Box>
  );
};
