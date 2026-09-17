import { useState, useEffect, useRef } from "react";

export default function StatusModal({
  activeStatus,
  onSave,
  onClear,
  onClose,
}) {
  // Initialize state using the activeStatus if it exists
  const [statusText, setStatusText] = useState(
    activeStatus ? activeStatus.text : "",
  );
  const [statusEmoji, setStatusEmoji] = useState(
    activeStatus ? activeStatus.emoji : "💬",
  );
  const [duration, setDuration] = useState(
    activeStatus ? activeStatus.duration : "Today",
  );
  const [pauseNotifications, setPauseNotifications] = useState(false);

  // If there's an active status, jump straight into Edit View
  const [isEditing, setIsEditing] = useState(!!activeStatus);

  const [customStart, setCustomStart] = useState({ date: "Today", time: "" });
  const [customEnd, setCustomEnd] = useState({ date: "Tomorrow", time: "" });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("slack-favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const [recentStatuses, setRecentStatuses] = useState(() => {
    const saved = localStorage.getItem("slack-recents");
    return saved
      ? JSON.parse(saved)
      : [{ emoji: "🔴", text: "football", duration: "Today" }];
  });

  const defaultSuggestions = [
    { emoji: "📅", text: "In a meeting", duration: "1 hour" },
    { emoji: "🚌", text: "Commuting", duration: "30 minutes" },
    { emoji: "🤒", text: "Out sick", duration: "Today" },
    {
      emoji: "🌴",
      text: "Vacationing",
      duration: "Choose a start and end time...",
    },
    { emoji: "🏡", text: "Working remotely", duration: "Today" },
  ];

  const durationOptions = [
    "Don’t clear",
    "30 minutes",
    "1 hour",
    "4 hours",
    "Today",
    "This week",
    "Choose a start and end time...",
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

    if (!statusText.trim()) return;

    let finalDuration = duration;
    if (duration === "Choose a start and end time...") {
      finalDuration = `${customStart.date} to ${customEnd.date}`;
    }

    const newStatus = {
      emoji: statusEmoji,
      text: statusText,
      duration: finalDuration,
    };

    const isDefault = defaultSuggestions.some(
      (def) => def.text === newStatus.text && def.emoji === newStatus.emoji,
    );

    const isFav = favorites.some(
      (f) => f.text === newStatus.text && f.emoji === newStatus.emoji,
    );

    // Only add to Recent tab if it is a custom status AND not already a favorite
    if (!isDefault && !isFav) {
      const filteredRecents = recentStatuses.filter(
        (r) => !(r.text === newStatus.text && r.emoji === newStatus.emoji),
      );
      const updatedRecents = [newStatus, ...filteredRecents].slice(0, 5);

      setRecentStatuses(updatedRecents);
      localStorage.setItem("slack-recents", JSON.stringify(updatedRecents));
    }

    onSave(newStatus);
  };

  const handleSelectPreset = (preset) => {
    setStatusEmoji(preset.emoji);
    setStatusText(preset.text);
    setDuration(preset.duration || "Today");
    setIsEditing(true);
    inputRef.current?.focus();
  };

  const handleInputChange = (e) => {
    setStatusText(e.target.value);
    if (!isEditing) setIsEditing(true);
  };

  const toggleFavorite = (e, preset) => {
    e.stopPropagation();
    const isFav = favorites.some(
      (f) => f.text === preset.text && f.emoji === preset.emoji,
    );

    if (isFav) {
      // It's currently a favorite, so we UN-STAR it.
      // Remove from favorites
      const newFavs = favorites.filter(
        (f) => !(f.text === preset.text && f.emoji === preset.emoji),
      );
      setFavorites(newFavs);
      localStorage.setItem("slack-favorites", JSON.stringify(newFavs));

      // Put it back in recents
      const newRecents = [preset, ...recentStatuses].slice(0, 5);
      setRecentStatuses(newRecents);
      localStorage.setItem("slack-recents", JSON.stringify(newRecents));
    } else {
      // It's currently a recent, so we STAR it.
      // Add to favorites
      const newFavs = [...favorites, preset];
      setFavorites(newFavs);
      localStorage.setItem("slack-favorites", JSON.stringify(newFavs));

      // Remove from recents
      const newRecents = recentStatuses.filter(
        (r) => !(r.text === preset.text && r.emoji === preset.emoji),
      );
      setRecentStatuses(newRecents);
      localStorage.setItem("slack-recents", JSON.stringify(newRecents));
    }
  };

  const handleDeleteRecent = (e, preset) => {
    e.stopPropagation();
    const updatedRecents = recentStatuses.filter(
      (r) => !(r.text === preset.text && r.emoji === preset.emoji),
    );
    setRecentStatuses(updatedRecents);
    localStorage.setItem("slack-recents", JSON.stringify(updatedRecents));
  };

  const isItemFavorited = (preset) => {
    return favorites.some(
      (f) => f.text === preset.text && f.emoji === preset.emoji,
    );
  };

  const renderListItem = (item, index, listType) => (
    <li key={`${listType}-${index}`}>
      <button
        type="button"
        onClick={() => handleSelectPreset(item)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#1264A3] hover:text-white rounded-md focus:bg-[#1264A3] focus:outline-none group transition-colors"
      >
        <span className="flex items-center gap-3">
          <span className="text-[18px]">{item.emoji}</span>
          <span className="font-bold">
            {item.text}{" "}
            <span className="font-normal opacity-70 ml-1">
              — {item.duration}
            </span>
          </span>
        </span>
        <div className="flex items-center gap-1">
          {listType === "recent" && (
            <div
              onClick={(e) => handleDeleteRecent(e, item)}
              className="relative group/btn p-1 rounded-md hover:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-gray-400 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[12px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 pointer-events-none whitespace-nowrap shadow-lg">
                Delete
              </span>
            </div>
          )}
          {listType !== "default" && (
            <div
              onClick={(e) => toggleFavorite(e, item)}
              className={`relative group/star p-1 rounded-md hover:bg-black/20 ${
                isItemFavorited(item)
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              } transition-opacity flex items-center justify-center`}
            >
              {isItemFavorited(item) ? (
                <span className="text-yellow-400 text-[16px] drop-shadow-sm leading-none">
                  ⭐
                </span>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385c.148.621-.531 1.121-1.071.809l-4.73-2.73a.563.563 0 00-.546 0l-4.73 2.73c-.54.312-1.22-.188-1.071-.809l1.285-5.385a.563.563 0 00-.182-.557l-4.204-3.602c-.38-.325-.178-.95.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
              )}
            </div>
          )}
        </div>
      </button>
    </li>
  );

  // Checks if the user has touched the inputs yet. If false, we show the "Clear Status" button.
  const isUnchanged =
    activeStatus &&
    statusText === activeStatus.text &&
    statusEmoji === activeStatus.emoji &&
    duration === activeStatus.duration;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className="bg-[#222529] text-gray-200 w-full max-w-[520px] rounded-xl shadow-2xl border border-gray-700 flex flex-col"
        role="dialog"
      >
        <div className="flex justify-between items-center p-5 pb-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Set a status</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 focus:ring-2 focus:ring-[#1264A3] rounded p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[85vh]">
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-2 bg-[#1A1D21] border border-gray-600 focus-within:border-[#1264A3] focus-within:ring-1 focus-within:ring-[#1264A3] rounded-lg p-1.5 transition-all">
              <button
                type="button"
                className="p-1.5 hover:bg-gray-700 rounded text-xl focus:outline-none"
              >
                {statusEmoji}
              </button>
              <input
                ref={inputRef}
                type="text"
                placeholder="What's your status?"
                className="bg-transparent flex-1 outline-none text-white placeholder-gray-400 text-[15px]"
                value={statusText}
                onClick={() => setIsEditing(true)}
                onChange={handleInputChange}
              />
              {statusText && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusText("");
                    if (!isEditing) inputRef.current?.focus();
                  }}
                  className="bg-gray-600 hover:bg-gray-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="px-5 pb-5 overflow-y-auto">
            {isEditing ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-gray-200">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-[#1A1D21] border border-gray-600 text-[15px] rounded-md px-3 py-2.5 focus:border-[#1264A3] focus:ring-1 focus:ring-[#1264A3] outline-none text-gray-200 appearance-none cursor-pointer"
                  >
                    {durationOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                    {!durationOptions.includes(duration) &&
                      duration !== "Choose a start and end time..." && (
                        <option value={duration}>{duration}</option>
                      )}
                  </select>
                </div>

                {duration === "Choose a start and end time..." && (
                  <div className="flex flex-col gap-3 p-4 bg-[#1A1D21] rounded-lg border border-gray-600">
                    <div className="flex items-center gap-3">
                      <span className="w-10 text-[13px] font-bold">Start</span>
                      <input
                        type="date"
                        className="bg-[#222529] border border-gray-600 rounded px-2 py-1.5 text-sm flex-1 outline-none focus:border-[#1264A3]"
                      />
                      <input
                        type="time"
                        className="bg-[#222529] border border-gray-600 rounded px-2 py-1.5 text-sm w-32 outline-none focus:border-[#1264A3]"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-10 text-[13px] font-bold">End</span>
                      <input
                        type="date"
                        className="bg-[#222529] border border-gray-600 rounded px-2 py-1.5 text-sm flex-1 outline-none focus:border-[#1264A3]"
                      />
                      <input
                        type="time"
                        className="bg-[#222529] border border-gray-600 rounded px-2 py-1.5 text-sm w-32 outline-none focus:border-[#1264A3]"
                      />
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2 text-[15px] cursor-pointer hover:text-white pt-2">
                  <input
                    type="checkbox"
                    checked={pauseNotifications}
                    onChange={(e) => setPauseNotifications(e.target.checked)}
                    className="rounded bg-[#1A1D21] border-gray-600 text-[#007A5A] focus:ring-[#007A5A] w-4 h-4 cursor-pointer"
                  />
                  Pause notifications until status is cleared
                </label>
              </div>
            ) : (
              <div className="space-y-5">
                {favorites.length > 0 && (
                  <div>
                    <h3 className="text-[13px] font-bold text-gray-400 mb-1 px-1">
                      Your Favorites
                    </h3>
                    <ul className="space-y-0.5">
                      {favorites.map((fav, i) =>
                        renderListItem(fav, i, "favorite"),
                      )}
                    </ul>
                  </div>
                )}
                {recentStatuses.length > 0 && (
                  <div>
                    <h3 className="text-[13px] font-bold text-gray-400 mb-1 px-1">
                      Recent
                    </h3>
                    <ul className="space-y-0.5">
                      {recentStatuses.map((recent, i) =>
                        renderListItem(recent, i, "recent"),
                      )}
                    </ul>
                  </div>
                )}
                <div>
                  <h3 className="text-[13px] font-bold text-gray-400 mb-1 px-1">
                    For New Workspace
                  </h3>
                  <ul className="space-y-0.5">
                    {defaultSuggestions.map((suggestion, i) =>
                      renderListItem(suggestion, i, "default"),
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center p-5 border-t border-gray-700 bg-[#222529] rounded-b-xl">
            <a href="#" className="text-[13px] text-[#36C5F0] hover:underline">
              Edit suggestions for New Workspace
            </a>

            {/* Renders Clear Status if modifying an existing status, otherwise Cancel/Save */}
            {isUnchanged ? (
              <button
                type="button"
                onClick={onClear}
                className="px-4 py-2 text-[13px] font-bold hover:bg-[#1A1D21] rounded border border-gray-500 transition-colors focus:ring-2 focus:ring-gray-500"
              >
                Clear Status
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-[13px] font-bold hover:bg-[#1A1D21] rounded border border-gray-500 transition-colors focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!statusText.trim()}
                  className={`px-4 py-2 text-[13px] font-bold rounded transition-colors focus:ring-2 focus:ring-green-400 ${
                    statusText.trim()
                      ? "bg-[#007A5A] hover:bg-[#148567] text-white cursor-pointer"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
                  }`}
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
