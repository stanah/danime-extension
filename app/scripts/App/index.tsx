import { EventEmitter } from "events";
import React, { useEffect, useState } from "react";
import {
  Button,
  IconButton,
  Typography,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  Modal,
  Box,
  Backdrop,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";

import { AnimeWithRate, getWatchListFromStorage, forceUpdateWatchList, updateRate, removeFromWatchList } from "./storageClient";
import { AnimeTable } from "./animeTable";
import { Menu, Watch } from "@mui/icons-material";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    fontSize: 22,
  },
});

export interface AppProps {
  eventEmitter: EventEmitter;
}

export type WatchListAddEvent = {
  error: boolean;
  message: string;
  notify: boolean;
};

export const App = ({ eventEmitter }: AppProps) => {
  const [items, setItems] = useState<AnimeWithRate[]>([]);
  const [visible, setVisible] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"success" | "error">("success");

  const [height, setHeight] = useState<number>(window.innerHeight);

  const forceUpdateAnimeData = async () => {
    const newWatchList = await forceUpdateWatchList();
    setItems(newWatchList);
  };

  useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight);
      console.log(window.innerHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleWatchListUpdated = async (d: WatchListAddEvent) => {
    const list = await getWatchListFromStorage();
    setItems(list);
    if (d.notify) {
      setMessage(d.message);
      setSeverity(d.error ? "error" : "success");
      setOpen(true);
    }
  };

  useEffect(() => {
    const init = async () => {
      const list = await getWatchListFromStorage();
      setItems(list);
    };
    init();
    eventEmitter.on("watchListUpdated", handleWatchListUpdated);
    return () => {
      eventEmitter.off("watchListUpdated", handleWatchListUpdated);
    };
  }, []);

  return (
    <div>
      <ThemeProvider theme={theme}>
        <IconButton
          style={{ margin: "15px" }}
          onClick={() => {
            setVisible(!visible);
          }}
        >
          <Menu />
        </IconButton>
        <Modal open={visible} onClose={() => setVisible(false)} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ invisible: true }}>
          <Box sx={{ top: "50%", left: "50%" }}>
            <Grid
              container
              direction="row"
              justifyContent="flex-start"
              alignItems="center"
              style={{ backgroundColor: "#eb5528", opacity: "95%", zIndex: 0 }}
            >
              <IconButton style={{ margin: "15px" }} onClick={() => setVisible(!visible)}>
                <Menu />
              </IconButton>
              <IconButton style={{ margin: "15px" }} onClick={forceUpdateAnimeData}>
                <RefreshIcon />
              </IconButton>
              <IconButton style={{ margin: "15px" }} onClick={() => setEditMode(!editMode)}>
                <EditIcon />
              </IconButton>
              {editMode ? (
                <Typography color={"white"} variant="h6">
                  編集中
                </Typography>
              ) : null}
            </Grid>
            <AnimeTable
              tableHeight={height - 200}
              items={items}
              editMode={editMode}
              onRemove={async (d) => {
                await removeFromWatchList(d);
                const list = await getWatchListFromStorage();
                setItems(list);
              }}
              onRateChange={async (id: number, rate: number | null) => {
                console.log("onRateChange");
                if (rate == null) updateRate(id, 0);
                else updateRate(id, rate);
                const list = await getWatchListFromStorage();
                setItems(list);
              }}
            />
          </Box>
        </Modal>
        <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)}>
          <Alert severity={severity} sx={{ width: "100%" }}>
            {message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </div>
  );
};

export default App;
