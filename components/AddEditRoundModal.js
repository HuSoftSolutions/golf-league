import React, { useState, useEffect } from 'react';
import { doc, addDoc, collection,updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Adjust the import path as needed
import useCourses from '../hooks/useCourses'; // Import the custom hook for fetching courses

const AddEditRoundModal = ({ locationId, leagueId, round, onClose }) => {
  const [roundName, setRoundName] = useState('');
  const [roundDate, setRoundDate] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const courses = useCourses(locationId); // Fetch courses for the dropdown

  useEffect(() => {
    // If editing an existing round, populate the form with its current data
    if (round) {
      setRoundName(round.name);
      setRoundDate(round.date);
      setSelectedCourse(JSON.stringify(round.course));
    }
  }, [round]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const roundData = {
      name: roundName,
      date: roundDate,
      course: JSON.parse(selectedCourse),
    };
		console.log(selectedCourse)

    try {
      if (round) {
        // Edit existing round
        await updateDoc(doc(db, `locations/${locationId}/leagues/${leagueId}/rounds`, round.id), roundData);
      } else {
        // Add new round
        await addDoc(collection(db, `locations/${locationId}/leagues/${leagueId}/rounds`), roundData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving round: ", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative mx-auto p-6 border w-full max-w-md shadow-lg rounded-md bg-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Round Name</label>
            <input
              type="text"
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={roundDate}
              onChange={(e) => setRoundDate(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a Course</option>
              {courses.map(course => (
                <option key={course.id} value={JSON.stringify(course)}>{course.name} ({course.nine})</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
            >
              {round ? 'Update Round' : 'Add Round'}
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

export default AddEditRoundModal;
