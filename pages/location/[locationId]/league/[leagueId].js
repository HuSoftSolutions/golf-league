import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import withAuth from '../../../../hocs/withAuth'; // Update the path accordingly
import { db } from '../../../../firebaseConfig'; // assuming db is your Firestore instance
import { collection, query, getDocs, doc, getDoc, where } from 'firebase/firestore';
import { useAuth } from '../../../../hooks/useAuth';

const LeagueRounds = () => {
  const [rounds, setRounds] = useState([]);
  const [league, setLeague] = useState({});
  const router = useRouter();
  const { locationId, leagueId } = router.query;
  const {user} = useAuth();

	

	useEffect(() => {
    if (locationId && leagueId && user) {
      const fetchRounds = async () => {
        const roundsRef = collection(db, `locations/${locationId}/leagues/${leagueId}/rounds`);
        const q = query(roundsRef);
        const querySnapshot = await getDocs(q);
        let roundsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch user scores for each round
        for (let round of roundsData) {
          const userScoreDocRef = doc(db, `locations/${locationId}/leagues/${leagueId}/rounds/${round.id}/user-scores`, user.uid);
          const userScoreDoc = await getDoc(userScoreDocRef);
          if (userScoreDoc.exists()) {
            round.userScore = userScoreDoc.data();
          }
        }

        setRounds(roundsData);

        // Fetch league data
        const leagueRef = doc(db, `locations/${locationId}/leagues`, leagueId);
        const leagueDoc = await getDoc(leagueRef);
        if (leagueDoc.exists()) {
          setLeague({ id: leagueDoc.id, ...leagueDoc.data() });
        }
      };

      fetchRounds();
    }
  }, [locationId, leagueId, user]);


// Function to display players from the array
const displayPlayers = (playersArray) => {
  return playersArray.map((player, index) => (
    <li key={index}>
      {player.displayName}
      {/* Calculate and display total score */}
      {player.scores && (
        <span>: Total Score - {Object.values(player.scores).reduce((total, score) => total + score, 0)}</span>
      )}
    </li>
  ));
};

const getButtonStyle = (roundStatus) => {
  switch (roundStatus) {
    case 'Not Started':
      return 'bg-green-500 hover:bg-green-700'; // Green for 'Start Round'
    case 'In Progress':
      return 'bg-yellow-500 hover:bg-yellow-700'; // Yellow for 'Continue Round'
    case 'Complete':
      return 'bg-gray-500 hover:bg-gray-700'; // Gray for 'View Round'
    default:
      return 'bg-blue-500 hover:bg-blue-700'; // Default case, can be adjusted as needed
  }
};



const getButtonText = (roundStatus) => {
  switch (roundStatus) {
    case 'Not Started':
      return 'Start Round';
    case 'In Progress':
      return 'Continue Round';
    case 'Complete':
      return 'View Round';
    default:
      return 'Play Now'; // Default case, can be adjusted as needed
  }
};

	
	const handlePlayNow = (roundId) => {
    router.push(`/location/${locationId}/league/${leagueId}/round/${roundId}`);
  };

	const getRoundStatus = (round) => {
		// Check if userScore exists
		if (round.userScore) {
			// Check if all players have complete scores
			const allScoresComplete = round.userScore.players.every(player => 
				player.scores && Object.keys(player.scores).length === 18 && // Assuming 18 holes
				Object.values(player.scores).every(score => score > 0)
			);
	
			return allScoresComplete ? 'Complete' : 'In Progress';
		} else {
			return 'Not Started';
		}
	};
	
	

	return (
    <div className="container mx-auto p-4 text-xs">
      <h1 className="text-2xl font-bold mb-4">League: {league.name}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rounds.map(round => (
          <div key={round.id} className="bg-white shadow-md rounded-lg p-4 border">
            <h2 className="text-lg font-bold mb-2">{round.name}</h2>
            <p><strong>Course:</strong> {round.course.name}</p>
            <p><strong>Nine:</strong> {round.course.nine}</p>
            <p><strong>Date:</strong> {round.date}</p>
            <p><strong>Status:</strong> {getRoundStatus(round)}</p>
						{round.userScore && (
              <div className="mt-2">
                <strong>Players:</strong>
                <ul>
                  {displayPlayers(round.userScore.players)}
                </ul>
              </div>
            )}
<button
  onClick={() => handlePlayNow(round.id)}
	className={`mt-4 text-white font-bold py-2 px-4 rounded ${getButtonStyle(getRoundStatus(round))}`}
	>
  {getButtonText(getRoundStatus(round))}
</button>

          </div>
        ))}
      </div>
    </div>
  );
};

export default LeagueRounds;