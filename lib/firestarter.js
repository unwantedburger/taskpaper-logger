// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const { initializeApp } = require("firebase/app");

const {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
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
  // TODO: You should move this out of this function and do it ielserhere perhaps
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

  // Query for documents with a timestamp within today's range
  const q = query(
    collection(db, taskLoggerNode),
    where("timestamp", ">=", Timestamp.fromDate(todayStart))
  );
  const querySnapshot = await getDocs(q);

  // Get today's node in case you need to update it.
  let todaysNode;
  querySnapshot.forEach((doc) => {
    todaysNode = doc.id;
  });

  if (querySnapshot.empty) {
    // If there's no document for today, add it

    console.log("not been added today – adding.");
    try {
      const docRef = await addDoc(collection(db, taskLoggerNode), dataObject);
      return docRef.id;
    } catch (err) {
      console.error("Error adding document: ", err);
      return err;
    }
  } else {
    // If it's already been added today update it
    console.log("Has already been added once today – updating.");
    try {
      await updateDoc(doc(db, taskLoggerNode, todaysNode), dataObject);
      console.log("Updated node");
      return true;
    } catch (err) {
      console.log("There is an error");
      console.error("Error", err);
      throw err;
    }
  }
}

module.exports = {
  createFire,
};
