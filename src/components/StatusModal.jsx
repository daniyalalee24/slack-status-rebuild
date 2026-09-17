import { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";

// Authentic Slack Default Speech Bubble SVG
const DefaultStatusIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 2.5C5.85786 2.5 2.5 5.61929 2.5 9.5C2.5 11.4553 3.42436 13.237 4.92004 14.5428L4.01501 17.0315C3.89965 17.3488 4.21855 17.6253 4.52187 17.4727L7.6166 15.9152C8.36979 16.2917 9.17182 16.5 10 16.5C14.1421 16.5 17.5 13.5 17.5 9.5C17.5 5.61929 14.1421 2.5 10 2.5Z"
      fill="#D1D2D3"
    />
  </svg>
);

// Helper function to calculate exact real-world expiration time
export const getExpirationTime = (dur) => {
  if (!dur || dur === "Don’t clear" || dur === "Choose a start and end time...")
    return "";
  if (dur === "Today") return "Until 11:59 PM";
  if (dur === "This week") return "Until Sunday";
  if (dur.includes("to")) return dur; // Handle custom date ranges

  const now = new Date();
  if (dur === "30 minutes") now.setMinutes(now.getMinutes() + 30);
  else if (dur === "1 hour") now.setHours(now.getHours() + 1);
  else if (dur === "4 hours") now.setHours(now.getHours() + 4);
  else return dur;

  // Added "en-US" to guarantee standard AM/PM formatting
  return `Until ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
};

export default function StatusModal({
  activeStatus,
  onSave,
  onClear,
  onClose,
}) {
  const [statusText, setStatusText] = useState(
    activeStatus ? activeStatus.text : "",
  );
  const [statusEmoji, setStatusEmoji] = useState(
    activeStatus ? activeStatus.emoji : "default",
  );
  const [duration, setDuration] = useState(
    activeStatus ? activeStatus.duration : "Today",
  );
  const [pauseNotifications, setPauseNotifications] = useState(false);

  const [isEditing, setIsEditing] = useState(!!activeStatus);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
  const pickerRef = useRef(null);
  const isPickerOpen = useRef(false);

  useEffect(() => {
    isPickerOpen.current = showEmojiPicker;
  }, [showEmojiPicker]);

  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isPickerOpen.current) {
          setShowEmojiPicker(false);
        } else {
          onClose();
        }
      }
    };

    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
      const newFavs = favorites.filter(
        (f) => !(f.text === preset.text && f.emoji === preset.emoji),
      );
      setFavorites(newFavs);
      localStorage.setItem("slack-favorites", JSON.stringify(newFavs));

      const newRecents = [preset, ...recentStatuses].slice(0, 5);
      setRecentStatuses(newRecents);
      localStorage.setItem("slack-recents", JSON.stringify(newRecents));
    } else {
      const newFavs = [...favorites, preset];
      setFavorites(newFavs);
      localStorage.setItem("slack-favorites", JSON.stringify(newFavs));

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
          <span className="text-[18px] flex items-center justify-center w-5 h-5">
            {item.emoji === "default" ? <DefaultStatusIcon /> : item.emoji}
          </span>
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

  const isUnchanged =
    activeStatus &&
    statusText === activeStatus.text &&
    statusEmoji === activeStatus.emoji &&
    duration === activeStatus.duration;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#222529] text-gray-200 w-full max-w-[520px] rounded-xl shadow-2xl border border-gray-700 flex flex-col"
        role="dialog"
        onClick={(e) => e.stopPropagation()}
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
              <div className="relative" ref={pickerRef}>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-700 rounded text-xl focus:outline-none focus:ring-2 focus:ring-[#1264A3] transition-colors"
                >
                  {statusEmoji === "default" ? (
                    <DefaultStatusIcon />
                  ) : (
                    statusEmoji
                  )}
                </button>

                {showEmojiPicker && (
                  <div className="absolute top-full mt-2 left-0 z-50 shadow-2xl">
                    <EmojiPicker
                      theme="dark"
                      onEmojiClick={(emojiData) => {
                        setStatusEmoji(emojiData.emoji);
                        setShowEmojiPicker(false);
                        inputRef.current?.focus();
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Added flex-1 and min-w-0 so long text shrinks nicely instead of pushing the time out */}
              <input
                ref={inputRef}
                type="text"
                placeholder="What's your status?"
                className="bg-transparent flex-1 min-w-0 outline-none text-white placeholder-gray-400 text-[15px]"
                value={statusText}
                onClick={() => setIsEditing(true)}
                onChange={handleInputChange}
              />

              {statusText && (
                <div className="flex items-center gap-2 pr-1 shrink-0">
                  {/* Removed the 'hidden sm:block' so it always shows regardless of screen size */}
                  {getExpirationTime(duration) && (
                    <span className="text-gray-400 text-[13px] whitespace-nowrap pointer-events-none select-none">
                      {getExpirationTime(duration)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setStatusText("");
                      setStatusEmoji("default");
                      setDuration("Today");
                      if (!isEditing) inputRef.current?.focus();
                    }}
                    className="bg-gray-600 hover:bg-gray-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0"
                  >
                    ✕
                  </button>
                </div>
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
                  className={`px-4 py-2 text-[13px] font-bold rounded transition-colors focus:ring-2 focus:ring-green-400 ${statusText.trim() ? "bg-[#007A5A] hover:bg-[#148567] text-white cursor-pointer" : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"}`}
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
