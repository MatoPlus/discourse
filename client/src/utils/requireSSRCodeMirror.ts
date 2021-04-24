import { codeMirrorModes } from "../constants";

// A workaround for SSR
export const requireSSRCodeMirror = () => {
  if (
    typeof window !== "undefined" &&
    typeof window.navigator !== "undefined"
  ) {
    codeMirrorModes.forEach((mode) => {
      // require all modes except "null" mode
      if (mode !== "null") {
        require(`codemirror/mode/${mode}/${mode}.js`);
      }
    });

    // keymaps
    require("codemirror/keymap/vim");
    require("codemirror/keymap/emacs");
  }
};
