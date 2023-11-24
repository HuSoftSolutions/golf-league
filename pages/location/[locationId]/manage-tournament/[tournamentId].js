import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import TournamentForm from "../../../../components/TournamentForm";
import useAllCourses from "../../../../hooks/useAllCourses";
import { v4 as uuidv4 } from "uuid";
import { FiCopy } from "react-icons/fi";
import Navbar from "@/components/navbar";
import withAuth from "../../../../hocs/withAuth";
import useCourse from "../../../../hooks/useCourse";
import CopyToClipboardButton from "../../../../components/CopyToClipboard";

const ManageTournament = () => {
  const router = useRouter();
  const { tournamentId, locationId } = router.query;
  const [submitting, setSubmitting] = useState(false);

  const onBackupNavigate = useCallback(() => {
    router.push(`/location/${locationId}/manage-tournament/${tournamentId}/backups`);
  }, [router, tournamentId]);

  const {
    courses,
    loading: coursesLoading,
    error: coursesError,
  } = useAllCourses();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const course = useCourse(tournament?.courseId);

  const copyAccessCodeLink = useCallback(
    (accessCode) => {
      navigator.clipboard.writeText(
        `${window.location.origin}/location/${locationId}/tournament/${tournamentId}/team/${accessCode}`
      );
    },
    [tournamentId, locationId]
  );

  const areRequiredFieldsFilled = useCallback(() => {
    if (!tournament) return false;

    const requiredFields = ["name", "type"];

    return requiredFields.every((field) => !!tournament[field]);
  }, [tournament]);

  useEffect(() => {
    if (!tournamentId) return;

    const unsubscribe = onSnapshot(
      doc(db, "tournaments", tournamentId),
      (doc) => {
        if (!doc.exists()) {
          setError(new Error("Tournament not found."));
        } else {
          const t = { id: doc.id, ...doc.data() };

          t.teams.forEach((team, index) => {
            let tName = "";

            team.players.forEach((p, i) => {
              if (team.players.length === i + 1) {
                tName += p.name;
              } else {
                tName += `${p.name}, `;
              }
            });

            // Calculate team handciap and team name
            const teamHdcp = Math.ceil(
              team.players.reduce((accumulator, currentValue) => {
                return accumulator + parseInt(currentValue?.handicap || 0, 10);
              }, 0) * (parseInt(t?.teamSize) === 1 ? 1 : 0.1)
            );

            team["handicap"] = teamHdcp;
            team["name"] = tName;
          });

          setTournament(t);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup function to detach the listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, [tournamentId]);

  // Handle form input changes
  const onInputChange = useCallback(
    (field) => (event) => {
      if (field === "notifications") {
        const value = event.target.value;
        const notifications = value === "" ? [] : value.split("\n");
        setTournament({ ...tournament, notifications });
      }
			else if (field === "holeParOverrides") {
				const hole = event.target.getAttribute("data-hole");
				const value = event.target.value;
				const holeParOverrides = {
					...tournament.holeParOverrides,
					[hole]: value,
				};
				setTournament({ ...tournament, holeParOverrides });
			}
			else {
        setTournament({ ...tournament, [field]: event.target.value });
      }
    },
    [tournament]
  );

  const onScoringClosedChange = useCallback(
    (event) => {
      setTournament({
        ...tournament,
        scoringClosed: event.target.value === "true",
      });
    },
    [tournament]
  );

  const onSkinsChange = useCallback(
    (event) => {
      setTournament({
        ...tournament,
        showSkins: event.target.value === "true",
      });
    },
    [tournament]
  );

  const onShowNetChange = useCallback(
    (event) => {
      setTournament({
        ...tournament,
        showNet: event.target.value === "true",
      });
    },
    [tournament]
  );

  const onHideTeamLeaderboardChange = useCallback(
    (event) => {
      setTournament({
        ...tournament,
        hideTeamLeaderboard: event.target.value === "true",
      });
    },
    [tournament]
  );

  const onTeamsChange = useCallback(
    (index, field) => (event) => {
      setTournament({ ...tournament, teams: event.target.value });
    },
    [tournament]
  );

	const onTeamScoresUpdate = (team, scores) => {
		const updatedTeams = [...tournament.teams];

		const teamIndex = updatedTeams.findIndex(v => v.accessCode === team.accessCode)
		const updatedTeam = {...updatedTeams[teamIndex]}

		updatedTeam.scores = scores;

		updatedTeams[teamIndex] = updatedTeam;
		setTournament({ ...tournament, teams: updatedTeams });
	}

  const onTeamChange = useCallback(
    (index, field) => (event) => {
      const updatedTeams = [...tournament.teams];
      const updatedTeam = { ...updatedTeams[index] };

      console.log("fired", index, field);

      if (field === "startingHole") {
        updatedTeam[field] = parseInt(event.target.value, 10) || 1; // Convert to a number or set it to 1 by default
      } else if (field === "name") {
        updatedTeam[field] = event.target.value;
      } else {
        updatedTeam[field] = event.target.value;
      }

      updatedTeams[index] = updatedTeam;

      setTournament({ ...tournament, teams: updatedTeams });
    },
    [tournament]
  );

  const onPlayerChange = useCallback(
    (teamIndex, playerIndex, field) => (event) => {
      const updatedTeams = [...tournament.teams];
      const updatedTeam = { ...updatedTeams[teamIndex] };

      // If the team doesn't have a players array yet, initialize it
      if (!updatedTeam.players) {
        updatedTeam.players = [];
      }

      const updatedPlayer = updatedTeam.players[playerIndex]
        ? { ...updatedTeam.players[playerIndex] }
        : {}; // Initialize a new player if one doesn't exist at this index

      if (field === "handicap") {
        updatedPlayer[field] = parseInt(event.target.value);
      } else {
        updatedPlayer[field] = event.target.value;
      }

      updatedTeam.players[playerIndex] = updatedPlayer;

      // Calculate team handciap and team name
      const teamHdcp = Math.ceil(
        updatedTeam.players.reduce((accumulator, currentValue) => {

          return accumulator + parseInt(currentValue?.handicap || 0, 10);
        }, 0) * (parseInt(tournament?.teamSize) === 1 ? 1 : 0.1)
      );
      updatedTeam["handicap"] = teamHdcp;

      updatedTeams[teamIndex] = updatedTeam;

      setTournament({ ...tournament, teams: updatedTeams });
    },
    [tournament]
  );

  const onAddTeam = useCallback(() => {
    setTournament({
      ...tournament,
      teams: [
        ...tournament.teams,
        {
          name: "",
          accessCode: uuidv4(),
          startingHole: "",
          holeOrder: "A",
          handicap: "",
          scores: {},
          players: [],
          nickname: "",
          paid: false,
        },
      ],
    });
  }, [tournament]);

  const onAddTeams = useCallback((newTeams) => {
    setTournament((prevTournament) => {
      const updatedTeams = newTeams.map((team) => ({
        ...team,

        accessCode: uuidv4(),
        scores: {}, // Assuming you still want to initialize scores as an empty object
      }));

      return {
        ...prevTournament,
        teams: [...prevTournament.teams, ...updatedTeams],
      };
    });
  }, []);

  const onDeleteTeam = useCallback(
    (index) => {
      setTournament({
        ...tournament,
        teams: tournament.teams.filter((_, i) => i !== index),
      });
    },
    [tournament]
  );

  const onHoleSponsorChange = useCallback(
    (index, field) => (event) => {
      const updatedHoleSponsors = [...tournament.holeSponsors];
      const updatedHoleSponsor = { ...updatedHoleSponsors[index] };

      updatedHoleSponsor[field] = event.target.value;
      updatedHoleSponsors[index] = updatedHoleSponsor;

      setTournament({ ...tournament, holeSponsors: updatedHoleSponsors });
    },
    [tournament]
  );

  const onAddHoleSponsor = useCallback(() => {
    setTournament({
      ...tournament,
      holeSponsors: [
        ...tournament.holeSponsors,
        {
          name: "",
          logoUrl: "",
          // Add any other fields you have for a hole sponsor
        },
      ],
    });
  }, [tournament]);

  const onDeleteHoleSponsor = useCallback(
    (index) => {
      setTournament({
        ...tournament,
        holeSponsors: tournament.holeSponsors.filter((_, i) => i !== index),
      });
    },
    [tournament]
  );


	const handleSaveOverrides = (overrides) => {
		setTournament({
			...tournament,
			holeParOverrides: overrides,
		});
  };

  const onSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setSubmitting(true); // Set submitting state to true when saving

			tournament.teams = tournament.teams.sort((teamA, teamB) => {
				if (teamA.startingHole !== teamB.startingHole) {
					return teamA.startingHole - teamB.startingHole;
				} else {
					return teamA.holeOrder.localeCompare(teamB.holeOrder);
				}
			});

      try {
        // Save the tournament to the database
        await updateDoc(doc(db, "tournaments", tournamentId), tournament);

        // console.log(tournament);
        setSubmitting(false); // Set submitting state to false when finished saving
      } catch (err) {
        setSubmitting(false); // Set submitting state to false if an error occurs
        setError(err);
        console.log(tournament.teams);
      }
    },
    [tournament, tournamentId]
  );

  if (loading || coursesLoading) {
    return <div>Loading...</div>;
  }

  if (error || coursesError) {
    return <div>Error: {(error || coursesError).message}</div>;
  }

  return (
    <div>
      <Navbar></Navbar>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-5">
          <h1 className="text-xl font-medium text-gray-700 mb-0">Edit Event</h1>

          <div className="m-1">
            <CopyToClipboardButton tournamentId={tournament.id} />
          </div>
          <button
            className="border-primary-700 text-sm text-primary-700 font-medium border rounded-md hover:bg-gray-200 px-4 py-2 m-1"
            onClick={onBackupNavigate}
          >
            Backups
          </button>
          <button
            className={`border-primary-700 text-sm text-primary-700 font-medium border rounded-md hover:bg-gray-200 px-4 py-2 m-1 ${
              !areRequiredFieldsFilled() && "opacity-50 hover:bg-white"
            }`}
            onClick={() => router.push(`/location/${locationId}/tournament/${tournament.id}`)}
            disabled={!areRequiredFieldsFilled()} // Disable the button based on the function result
          >
            Event Leaderboard
          </button>
        </div>
        <div className="flex items-center justify-end ml-4">
          <label className="mr-4">Scoring Open:</label>
          <label
            htmlFor="scoringOpen"
            className="flex items-center cursor-pointer mr-4"
          >
            <input
              id="scoringOpen"
              name="scoringClosed"
              type="radio"
              value={false}
              checked={!tournament.scoringClosed}
              onChange={onScoringClosedChange}
              className="mr-2"
            />
            On
          </label>
          <label
            htmlFor="scoringClosed"
            className="flex items-center cursor-pointer"
          >
            <input
              id="scoringClosed"
              name="scoringClosed"
              type="radio"
              value={true}
              checked={tournament.scoringClosed}
              onChange={onScoringClosedChange}
              className="mr-2"
            />
            Off
          </label>
        </div>

        <div className="flex items-center justify-end ml-4">
          <label className="mr-4">Skins:</label>
          <label
            htmlFor="skinsOn"
            className="flex items-center cursor-pointer mr-4"
          >
            <input
              id="skinsOn"
              name="skins"
              type="radio"
              value={true}
              checked={tournament.showSkins}
              onChange={onSkinsChange}
              className="mr-2"
            />
            On
          </label>
          <label
            htmlFor="skinsOff"
            className="flex items-center cursor-pointer"
          >
            <input
              id="skinsOff"
              name="skins"
              type="radio"
              value={false}
              checked={!tournament.showSkins}
              onChange={onSkinsChange}
              className="mr-2"
            />
            Off
          </label>
        </div>

        <div className="flex items-center justify-end ml-4">
          <label className="mr-4">Show Net:</label>
          <label
            htmlFor="showNetOn"
            className="flex items-center cursor-pointer mr-4"
          >
            <input
              id="showNetOn"
              name="showNet"
              type="radio"
              value={true}
              checked={tournament.showNet}
              onChange={onShowNetChange}
              className="mr-2"
            />
            On
          </label>
          <label
            htmlFor="showNetOff"
            className="flex items-center cursor-pointer"
          >
            <input
              id="showNetOff"
              name="showNet"
              type="radio"
              value={false}
              checked={!tournament.showNet}
              onChange={onShowNetChange}
              className="mr-2"
            />
            Off
          </label>
        </div>

        <div className="flex items-center justify-end ml-4">
          <label className="mr-4">Hide Team Leaderboard:</label>
          <label
            htmlFor="hideTeamLeaderboardOn"
            className="flex items-center cursor-pointer mr-4"
          >
            <input
              id="hideTeamLeaderboardOn"
              name="hideTeamLeaderboard"
              type="radio"
              value={true}
              checked={tournament.hideTeamLeaderboard}
              onChange={onHideTeamLeaderboardChange}
              className="mr-2"
            />
            On
          </label>
          <label
            htmlFor="hideTeamLeaderboardOff"
            className="flex items-center cursor-pointer"
          >
            <input
              id="hideTeamLeaderboardOff"
              name="hideTeamLeaderboard"
              type="radio"
              value={false}
              checked={!tournament.hideTeamLeaderboard}
              onChange={onHideTeamLeaderboardChange}
              className="mr-2"
            />
            Off
          </label>
        </div>

        <TournamentForm
          tournament={{ ...tournament, course: course }}
          courses={courses}
          onSubmit={onSubmit}
          onInputChange={onInputChange}
          onTeamChange={onTeamChange}
          onTeamsChange={onTeamsChange}
          onAddTeam={onAddTeam}
          onAddTeams={onAddTeams}
          onDeleteTeam={onDeleteTeam}
          onPlayerChange={onPlayerChange}
          onHoleSponsorChange={onHoleSponsorChange}
          onAddHoleSponsor={onAddHoleSponsor}
          onDeleteHoleSponsor={onDeleteHoleSponsor}
          copyAccessCodeLink={copyAccessCodeLink}
					handleSaveOverrides={handleSaveOverrides}
					onTeamScoresUpdate={onTeamScoresUpdate}
        />

        {submitting && (
          <div className="flex items-center justify-center mt-4">
            {/* <Loader type="ThreeDots" color="#00BFFF" height={80} width={80} /> */}
            Submitting...
          </div>
        )}
      </div>
    </div>
  );
};

export default withAuth(ManageTournament, null);
