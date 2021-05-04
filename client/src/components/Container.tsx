import { Flex, useColorMode, FlexProps, Box } from "@chakra-ui/react";
import { Navigation } from "./Navigation";

type ContainerProps = {
  disableStickyNav?: boolean;
} & FlexProps;

export const Container: React.FC<ContainerProps> = ({
  disableStickyNav,
  ...props
}) => {
  const { colorMode } = useColorMode();

  const bgColor = { light: "gray.50", dark: "gray.900" };
  const color = { light: "black", dark: "white" };
  return (
    <Box>
      <Navigation disableSticky={!!disableStickyNav} />
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
