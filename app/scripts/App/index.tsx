import { createTheme, ThemeProvider } from "@mui/material/styles";

import MainPage from "./mainPage";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    fontSize: 22,
  },
});

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <MainPage />
    </ThemeProvider>
  );
}

export default App;
