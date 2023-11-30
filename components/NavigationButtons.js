// NavigationButtons.js
import React from "react";
import {FaArrowRight, FaArrowLeft} from 'react-icons/fa6';

const NavigationButtons = ({ currentHole, totalHoles, onNavigate }) => {
  return (
    <div className="navigation-buttons w-full flex justify-between items-center mt-8 mb-4 text-sm px-3">
      <FaArrowLeft className="w-10 h-6" onClick={() => onNavigate(-1)} />
        

			<span className="font-bold text-2xl">Hole {currentHole + 1}</span>
      <FaArrowRight className="w-10 h-6" onClick={() => onNavigate(1)} />

    </div>
  );
};

export default NavigationButtons;
