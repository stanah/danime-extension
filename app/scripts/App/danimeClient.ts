import axios from "axios";

export interface Anime {
  id: number;
  title: string;
  description: string;
  seasonTag: string;
  updated_at: Date;
  episodes: Episode[];
  allWatched: boolean;
  unWatchedCount: number;
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  url: string;
  watched: boolean;
  created_at: Date;
}

// 文字列から数値を抽出する
const extractNumberFromString = (str: string): number => {
  const number = str.match(/\d+/);
  if (number === null) throw new Error("Invalid number format");
  return Number(number[0]);
};

const getAnimeData = async (id: string): Promise<Anime> => {
  const address = `https://animestore.docomo.ne.jp/animestore/ci_pc?workId=${id}`;
  // const response = await axios.get(address);
  const response = await axios.get(address, {
    // withCredentials: true,
    // headers: {
    //   Cookie: cookie,
    // },
  });
  const dom = new DOMParser().parseFromString(response.data, "text/html").body;
  const episodeList: Episode[] = [];

  dom.querySelectorAll("div.episodeContainer a").forEach((element) => {
    const match = element.id.match(/episodePartId.*/);
    if (match == null || match.length === 0) return;
    const imgSrc = element.querySelector("div.thumbnailContainer img")?.getAttribute("data-src") || "";
    const createdAt = imgSrc.slice(-13);

    episodeList.push({
      id: element.id,
      episodeNumber: extractNumberFromString(element.querySelector("div.textContainer span.line1 span.number")?.innerHTML ?? ""),
      title: element.querySelector("div.textContainer h3.line2 span")?.innerHTML ?? "",
      url: `https://animestore.docomo.ne.jp/animestore/ci_pc?workId=${id}&${element
        .getAttribute("href")
        ?.replace("http://localhost:4200/cd_pc?", "")}`, // FIXME
      watched: element.classList.contains("watched"),
      created_at: new Date(Number(createdAt)),
    });
  });
  // spanタグを削除
  const title = dom.querySelector("div.titleWrap h1")?.innerHTML.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "") ?? "";

  // episodeListの最後の要素が最新話なので、そのcreated_atを取得する
  const latestEpisodeCreatedAt = episodeList[episodeList.length - 1].created_at;

  let seasonTag = "";
  dom.querySelectorAll("div.tagArea").forEach((element) => {
    const match = element.innerHTML.match(/\d{4}年(春|夏|秋|冬)/);
    if (match == null || match.length === 0) return;
    seasonTag = match[0];
  });

  return {
    id: Number(id),
    title: title,
    description: "description",
    seasonTag: seasonTag,
    updated_at: latestEpisodeCreatedAt,
    episodes: episodeList,
    allWatched: episodeList.every((episode) => episode.watched),
    unWatchedCount: episodeList.filter((episode) => !episode.watched).length,
  };
};

const login = async () => {
  throw new Error("Not implemented");
};

export { getAnimeData, login };
