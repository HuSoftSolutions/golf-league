// hooks/useLeagues.js
import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

const useLeagues = (locationId) => {
  const [leagues, setLeagues] = useState([]);

  useEffect(() => {
    const db = getFirestore();
    const leaguesQuery = query(collection(db, `locations/${locationId}/leagues`));

    const unsubscribe = onSnapshot(leaguesQuery, (snapshot) => {
      const leaguesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeagues(leaguesData);
    });

    return () => unsubscribe();
  }, [locationId]);

  const deleteLeague = async (leagueId) => {
    if (window.confirm("Are you sure you want to delete this league?")) {
      const db = getFirestore();
      await deleteDoc(doc(db, `locations/${locationId}/leagues`, leagueId));
    }
  };

  return { leagues, deleteLeague };
};

export default useLeagues;
