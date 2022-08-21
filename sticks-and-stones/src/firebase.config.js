import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAjOAaE7FHlK28ut8OjJDZ_yqKlMIRNw2A",
  authDomain: "sticks-and-stones-c2e9a.firebaseapp.com",
  databaseURL: "https://sticks-and-stones-c2e9a-default-rtdb.firebaseio.com/",
  projectId: "sticks-and-stones-c2e9a",
  storageBucket: "sticks-and-stones-c2e9a.appspot.com",
  messagingSenderId: "825434607359",
  appId: "1:825434607359:web:049881342bb95736f2c6ca",
  measurementId: "G-NGGEJ8FS61",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore();
