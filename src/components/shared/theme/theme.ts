import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    miniMap: {
      node: string;
      stroke: string;
      mask: string;
    };
  }
  interface PaletteOptions {
    miniMap?: {
      node?: string;
      stroke?: string;
      mask?: string;
    };
  }
}

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    background: {
      default: "#fafafa",
      paper: "#fff",
    },
    miniMap: {
      node: "#1976d2",
      stroke: "#333",
      mask: "rgba(0,0,0,0.1)",
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    miniMap: {
      node: "#90caf9",
      stroke: "#eeeeee",
      mask: "rgba(255,255,255,0.1)",
    },
  },
});
