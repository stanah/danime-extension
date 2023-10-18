import { getAnimeData, Anime, AnimeId } from "./danimeClient";

export type Rate = 1 | 2 | 3 | 4 | 5;

export interface AnimeWithRate extends Anime {
  rate: Rate | null;
}

const reservedKeys = ["watchLists"];
const animeIdPrefix = "animeId_";
const defaultWatchListName = "default";

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
  return get(`${animeIdPrefix}${animeId}}`);
};

const setAnime = async (animeId: AnimeId, value: AnimeWithRate): Promise<void> => {
  return set(`${animeIdPrefix}${animeId}}`, value);
};

export const addToWatchList = async (animeId: AnimeId): Promise<void> => {
  const watchList = await getWatchList(defaultWatchListName);
  await watchList.add(animeId);
  await watchList.save();
};

export const saveWatchList = async (watchList: WatchList): Promise<void> => {
  await set(watchList.name, watchList.list);

  const watchLists = (await get("watchLists")) || [];
  watchLists.push(watchList.name);
  await set("watchLists", watchLists);
};

export const removeWatchList = async (watchList: WatchList): Promise<void> => {
  await remove(watchList.name);

  const watchLists = (await get("watchLists")) || [];
  const newWatchLists = watchLists.filter((name: string) => name !== watchList.name);
  await set("watchLists", newWatchLists);
};

export const getWatchList = async (name: string): Promise<WatchList> => {
  const list = (await get(name)) || [];
  const watchList = new WatchList(name, list);
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
    if (reservedKeys.includes(name)) throw new Error("Reserved key");
    this.name = name;
    this.list = list;
  }

  async add(animeId: AnimeId): Promise<void> {
    this.list.push(animeId);
  }

  async remove(animeId: AnimeId): Promise<void> {
    this.list = this.list.filter((id) => id !== animeId);
  }

  async getList(): Promise<AnimeId[]> {
    return this.list;
  }

  async save(): Promise<void> {
    await set(this.name, this.list);
  }
}

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

  async updateAnimeInfo(id: AnimeId): Promise<void> {
    const data = await getAnimeData(id);
    const animeWithRate: AnimeWithRate = {
      ...data,
      rate: null,
    };
    await setAnime(id, animeWithRate);
  }
}
