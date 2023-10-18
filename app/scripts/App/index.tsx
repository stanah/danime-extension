import { useEffect, useState } from "react";
import { Container, Button, IconButton, Typography, Grid } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";

import { saveWatchList, getWatchList, removeWatchList, WatchList, AnimeStorageClient, AnimeWithRate, getWatchLists } from "./storageClient";
import { AnimeTable } from "./animeTable";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    fontSize: 22,
  },
});

export interface AppProps {}

const animeStorageClient = new AnimeStorageClient();

export const App = (props: AppProps) => {
  const [watchList, setWatchList] = useState<AnimeWithRate[]>([]);
  const [watchLists, setWatchLists] = useState<string[]>([]);
  const [visible, setVisible] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);

  const updateAnimeData = async () => {
    const promises = watchList.map((d) => animeStorageClient.updateAnimeInfo(d.id));
    await Promise.all(promises);

    const ret = await getWatchList("test");
    const newAnimeList: AnimeWithRate[] = [];
    for (let i = 0; i < ret.list.length; i++) {
      const animeInfo = await animeStorageClient.getAnimeInfo(ret.list[i]);
      newAnimeList.push(animeInfo);
    }
    console.log(newAnimeList);
    setWatchList(newAnimeList);
  };

  const loadWatchList = async (name: string) => {
    const ret = await getWatchList(name);
    const newAnimeList: AnimeWithRate[] = [];
    for (let i = 0; i < ret.list.length; i++) {
      const animeInfo = await animeStorageClient.getAnimeInfo(ret.list[i]);
      newAnimeList.push(animeInfo);
    }
    setWatchList(newAnimeList);
  };

  const execute = async () => {
    const list = await getWatchLists();
    setWatchLists(list);
  };

  useEffect(() => {
    execute().then(() => console.log("done"));
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Button
        style={{ margin: "15px" }}
        variant="contained"
        onClick={() => {
          setVisible(!visible);
        }}
      >
        Watch List
      </Button>

      {visible ? (
        <Container maxWidth={false} style={{ backgroundColor: "#eb5528", opacity: "95%" }}>
          <Grid container direction="row" justifyContent="flex-start" alignItems="center">
            <IconButton style={{ margin: "15px" }} onClick={updateAnimeData}>
              <RefreshIcon />
            </IconButton>
            <IconButton style={{ margin: "15px" }} onClick={() => setEditMode(!editMode)}>
              <EditIcon />
            </IconButton>
            {editMode ? (
              <Typography color={"white"} variant="h5">
                編集中
              </Typography>
            ) : null}
          </Grid>
          <AnimeTable
            items={watchList}
            editMode={editMode}
            onRemove={(d) => {
              alert(`delete!! id: ${d}`);
            }}
          />
        </Container>
      ) : null}
    </ThemeProvider>
  );
};

export default App;
