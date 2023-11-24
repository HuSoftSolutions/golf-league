import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { useAuth } from "../../../../../../hooks/useAuth";
import useCourses from "../../../../../../hooks/useCourses";
import usePlayers from "../../../../../../hooks/usePlayers";
import useUserScores from "../../../../../../hooks/useUserScores";
import PlayerSelectionModal from "../../../../../../components/PlayerSelectionModal";
import NavigationButtons from "../../../../../../components/NavigationButtons";
import Confetti from "react-confetti"; // Import confetti package
import { FaPlus, FaMinus, FaPeopleGroup, FaTrophy } from "react-icons/fa6";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import withAuth from "../../../../../../hocs/withAuth";

const RoundDetails = () => {
  const router = useRouter();
  const { locationId, leagueId, roundId } = router.query;
  const { user } = useAuth();
  const courses = useCourses(locationId);
  const players = usePlayers(locationId);
  const { userScores, isLoading } = useUserScores(
    locationId,
    leagueId,
    roundId,
    user?.uid
  );
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [roundDetails, setRoundDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentHole, setCurrentHole] = useState(0);
  const [holesLeft, setHolesLeft] = useState(9); // Total number of holes
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    if (holesLeft === 0) {
      setShowConfetti(true);
      setShowCompletionModal(true);
    }
  }, [holesLeft]);

	useEffect(() => {
    const completedHoles = calculateCompletedHoles();
    setHolesLeft(9 - completedHoles); // Assuming 9 holes in total
    if (completedHoles === 9) {
        setShowConfetti(true);
        setShowCompletionModal(true);
    }
}, [currentHole]);

