// pages/index.js
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import Navbar from "@/components/navbar";
import { ToastContainer } from "react-toastify";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig"; // Adjust the import path as needed
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const router = useRouter();
  const [leagueCodeDigits, setLeagueCodeDigits] = useState(
    new Array(6).fill("")
  );
  const [isInvalid, setIsInvalid] = useState(false);
  const { user, signInWithGoogle } = useAuth();

  const handleBackspace = (event) => {
    if (event.key === "Backspace" && !leagueCodeDigits[index]) {
      if (index > 0) {
        document.querySelector(`.code-input:nth-child(${index})`).focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && index !== 0 && !leagueCodeDigits[index]) {
      document.querySelector(`.code-input:nth-child(${index})`).focus();
    }
  };

  const handleDigitChange = (e, index) => {
    const newDigits = [...leagueCodeDigits];
    newDigits[index] = e.target.value.slice(0, 1);
    setLeagueCodeDigits(newDigits);

    // Reset error state if not all digits are filled
    if (!newDigits.every((digit) => digit) || newDigits.length !== 6) {
      if (isInvalid) setIsInvalid(false);
    }

    // Move focus to next input
    if (index < leagueCodeDigits.length - 1 && e.target.value) {
      document.querySelector(`.code-input:nth-child(${index + 2})`).focus();
    }

    // Check if all digits are entered and submit
    if (newDigits.every((digit) => digit) && newDigits.length === 6) {
      submitLeagueCode(newDigits.join(""));
    }
  };

  const submitLeagueCode = async (code) => {
    try {
      const codeRef = doc(db, "leagueCodes", code);
      const codeSnap = await getDoc(codeRef);

      if (codeSnap.exists()) {
        const { locationId, leagueId } = codeSnap.data();
        router.push(`/location/${locationId}/league/${leagueId}`);
      } else {
        // Handle invalid code
        setIsInvalid(true);
      }
    } catch (error) {
      console.error("Error fetching league code: ", error);
      setIsInvalid(true);
    }
  };

  useEffect(() => {
    if (!auth) return;
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        // User is signed out
        signInAnonymously(auth)
          .then(() => {
            // Do nothing, user is signed in anonymously.
            // console.log("signed in anon");
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(error);

            // ...
          });
      }
      // ...
    });
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://www.google.com/recaptcha/api.js?render=" +
      process.env.NEXT_PUBLIC_RECAPTCHA_V3_KEY;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar style="light"></Navbar>

      <div className="flex flex-grow flex-col items-center justify-center text-primary-800 ">
        {/* Title */}

        <div className="flex justify-center items-center h-full w-full sm:w-3/4">
          {user ? (
            <div>
              <p className="text-center mb-4">
                Enter your 6-digit League Code:
              </p>
              <div className="code-input-container">
                {leagueCodeDigits.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleDigitChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onFocus={(e) => e.target.select()}
                    className={`code-input ${isInvalid ? "input-shake" : ""}`}
                  />
                ))}
              </div>

              <p className="text-red-500 mt-2 h-[50px]">
                {isInvalid ? "Invalid Code. Please try again." : ""}
              </p>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="text-4xl text-blue-500 p-2 border-blue-500 rounded border-4 hover:bg-blue-200"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-around items-center flex-col sm:flex-row w-full h-32 bg-gray-100">
        <div className="flex w-1/2 justify-around items-center">
          <div className="font-bruno-ace-sc text-xl sm:text-4xl justify-around items-center">
            GOLF LEAGUE
          </div>
        </div>
        <div className="w-1/2 flex justify-around items-center">
          <div className="text-sm text-gray-500 text-center">
            © 2023 Golf League. Powered by TeeFindr. All Rights Reserved.
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
