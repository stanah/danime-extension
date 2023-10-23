import { getAnimeData, Anime, AnimeId } from "./danimeClient";

export interface AnimeWithRate extends Anime {
  rate: number | null;
}

const WATCH_LIST_NAME = "default";
const animeIdPrefix = "animeId_";

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

  async setRate(id: AnimeId, rate: number): Promise<void> {
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

const get = async (key: string): Promise<any> => {
  if (typeof browser !== "undefined") {
    const ret = await browser.storage.sync.get(key);
    return ret[key];
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

const getAnimeIds = async (): Promise<AnimeId[]> => {
  return get(WATCH_LIST_NAME);
};

export const addToWatchList = async (animeId: AnimeId): Promise<void> => {
  const list = (await get(WATCH_LIST_NAME)) || [];
  list.push(animeId);
  await set(WATCH_LIST_NAME, list);
};

export const removeFromWatchList = async (animeId: AnimeId): Promise<void> => {
  const list = (await get(WATCH_LIST_NAME)) || [];
  const newList = list.filter((d: AnimeId) => d !== animeId);
  await set(WATCH_LIST_NAME, newList);
};

export const clearWatchList = async (): Promise<void> => {
  await set(WATCH_LIST_NAME, []);
};

export const getWatchListFromStorage = async (): Promise<AnimeWithRate[]> => {
  const list = (await getAnimeIds()) || [];
  const newAnimeList: AnimeWithRate[] = [];
  for (let i = 0; i < list.length; i++) {
    const animeInfo = await animeStorageClient.getAnimeInfo(list[i]);
    newAnimeList.push(animeInfo);
  }
  return newAnimeList;
};

export const forceUpdateWatchList = async (): Promise<AnimeWithRate[]> => {
  const list = (await getAnimeIds()) || [];
  const newAnimeList: AnimeWithRate[] = [];
  for (let i = 0; i < list.length; i++) {
    const animeInfo = await animeStorageClient.updateAnimeInfo(list[i]);
    newAnimeList.push(animeInfo);
  }
  return newAnimeList;
};

export const updateRate = async (animeId: AnimeId, rate: number): Promise<AnimeWithRate[]> => {
  await animeStorageClient.setRate(animeId, rate);
  return getWatchListFromStorage();
};