useEffect(() => {
	const completedHoles = calculateCompletedHoles();
	setHolesLeft(9 - completedHoles);
}, [selectedPlayers]); // Runs only when selectedPlayers changes, i.e., on component mount



  useEffect(() => {
    if (!userScores && players.length > 0 && user) {
      setIsModalOpen(true);
    }
  }, [userScores, players, user]);

  useEffect(() => {
    const fetchUserScores = async () => {
      if (roundId && user) {
        try {
          const db = getFirestore();
          const userScoreRef = doc(
            db,
            `locations/${locationId}/leagues/${leagueId}/rounds/${roundId}/user-scores`,
            user?.uid
          );
          const userScoreSnap = await getDoc(userScoreRef);

          if (userScoreSnap.exists()) {
            const userScoreData = userScoreSnap.data();
            if (userScoreData.players && userScoreData.players.length > 0) {
              setSelectedPlayers(
                userScoreData.players.map((player) => ({
                  ...player,
                  scores: player.scores || {},
                }))
              );
            }
          }
        } catch (error) {
          console.error("Error fetching user scores:", error);
        }
      }
    };

    fetchUserScores();
  }, [roundId, user, locationId, leagueId]);

  useEffect(() => {
    const fetchRoundDetails = async () => {
      if (roundId) {
        const db = getFirestore();
        const roundRef = doc(
          db,
          `locations/${locationId}/leagues/${leagueId}/rounds`,
          roundId
        );
        const roundSnap = await getDoc(roundRef);

        if (roundSnap.exists()) {
          setRoundDetails(roundSnap.data());
        } else {
          console.log("No such round!");
        }
      }
    };

    fetchRoundDetails();
  }, [locationId, leagueId, roundId]);

  const openModalForEditing = () => {
    setIsModalOpen(true);
  };

	const calculateCompletedHoles = () => {
    let completedHoles = 0;
    for (let i = 0; i < 9; i++) {
        if (selectedPlayers.every(
            (player) => player.scores[i] > 0
        )) {
            completedHoles++;
        }
    }
    return completedHoles;
};



  const handleSavePlayers = async () => {
    try {
      const db = getFirestore();
      const userScoreRef = doc(
        db,
        `locations/${locationId}/leagues/${leagueId}/rounds/${roundId}/user-scores`,
        user?.uid
      );
      await setDoc(userScoreRef, { players: selectedPlayers }, { merge: true });
      alert("Players saved successfully");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving players:", error);
      alert("Error saving players");
    }
  };

  const handleNavigate = async (direction) => {
    await saveScores();
    let nextSpot = currentHole + direction;
    console.log(nextSpot);
    if (nextSpot < 0) nextSpot = 8;
    else if (nextSpot > 8) nextSpot = 0;

    setCurrentHole(nextSpot);
  };

  const saveScores = async () => {
    try {
      const db = getFirestore();
      const userScoreRef = doc(
        db,
        `locations/${locationId}/leagues/${leagueId}/rounds/${roundId}/user-scores`,
        user?.uid
      );
      await setDoc(userScoreRef, { players: selectedPlayers }, { merge: true });
    } catch (error) {
      console.error("Error saving scores:", error);
    }
  };

  const handleScoreUpdate = (playerId, change) => {
    setSelectedPlayers((prevPlayers) =>
      prevPlayers.map((player) => {
        if (player.id === playerId) {
          const currentScore = player.scores[currentHole] || 0;
          const newScore = Math.max(0, Math.min(12, currentScore + change));
          const newScores = { ...player.scores, [currentHole]: newScore };
          return { ...player, scores: newScores };
        }
        return player;
      })
    );
  };

  const renderScoreInputs = () => {
    if (selectedPlayers.length === 0) {
      return (
        <div className="w-full h-full bg-gray-200 rounded p-2 justify-center items-center flex">
          No players added.
        </div>
      );
    }

    return (
      <>
        <NavigationButtons
          currentHole={currentHole}
          totalHoles={9} // Adjust based on the total number of holes
          onNavigate={handleNavigate}
        />
        <div className="flex flex-col">
          {selectedPlayers.map((player) => (
            <div key={player.id} className="flex items-center justify-between py-4 border-t">
              <span className="text-xs font-medium">{player.displayName}</span>
              <div className="flex items-center">
                <button
                  className="bg-gray-500 text-white rounded-l p-2 px-6"
                  onClick={() => handleScoreUpdate(player.id, -1)}
                  disabled={player.scores[currentHole] <= 0}
                >
                  <FaMinus className="w-5 h-5" />

                </button>
                <span className="p-2 w-[60px] text-center">
                  {player.scores[currentHole] || 0}
                </span>
                <button
                  className="bg-gray-500 text-white rounded-r p-2 px-6"
                  onClick={() => handleScoreUpdate(player.id, 1)}
                  disabled={player.scores[currentHole] >= 12}
                >
                  <FaPlus className="w-5 h-5" />
                  
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!roundDetails) {
    return <div>Loading round details...</div>;
  }

  const courseName =
    courses.find((course) => course.id === roundDetails.course.id)?.name ||
    "Unknown Course";

  return (
    <div className="flex flex-col w-full p-2 relative">
      <div className="flex justify-between items-center border-b pb-3">
				<FaArrowAltCircleLeft className="w-8 h-8" onClick={() => router.back()}/>
        
        
          <button
            onClick={openModalForEditing}
            className="bg-blue-500 text-white p-2 rounded text-xs"
          >
            <FaPeopleGroup className="w-5 h-5"/>
          </button>
        
      </div>
      <div className=" text-xs pt-2">
        {/* ... existing round details ... */}
        <div>{roundDetails.name}</div>
        <div>{courseName}</div>
        <div>{roundDetails.date}</div>
        <div>{roundDetails.nine}</div>
      </div>

      <div className="">{renderScoreInputs()}</div>
      <div className="fixed bottom-3 w-full justify-center flex">
        <span>Holes left: {holesLeft}</span>
      </div>

      {isModalOpen && (
        <PlayerSelectionModal
          players={players}
          selectedPlayers={selectedPlayers}
          setSelectedPlayers={setSelectedPlayers}
          onSave={handleSavePlayers}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default RoundDetails;
