const admin = require("firebase-admin");
const serviceAccount = require("./key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const assets = [
  {
    symbol: "DYDX",
    quantity: 338051.0,
    href: "https://dydx.trade/",
    imgSrc: "https://assets.coingecko.com/coins/images/32594/standard/dydx.png?1698673495",
    id: "dydx-chain",
  },
  {
    symbol: "CVXCRV",
    quantity: 1183675.0,
    href: "https://www.convexfinance.com/",
    imgSrc: "https://assets.coingecko.com/coins/images/15586/standard/convex-crv.png?1696515222",
    id: "convex-crv",
  },
  {
    symbol: "AURA",
    quantity: 150000.0,
    href: "https://aura.finance/",
    imgSrc: "https://assets.coingecko.com/coins/images/25942/standard/logo.png?1696525021",
    id: "aura-finance",
  },
  {
    symbol: "CVX",
    quantity: 17763.35,
    href: "https://www.convexfinance.com/",
    imgSrc: "https://assets.coingecko.com/coins/images/15585/standard/convex.png?1696515221",
    id: "convex-finance",
  },
];

const treasuryAssets = [...assets];

const batch = db.batch();

treasuryAssets.forEach((asset) => {
  const ref = db.collection("treasuryAssets").doc();
  batch.set(ref, asset);
});

batch
  .commit()
  .then(() => {
    console.log("Successfully added assets to Firestore.");
  })
  .catch((error) => {
    console.error("Error adding assets to Firestore: ", error);
  });

  