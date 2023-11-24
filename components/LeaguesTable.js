// components/LeaguesTable.js
import React, { useState } from 'react';
import { useRouter } from 'next/router'; // Import useRouter from next/router
import AddLeagueModal from './AddLeagueModal';
import useLeagues from '../hooks/useLeagues';

const LeaguesTable = ({ locationId }) => {
  const { leagues, deleteLeague } = useLeagues(locationId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const router = useRouter(); // Initialize useRouter

  const handleEditLeague = (league) => {
    setSelectedLeague(league);
    setIsModalOpen(true);
  };

  const handleViewLeague = (leagueId) => {
    router.push(`/location/${locationId}/manage-league/${leagueId}`); // Redirect to the league page
  };

  return (
    <div className="overflow-x-auto mb-8">
      <div className="flex justify-between items-center my-4">
        <h2 className="text-xl font-semibold text-white">Leagues</h2>
        <button 
          onClick={() => {
            setIsModalOpen(true);
            setSelectedLeague(null);
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New League
        </button>
      </div>

      {isModalOpen && (
        <AddLeagueModal
          locationId={locationId}
          league={selectedLeague}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedLeague(null);
          }}
        />
      )}

      <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Details</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leagues.map(league => (
            <tr key={league.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{league.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{league.details}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  onClick={() => handleViewLeague(league.id)}
                  className="text-gray-400 hover:text-indigo-900 mr-4"
                >
                  VIEW
                </button>
                <button 
                  onClick={() => handleEditLeague(league)}
                  className="text-gray-400 hover:text-indigo-900 mr-4"
                >
                  EDIT
                </button>
								<button 
                  onClick={() => deleteLeague(league.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  DELETE
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaguesTable;
