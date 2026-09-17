import { useState, useEffect } from "react";
import StatusModal, { getExpirationTime } from "./components/StatusModal";

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Initialize state from localStorage so it remembers on refresh
  const [activeStatus, setActiveStatus] = useState(() => {
    const saved = localStorage.getItem("slack-active-status");
    return saved ? JSON.parse(saved) : null;
  });

  const [isHovered, setIsHovered] = useState(false);

  // 2. Automatically save to localStorage whenever the status changes
  useEffect(() => {
    if (activeStatus) {
      localStorage.setItem("slack-active-status", JSON.stringify(activeStatus));
    } else {
      localStorage.removeItem("slack-active-status");
    }
  }, [activeStatus]);

  const handleClearStatus = (e) => {
    e.stopPropagation();
    setActiveStatus(null);
  };

  return (
    <div className="min-h-screen bg-[#1A1D21] flex p-10 justify-center">
      {/* Made the container slightly wider to fit the time text nicely */}
      <div className="w-[360px]">
        {!activeStatus ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 w-full text-left bg-[#222529] border border-gray-600 text-gray-200 rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Update your status
          </button>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex items-center justify-between w-full px-3 py-1.5 bg-[#222529] border border-gray-600 text-gray-200 rounded-md hover:bg-[#2C3036] transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-[17px] flex-shrink-0 flex items-center justify-center w-5 h-5">
                {isHovered ? (
                  // Pencil Icon on Hover
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 text-gray-300"
                  >
                    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                  </svg>
                ) : activeStatus.emoji === "default" ? (
                  // Default Slack Icon
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 2.5C5.85786 2.5 2.5 5.61929 2.5 9.5C2.5 11.4553 3.42436 13.237 4.92004 14.5428L4.01501 17.0315C3.89965 17.3488 4.21855 17.6253 4.52187 17.4727L7.6166 15.9152C8.36979 16.2917 9.17182 16.5 10 16.5C14.1421 16.5 17.5 13.5 17.5 9.5C17.5 5.61929 14.1421 2.5 10 2.5Z"
                      fill="#D1D2D3"
                    />
                  </svg>
                ) : (
                  // User selected Emoji
                  activeStatus.emoji
                )}
              </span>

              <div className="flex items-baseline gap-1.5 truncate">
                <span className="font-bold text-[14px] text-gray-200 truncate">
                  {activeStatus.text}
                </span>
                {/* Dynamically render the exact time next to the text */}
                {getExpirationTime(activeStatus.duration) && (
                  <span className="text-[13px] text-gray-400 font-normal truncate">
                    — {getExpirationTime(activeStatus.duration)}
                  </span>
                )}
              </div>
            </div>

            <div
              onClick={handleClearStatus}
              className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-[#35373B] text-gray-300 hover:bg-[#4A4D51] transition-colors ml-2"
              title="Clear status"
            >
              {/* Circular 'X' clear button */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {isModalOpen && (
        <StatusModal
          activeStatus={activeStatus}
          onSave={(status) => {
            setActiveStatus(status);
            setIsModalOpen(false);
          }}
          onClear={() => {
            setActiveStatus(null);
            setIsModalOpen(false);
          }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
