// アニメのデータを保存するクラス
// データの保存はbrowser.storage.syncを使う

import { getAnimeData, Anime, AnimeId } from "./danimeClient";

export type Rate = 1 | 2 | 3 | 4 | 5;

export interface AnimeWithRate extends Anime {
  rate: Rate | null;
}
// 予約済みのキー
const reservedKeys = ["watchLists"];
const animeIdPrefix = "animeId_";
const defaultWatchListName = "default";

const getAnime = (id: AnimeId): Promise<AnimeWithRate> => {
  return get(`${animeIdPrefix}${id}}`);
};
const setAnime = (id: AnimeId, value: any): Promise<void> => {
  return set(`${animeIdPrefix}${id}}`, value);
};

const remove = async (key: string): Promise<void> => {
  if (typeof browser !== "undefined") {
    throw new Error("browser");
    //   return browser.storage.sync;
  } else if (typeof chrome !== "undefined") {
    await chrome.storage.sync.remove(key);
  } else {
    throw new Error("Unsupported browser");
  }
};

const get = async (key: string): Promise<any> => {
  if (typeof browser !== "undefined") {
    throw new Error("browser");
    //   return browser.storage.sync;
  } else if (typeof chrome !== "undefined") {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(key, function (value) {
        resolve(value[key]);
      });
    });
  } else {
    throw new Error("Unsupported browser");
  }
};

const set = async (key: string, value: any): Promise<void> => {
  if (typeof browser !== "undefined") {
    throw new Error("browser");
    //   return browser.storage.sync;
  } else if (typeof chrome !== "undefined") {
    await chrome.storage.sync.set({ [key]: value });
  } else {
    throw new Error("Unsupported browser");
  }
};

export const addToWatchList = async (id: AnimeId) => {
  const watchList = await getWatchList(defaultWatchListName);
  await watchList.add(id);
  await watchList.save();
};

export const saveWatchList = async (watchList: WatchList) => {
  await set(watchList.name, watchList.list);

  // プレイリストのリストに追加する
  const watchLists = (await get("watchLists")) || [];
  watchLists.push(watchList.name);
  await set("watchLists", watchLists);
};

export const removeWatchList = async (watchList: WatchList) => {
  await remove(watchList.name);
  // プレイリストのリストから削除する
  const watchLists = (await get("watchLists")) || [];
  const newWatchLists = watchLists.filter((name: string) => name !== watchList.name);
  await set("watchLists", newWatchLists);
};

export const getWatchList = async (name: string): Promise<WatchList> => {
  const list = (await get(name)) || [];
  const watchList = new WatchList(name, list); // list変数をstring[]型に変換する
  return watchList;
};

export const getWatchLists = async (): Promise<string[]> => {
  const watchLists = ((await get("watchLists")) as string[]) || [];
  return watchLists;
};

export class WatchList {
  name: string;
  list: AnimeId[] = [];

  constructor(name: string, list: AnimeId[]) {
    // nameが予約済みのキーと重複していたらエラーを投げる
    if (reservedKeys.includes(name)) throw new Error("Reserved key");
    this.name = name;
    this.list = list;
  }

  async add(animeId: AnimeId) {
    this.list.push(animeId);
  }

  async remove(animeId: AnimeId) {
    this.list = this.list.filter((id) => id !== animeId);
  }

  async getList() {
    return this.list;
  }

  async save() {
    await set(this.name, this.list);
  }
}

export class AnimeStorageClient {
  constructor() {}

  async getAnimeInfo(id: AnimeId): Promise<AnimeWithRate> {
    const ret = await getAnime(id);
    // 見つからない場合はdanimeClientから取得する
    if (ret === undefined) {
      console.log("見つからないのでdanimeClientから取得する");
      const data = await getAnimeData(id);
      // dataをAnimeWithRate型に変換して保存する
      const animeWithRate: AnimeWithRate = {
        ...data,
        rate: null,
      };

      // 被らないようにidにprefixをつけてstorageに保存する
      await setAnime(id, animeWithRate);
      return animeWithRate;
    }
    console.log("見つかったのでstorageから取得したものを返す");
    return ret;
  }

  async setRate(id: AnimeId, rate: Rate) {
    const animeInfo = await this.getAnimeInfo(id);
    // rateを更新する
    animeInfo.rate = rate;
    // storageに保存する
    await setAnime(id, animeInfo);
  }

  async removeRate(id: AnimeId) {
    const animeInfo = await this.getAnimeInfo(id);
    // rateを削除する
    animeInfo.rate = null;
    // storageに保存する
    await setAnime(id, animeInfo);
  }

  // getAnimeDataを使って取得したデータをstorageに保存する
  async updateAnimeInfo(id: AnimeId) {
    const data = await getAnimeData(id);
    // dataをAnimeWithRate型に変換して保存する
    const animeWithRate: AnimeWithRate = {
      ...data,
      rate: null,
    };
    await setAnime(id, animeWithRate);
  }
}
