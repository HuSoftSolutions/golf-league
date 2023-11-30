const RoundCompletionModal = ({ isOpen, onClose, players }) => {
  if (!isOpen) return null;

  const calculateTotalScore = (scores) => Object.values(scores).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-10 px-4">
      <div className="bg-white p-4 rounded-lg max-w-md w-full shadow-lg text-slate-800">
        <h2 className="text-xl font-bold text-center mb-4">Round Complete!</h2>
        <div className="overflow-auto max-h-[60vh] text-xs">
          {players.map((player) => (
            <div key={player.id} className="mb-4">
              <div className="flex justify-between items-center border-b py-2">
                <span className="font-medium">{player.displayName}</span>
                <span className="font-semibold">{calculateTotalScore(player.scores)}</span>
              </div>
              <div className="flex overflow-x-auto mt-2">
                <table className="min-w-full text-xs">
                  <tbody>
                    <tr>
                      {Object.entries(player.scores).map(([hole, score], index) => (
                        <td key={index} className="px-2 py-1 border text-center">
                          {score}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={onClose} 
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded w-full transition duration-200 ease-in-out"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default RoundCompletionModal;
