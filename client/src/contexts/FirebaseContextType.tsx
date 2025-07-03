import React, { createContext, useContext, useEffect, useState } from "react";
import { initializeApp, FirebaseApp } from "@firebase/app";
import { getAuth, Auth } from "@firebase/auth";
import { getFirestore, Firestore } from "@firebase/firestore";

interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  userId: string | null;
  error: string | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  db: null,
  userId: null,
  error: null,
  loading: true,
});

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        const firebaseConfig = {
            apiKey: import.meta.env.VITE_FIREBASE_APP_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            databaseURL: import.meta.env.VITE_FIREBASE_DB_URL,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_APP_ID,
          };

        const firebaseApp = initializeApp(firebaseConfig);
        const firestore = getFirestore(firebaseApp);
        const firebaseAuth = getAuth(firebaseApp);

        const user = localStorage.getItem("user");
        const parsedUser = user ? JSON.parse(user) : null;
        console.log(parsedUser)
        setUserId(parsedUser?.uid || null);
        setApp(firebaseApp);
        setDb(firestore);
        setAuth(firebaseAuth);
        setLoading(false);
      } catch (initError) {
        console.error("Failed to initialize Firebase:", initError);
        setError("Failed to initialize Firebase.");
        setLoading(false);
      }
    };

    initializeFirebase();
  }, []);

  return (
    <FirebaseContext.Provider value={{ app, auth, db, userId, error, loading }}>
      {children}
    </FirebaseContext.Provider>
  );
};
