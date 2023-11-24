// hooks/useUserScores.js
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

const useUserScores = (locationId, leagueId, roundId, userId) => {
  const [userScores, setUserScores] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserScores = async () => {
      if (userId) {
        setIsLoading(true);
        const db = getFirestore();
        const userScoreRef = doc(db, `locations/${locationId}/leagues/${leagueId}/rounds/${roundId}/user-scores`, userId);
        const userScoreSnap = await getDoc(userScoreRef);

        if (userScoreSnap.exists()) {
          setUserScores(userScoreSnap.data());
        } else {
          setUserScores(null);
        }
        setIsLoading(false);
      }
    };

    fetchUserScores();
  }, [locationId, leagueId, roundId, userId]);

  return { userScores, isLoading };
};

export default useUserScores;
