// AddCourseModal.js
import React, { useState, useEffect } from "react";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Adjust the import path as needed

const AddCourseModal = ({ locationId, course, onClose }) => {
	const [courseName, setCourseName] = useState("");
  const [nine, setNine] = useState("front");
  const [holeHdcps, setHoleHdcps] = useState(new Array(9).fill(''));
  const [holePars, setHolePars] = useState(new Array(9).fill(''));

  useEffect(() => {
    if (course) {
      setCourseName(course.name);
      setNine(course.nine);
      setHoleHdcps(course.holeHdcps);
      setHolePars(course.holePars);
    }
  }, [course]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (courseName.trim() === "" || nine.trim() === "") {
      alert("Please fill out all fields.");
      return;
    }

    if (!holeHdcps.every(h => h !== '' && !isNaN(h)) ||
        !holePars.every(p => p !== '' && !isNaN(p))) {
      alert("Please fill out all fields with valid numbers.");
      return;
    }

    try {
      const courseData = {
        name: courseName,
        nine,
        holeHdcps: holeHdcps.map(Number),
        holePars: holePars.map(Number),
      };

      if (course) {
        // Update existing course
        await updateDoc(doc(db, `locations/${locationId}/courses`, course.id), courseData);
      } else {
        // Add new course
        await addDoc(collection(db, `locations/${locationId}/courses`), courseData);
      }
      onClose();
    } catch (error) {
      console.error("Error adding/editing course: ", error);
    }
  };

  const handleHoleChange = (index, value, type) => {
    const updatedValue = value.replace(/^0+/, '') || "0";
    if (type === "hdcp") {
      const newHoleHdcps = [...holeHdcps];
      newHoleHdcps[index] = updatedValue;
      setHoleHdcps(newHoleHdcps);
    } else {
      const newHolePars = [...holePars];
      newHolePars[index] = updatedValue;
      setHolePars(newHolePars);
    }
  };
	
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative mx-auto p-6 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Course Name
            </label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Course Name"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nine
            </label>
            <select
              value={nine}
              onChange={(e) => setNine(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="front">Front</option>
              <option value="back">Back</option>
            </select>
          </div>

					<div className="space-y-2">
            {holeHdcps.map((_, index) => (
              <div key={index} className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 w-16">
                  Hole {index + 1}
                </label>
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-gray-700">Hdcp</label>
                  <input
                    type="number"
                    value={holeHdcps[index]}
                    onChange={(e) =>
                      handleHoleChange(index, e.target.value, "hdcp")
                    }
                    className="px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-gray-700">Par</label>
                  <input
                    type="number"
                    value={holePars[index]}
                    onChange={(e) =>
                      handleHoleChange(index, e.target.value, "par")
                    }
                    className="px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
            >
              Save Course
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

export default AddCourseModal;
