import { useState } from "react";
import StatusModal from "./components/StatusModal";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#1A1D21] flex items-center justify-center">
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-[#222529] border border-gray-600 text-gray-200 rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        Update your status
      </button>

      {isModalOpen && <StatusModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

export default App;
