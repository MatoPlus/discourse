import { Flex, useColorMode, FlexProps, Box } from "@chakra-ui/react";
import { Navigation } from "./Navigation";

export const Container = ({
  disableStickyNav,
  ...props
}: FlexProps & { disableStickyNav?: boolean }) => {
  const { colorMode } = useColorMode();

  const bgColor = { light: "gray.50", dark: "gray.900" };
  const navBgColor = { light: "gray.100", dark: "gray.800" };
  const color = { light: "black", dark: "white" };
  return (
    <Box>
      <Navigation
        bg={navBgColor[colorMode]}
        disableSticky={!!disableStickyNav}
      />
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="flex-start"
        bg={bgColor[colorMode]}
        color={color[colorMode]}
        {...props}
      />
    </Box>
  );
};
