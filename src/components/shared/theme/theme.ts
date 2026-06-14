import {
  createTheme,
  type PaletteColor,
  type SimplePaletteColorOptions,
} from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    tertiary: PaletteColor;
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
    tertiary?: SimplePaletteColorOptions;
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
      main: "#0b5f61",
      dark: "#084a4d",
      light: "#2e8587",
      contrastText: "#f4fbfb",
    },
    secondary: {
      main: "#1f8f93",
      dark: "#166f73",
      light: "#5dbfc0",
      contrastText: "#072c2d",
    },
    tertiary: {
      main: "#9fd4d5",
      dark: "#7dbbbc",
      light: "#c5e8e8",
      contrastText: "#0c2f31",
    },
    background: {
      default: "#edf2f3",
      paper: "#ffffff",
      inverted: "#121212",
    },
    text: {
      primary: "#0f1d21",
      secondary: "#51636b",
    },
    miniMap: {
      node: "#0b5f61",
      stroke: "#333",
      mask: "rgba(0,0,0,0.1)",
    },
    textVariants: {
      text1: "#0f1d21",
      text2: "#33444c",
      text3: "#60727a",
      text4: "#90a0a7",
      inverted: "#ffffff", // for dark mode text on dark backgrounds
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#7fd7d6",
      dark: "#5db8b7",
      light: "#a8e7e7",
      contrastText: "#07292a",
    },
    secondary: {
      main: "#58b6b8",
      dark: "#46989a",
      light: "#88d2d2",
      contrastText: "#041b1d",
    },
    tertiary: {
      main: "#2e5558",
      dark: "#254548",
      light: "#467a7d",
      contrastText: "#ddf1f1",
    },
    background: {
      default: "#111516",
      paper: "#171d1f",
      inverted: "#fafafa",
    },
    text: {
      primary: "#f2f7f8",
      secondary: "#b9c7cb",
    },
    miniMap: {
      node: "#58b6b8",
      stroke: "#eeeeee",
      mask: "rgba(255,255,255,0.1)",
    },
    textVariants: {
      text1: "#f2f7f8",
      text2: "#d6e0e3",
      text3: "#b1c0c4",
      text4: "#85979d",
      inverted: "#000000", // for light mode text on light backgrounds
    },
  },
});
