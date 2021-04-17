import "codemirror/lib/codemirror.css";
import "codemirror/theme/solarized.css";
import { Box, Heading } from "@chakra-ui/layout";
import { Container } from "../../components/Container";
import React, { useState } from "react";
import { RoomProps } from ".";
import { fetchRoom } from "../../api/routes/rooms";
import { Controlled as CodeMirror } from "react-codemirror2";
import { useColorMode } from "@chakra-ui/color-mode";
import { Select } from "@chakra-ui/select";

// A workaround for SSR
if (typeof window !== "undefined" && typeof window.navigator !== "undefined") {
  require("codemirror/mode/javascript/javascript");
  require("codemirror/mode/xml/xml");
  require("codemirror/mode/css/css");
  require("codemirror/keymap/vim");
  require("codemirror/keymap/emacs");
}

export async function getServerSideProps(context: any) {
  const { id } = context.query;
  const { data } = await fetchRoom(id as string);
  return {
    props: {
      room: data,
    },
  };
}

// TODO: We want an is auth method of some sort
const Room = ({ room }: { room: RoomProps }) => {
  if (!room) {
    return (
      <Container height="100vh">
        <Box>could not find post</Box>
      </Container>
    );
  }

  const { colorMode } = useColorMode();
  const [code, setCode] = useState({ value: "" });
  const [indent, setIndent] = useState(4);
  const [language, setLanguage] = useState("javascript");
  const [keybinding, setKeybinding] = useState("default");

  return (
    <Container height="100%" disableStickyNav>
      <Box width="100%" padding={5}>
        <CodeMirror
          onBeforeChange={(editor, data, value) => {
            setCode({ value });
          }}
          value={code.value}
          options={{
            lineNumbers: true,
            lineWrapping: true,
            lint: true,
            indentUnit: indent,
            mode: language,
            theme: `solarized ${colorMode}`,
            keyMap: keybinding,
          }}
        />
      </Box>
      <Heading pl={5} mr="auto" size="lg">
        {room.name}
      </Heading>
      <Select
        size="sm"
        width={150}
        name="language"
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
      >
        <option value="javascript">javascript</option>
        <option value="xml">xml</option>
        <option value="css">css</option>
      </Select>
      <Select
        size="sm"
        width={150}
        name="keybinding"
        value={keybinding}
        onChange={(event) => setKeybinding(event.target.value)}
      >
        <option value="default">default</option>
        <option value="vim">vim</option>
        <option value="emacs">emacs</option>
      </Select>
    </Container>
  );
};

export default Room;
