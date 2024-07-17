// utils.ts
import { collection, getDocs } from "firebase/firestore";
import axios from "axios";
import { db } from "./main";

export const fetchData = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map((doc) => doc.data());
};

export const fetchPrices = async (assetIds: string[]) => {
  const cachedPrices = JSON.parse(sessionStorage.getItem("assetPrices") || "{}");
  const uncachedIds = assetIds.filter((id) => !cachedPrices[id]);

  if (uncachedIds.length > 0) {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${uncachedIds.join(",")}&vs_currencies=usd`
    );
    const prices = response.data;

    uncachedIds.forEach((id) => {
      cachedPrices[id] = prices[id]?.usd;
    });

    sessionStorage.setItem("assetPrices", JSON.stringify(cachedPrices));
  }

  return cachedPrices;
};
