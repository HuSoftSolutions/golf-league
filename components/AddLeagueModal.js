import React, { useState, useEffect } from 'react';
import { doc, updateDoc, addDoc, collection, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Adjust the import path as needed

const generateLeagueCode = () => {
  return Math.random().toString().substr(2, 6);
};

const AddLeagueModal = ({ locationId, league, onClose }) => {
  const [leagueName, setLeagueName] = useState('');
  const [leagueCode, setLeagueCode] = useState('');

  useEffect(() => {
    if (league) {
      setLeagueName(league.name);
      setLeagueCode(league.code || generateLeagueCode());
    } else {
      setLeagueCode(generateLeagueCode());
    }
  }, [league]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const leagueData = { name: leagueName, code: leagueCode };

    try {
      let leagueId;
      if (league) {
        // Edit existing league
        const leagueRef = doc(db, `locations/${locationId}/leagues`, league.id);
        await updateDoc(leagueRef, leagueData);
        leagueId = league.id;
      } else {
        // Add new league
        const leagueRef = await addDoc(collection(db, `locations/${locationId}/leagues`), leagueData);
        leagueId = leagueRef.id;
      }

      // Update or add league code in a separate collection
      const codeRef = doc(db, "leagueCodes", leagueCode);
      await setDoc(codeRef, { locationId, leagueId });

      onClose();
    } catch (error) {
      console.error("Error saving league: ", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative mx-auto p-6 border w-full max-w-md shadow-lg rounded-md bg-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">League Name</label>
            <input
              type="text"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
						      <label className="block text-sm font-medium text-gray-700">League Code</label>
      <input
        type="text"
        value={leagueCode}
        readOnly
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
      />
          </div>
					
          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
            >
              {league ? 'Update League' : 'Add League'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeagueModal;
