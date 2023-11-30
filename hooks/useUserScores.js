import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

const useUserScores = (locationId, leagueId, roundId, userId) => {
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [originalScores, setOriginalScores] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    setIsLoading(true);
    const db = getFirestore();
    const userScoreRef = doc(
      db,
      `locations/${locationId}/leagues/${leagueId}/rounds/${roundId}/user-scores`,
      userId
    );

    const unsubscribe = onSnapshot(userScoreRef, (snapshot) => {
      if (snapshot.exists()) {
        const userScoreData = snapshot.data();
        const playersWithScores = userScoreData.players.map((player) => ({
          ...player,
          scores: player.scores || {},
        }));
        setSelectedPlayers(playersWithScores);
        setOriginalScores(
          playersWithScores.reduce((acc, player) => {
            acc[player.id] = player.scores;
            return acc;
          }, {})
        );
        setHasUnsavedChanges(false);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching user scores:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [locationId, leagueId, roundId, userId]);

  useEffect(() => {
    const hasChanges = selectedPlayers.some(
      player => JSON.stringify(player.scores) !== JSON.stringify(originalScores[player.id])
    );
    setHasUnsavedChanges(hasChanges);
  }, [selectedPlayers, originalScores]);

  return { selectedPlayers, setSelectedPlayers, hasUnsavedChanges, isLoading };
};

export default useUserScores;
