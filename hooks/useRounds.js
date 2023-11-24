// hooks/useRounds.js
import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import {format} from 'date-fns'

const useRounds = (locationId, leagueId) => {
  const [rounds, setRounds] = useState([]);

  useEffect(() => {
    if (locationId && leagueId) {
      const db = getFirestore();
      const roundsQuery = query(collection(db, `locations/${locationId}/leagues/${leagueId}/rounds`));

      const unsubscribe = onSnapshot(roundsQuery, (snapshot) => {

        const roundsData = snapshot.docs.map(doc => {
					const data = doc.data();
					// let date = data?.date?.toDate();
					// if(date) date = format(date, "Pp");

					return({ id: doc.id,...data }) 
				});
        setRounds(roundsData.sort((a,b) => {return new Date(a.date) - new Date(b.date)}));
      });

      return () => unsubscribe();
    }
  }, [locationId, leagueId]);

  return rounds;
};

export default useRounds;
