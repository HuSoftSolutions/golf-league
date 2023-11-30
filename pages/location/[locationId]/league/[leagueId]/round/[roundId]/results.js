import React, { useEffect, useState } from "react";
import { collection, query, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../../../../../../firebaseConfig";
import { useRouter } from "next/router";
import useRound from "../../../../../../../hooks/useRound";
import FAQModal from "../../../../../../../components/FAQModal";
import {
  FaPlus,
  FaMinus,
  FaPeopleGroup,
  FaArrowAltCircleLeft,
} from "react-icons/fa";

const RoundResults = () => {
  const [scores, setScores] = useState([]);
  const [maxHoles, setMaxHoles] = useState(0);
  const router = useRouter();
  const { locationId, leagueId, roundId } = router.query;
  const { round, loading, error } = useRound(locationId, leagueId, roundId);
  const [sortCriteria, setSortCriteria] = useState("net"); // 'net' or 'gross'
  const [isFAQModalOpen, setFAQModalOpen] = useState(false);

  useEffect(() => {
    // const fetchScores = async () => {
    const scoresRef = collection(
      db,
      `locations/${locationId}/leagues/${leagueId}/rounds/${roundId}/user-scores`
    );
    const unsubscribe = onSnapshot(scoresRef, (querySnapshot) => {
      const scoresData = [];
      let holesCount = 0;

      querySnapshot.docs.forEach((doc) => {
        const scoreData = doc.data();
        scoreData.players.forEach((player) => {
          const playerScores = Object.values(player.scores); // Convert map to array of scores
          holesCount = Math.max(holesCount, playerScores.length);
          const totalScore = playerScores.reduce(
            (acc, score) => acc + score,
            0
          );
          const netScore = totalScore - player.hdcp;

          scoresData.push({
            scorekeeper: player.scorekeeper,
            player: player.displayName,
            hdcp: player.hdcp,
            playerScores,
            totalScore,
            netScore,
            selectedRound: player.selectedRound,
          });
        });
      });

      setScores(scoresData);
      setMaxHoles(holesCount);
    });

    return () => unsubscribe(); // Clean up the listener when the component unmounts
  }, [locationId, leagueId, roundId]);

  scores.sort((a, b) => {
    if (sortCriteria === "net") {
      return a.netScore - b.netScore;
    } else {
      return a.totalScore - b.totalScore;
    }
  });

  // Generate header for each hole
  const holeHeaders = [];
  for (let i = 1; i <= maxHoles; i++) {
    holeHeaders.push(
      <th
        key={i + "holeHdr"}
        className="uppercase tracking-wider text-center font-normal"
      >
        {round?.course?.nine === "back" ? i + 9 : i}
      </th>
    );
  }

  const calculateStrokesReceived = (hdcp, holeHdcpRanks) => {
    let strokesPerHole = new Array(holeHdcpRanks.length).fill(0);
    let sortedHoleRanks = [...holeHdcpRanks]
      .map((rank, index) => ({ rank, index }))
      .sort((a, b) => a.rank - b.rank);

    for (let i = 0; i < hdcp; i++) {
      strokesPerHole[sortedHoleRanks[i % holeHdcpRanks.length].index]++;
    }

    return strokesPerHole;
  };

  const calculateSkins = (scoresData) => {
    let skins = new Array(maxHoles).fill(null);
    for (let i = 0; i < maxHoles; i++) {
      let holeScores = scoresData.map((score) => score.playerScores[i]);

      // Check if all players have entered a score for this hole
      if (holeScores.every((score) => score !== undefined)) {
        let minScore = Math.min(...holeScores);
        if (
          holeScores.filter((score) => score === minScore && minScore > 0)
            .length === 1
        ) {
          skins[i] = holeScores.indexOf(minScore);
        }
      }
    }
    return skins;
  };

  const skins = calculateSkins(scores);

  const renderScoreWithStrokes = (
    score,
    hdcp,
    holeHdcpRanks,
    holeIndex,
    playerIndex
  ) => {
    const strokesReceived = calculateStrokesReceived(hdcp, holeHdcpRanks)[
      holeIndex
    ];
    const isSkin = skins[holeIndex] === playerIndex;
    const scoreClass = isSkin
      ? "bg-red-100 border border-red-400"
      : "text-gray-500";

    return (
      <td
        key={`${playerIndex}-${holeIndex}`}
        className={`p-2 whitespace-nowrap ${scoreClass} relative`}
      >
        {score}
        <div className="absolute bottom-0 right-0">
          {Array(strokesReceived)
            .fill(0)
            .map((_, idx) => (
              <span
                key={`${playerIndex}-${holeIndex}-hdcpDot-${idx}`}
                className="text-blue-500 text-[3px]"
              >
                ⬤
              </span>
            ))}
        </div>
      </td>
    );
  };

  return (
    <div className="overflow-x-auto p-4 text-xs flex justify-center items-center flex-col">
      <div className="flex w-full mb-4">
        <FaArrowAltCircleLeft
          className="w-8 h-8"
          onClick={() => router.back()}
        />
      </div>
      <div className="container flex flex-col">
        <div className="flex justify-between items-end w-full">
          <div className="pb-4 text-lg">
            <p>{round?.name}</p>
            <p className="text-xs">{round?.date}</p>
            <p className="text-xs">{round?.course?.name}</p>
          </div>

          <div className="flex w-full items-center justify-end pb-4">
            <span className="px-2">
              Sort: {sortCriteria === "net" ? "Net" : "Gross"}
            </span>
            <label className="switch">
              <input
                type="checkbox"
                checked={sortCriteria === "gross"}
                onChange={() =>
                  setSortCriteria(sortCriteria === "net" ? "gross" : "net")
                }
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
        <div className="bg-slate-500 flex justify-end p-1 text-white">
          <button onClick={() => setFAQModalOpen(true)}>FAQs</button>
        </div>
        <div className="w-full flex overflow-scroll text-black bg-white">
          <table className="bg-white text-center w-full mb-6">
            <thead className="text-gray-800 border-b bg-gray-200">
              <tr>
                <th
                  className="p-2 text-left text-xs font-medium uppercase tracking-wider"
                  rowSpan="3"
                >
                  Player
                </th>
                <th
                  className="p-2 text-left text-xs font-medium uppercase tracking-wider"
                  rowSpan="3"
                >
                  Scorer
                </th>
                <th
                  className="p-2 text-center text-xs font-medium uppercase tracking-wider"
                  rowSpan="3"
                >
                  HDCP
                </th>
                <td className="text-[8px]">HOLE</td>

                {holeHeaders}
                <th
                  className="p-2 text-center text-xs font-medium uppercase tracking-wider"
                  rowSpan="3"
                >
                  Gross
                </th>
                <th
                  className="p-2 text-center text-xs font-medium uppercase tracking-wider"
                  rowSpan="3"
                >
                  Net
                </th>
              </tr>
              <tr className="">
                <td className="text-[8px]">PAR</td>
                {round?.course?.holePars.map((par, idx) => (
                  <td key={`holePar-${idx}`} className="text-center text-xs">
                    {par}
                  </td>
                ))}
              </tr>
              <tr className="">
                <td className="text-[8px]">HDCP</td>
                {round?.course?.holeHdcps.map((hdcp, idx) => (
                  <td key={idx + "hdcp"} className="text-center text-xs">
                    {hdcp}
                  </td>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scores?.length === 0 && (
                <tr>
                  <td
                    className="py-6 text-4xl uppercase text-slate-800"
                    colSpan={12}
                  >
                    No scores entered yet
                  </td>
                </tr>
              )}

              {scores.map((score, playerIndex) => (
                <tr key={score.playerId || `score-${playerIndex}`}>
                  <td className="p-2 whitespace-nowrap font-medium text-gray-900 text-left">
                    {score.player}
                  </td>
                  <td className="p-2 whitespace-nowrap text-gray-500 text-left">
                    {score.scorekeeper}
                  </td>
                  <td className="p-2 whitespace-nowrap text-gray-500 text-center">
                    {score.hdcp}
                  </td>
                  <td></td>
                  {score.playerScores.map((playerScore, holeIndex) =>
                    renderScoreWithStrokes(
                      playerScore,
                      score.hdcp,
                      round?.course?.holeHdcps,
                      holeIndex,
                      playerIndex
                    )
                  )}

                  <td className="p-2 whitespace-nowrap text-gray-500">
                    {score.totalScore}
                  </td>
                  <td className="p-2 whitespace-nowrap text-gray-500">
                    {score.netScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <FAQModal
        isOpen={isFAQModalOpen}
        onClose={() => setFAQModalOpen(false)}
      />
    </div>
  );
};

export default RoundResults;
