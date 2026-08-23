 import { initializeApp } from "firebase/app"; 
 import { getAuth } from "firebase/auth"; 
 import { getFirestore } from "firebase/firestore"; 
 const firebaseConfig = { apiKey: "AIzaSyBzfP0CGzjsYUCVMAYE--3g7ePY7BKC8Bk", 
    authDomain: "university-event-system-24640.firebaseapp.com", 
    projectId: "university-event-system-24640", 
    storageBucket: "university-event-system-24640.firebasestorage.app",
     messagingSenderId: "1094543537982",
      appId: "1:1094543537982:web:a4c7248ffcf6bb066ede6f" }; 
      const app = initializeApp(firebaseConfig); 
      export const auth = getAuth(app); 
      export const db = getFirestore(app);