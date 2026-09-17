import { useState } from "react";
import heroImg from "./assets/hero.png";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-900 text-center">
      <h1 className="text-4xl font-black text-emerald-400 drop-shadow-md">
        Tailwind v4 is Live! 🚀
      </h1>
    </div>
  );
}

export default App;
