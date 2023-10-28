import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword,GoogleAuthProvider } from 'firebase/auth';
const firebaseConfig = {
  apiKey: "AIzaSyDYeaaUHfp6NbEtNvfdnpaEe0T8x9FSuqI",
  authDomain: "serverless-group-11.firebaseapp.com",
  projectId: "serverless-group-11",
  storageBucket: "serverless-group-11.appspot.com",
  messagingSenderId: "1013386280517",
  appId: "1:1013386280517:web:9f6b27a9fa77a07698ad2c",
  measurementId: "G-NL7YXFBYLG"
};
  const firebaseApp = initializeApp(firebaseConfig);
  export const auth = getAuth(firebaseApp);
  export const googleAuthProvider = new GoogleAuthProvider();
  export const registerUser = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };