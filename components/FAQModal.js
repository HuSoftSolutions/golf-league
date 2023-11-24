const FAQModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-6 md:p-8 lg:p-10 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800">FAQs</h2>
        <div className="mt-4 text-gray-600">
          <ul>
            {/* List of FAQs */}
            <li>
              <strong>How is the net score calculated?</strong>
              <p>
                The net score is calculated by subtracting the player's handicap
                from their total score.
              </p>
            </li>
            <li>
              <strong>What determines a skin in golf?</strong>
              <p>
                A skin is awarded to a player who has the sole lowest score on a
                hole among all players.
              </p>
            </li>
            <li>
              <strong>How are strokes distributed based on handicap?</strong>
              <p>
                Strokes are given to players based on the difficulty ranking of
                each hole, starting from the most difficult.
              </p>
            </li>
            {/* Add more FAQs as needed */}
          </ul>
        </div>
        <button
          onClick={onClose}
          className="mt-4 bg-red-500 text-white active:bg-red-600 font-bold uppercase px-3 py-1 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 text-xs"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default FAQModal;
