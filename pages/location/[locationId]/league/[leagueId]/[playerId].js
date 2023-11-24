import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../../../firebaseConfig'; // Update the path accordingly
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const PlayerOverview = () => {
  const [playerDetails, setPlayerDetails] = useState({});
  const [playerRounds, setPlayerRounds] = useState([]);
  const router = useRouter();
  const { locationId, leagueId, playerId } = router.query;

  useEffect(() => {
    if (locationId && leagueId && playerId) {
      fetchPlayerDetails();
      fetchPlayerRounds();
    }
  }, [locationId, leagueId, playerId]);

  const fetchPlayerDetails = async () => {
		console.log(playerId)
    const playerRef = doc(db, `location/${locationId}/league/${leagueId}/players`, playerId); // Adjust the path according to your database structure
    const playerDoc = await getDoc(playerRef);
		console.log(playerDoc.data())
    if (playerDoc.exists()) {
      setPlayerDetails(playerDoc.data());
    }
  };

	const fetchPlayerRounds = async () => {
		const roundsRef = collection(db, `locations/${locationId}/leagues/${leagueId}/rounds`);
		const roundsSnapshot = await getDocs(roundsRef);
		let newPlayerRounds = [];
	
		for (const roundDoc of roundsSnapshot.docs) {
			const roundData = roundDoc.data();
			const roundId = roundDoc.id;
			const userScoreRef = doc(db, `locations/${locationId}/leagues/${leagueId}/rounds/${roundId}/user-scores`, playerId);
			const userScoreDoc = await getDoc(userScoreRef);
	
			if (userScoreDoc.exists()) {
				newPlayerRounds.push({
					roundId: roundId,
					...roundData,
					userScore: userScoreDoc.data()
				});
			}
		}
	
		setPlayerRounds(newPlayerRounds);
	};
	

  return (
    <div>
      <h1>Player Overview</h1>
      <div>
        <h2>Player Details</h2>
        {/* Display player details */}
        <p>Name: {playerDetails.name}</p>
        <p>Email: {playerDetails.email}</p>
        {/* Add more player details as needed */}
      </div>
      <div>
        <h2>Player Rounds</h2>
        {/* Display player rounds in a table or list */}
        {playerRounds.map((round, index) => (
          <div key={index}>
            <p>Round ID: {round.roundId}</p>
            <p>Date: {round.date}</p>
            {/* Add more round details as needed */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerOverview;
