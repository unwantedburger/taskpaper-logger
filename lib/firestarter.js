// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const { initializeApp } = require("firebase/app");

const {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  getDocs,
  where,
  query,
  Timestamp,
  doc,
} = require("firebase/firestore");

const dotenv = require("dotenv");

initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "universaldashboard-fd9d8.firebaseapp.com",
  projectId: "universaldashboard-fd9d8",
  storageBucket: "universaldashboard-fd9d8.appspot.com",
  messagingSenderId: "904361515736",
  appId: "1:904361515736:web:d58b91567255dc7e3d95ad",
});

const db = getFirestore();

const taskLoggerNode = "tasklogger";

async function createFire(dataToLog) {
  const date = new Date();
  // Get the start and end timestamps for today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Query for documents with a timestamp within today's range
  const q = query(
    collection(db, taskLoggerNode),
    where("timestamp", ">=", Timestamp.fromDate(todayStart))
  );

  const querySnapshot = await getDocs(q);

  // If there's no document for today, add a new one
  if (querySnapshot.empty) {
    console.log("not been added today");
    // Add it

    const dataObject = {
      timestamp: Timestamp.fromDate(new Date(date)), // Example: firebase.firestore.Timestamp.fromDate(new Date('2023-03-22T18:10:00'))
      tasks_total: dataToLog?.tasks?.total,
      tasks_critical: dataToLog?.tasks?.critical,
      tasks_high: dataToLog?.tasks?.high,
      tasks_mid: dataToLog?.tasks?.mid,
      tasks_low: dataToLog?.tasks?.low,
      tasks_evokedset: dataToLog?.tasks?.evokedset,
      tasks_unprioritised: dataToLog?.tasks?.unprioritised,
      tasks_done: dataToLog?.tasks.done,
      projects: dataToLog?.projects,
    };

    // console.log({ dataToLog, dataObject });
    try {
      const docRef = await addDoc(collection(db, taskLoggerNode), dataObject);
      return docRef.id;
    } catch (err) {
      console.error("Error adding document: ", err);
      return err;
    }
  } else {
    console.log("has been added today");
  }
}

module.exports = {
  createFire,
};
