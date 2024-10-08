import "@firebase/firestore";
import '@firebase/auth';

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAuth, browserSessionPersistence } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDiSuxPcu0niDi7AvnYHaOx_a_mLNQoBX4",
    authDomain: "fyp-taskmanager.firebaseapp.com",
    projectId: "fyp-taskmanager",
    storageBucket: "fyp-taskmanager.appspot.com",
    messagingSenderId: "580347266167",
    appId: "1:580347266167:web:c04f6bbc7bc2603a6af272",
    measurementId: "G-VTZ63CWB18"
  };

// Initialize Firebase database
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get service
const firebaseDB = getFirestore(app);
// Initialize Firebase Authentication 
const auth = initializeAuth(app, {
    persistence: browserSessionPersistence,
});
// Initialize Cloud Storage
const storage = getStorage(app);

export { firebaseDB, auth, storage };