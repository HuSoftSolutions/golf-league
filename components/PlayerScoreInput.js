// PlayerScoreInput.js
import React from "react";

const PlayerScoreInput = ({ player, holeCount = 9 }) => {
  return (
    <div key={player.id} className="mb-4">
      <h4 className="font-semibold">{player.displayName}</h4>
      {Array.from({ length: holeCount }).map((_, holeIndex) => (
        <input
          key={holeIndex}
          type="number"
          placeholder={`Hole ${holeIndex + 1}`}
          className="mr-2 mb-2"
          // Add onChange handler as needed
        />
      ))}
    </div>
  );
};

export default PlayerScoreInput;
