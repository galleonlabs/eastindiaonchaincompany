const admin = require("firebase-admin");
const serviceAccount = require("./key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const harvest = [
  {
    assetSymbol: "USDC",
    id: "usd-coin",
    quantity: 2898.66,
  },
  {
    assetSymbol: "USDC",
    id: "usd-coin",
    quantity: 320.29,
  },
  {
    assetSymbol: "USDC",
    id: "usd-coin",
    quantity: 2798,
  },
  {
    assetSymbol: "USDC",
    id: "usd-coin",
    quantity: 2831.81,
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
