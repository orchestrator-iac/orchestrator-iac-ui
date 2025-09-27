import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    miniMap: {
      node: string;
      stroke: string;
      mask: string;
    };
    textVariants: {
      text1: string;
      text2: string;
      text3: string;
      text4: string;
      inverted: string;
    };
  }

  interface TypeBackground {
    inverted: string;
  }

  interface PaletteOptions {
    miniMap?: {
      node?: string;
      stroke?: string;
      mask?: string;
    };
    textVariants?: {
      text1?: string;
      text2?: string;
      text3?: string;
      text4?: string;
      inverted?: string;
    };
  }
}


export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#057474",
    },
    secondary: {
      main: "#4bb3b3",
    },
    background: {
      default: "#fafafa",
      paper: "#fff",
      inverted: "#121212",
    },
    miniMap: {
      node: "#057474",
      stroke: "#333",
      mask: "rgba(0,0,0,0.1)",
    },
    textVariants: {
      text1: "#000000", // darkest
      text2: "#333333",
      text3: "#666666",
      text4: "#999999", // lightest
      inverted: "#ffffff", // for dark mode text on dark backgrounds
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#8ecacc",
    },
    secondary: {
      main: "#b6e2e2",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
      inverted: "#fafafa",
    },
    miniMap: {
      node: "#4bb3b3",
      stroke: "#eeeeee",
      mask: "rgba(255,255,255,0.1)",
    },
    textVariants: {
      text1: "#ffffff", // brightest
      text2: "#dddddd",
      text3: "#bbbbbb",
      text4: "#999999", // darkest text
      inverted: "#000000", // for light mode text on light backgrounds
    },
  },
});
