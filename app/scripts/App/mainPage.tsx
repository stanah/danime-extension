// material-uiのテーブルを使って、データを表示するReactコンポーネントを作成する
// useEffectで、画面読み込み時にgetAnimeData()を使って、データを取得する

import React, { useEffect, useState } from "react";
import { getAnimeData, Episode, Anime } from "./danimeClient";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Collapse, Box, Button, Container } from "@mui/material";

import { tableCellClasses } from "@mui/material/TableCell";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import { styled } from "@mui/material/styles";
const BASE_URL = "https://animestore.docomo.ne.jp/animestore/ci_pc?workId=";

//Reactコンポーネントの型定義
export interface AnimeTableProps {
  items: Anime[];
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

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
      <StyledTableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <StyledTableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
          </IconButton>
        </StyledTableCell>
        <StyledTableCell component="th" scope="row">
          {row.title}
        </StyledTableCell>
        <StyledTableCell>{row.allWatched ? "すべて視聴済み" : `未視聴あり (${row.unWatchedCount}本)`}</StyledTableCell>
        <StyledTableCell>{calcDays(row.updated_at)}</StyledTableCell>
        <StyledTableCell>{row.seasonTag}</StyledTableCell>
        <StyledTableCell>
          <Button variant="contained" href={`${BASE_URL}${row.id}`} target="_blank">
            視聴
          </Button>
        </StyledTableCell>
      </StyledTableRow>
      <StyledTableRow>
        <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small" aria-label="episodes">
                <TableHead>
                  <TableRow>
                    <StyledTableCell width={40}>話数</StyledTableCell>
                    <StyledTableCell>タイトル</StyledTableCell>
                    <StyledTableCell>視聴ステータス</StyledTableCell>
                    <StyledTableCell>最終更新</StyledTableCell>
                    <StyledTableCell width={60}>リンク</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.episodes.map((episode) => (
                    <TableRow key={episode.id}>
                      <StyledTableCell>{episode.episodeNumber}</StyledTableCell>
                      <StyledTableCell>{episode.title}</StyledTableCell>
                      <StyledTableCell>{episode.watched ? "視聴済み" : "未視聴"}</StyledTableCell>
                      <StyledTableCell>{calcDays(episode.created_at)}</StyledTableCell>
                      <StyledTableCell component="th" scope="row">
                        <Button variant="contained" href={episode.url} target="_blank">
                          視聴
                        </Button>
                      </StyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </StyledTableCell>
      </StyledTableRow>
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
          <StyledTableRow>
            <StyledTableCell width={30} />
            <StyledTableCell>作品名</StyledTableCell>
            <StyledTableCell>視聴ステータス</StyledTableCell>
            <StyledTableCell>最終更新</StyledTableCell>
            <StyledTableCell>放送時期</StyledTableCell>
            <StyledTableCell>リンク</StyledTableCell>
          </StyledTableRow>
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

  const animeIdList = ["26609", "26467", "26440"];

  useEffect(() => {
    const promises = animeIdList.map((id) => getAnimeData(id));
    Promise.all(promises).then(setAnimeList);
  }, []);
  return (
    <Container>
      <AnimeTable items={animeList} />
    </Container>
  );
};

export default MainPage;
