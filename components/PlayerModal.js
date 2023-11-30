import React, { useState, useEffect } from 'react';

const PlayerModal = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const [playerData, setPlayerData] = useState({ displayName: '', hdcp: 0, email: '' });

  useEffect(() => {
    setPlayerData(initialData.id ? initialData : { displayName: '', hdcp: 0, email: ''});
  }, [initialData]);

  const handleChange = (e) => {
    setPlayerData({ ...playerData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSubmit(playerData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full text-black">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-semibold">{initialData.id ? 'Edit Player' : 'Add Player'}</h3>
        <div className="my-2">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="displayName">
            Player Name
          </label>
          <input
            name="displayName"
            value={playerData.displayName}
            onChange={handleChange}
            placeholder="Player Name"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="my-2">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="hdcp">
            Handicap
          </label>
          <input
            name="hdcp"
            type="number"
            value={playerData.hdcp}
            onChange={handleChange}
            placeholder="Handicap"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="my-2">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            name="email"
            type="email"
            value={playerData.email}
            onChange={handleChange}
            placeholder="Email"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mr-2">Cancel</button>
          <button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Submit</button>
        </div>
      </div>
    </div>
  );
};

export default PlayerModal;
