import { ChakraProvider } from "@chakra-ui/react";

import theme from "../theme";
import { AppProps } from "next/app";
import { refreshAccessToken } from "../api/routes/auth";
import { useEffect } from "react";
import { setAccessToken } from "../accessToken";
import { QueryClient, QueryClientProvider } from "react-query";
import "../styles/codemirror.css";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    refreshAccessToken().then(async (response) => {
      const { accessToken } = await response.data;
      if (accessToken) {
        setAccessToken(accessToken);
      }
    });
  }, []);

  return (
    <ChakraProvider resetCSS theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default MyApp;
