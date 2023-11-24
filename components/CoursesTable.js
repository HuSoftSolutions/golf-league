import React, { useState } from 'react';
import AddCourseModal from './AddCourseModal';
import useCourses from '../hooks/useCourses'; // Import the custom hook

const CoursesTable = ({ locationId }) => {
  const courses = useCourses(locationId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  return (
    <div className="overflow-x-auto my-4">
      <div className="flex justify-between items-center my-4">
        <h2 className="text-xl font-semibold text-white">Courses</h2>
        <button 
          onClick={() => {
            setIsModalOpen(true);
            setSelectedCourse(null);
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Course
        </button>
      </div>

      {isModalOpen && (
        <AddCourseModal
          locationId={locationId}
          course={selectedCourse}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCourse(null);
          }}
        />
      )}

      <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Course Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nine</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Hole HDCPs</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Hole Pars</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {courses.map(course => (
            <tr key={course.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.nine}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.holeHdcps.join(', ')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.holePars.join(', ')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a href="#" onClick={() => handleEditCourse(course)} className="text-gray-400 hover:text-indigo-900">
									EDIT
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CoursesTable;
