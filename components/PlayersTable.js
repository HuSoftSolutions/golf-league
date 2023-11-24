import React from 'react';
import usePlayers from '../hooks/usePlayers'; // Adjust the import path as needed

const PlayersTable = ({ locationId }) => {
  const players = usePlayers(locationId);

  return (
    <div className="overflow-x-auto">
      <h2 className="text-xl font-semibold text-white mb-4">Players</h2>
      <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Score</th>
            {/* Add more headers as needed */}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {players.map(player => (
            <tr key={player.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{player.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.score}</td>
              {/* Add more data cells as needed */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayersTable;
