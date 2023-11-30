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
import Confetti from "react-confetti";
import { FaPlus, FaMinus, FaPeopleGroup, FaArrowAltCircleLeft } from "react-icons/fa";
import useWindowDimensions from "../../../../../../hooks/useWindowDimensions";
import RoundCompletionModal from "../../../../../../components/RoundCompletionModal";

const RoundDetails = () => {
  const router = useRouter();
  const { locationId, leagueId, roundId } = router.query;
  const { user } = useAuth();
  const courses = useCourses(locationId);
  const players = usePlayers(locationId);
  const { selectedPlayers, setSelectedPlayers, hasUnsavedChanges, isLoading } = useUserScores(
    locationId,
    leagueId,
    roundId,
    user?.uid
  );

  const { width, height } = useWindowDimensions();
  const [roundDetails, setRoundDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentHole, setCurrentHole] = useState(0);
  const [holesLeft, setHolesLeft] = useState(9);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    const fetchRoundDetails = async () => {
      if (roundId) {
        const db = getFirestore();
        const roundRef = doc(db, `locations/${locationId}/leagues/${leagueId}/rounds`, roundId);
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

  useEffect(() => {
    const calculateCompletedHoles = () => {
      let completedHoles = 0;
      for (let i = 0; i < 9; i++) {
        if (selectedPlayers?.every((player) => player.scores[i] > 0)) {
          completedHoles++;
        }
      }
      return completedHoles;
    };

    const completedHoles = calculateCompletedHoles();
    setHolesLeft(9 - completedHoles);
  }, [selectedPlayers]);

  const handleNavigate = (direction) => {
    let nextSpot = currentHole + direction;
    if (nextSpot < 0) nextSpot = 8;
    else if (nextSpot > 8) nextSpot = 0;
    setCurrentHole(nextSpot);
  };

  const saveScores = async () => {
    try {
      const db = getFirestore();
      const userScoreRef = doc(db, `locations/${locationId}/leagues/${leagueId}/rounds/${roundId}/user-scores`, user?.uid);
      await setDoc(userScoreRef, { players: selectedPlayers }, { merge: true });
      // alert("Scores saved successfully");
    } catch (error) {
      console.error("Error saving scores:", error);
      alert("Error saving scores");
    }
  };

  const handleScoreUpdate = (playerId, change) => {
    setSelectedPlayers((prevPlayers) =>
      prevPlayers.map((player) => {
        if (player.id === playerId) {
          const currentScore = player.scores[currentHole] || 0;
          const newScore = Math.max(0, Math.min(12, currentScore + change));
          return { ...player, scores: { ...player.scores, [currentHole]: newScore } };
        }
        return player;
      })
    );
  };

  const renderScoreInputs = () => {
    if (!selectedPlayers?.length) {
      return <div className="w-full h-full bg-gray-200 rounded p-2 justify-center items-center flex text-black">No players added.</div>;
    }

    return (
      <>
        <NavigationButtons currentHole={currentHole} totalHoles={9} onNavigate={handleNavigate} />
        <div className="flex flex-col">
          {selectedPlayers.map((player) => (
            <div key={player.id} className="flex items-center justify-between py-1 border-t">
              <span className="text-xs font-medium">{player.displayName}</span>
              <div className="flex items-center">
                <button className="bg-gray-500 text-white rounded-l p-2 px-6" onClick={() => handleScoreUpdate(player.id, -1)} disabled={player.scores[currentHole] <= 0}>
                  <FaMinus className="w-5 h-5" />
                </button>
                <span className="p-2 w-[60px] text-4xl text-center">{player.scores[currentHole] || 0}</span>
                <button className="bg-gray-500 text-white rounded-r p-2 px-6" onClick={() => handleScoreUpdate(player.id, 1)} disabled={player.scores[currentHole] >= 12}>
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

  const courseName = courses.find((course) => course.id === roundDetails.course.id)?.name || "Unknown Course";

  return (
    <div className="flex flex-col w-full p-2 relative">
      <div className="flex justify-between items-center border-b pb-3">
        <FaArrowAltCircleLeft className="w-8 h-8" onClick={() => router.back()} />
				<button
                onClick={() => router.push(`/location/${locationId}/league/${leagueId}/round/${roundId}/results`)}
                className={`bg-blue-500 text-white p-2 rounded text-xs flex items-center`}
              >
                Results
              </button>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 text-white p-2 rounded text-xs flex items-center">
          Add Players
        </button>
      </div>
      <div className="flex w-full justify-between text-xs pt-2">
        <div>
          <div>{roundDetails.name}</div>
          <div>{courseName}</div>
          <div>{roundDetails.date}</div>
          <div>{roundDetails.nine}</div>
        </div>
        <button onClick={saveScores} disabled={!hasUnsavedChanges} className={`p-2 rounded text-xs ${hasUnsavedChanges ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500"}`}>
          Save Scores
        </button>
      </div>
      <div className="">{renderScoreInputs()}</div>
      <div className="fixed bottom-3 w-full justify-center flex">
        <span>Holes left: {holesLeft}</span>
      </div>
      {isModalOpen && (
        <PlayerSelectionModal scorekeeper={user?.displayName} players={players} selectedPlayers={selectedPlayers} setSelectedPlayers={setSelectedPlayers} onSave={() => setIsModalOpen(false)} onClose={() => setIsModalOpen(false)} />
      )}
      {showConfetti && <Confetti width={width} height={height} />}
      <RoundCompletionModal isOpen={showCompletionModal} onClose={() => setShowCompletionModal(false)} players={selectedPlayers} />
    </div>
  );
};

export default RoundDetails;
