// material-uiのテーブルを使って、データを表示するReactコンポーネントを作成する
// useEffectで、画面読み込み時にgetAnimeData()を使って、データを取得する
import React from "react";
import { Anime } from "./danimeClient";
import { Box, Button, Rating } from "@mui/material";

import { DataGrid, GridToolbar, GridColDef, GridValueGetterParams, GridCellParams, GridRenderCellParams } from "@mui/x-data-grid";

import { styled } from "@mui/material/styles";

//Reactコンポーネントの型定義
export interface AnimeTableProps {
  items: Anime[];
  editMode: boolean;
  onRemove: (id: number) => void;
  onRateChange: (id: number, rate: number | null) => void;
  tableHeight: number;
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

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  "& .MuiDataGrid-toolbarContainer": {
    backgroundColor: theme.palette.background.paper,
  },
  ".MuiDataGrid-columnHeaderTitle": {
    color: theme.palette.text.secondary,
  },
  "& .MuiDataGrid-main": {
    backgroundColor: theme.palette.background.paper,
  },
  "& .MuiDataGrid-footerContainer": {
    backgroundColor: theme.palette.background.paper,
  },
  "& .MuiDataGrid-row:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const AnimeTable = (props: AnimeTableProps) => {
  const { items, onRemove, onRateChange, editMode, tableHeight } = props;

  const cellClickHandler = (event: GridCellParams) => {
    console.log(event);
  };

  const columns: GridColDef[] = [
    { field: "title", headerName: "作品名", width: 400 },
    {
      field: "rate",
      headerName: "評価",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Rating
          name="simple-controlled"
          value={params.row.rate}
          onChange={(event, newValue) => {
            onRateChange(params.row.id, newValue);
          }}
        />
      ),
    },
    {
      field: "allWatched",
      headerName: "視聴ステータス",
      width: 160,
      valueGetter: (params: GridValueGetterParams) => (params.row.allWatched ? "すべて視聴済み" : `未視聴あり (${params.row.unWatchedCount}本)`),
    },
    {
      field: "updated_at",
      headerName: "最終更新",
      width: 100,
      valueGetter: (params: GridValueGetterParams) => calcDays(new Date(params.row.updated_at)),
    },
    { field: "seasonTag", headerName: "放送時期", width: 100 },
    {
      field: "latestUnwatchedEpisodeUrl",
      headerName: "リンク",
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Button variant="contained" target="_blank" href={params.row.latestUnwatchedEpisodeUrl}>
          開く
        </Button>
      ),
    },
    {
      field: "remove",
      headerName: "削除",
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Button variant="contained" color="error" onClick={() => onRemove(params.row.id)}>
          削除
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ height: tableHeight, width: "100%" }}>
      <StyledDataGrid
        rows={items}
        columns={columns}
        disableRowSelectionOnClick
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        density="compact"
        disableDensitySelector
        onCellClick={(event) => cellClickHandler(event)}
        sx={{
          opacity: 0.9,
        }}
      />
    </Box>
  );
};
