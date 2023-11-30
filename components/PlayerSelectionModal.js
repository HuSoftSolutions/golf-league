import React from "react";
import Select from "react-select";

const PlayerSelectionModal = ({
  players,
  selectedPlayers,
  setSelectedPlayers,
  onSave,
  onClose,
}) => {
  const options = players.map((player) => ({
    value: player,
    label: player.displayName,
  }));

	const handleChange = (selectedOptions) => {
		// Create a map of existing players for quick lookup
		const existingPlayersMap = new Map(selectedPlayers.map(player => [player.id, player]));
	
		// Map over the newly selected players
		const updatedSelectedPlayers = selectedOptions.map(option => {
			const existingPlayer = existingPlayersMap.get(option.value.id);
	
			// If the player already exists, return the existing player data
			// Otherwise, initialize with default scores
			return existingPlayer || { ...option.value, scores: [0, 0, 0, 0, 0, 0, 0, 0, 0] };
		});
	
		setSelectedPlayers(updatedSelectedPlayers);
	};
	

	return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl overflow-y-auto h-2/3 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-4">Select Players</h3>
          <p className="text-sm text-gray-600 mb-6">
            Choose players for the round. You can select multiple players from the list below.
          </p>
          <Select
            isMulti
            options={options}
            value={selectedPlayers.map((player) => ({
              value: player,
              label: player.displayName,
            }))}
            onChange={handleChange}
            className="mb-4 text-black"
          />
        </div>
        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Close
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerSelectionModal;
