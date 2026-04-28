// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Cambio a Database
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDwrMAreTsyWNeEYr2FYwqJeiosYCv8Bzk",
  authDomain: "mibasedatos5.firebaseapp.com",
  databaseURL: "https://mibasedatos5-default-rtdb.firebaseio.com",
  projectId: "mibasedatos5",
  storageBucket: "mibasedatos5.firebasestorage.app",
  messagingSenderId: "17765170617",
  appId: "1:17765170617:web:306d0740d66a426613ca68",
  measurementId: "G-VCRFTMCVBF"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
// Inicializar Realtime Database
const db = getDatabase(app);

export { db };
