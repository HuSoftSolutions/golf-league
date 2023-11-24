import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { runTransaction, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../../../firebaseConfig";
import GolfLeaderboard from "../../../../../../components/GolfLeaderboard";
import { BsArrowRightCircle, BsArrowLeftCircle } from "react-icons/bs";
import useCourse from "../../../../../../hooks/useCourse";
import {
  AiOutlinePlusCircle,
  AiOutlineMinusCircle,
  AiOutlineCloseCircle,
} from "react-icons/ai";
import { FiAlertTriangle } from "react-icons/fi";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Confetti from "react-dom-confetti";
import BackToHome from "../../../../../../components/BackToHome";
import Modal from "react-modal";
import RoundSummaryModal from "../../../../../../components/team-score-components/RoundSummaryModal";
// import TestTable from "../../../../components/TestTable";
import Navbar from "../../../../../../components/navbar";

const TeamScore = () => {
  const confettiConfig = {
    angle: 90,
    spread: 360,
    startVelocity: 40,
    elementCount: 70,
    dragFriction: 0.12,
    duration: 3000,
    stagger: 3,
    colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
  };
  const router = useRouter();
  const [scoringClosed, setScoringClosed] = useState(false);

  const [isConfettiActive, setIsConfettiActive] = useState(false);

  const [team, setTeam] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [saving, setSaving] = useState(false);
  const [remainingHoles, setRemainingHoles] = useState(18);
  const { tournamentId, accessCode } = router.query;
  const course = useCourse(tournament?.courseId);

  const [curHolePar, setCurHolePar] = useState(null);

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const getCurrentHoleFromLocalStorage = () => {
    return (
      parseInt(
        localStorage.getItem(`currentHole:${tournamentId}:${accessCode}`)
      ) || team.startingHole
    );
  };

  const [currentHole, setCurrentHole] = useState(
    team ? getCurrentHoleFromLocalStorage() : null
  );

  const getHolePar = (holeIndex) => {
    if (tournament && course) {
      const holePar = course.holePars[holeIndex - 1];
      return holePar;
    }
    return "";
  };

  const [score, setScore] = useState(0);
  const [view, setView] = useState("teamScore"); // Possible values: "teamScore" and "golfLeaderboard"
  const [isScoreChanged, setIsScoreChanged] = useState(false);

  const holeScore = team ? team.scores[currentHole] || 0 : 0;

  const calculateRemainingHoles = (teamData, tournamentType) => {
    const scores = teamData.scores;
    const nonZeroScores = Object.values(scores).filter((score) => score !== 0);
    const totalHoles =
      tournamentType === "F9" || tournamentType === "B9" ? 9 : 18;
    const holesRemaining = totalHoles - nonZeroScores.length;
    return Math.max(holesRemaining, 0); // Ensure remaining holes are never negative
  };

  const getTeamData = async () => {
    try {
      const tournamentDoc = await getDoc(doc(db, "tournaments", tournamentId));
      const tournamentData = tournamentDoc.data();

      const teamData = tournamentData.teams.find(
        (team) => team.accessCode === accessCode
      );

      if (!teamData) {
        throw new Error("Team not found");
      }

      setTournament(tournamentData);
      setTeam(teamData);
      setCurrentHole(teamData.startingHole);

      // Calculate remaining holes and update the state
      const holesRemaining = calculateRemainingHoles(
        teamData,
        tournamentData.type
      );
      setRemainingHoles(holesRemaining);

      localStorage.setItem(
        `recentPlayed:${tournamentId + accessCode}`,
        JSON.stringify({ tournamentId, accessCode, team: teamData.name })
      );
    } catch (error) {
      console.error("Error fetching team data:", error);
    }
  };

  useEffect(() => {
    if (tournamentId) {
      const unsubscribe = onSnapshot(
        doc(db, "tournaments", tournamentId),
        (docSnapshot) => {
          const updatedTournamentData = docSnapshot.data();
          setScoringClosed(updatedTournamentData.scoringClosed);
        },
        (error) => {
          console.error("Error listening for updates:", error);
        }
      );

      // Unsubscribe from the listener when the component is unmounted
      return () => {
        unsubscribe();
      };
    }
  }, [tournamentId]);

  useEffect(() => {
    if (team && course) {
      const curHole = getCurrentHoleFromLocalStorage();
      setCurrentHole(curHole);
      setCurHolePar(getHolePar(curHole));
    }
  }, [team, course, currentHole]);

  useEffect(() => {
    if (tournamentId && accessCode) {
      getTeamData();
    }
  }, [tournamentId, accessCode]);

  useEffect(() => {
    setScore(holeScore);
  }, [holeScore]);

  useEffect(() => {
    if (team && tournamentId && accessCode) {
      setCurrentHole(getCurrentHoleFromLocalStorage());
    }
  }, [team, tournamentId, accessCode]);

  const incrementScore = () => {
    if (saving) return;

    if (score < 9) {
      setScore(score + 1);
      setIsScoreChanged(true);
    }
  };

  const decrementScore = () => {
    if (saving) return;

    if (score > 0) {
      setScore(score - 1);
      setIsScoreChanged(true);
    }
  };

  const changeHole = async (direction) => {
    // Save the current hole's score before changing the hole if it has changed
    if (saving) return;

    if (isScoreChanged) {
      await saveScore();
    }

    let newHole = currentHole;
    const frontNineMax = 9;
    const backNineMin = 10;
    const maxHole = tournament.type === "F9" ? frontNineMax : 18;
    const minHole = tournament.type === "B9" ? backNineMin : 1;

    if (direction === "next") {
      newHole = currentHole === maxHole ? minHole : currentHole + 1;
    } else if (direction === "prev") {
      newHole = currentHole === minHole ? maxHole : currentHole - 1;
    }

    setCurrentHole(newHole);
    localStorage.setItem(`currentHole:${tournamentId}:${accessCode}`, newHole);
    setScore(team.scores[newHole] || 0);
  };

  const saveScore = async () => {
    if (scoringClosed === true) return;

    setSaving(true);
    const newScores = { ...team.scores, [currentHole]: score }; // Update the current hole's score

    try {
      await runTransaction(db, async (transaction) => {
        const tournamentDoc = await transaction.get(
          doc(db, "tournaments", tournamentId)
        );
        const tournamentData = tournamentDoc.data();
        const teamIndex = tournamentData.teams.findIndex(
          (t) => t.accessCode === accessCode
        );

        const updatedTeams = [...tournamentData.teams];
        updatedTeams[teamIndex].scores = newScores;

        transaction.update(doc(db, "tournaments", tournamentId), {
          teams: updatedTeams,
        });
      });

      setIsScoreChanged(false);

      // Update the local team state
      setTeam((prevTeam) => {
        return { ...prevTeam, scores: newScores };
      });

      // Calculate remaining holes and update the state
      const holesRemaining = calculateRemainingHoles(
        {
          ...team,
          scores: newScores,
        },
        tournament.type
      );
      setRemainingHoles(holesRemaining);

      if (holesRemaining === 0) {
        toast.success("Congratulations on completing your round!");
        setIsSummaryModalOpen(true); // Open the summary modal
        setIsConfettiActive(true); // Activate confetti animation
      } else {
        setIsConfettiActive(false); // Deactivate confetti animation
      }
    } catch (error) {
      console.error("Error updating score:", error);
      toast.error("Error saving score. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleViewChange = async () => {
    if (isScoreChanged) {
      await saveScore();
    }
    setView(view === "teamScore" ? "golfLeaderboard" : "teamScore");
  };

  if (!team || !tournament || currentHole === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col w-full items-center text-primary-600 h-screen bg-white">
      <div className="w-full h-full flex flex-col">
        <Navbar>
          {!tournament?.hideTeamLeaderboard ? (
            <button
              className="text-sm text-white font-medium text-center"
              onClick={handleViewChange}
            >
              {view === "teamScore" ? "View Leaderboard" : "Go To Score Entry"}
            </button>
          ) : null}
        </Navbar>

        {view === "teamScore" ? (
          <div className="flex flex-col justify-between items-center py-5 text-center w-full">
            
						{tournament?.notifications?.length ? (
        <div className=" text-primary-800 font-bold text-center text-lg w-full h-fit mb-4">
          {tournament.notifications.map((not, notIndex) => {
            return <p key={notIndex}>{not}</p>;
          })}
        </div>
      ) : null}
						
						{saving ? (
              <div className="fixed bottom-0 right-0 h-[75px] text-white bg-primary-600 text-bold py-2 w-full text-center text-lg z-10 flex justify-center items-center">
                Saving score...
              </div>
            ) : null}
            {view === "teamScore" ? (
              <div className="flex justify-center text-center">
                <p className="text-center text-xs">{team.name}</p>
              </div>
            ) : null}

            <div className="mt-3 flex flex-row justify-center items-center">
              <button
                className="text-primary-600 rounded text-3xl"
                onClick={() => changeHole("prev")}
              >
                <BsArrowLeftCircle className="w-10 h-10" />
              </button>
              <div>
                <h3 className="text-5xl text-center px-6">
                  HOLE {currentHole}
                </h3>
              </div>

              <button
                className="text-primary-600 rounded text-3xl"
                onClick={() => changeHole("next")}
              >
                <BsArrowRightCircle className="w-10 h-10" />
              </button>
            </div>
            {
              <p className="w-full text-center h-[25px]">
                {curHolePar && `Par ${curHolePar}`}
              </p>
            }
            <div className="sm:mt-8 flex flex-row justify-center items-center">
              <button
                className={`text-primary-600 rounded text-3xl ${
                  score <= 0 ? "opacity-50" : ""
                }`}
                onClick={decrementScore}
              >
                <AiOutlineMinusCircle className="w-10 h-10" />
              </button>
              <h3 className="text-[125px] xs:text-[150px] text-center px-6  min-w-[175px]">
                {score}
              </h3>
              <button
                className={`text-primary-600 rounded text-3xl ${
                  score >= 9 ? "opacity-50" : ""
                }`}
                onClick={incrementScore}
              >
                <AiOutlinePlusCircle className="w-10 h-10" />
              </button>
            </div>
            <div className="flex justify-center w-full">
              {scoringClosed === true ? (
                <span className="flex items-center text-lg bg-red-500 py-2 px-3 text-white font-bold rounded">
                  <FiAlertTriangle className="w-6 h-6 text-red-200 mr-2" />
                  Scoring is Closed
                </span>
              ) : (
                <button
                  className={`border-primary-600 border text-primary py-2 px-4 rounded w-fit sm:mt-8 hover:bg-primary-600 hover:text-white ${
                    !isScoreChanged ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={saveScore}
                  disabled={!isScoreChanged}
                >
                  Save Score
                </button>
              )}
            </div>
            {remainingHoles === 0 ? (
              <div className="flex flex-col mt-10 w-full text-center rounded p-2 py-5 text-primary-600">
                <span className="text-2xl">Round Complete!</span>
                <span className="text-xs">Please review your scores</span>
              </div>
            ) : (
              <div className="mt-10">
                <h2 className="text-xl text-center fixed bottom-0 left-0 w-full text-primary-600 font-medium pb-2">
                  Holes Left: {remainingHoles}
                </h2>
                <p className="text-3xl"></p>
              </div>
            )}
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 1000,
                pointerEvents: "none",
              }}
            >
              <Confetti active={isConfettiActive} config={confettiConfig} />
            </div>
          </div>
        ) : (
          <div className="">
            {/* <TestTable /> */}
            <GolfLeaderboard tournamentId={tournament.id} teamMode={true} />
          </div>
        )}

        <ToastContainer />
        <RoundSummaryModal
          isOpen={isSummaryModalOpen}
          onRequestClose={() => setIsSummaryModalOpen(false)}
          scores={team.scores}
          roundType={tournament.type}
        />
      </div>
    </div>
  );
};

export default TeamScore;
