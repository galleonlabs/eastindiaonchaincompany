const admin = require("firebase-admin");
const serviceAccount = require("./key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const harvest = [
  {
    assetSymbol: "CRVUSD",
    id: "crvusd",
    quantity: 0,
  },
  {
    assetSymbol: "USDC",
    id: "usd-coin",
    quantity: 0,
  },
  {
    assetSymbol: "CRV",
    id: "curve-dao-token",
    quantity: 0,
  },
  {
    assetSymbol: "CVX",
    id: "convex-finance",
    quantity: 0,
  },
];

const batch = db.batch();

harvest.forEach((asset) => {
  const ref = db.collection("harvests").doc();
  batch.set(ref, {
    ...asset,
    date: admin.firestore.FieldValue.serverTimestamp(),
  });
});

batch
  .commit()
  .then(() => {
    console.log("Successfully added harvest to Firestore.");
  })
  .catch((error) => {
    console.error("Error adding harvest to Firestore: ", error);
  });
