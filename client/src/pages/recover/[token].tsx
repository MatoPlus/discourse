import { Button } from "@chakra-ui/button";
import { Box, Link as ChakraLink, Text } from "@chakra-ui/layout";
import { Form, Formik } from "formik";
import { Container } from "../../components/Container";
import { InputField } from "../../components/InputField";
import { changePassword } from "../../api/routes/users";
import { getErrorMap } from "../../utils/getErrorMap";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Link from "next/link";
import { Flex } from "@chakra-ui/react";

const ChangePassword = () => {
  const router = useRouter();
  const [tokenError, setTokenError] = useState("");

  return (
    <Container>
      <Box m="auto">
        <Formik
          initialValues={{ password: "", confirm: "" }}
          onSubmit={async (values, { setErrors }) => {
            const token =
              typeof router.query.token === "string" ? router.query.token : "";
            const response = await changePassword(token, values).catch(
              (err) => {
                const errorMap = getErrorMap(err.response.data.errors);
                console.log(errorMap);
                if ("token" in errorMap) {
                  setTokenError(errorMap.token);
                }
                setErrors(errorMap);
              }
            );
            if (response && response.data) {
              router.push("/login");
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
              <Box mt={4}>
                <InputField
                  name="confirm"
                  placeholder="confirm"
                  label="Confirm"
                  type="password"
                />
              </Box>
              {tokenError ? (
                <Flex>
                  <Box mr={2}>
                    <Text color="red.400">{tokenError}</Text>
                  </Box>
                  <Link href="/recover">
                    <ChakraLink>- get a new token</ChakraLink>
                  </Link>
                </Flex>
              ) : null}
              <Button
                mt={4}
                type="submit"
                colorScheme="teal"
                isLoading={isSubmitting}
              >
                change password
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default ChangePassword;
