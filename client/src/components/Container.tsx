import { Box, Flex, Spinner } from "@chakra-ui/react";
import React from "react";
import { Navigation } from "./Navigation";
import { Wrapper, WrapperVariant } from "./Wrapper";

type ContainerProps = {
  disableStickyNav?: boolean;
  variant?: WrapperVariant;
  isSingleView?: boolean;
  isLoading?: boolean;
};

export const Container: React.FC<ContainerProps> = ({
  children,
  disableStickyNav = false,
  variant = "regular",
  isSingleView = false,
  isLoading = false,
}) => {
  return (
    <Box height={isSingleView ? "100vh" : undefined}>
      <Navigation disableSticky={disableStickyNav} />
      {isLoading ? (
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="flex-start"
          height="80vh"
        >
          <Spinner size="xl" m="auto" />
        </Flex>
      ) : (
        <Wrapper variant={variant}>{children}</Wrapper>
      )}
    </Box>
  );
};
