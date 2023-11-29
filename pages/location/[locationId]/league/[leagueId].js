import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import withAuth from "../../../../hocs/withAuth"; // Update the path accordingly
import { db } from "../../../../firebaseConfig"; // assuming db is your Firestore instance
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  where,
} from "firebase/firestore";
import { useAuth } from "../../../../hooks/useAuth";
import { MdGolfCourse, MdOutlineDateRange } from "react-icons/md";
import { GrStatusInfo } from "react-icons/gr";


const LeagueRounds = () => {
  const [rounds, setRounds] = useState([]);
  const [league, setLeague] = useState({});
  const router = useRouter();
  const { locationId, leagueId } = router.query;
  const { user } = useAuth();

  useEffect(() => {
    if (locationId && leagueId && user) {
      const fetchRounds = async () => {
        const roundsRef = collection(
          db,
          `locations/${locationId}/leagues/${leagueId}/rounds`
        );
        const q = query(roundsRef);
        const querySnapshot = await getDocs(q);
        let roundsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(roundsData);
        // Fetch user scores for each round
        for (let round of roundsData) {
          const userScoreDocRef = doc(
            db,
            `locations/${locationId}/leagues/${leagueId}/rounds/${round.id}/user-scores`,
            user.uid
          );
          const userScoreDoc = await getDoc(userScoreDocRef);
          if (userScoreDoc.exists()) {
            round.userScore = userScoreDoc.data();
          }
        }

        setRounds(
          roundsData.sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
          })
        );

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
          <span>
            : Total Score -{" "}
            {Object.values(player.scores).reduce(
              (total, score) => total + score,
              0
            )}
          </span>
        )}
      </li>
    ));
  };

  const getButtonStyle = (roundStatus) => {
    switch (roundStatus) {
      case "Not Started":
        return "bg-green-500 hover:bg-green-700"; // Green for 'Start Round'
      case "In Progress":
        return "bg-yellow-500 hover:bg-yellow-700"; // Yellow for 'Continue Round'
      case "Complete":
        return "bg-gray-500 hover:bg-gray-700"; // Gray for 'View Round'
      default:
        return "bg-blue-500 hover:bg-blue-700"; // Default case, can be adjusted as needed
    }
  };

  const getButtonText = (roundStatus) => {
    switch (roundStatus) {
      case "Not Started":
        return "Start Round";
      case "In Progress":
        return "Continue Round";
      case "Complete":
        return "View Round";
      default:
        return "Play Now"; // Default case, can be adjusted as needed
    }
  };

  const handlePlayNow = (roundId) => {
    router.push(`/location/${locationId}/league/${leagueId}/round/${roundId}`);
  };

  const getRoundStatus = (round) => {
    // Check if userScore exists
    if (round.userScore && round.userScore.players.length > 0) {
      // Check if any player has started scoring
      const anyScoresStarted = round.userScore.players.some(
        (player) => player.scores && Object.keys(player.scores).length > 0
      );

      if (!anyScoresStarted) {
        return "Not Started";
      }

      // Check if all players have complete scores for all holes
      const allScoresComplete = round.userScore.players.every(
        (player) =>
          player.scores &&
          Object.values(player.scores).every((score) => score > 0)
      );

      return allScoresComplete ? "Complete" : "In Progress";
    } else {
      return "Not Started";
    }
  };

  return (
    <div className="container mx-auto p-4 text-xs">
      <h1 className="text-2xl font-bold mb-4">League: {league.name}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rounds
          .sort((a, b) => a.name - b.name)
          .map((round) => (
            <div
              key={round.id}
              className="flex flex-col justify-between bg-slate-400 shadow-md rounded-lg p-4 border border-slate-400 text-slate-800"
            >
              <div className="">
                <h2 className="text-lg font-bold mb-2">{round.name}</h2>

                <div className="flex items-center text-xs mb-1 ml-0.5">
                  <MdGolfCourse className="w-7 h-7 mr-1" />
                  <p>
                    {round.course.name} | {round.course.nine}
                  </p>
                </div>
                <div className="flex items-center text-xs mb-1">
                  <MdOutlineDateRange className="w-7 h-7 mr-1" />

                  <p>{round.date}</p>
                </div>

                <div className="flex ml-0.5 items-center text-xs mb-1">
                  <GrStatusInfo className="w-6 h-6 mr-1" />
                  <p>
                  	{getRoundStatus(round)}
                  </p>
                </div>

                {round.userScore && (
                  <div className="mt-2">
                    <ul>{displayPlayers(round.userScore.players)}</ul>
                  </div>
                )}
              </div>
              <button
                onClick={() => handlePlayNow(round.id)}
                className={`mt-4 font-bold py-2 px-4 rounded w-full ${getButtonStyle(
                  getRoundStatus(round)
                )}`}
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
