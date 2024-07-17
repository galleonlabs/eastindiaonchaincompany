const admin = require("firebase-admin");
const serviceAccount = require("./key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const assets = [
  { symbol: '', quantity: 0, href: "", imgSrc: "", id: '' },
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

  