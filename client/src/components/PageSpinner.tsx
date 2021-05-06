import { Spinner } from "@chakra-ui/spinner";
import React from "react";
import { CenterWrapper } from "./CenterWrapper";

export const PageSpinner = () => {
  return (
    <CenterWrapper>
      <Spinner size="xl" m="auto" />
    </CenterWrapper>
  );
};
