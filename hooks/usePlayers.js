import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

const usePlayers = (locationId) => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const db = getFirestore();
    const playersQuery = query(collection(db, `locations/${locationId}/players`));

    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(playersQuery, (snapshot) => {
      const playersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayers(playersData);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [locationId]);

  return players;
};

export default usePlayers;
