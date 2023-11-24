import React from 'react';

const HoleScoreInput = ({ players, holeNumber, onScoreChange }) => {
  const handleScoreUpdate = (playerId, change) => {
    // Implement logic to update the score
    // Ensure the score stays within the 0-12 range
  };

  return (
    <div className="flex flex-col space-y-4">
      {players.map(player => (
        <div key={player.id} className="flex items-center justify-between">
          <span className="text-lg font-medium">{player.displayName}</span>
          <div className="flex items-center">
            <button
              className="bg-red-500 text-white p-2 rounded-l"
              onClick={() => handleScoreUpdate(player.id, -1)}
              disabled={player.scores?.[holeNumber] && player.scores?.[holeNumber] <= 0}
            >
              -
            </button>
            <span className="px-4 py-2 border-t border-b">
              {player.scores?.[holeNumber]}
            </span>
            <button
              className="bg-green-500 text-white p-2 rounded-r"
              onClick={() => handleScoreUpdate(player.id, 1)}
              disabled={player.scores?.[holeNumber] && player.scores[holeNumber] >= 12}
            >
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HoleScoreInput;
