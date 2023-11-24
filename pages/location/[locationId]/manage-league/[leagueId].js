import React, { useState } from 'react';
import { useRouter } from 'next/router';
import useRounds from '../../../../hooks/useRounds';
import useCourses from '../../../../hooks/useCourses'; // Import the custom hook for courses
import AddEditRoundModal from '../../../../components/AddEditRoundModal'; // Import the modal component
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig'; // Adjust the import path as needed
import ManagePlayers from '../../../../components/ManagePlayers';
import { useAuth } from '../../../../hooks/useAuth';

const ManageLeague = () => {
  const router = useRouter();
  const { locationId, leagueId } = router.query;
  const rounds = useRounds(locationId, leagueId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);
	const courses = useCourses(locationId)
	const {user} = useAuth();
	

  const handleEditRound = (round) => {
    setSelectedRound(round);
    setIsModalOpen(true);
  };

  const handleDeleteRound = async (roundId) => {
    if (window.confirm("Are you sure you want to delete this round?")) {
      try {
        await deleteDoc(doc(db, `locations/${locationId}/leagues/${leagueId}/rounds`, roundId));
      } catch (error) {
        console.error("Error deleting round: ", error);
      }
    }
  };

  return (
    <div className="overflow-x-auto p-4 bg-white text-xs">
      <div className="flex justify-between items-center mb-4">
				<button onClick={() => router.back()}>back</button>
        <h2 className="text-xl font-semibold text-gray-800">Rounds in League</h2>
        <button 
          onClick={() => {
            setIsModalOpen(true);
            setSelectedRound(null);
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Round
        </button>
      </div>

      {isModalOpen && (
        <AddEditRoundModal
          locationId={locationId}
          leagueId={leagueId}
          round={selectedRound}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRound(null);
          }}
        />
      )}
			<div className="my-10">

      <table className="min-w-full bg-white overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Round Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Course</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nine</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rounds.map(round => (
            <tr key={round.id}>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{round.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">{round.course?.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">{round.course?.nine}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">{round.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
							<button 
                  onClick={() => router.push(`/location/${locationId}/league/${leagueId}/round/${round.id}/results`)}
                  className="text-green-600 hover:text-green-900 mr-4"
                >
                  Results
                </button>
                <button 
                  onClick={() => router.push(`/location/${locationId}/league/${leagueId}/round/${round.id}`)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Enter
                </button>
                <button 
                  onClick={() => handleEditRound(round)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteRound(round.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
			</div>
			<ManagePlayers locationId={locationId} scorekeeper={user?.displayName} selectedRound={selectedRound} />

    </div>
  );
};

export default ManageLeague;
