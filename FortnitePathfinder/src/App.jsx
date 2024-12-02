import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <header className="bg-gray-500 flex h-14 items-center justify-center text-center text-3xl text-white">
        Fortnite Pathfinder
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="bg-gray-300 w-48 overflow-y-auto">
          <div className="h-48">
            <div className="bg-yellow-400 flex h-12 items-center justify-center text-center text-2xl">
              Map Editor
            </div>
          </div>
          <div className="h-48">
            <div className="bg-yellow-400 flex h-12 items-center justify-center text-center text-2xl">
              Algorithms
            </div>
          </div>
          <div className="h-48">
            <div className="bg-yellow-400 flex h-12 items-center justify-center text-center text-2xl">
              Run Route
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-green-300 flex-1 overflow-hidden">
          Map goes here
        </div>
      </div>
    </div>
  );
}

export default App;