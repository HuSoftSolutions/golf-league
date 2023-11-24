import { useEffect, useState, useContext, createContext } from "react";
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as signOutFromFirebase,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth } from "../firebaseConfig";
import { db } from "../firebaseConfig"; // assuming db is your Firestore instance
import { useRouter } from "next/router";

// Create a context
const authContext = createContext();

export function ProvideAuth({ children }) {
  const auth = useAuthProvider();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = () => {
  return useContext(authContext);
};

function useAuthProvider() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const signInWithGoogle = (redirectPath="/") => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider)
      .then(async (response) => {
        // Check if user already exists in Firestore
        const docRef = doc(db, "users", response.user.uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          // Add user to Firestore
          await setDoc(docRef, {
            name: response.user.displayName,
            email: response.user.email,
            photoURL: response.user.photoURL,
            // Add more fields as necessary
          });
        }

        // Fetch user data from Firestore and set it to state
        const userDoc = await getDoc(docRef);
        const user_ = { ...response.user, ...userDoc.data() };
        setUser(user_);

        const { business_id, uid } = user_;
        console.log(business_id);

        if (business_id) router.push(`/location/${business_id}`);
        else router.push(redirectPath || `/account/${uid}`);

        return response.user;
      })
      .catch((error) => {
        return { error };
      });
  };

  const signOut = () => {
    return signOutFromFirebase(auth)
      .then(() => {
        setUser(false);
      })
      .catch((error) => {
        return { error };
      });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user data from Firestore and merge it with auth user
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser({ ...user, ...docSnap.data() });
        } else {
          setUser(user);
        }

        // redirect user to /account/[userId]
        // router.push(`/account/${user.uid}`);
      } else {
        setUser(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return {
    user,
    signInWithGoogle,
    signOut,
  };
}
