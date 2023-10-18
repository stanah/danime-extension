import { getAnimeData, Anime, AnimeId } from "./danimeClient";

export type Rate = 1 | 2 | 3 | 4 | 5;

export interface AnimeWithRate extends Anime {
  rate: Rate | null;
}

const reservedKeys = ["watchLists"];
const animeIdPrefix = "animeId_";
const watchListPrefix = "watchList_";
const defaultWatchListName = "default";

export class AnimeStorageClient {
  async getAnimeInfo(id: AnimeId): Promise<AnimeWithRate> {
    const ret = await getAnime(id);
    if (ret === undefined) {
      console.log("見つからないのでdanimeClientから取得する");
      const data = await getAnimeData(id);
      const animeWithRate: AnimeWithRate = {
        ...data,
        rate: null,
      };
      await setAnime(id, animeWithRate);
      return animeWithRate;
    }
    console.log("見つかったのでstorageから取得したものを返す");
    return ret;
  }

  async setRate(id: AnimeId, rate: Rate): Promise<void> {
    const animeInfo = await this.getAnimeInfo(id);
    animeInfo.rate = rate;
    await setAnime(id, animeInfo);
  }

  async removeRate(id: AnimeId): Promise<void> {
    const animeInfo = await this.getAnimeInfo(id);
    animeInfo.rate = null;
    await setAnime(id, animeInfo);
  }

  async updateAnimeInfo(id: AnimeId): Promise<AnimeWithRate> {
    const data = await getAnimeData(id);
    const animeWithRate: AnimeWithRate = {
      ...data,
      rate: null,
    };
    await setAnime(id, animeWithRate);
    return animeWithRate;
  }
}

const animeStorageClient = new AnimeStorageClient();

const remove = async (key: string): Promise<void> => {
  if (typeof browser !== "undefined") {
    return browser.storage.sync.remove(key);
  } else if (typeof chrome !== "undefined") {
    await chrome.storage.sync.remove(key);
  } else {
    throw new Error("Unsupported browser");
  }
};

const get = async (key: string): Promise<any> => {
  if (typeof browser !== "undefined") {
    return browser.storage.sync.get(key);
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
    return browser.storage.sync.set({ [key]: value });
  } else if (typeof chrome !== "undefined") {
    await chrome.storage.sync.set({ [key]: value });
  } else {
    throw new Error("Unsupported browser");
  }
};

const getAnime = async (animeId: AnimeId): Promise<AnimeWithRate> => {
  return get(`${animeIdPrefix}${animeId}`);
};

const setAnime = async (animeId: AnimeId, value: AnimeWithRate): Promise<void> => {
  return set(`${animeIdPrefix}${animeId}`, value);
};

export const getSelectedWatchListName = async (): Promise<string> => {
  const selectedWatchListName = (await get("selectedWatchList")) || defaultWatchListName;
  return selectedWatchListName;
};

export const setSelectedWatchListName = async (name: string): Promise<void> => {
  await set("selectedWatchList", name);
};

export const removeWatchList = async (name: string): Promise<void> => {
  // defaultは削除できない
  if (name === defaultWatchListName) {
    alert("defaultは削除できません");
    return;
  }
  await remove(`${watchListPrefix}${name}`);
  const watchLists = await getWatchLists();
  const newWatchLists = watchLists.filter((d: string) => d !== name);
  await set("watchLists", newWatchLists);
};

export const getWatchList = async (name: string): Promise<WatchList> => {
  const list = (await get(`${watchListPrefix}${name}`)) || [];
  const newAnimeList: AnimeWithRate[] = [];
  for (let i = 0; i < list.length; i++) {
    const animeInfo = await animeStorageClient.getAnimeInfo(list[i]);
    newAnimeList.push(animeInfo);
  }
  const watchList = new WatchList(name, newAnimeList);
  // 存在しない場合、storageに保存する
  if (list.length === 0) {
    saveWatchList(watchList);
  }
  return watchList;
};

export const saveWatchList = async (watchList: WatchList): Promise<void> => {
  const list = watchList.getList().map((d) => d.id);
  await set(`${watchListPrefix}${watchList.getName()}`, list);
  await addToWatchLists(watchList.getName());
};

export const addToWatchLists = async (name: string): Promise<void> => {
  const watchLists = await getWatchLists();
  if (watchLists.includes(name)) return;
  watchLists.push(name);
  await set("watchLists", watchLists);
};

export const getWatchLists = async (): Promise<string[]> => {
  const watchLists = ((await get("watchLists")) as string[]) || [];
  return watchLists;
};

export class WatchList {
  private name: string;
  private list: AnimeWithRate[] = [];

  constructor(name: string, list: AnimeWithRate[]) {
    if (reservedKeys.includes(name)) throw new Error("Reserved key");
    this.name = name;
    this.list = list;
  }

  async add(animeId: AnimeId): Promise<void> {
    // 重複している場合、alertを出す
    if (this.list.find((d) => d.id === animeId)) {
      alert("既に登録されています");
      return;
    }

    const ret = await animeStorageClient.getAnimeInfo(animeId);
    this.list.push(ret);
    await this.save();
  }

  // listの中身を更新する
  async updateAll(): Promise<WatchList> {
    const newList: AnimeWithRate[] = [];
    for (let i = 0; i < this.list.length; i++) {
      const animeInfo = await animeStorageClient.updateAnimeInfo(this.list[i].id);
      newList.push(animeInfo);
    }
    this.list = newList;
    await this.save();
    return this;
  }

  async remove(animeId: AnimeId): Promise<WatchList> {
    this.list = this.list.filter((d) => d.id !== animeId);
    await this.save();
    return this;
  }

  getName(): string {
    return this.name;
  }
  getList(): AnimeWithRate[] {
    return this.list;
  }

  async save(): Promise<void> {
    await saveWatchList(this);
  }
}
