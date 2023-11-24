import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Adjust the import path as needed

const useRound = (locationId, leagueId, roundId) => {
  const [round, setRound] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roundId) {
      setLoading(false);
      return;
    }

    const roundRef = doc(db, `locations/${locationId}/leagues/${leagueId}/rounds`, roundId);

    const unsubscribe = onSnapshot(roundRef, 
      (doc) => {
        setRound({ id: doc.id, ...doc.data() });
				console.log(doc.data())
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching round data: ", error);
        setError(error);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [roundId]);

  return { round, loading, error };
};

export default useRound;
