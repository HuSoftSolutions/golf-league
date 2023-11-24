// pages/tournament/[tournamentId].js
import { useRouter } from "next/router";

import { useState } from "react";
import BackToHome from "../../../../components/BackToHome";
import GolfLeaderboard from "../../../../components/GolfLeaderboard";

const TournamentPage = () => {
  const router = useRouter();
  const { tournamentId } = router.query;

  return (
    <div className="flex flex-col w-full h-full bg-white">
      <div className="p-3">
        {/* <BackToHome /> */}
      </div>
      <GolfLeaderboard tournamentId={tournamentId} />
    </div>
  );
};

export default TournamentPage;
