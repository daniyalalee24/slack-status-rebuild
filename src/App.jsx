import { useState } from "react";
import StatusModal from "./components/StatusModal";

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState(null); // Tracks the set status
  const [isHovered, setIsHovered] = useState(false);

  const handleClearStatus = (e) => {
    e.stopPropagation();
    setActiveStatus(null);
  };

  return (
    <div className="min-h-screen bg-[#1A1D21] flex p-10 justify-center">
      {/* Container simulating the Slack Sidebar */}
      <div className="w-64">
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
            className="flex items-center justify-between w-full px-2 py-1.5 bg-[#222529] border border-gray-600 text-gray-200 rounded-md hover:bg-[#2C3036] transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-base flex-shrink-0 flex items-center justify-center w-5 h-5">
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
                ) : (
                  activeStatus.emoji
                )}
              </span>
              <span className="font-medium text-[13px] truncate">
                {activeStatus.text}
              </span>
            </div>

            <div
              onClick={handleClearStatus}
              className="w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-400/20 text-gray-300 hover:bg-gray-400 hover:text-[#1A1D21] transition-colors ml-2"
              title="Clear status"
            >
              {/* Little 'x' button */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3 h-3"
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
