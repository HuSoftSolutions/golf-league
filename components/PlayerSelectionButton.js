// PlayerSelectionButton.js
import React from "react";

const PlayerSelectionButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="mt-4 bg-blue-500 text-white p-2 rounded"
    >
      Edit Player Selection
    </button>
  );
};

export default PlayerSelectionButton;
