import { useState, useEffect, useRef } from "react";

export default function StatusModal({ onClose }) {
  const [statusText, setStatusText] = useState("");
  const [statusEmoji, setStatusEmoji] = useState("💬");
  const [clearAfter, setClearAfter] = useState("Today");
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState(false);

  const [favorites, setFavorites] = useState([
    { emoji: "🎧", text: "Deep Work", clearAfter: "2 hours" },
  ]);

  const defaultSuggestions = [
    { emoji: "📅", text: "In a meeting", clearAfter: "1 hour" },
    { emoji: "🚌", text: "Commuting", clearAfter: "30 minutes" },
    { emoji: "🤒", text: "Out sick", clearAfter: "Today" },
  ];

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!statusText.trim()) {
      setError(true);
      return;
    }

    if (isFavorite) {
      setFavorites([
        ...favorites,
        { emoji: statusEmoji, text: statusText, clearAfter },
      ]);
    }

    console.log("Status Saved:", { statusEmoji, statusText, clearAfter });
    onClose();
  };

  const applyPreset = (preset) => {
    setStatusEmoji(preset.emoji);
    setStatusText(preset.text);
    setClearAfter(preset.clearAfter);
    setError(false);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className="bg-[#222529] text-gray-200 w-full max-w-130 rounded-xl shadow-2xl border border-gray-700 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Set a status</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 focus:ring-2 focus:ring-blue-500 rounded p-1"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-6">
          <div className="space-y-2">
            <div
              className={`flex items-center gap-2 bg-[#1A1D21] border ${error ? "border-red-500" : "border-gray-600 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"} rounded-lg p-2 transition-all`}
            >
              <button
                type="button"
                className="p-2 hover:bg-gray-700 rounded text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusEmoji}
              </button>
              <input
                ref={inputRef}
                type="text"
                placeholder="What's your status?"
                className="bg-transparent flex-1 outline-none text-white placeholder-gray-400"
                value={statusText}
                onChange={(e) => {
                  setStatusText(e.target.value);
                  setError(false);
                }}
              />
              {statusText && (
                <button
                  type="button"
                  onClick={() => setStatusText("")}
                  className="text-gray-400 hover:text-white p-2"
                >
                  ✕
                </button>
              )}
            </div>

            {error && (
              <p className="text-red-400 text-sm font-medium">
                Please enter a status before saving.
              </p>
            )}

            <div className="flex gap-4 pt-2 items-center">
              <select
                value={clearAfter}
                onChange={(e) => setClearAfter(e.target.value)}
                className="bg-[#1A1D21] border border-gray-600 text-sm rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-200"
              >
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
                <option>Today</option>
                <option>Don't clear</option>
              </select>

              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-2 focus:ring-blue-500 w-4 h-4"
                />
                ⭐️ Save as Favorite
              </label>
            </div>
          </div>

          {favorites.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Your Favorites
              </h3>
              <ul className="space-y-1">
                {favorites.map((fav, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => applyPreset(fav)}
                      className="w-full flex items-center justify-between text-left px-3 py-2 hover:bg-blue-600/20 rounded-md focus:bg-blue-600/20 focus:outline-none"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-lg">{fav.emoji}</span>
                        <span className="text-gray-200">
                          {fav.text}{" "}
                          <span className="text-gray-500 text-sm hidden sm:inline">
                            — {fav.clearAfter}
                          </span>
                        </span>
                      </span>
                      <span className="text-yellow-500 text-sm">⭐️</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              For Workspace
            </h3>
            <ul className="space-y-1">
              {defaultSuggestions.map((suggestion, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => applyPreset(suggestion)}
                    className="w-full flex items-center gap-3 text-left px-3 py-2 hover:bg-[#1A1D21] rounded-md focus:bg-[#1A1D21] focus:outline-none"
                  >
                    <span className="text-lg">{suggestion.emoji}</span>
                    <span className="text-gray-200">
                      {suggestion.text}{" "}
                      <span className="text-gray-500 text-sm hidden sm:inline">
                        — {suggestion.clearAfter}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium hover:bg-[#1A1D21] rounded-md border border-gray-600 transition-colors focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-[#007A5A] hover:bg-[#148567] text-white rounded-md transition-colors focus:ring-2 focus:ring-green-400"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
