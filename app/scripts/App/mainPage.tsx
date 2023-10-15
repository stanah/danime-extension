// material-uiのテーブルを使って、データを表示するReactコンポーネントを作成する
// useEffectで、画面読み込み時にgetAnimeData()を使って、データを取得する

import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { getAnimeData, Episode, Anime } from "./danimeClient";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Collapse, Box, Button, Container } from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

const StyledApp = styled.div`
  // Your style here
`;
const BASE_URL = "https://animestore.docomo.ne.jp/animestore/ci_pc?workId=";

//Reactコンポーネントの型定義
export interface AnimeTableProps {
  items: Anime[];
}

// 指定したDate型から現在までの日数を計算する。ただし、１日未満の場合は時間を返す
const calcDays = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}時間前`;
  }
  return `${days}日前`;
};

function Row(props: { row: Anime }) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.title}
        </TableCell>
        <TableCell>{row.allWatched ? "すべて視聴済み" : "未視聴あり"}</TableCell>
        <TableCell>{calcDays(row.updated_at)}</TableCell>
        <TableCell>{row.seasonTag}</TableCell>
        <TableCell>
          {" "}
          <Button variant="outlined" href={`${BASE_URL}${row.id}`} target="_blank">
            視聴
          </Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small" aria-label="episodes">
                <TableHead>
                  <TableRow>
                    <TableCell>話数</TableCell>
                    <TableCell>タイトル</TableCell>
                    <TableCell>リンク</TableCell>
                    <TableCell>視聴ステータス</TableCell>
                    <TableCell>最終更新</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.episodes.map((episode) => (
                    <TableRow key={episode.id}>
                      <TableCell>{episode.episodeNumber}</TableCell>
                      <TableCell>{episode.title}</TableCell>
                      <TableCell component="th" scope="row">
                        <Button variant="outlined" href={episode.url} target="_blank">
                          視聴
                        </Button>
                      </TableCell>
                      <TableCell>{episode.watched ? "視聴済み" : "未視聴"}</TableCell>
                      <TableCell>{calcDays(episode.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export const AnimeTable = (props: AnimeTableProps) => {
  const { items } = props;
  //
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table" size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>作品名</TableCell>
            <TableCell>視聴ステータス</TableCell>
            <TableCell>最終更新</TableCell>
            <TableCell>放送時期</TableCell>
            <TableCell>リンク</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((row) => (
            <Row key={row.id} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Reactコンポーネント
export const MainPage = () => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  console.log(animeList);

  const animeIdList = ["26609", "26467", "26440"];

  useEffect(() => {
    const promises = animeIdList.map((id) => getAnimeData(id));
    Promise.all(promises).then(setAnimeList);
  }, []);
  return (
    <StyledApp>
      <Container maxWidth="lg">
        <AnimeTable items={animeList} />
      </Container>
    </StyledApp>
  );
};

export default MainPage;
