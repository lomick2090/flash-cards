import { useState, useEffect } from "react";

function App() {
  // Load cards from localStorage on initial render
  const [cards, setCards] = useState(() => {
    const savedCards = localStorage.getItem("flashcards");
    if (savedCards) {
      return JSON.parse(savedCards);
    } else {
      return [
        {
          front: "What is React?",
          back: "A JavaScript library for building user interfaces",
        },
        {
          front: "What is a React Hook?",
          back: "Functions that let you use state and other React features without writing a class",
        },
        {
          front: "What is JSX?",
          back: "A syntax extension for JavaScript that looks similar to HTML",
        },
      ];
    }
  });
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedIndex = localStorage.getItem("currentCardIndex");
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newCardFront, setNewCardFront] = useState("");
  const [newCardBack, setNewCardBack] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportText, setExportText] = useState("");

  // Save cards to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("flashcards", JSON.stringify(cards));
  }, [cards]);

  // Save current index to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("currentCardIndex", currentIndex.toString());
  }, [currentIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isEditing) return; // Don't navigate when editing

      switch (e.key) {
        case "ArrowLeft":
          navigate(-1);
          break;
        case "ArrowRight":
          navigate(1);
          break;
        case " ": // Spacebar to flip
          e.preventDefault(); // Prevent spacebar from clicking focused buttons
          setIsFlipped(!isFlipped);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, currentIndex, isEditing, cards.length]);

  // Navigation function
  const navigate = (direction) => {
    const newIndex = (currentIndex + direction + cards.length) % cards.length;
    setCurrentIndex(newIndex);
    setIsFlipped(false);
  };

  // Export cards as text in a modal
  const exportCards = () => {
    try {
      // Format cards as pretty JSON
      const data = JSON.stringify(cards, null, 2);
      setExportText(data);
      setShowExportModal(true);
    } catch (error) {
      console.error("Export generation failed:", error);
      alert("Failed to generate export: " + error.message);
    }
  };

  // Copy export text to clipboard
  const copyToClipboard = () => {
    try {
      navigator.clipboard
        .writeText(exportText)
        .then(() => {
          alert("Copied to clipboard!");
        })
        .catch((err) => {
          console.error("Copy failed:", err);
          alert("Failed to copy. Please select the text manually and copy.");
        });
    } catch (error) {
      console.error("Copy failed:", error);
      alert("Failed to copy. Please select the text manually and copy.");
    }
  };

  // Import cards from JSON file
  const importCards = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedCards = JSON.parse(event.target.result);
        if (Array.isArray(importedCards) && importedCards.length > 0) {
          // Validate that each card has front and back properties
          const validCards = importedCards.filter(
            (card) => card.front && card.back,
          );

          if (validCards.length > 0) {
            setCards(validCards);
            setCurrentIndex(0);
            setIsFlipped(false);
            alert(`Successfully imported ${validCards.length} flashcards!`);
          } else {
            alert("No valid flashcards found in the file.");
          }
        } else {
          alert("Invalid JSON format. Please upload a valid flashcards file.");
        }
      } catch (error) {
        alert("Error reading file: " + error.message);
      }
    };
    reader.readAsText(file);

    // Reset file input
    e.target.value = null;
  };

  // Add new card
  const addCard = () => {
    if (newCardFront.trim() === "" || newCardBack.trim() === "") return;

    const updatedCards = [
      ...cards,
      {
        front: newCardFront,
        back: newCardBack,
      },
    ];

    setCards(updatedCards);
    setNewCardFront("");
    setNewCardBack("");
    setIsEditing(false);
  };

  // Delete current card
  const deleteCard = () => {
    if (cards.length <= 1) return;

    const newCards = [...cards];
    newCards.splice(currentIndex, 1);
    setCards(newCards);
    setCurrentIndex(Math.min(currentIndex, newCards.length - 1));
    setIsFlipped(false);
  };

  // Shuffle cards using Fisher-Yates algorithm
  const shuffleCards = () => {
    const shuffledCards = [...cards];
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }
    setCards(shuffledCards);
    setCurrentIndex(0);
  };

  // Clear all cards and reset to defaults
  const resetCards = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all flashcards? This can't be undone.",
      )
    ) {
      const defaultCards = [
        {
          front: "What is React?",
          back: "A JavaScript library for building user interfaces",
        },
        {
          front: "What is a React Hook?",
          back: "Functions that let you use state and other React features without writing a class",
        },
        {
          front: "What is JSX?",
          back: "A syntax extension for JavaScript that looks similar to HTML",
        },
      ];
      setCards(defaultCards);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Flash Card App</h1>

      {/* Card display */}
      {cards.length > 0 && !isEditing && !showExportModal && (
        <div className="mb-4 w-full max-w-md">
          <div
            className="bg-white rounded-lg shadow-lg p-6 min-h-64 flex items-center justify-center transition-all duration-300 transform relative"
            style={{ perspective: "1000px" }}
          >
            <div
              className={`w-full h-full flex items-center justify-center text-xl transition-transform duration-500`}
            >
              {isFlipped ? (
                <p className="text-center text-4xl">{cards[currentIndex].back}</p>
              ) : (
                <p className="text-center font-semibold text-4xl">
                  {cards[currentIndex].front}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <div className="flex space-x-2">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => navigate(-1)}
              >
                Previous
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => navigate(1)}
              >
                Next
              </button>
            </div>

            <div className="text-gray-600">
              {currentIndex + 1} / {cards.length}
            </div>
          </div>

          <div className="flex mt-4 space-x-2 flex-wrap">
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-2"
              onClick={() => setIsEditing(true)}
            >
              Add Card
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mb-2"
              onClick={deleteCard}
              disabled={cards.length <= 1}
            >
              Delete Card
            </button>
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mb-2"
              onClick={resetCards}
            >
              Reset All
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mb-2"
              onClick={shuffleCards}
            >
              Shuffle Cards
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
              onClick={exportCards}
            >
              Export Cards
            </button>

            <label className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer mb-2">
              Import Cards
              <input
                type="file"
                accept=".json"
                onChange={importCards}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* Add new card form */}
      {isEditing && (
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Add New Card</h2>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Front:</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              value={newCardFront}
              onChange={(e) => setNewCardFront(e.target.value)}
              placeholder="Enter question or term"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Back:</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              value={newCardBack}
              onChange={(e) => setNewCardBack(e.target.value)}
              placeholder="Enter answer or definition"
            />
          </div>

          <div className="flex space-x-2">
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={addCard}
            >
              Save Card
            </button>
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Export Flashcards</h2>
            <p className="mb-4">
              Copy this JSON and save it to a file with a .json extension:
            </p>

            <div className="bg-gray-100 p-4 rounded mb-4 overflow-x-auto">
              <pre className="whitespace-pre-wrap">{exportText}</pre>
            </div>

            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={copyToClipboard}
              >
                Copy to Clipboard
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={() => setShowExportModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-gray-600">
        <p>Keyboard shortcuts:</p>
        <ul className="list-disc pl-6">
          <li>Left arrow: Previous card</li>
          <li>Right arrow: Next card</li>
          <li>Spacebar: Flip card</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
