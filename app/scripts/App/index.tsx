import { EventEmitter } from "events";
import { useEffect, useState } from "react";
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

import {
  getWatchList,
  AnimeWithRate,
  getWatchLists,
  removeWatchList,
  WatchList,
  saveWatchList,
  setSelectedWatchListName,
  getSelectedWatchListName,
} from "./storageClient";
import { AnimeTable } from "./animeTable";
import { Menu } from "@mui/icons-material";

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
  const [watchList, setWatchList] = useState<WatchList | null>(null);
  const [watchLists, setWatchLists] = useState<string[]>([]);
  const [visible, setVisible] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedWatchList, setSelectedWatchList] = useState<string>("default");

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"success" | "error">("success");

  const [height, setHeight] = useState<number>(window.innerHeight);

  const updateAnimeData = async () => {
    if (!watchList) return;
    const newWatchList = await watchList.updateAll();
    setWatchList(newWatchList);
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

  // 選択されているwaTchListを削除する
  const removeSelectedWatchList = async () => {
    try {
      await removeWatchList(selectedWatchList);
    } catch (e) {
      alert("削除に失敗しました");
    }
    const list = await getWatchLists();
    setWatchLists(list);
    setSelectedWatchList("default");
  };

  const onClickAddWatchList = async () => {
    const name = prompt("ウォッチリストの名前を入力してください");
    if (name) {
      await saveWatchList(new WatchList(name, []));
      const list = await getWatchLists();
      setWatchLists(list);
      setSelectedWatchList(name);
    }
  };

  const handleWatchListUpdated = async (d: WatchListAddEvent) => {
    const current = await getSelectedWatchListName();
    const newWatchList = await getWatchList(current);
    setWatchList(newWatchList);
    if (d.notify) {
      setMessage(d.message);
      setSeverity(d.error ? "error" : "success");
      setOpen(true);
    }
  };

  useEffect(() => {
    (async () => {
      const newWatchList = await getWatchList(selectedWatchList);
      setWatchList(newWatchList);
      await setSelectedWatchListName(selectedWatchList);
    })();
  }, [selectedWatchList]);

  useEffect(() => {
    if (!watchList) return;
    setItems(watchList.getList());
  }, [watchList]);

  useEffect(() => {
    (async () => {
      const list = await getWatchLists();
      setWatchLists(list);
    })();
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
              <IconButton style={{ margin: "15px" }} onClick={updateAnimeData}>
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
              <FormControl style={{ marginLeft: "20px", marginRight: "20px", width: "200px" }}>
                <InputLabel>ウォッチリスト</InputLabel>
                <Select
                  value={selectedWatchList}
                  label="ウォッチリスト"
                  onChange={async (e) => {
                    setSelectedWatchList(e.target.value as string);
                  }}
                >
                  {watchLists.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {editMode ? (
                <Button color="secondary" onClick={() => removeSelectedWatchList()}>
                  ウォッチリストを削除
                </Button>
              ) : (
                <Button onClick={() => onClickAddWatchList()}>追加</Button>
              )}
            </Grid>
            <AnimeTable
              tableHeight={height - 200}
              items={items}
              editMode={editMode}
              onRemove={async (d) => {
                if (!watchList) return;
                await watchList.remove(d);
                setItems(watchList.getList());
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
