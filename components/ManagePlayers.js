import React, { useState } from 'react';
import { addDoc, updateDoc, doc, collection, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import usePlayers from '../hooks/usePlayers';
import PlayerModal from './PlayerModal';

const ManagePlayers = ({ locationId, scorekeeper }) => {
  const players = usePlayers(locationId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  const openModal = (player = null) => {
    setEditingPlayer(player ? { ...player } : null);
    setModalOpen(true);
  };

  const handleModalSubmit = async (playerData) => {
    try {
      if (editingPlayer) {
        // Update existing player
        const playerRef = doc(db, `locations/${locationId}/players`, editingPlayer.id);
        await updateDoc(playerRef, playerData);
      } else {
        // Add new player
        await addDoc(collection(db, `locations/${locationId}/players`), playerData);
      }
    } catch (error) {
      console.error("Error updating player: ", error);
    } finally {
      setModalOpen(false);
      setEditingPlayer(null);
    }
  };

  const handleRemovePlayer = async (playerId) => {
    try {
      await deleteDoc(doc(db, `locations/${locationId}/players`, playerId));
    } catch (error) {
      console.error("Error removing player: ", error);
    }
  };

  return (
    <div className="p-4 bg-white">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage Players</h2>
      
      <table className="min-w-full bg-white overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Player Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Handicap</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {players.map(player => (
            <tr key={player.id}>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{player.displayName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">{player.hdcp}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                <button 
                  onClick={() => openModal(player)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleRemovePlayer(player.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button 
        onClick={() => openModal()}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mt-4"
      >
        Add Player
      </button>

      <PlayerModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSubmit={handleModalSubmit}
        initialData={editingPlayer || {}}
				scorekeeper={scorekeeper}
      />
    </div>
  );
};

export default ManagePlayers;
