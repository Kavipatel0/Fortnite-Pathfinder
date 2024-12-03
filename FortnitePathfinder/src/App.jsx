import Map from './Map';
import { useState, useEffect } from 'react';
import { MapPin, Trash2, Check } from 'lucide-react';
import {Graph} from './Graph.js';
import Papa from "papaparse"

function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [startPosition, setStartPosition] = useState(null);
  const [endPosition, setEndPosition] = useState(null);
  const [graph, setGraph] = useState(null);
  const [path, setPath] = useState([]);
  const [isPathfinding, setIsPathfinding] = useState(false);
  const [isShowingFinalPath, setIsShowingFinalPath] = useState(false);


  const readCSV = async () => {
    try {
      const response = await fetch('/data/FortniteMarkedData.csv');
      const fileContent = await response.text();
      const results = Papa.parse(fileContent, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });
      return results.data;
    } catch (error) {
      console.error('Error reading file:', error);
    }
  };
  

  // Load CSV and initialize graph
  useEffect(() => {
    const initializeData = async () => {
      try {
        const data = await readCSV();
        console.log(data);
        if (data) {
          let newGraph = new Graph(400);
          newGraph.updateGraph(data);
          setGraph(newGraph);
        }
      } catch (error) {
        console.error('Error loading CSV data:', error);
      }
    };

    initializeData();
  }, []);



  const handleToolSelect = (tool) => {
    setActiveTool(tool === activeTool ? null : tool);
  };

  const handleMapClick = (gridPosition) => {
    if (activeTool === 'start') {
      setStartPosition(gridPosition);
      setActiveTool(null);
    } else if (activeTool === 'end') {
      setEndPosition(gridPosition);
      setActiveTool(null);
    }
  };

  const handleClearMap = () => {
    setStartPosition(null);
    setEndPosition(null);
    setPath([]);
    setActiveTool(null);
  };

  const getMarkerPositions = () => {
    if (!startPosition || !endPosition) {
        return null;
    }

    return [[startPosition.x, startPosition.y], [endPosition.x, endPosition.y]];
  };

  const runPathfinding = () => {
    if (!graph || !startPosition || !endPosition || isPathfinding) return;
  
    setIsPathfinding(true);
    setIsShowingFinalPath(false);
    
    const start = [startPosition.x, startPosition.y];
    const end = [endPosition.x, endPosition.y];
  
    if (selectedAlgorithm === 'dijkstra') {
      const result = graph.dijkstra(start, end);
      console.log('Dijkstra Result:', result);
      
      if (result[0] === -1) {
        console.log('No path found');
        setPath([]);
        setIsShowingFinalPath(false);
        setIsPathfinding(false);
      } else {
        setPath([]);
  
        const visitedCells = result[1];
        let currentPath = [];
        let i = 0;
        
        const timer = setInterval(() => {
          for (let j = 0; j < 15 && i < visitedCells.length; j++) {
            currentPath.push(visitedCells[i]);
            i++;
          }
          setPath([...currentPath]);
          
          if (i >= visitedCells.length) {
            clearInterval(timer);
            setTimeout(() => {
              setPath(result[2]);
              setIsShowingFinalPath(true);
              setIsPathfinding(false);
            }, 100);
          }
        }, 1); 
      }
    }
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <header className="bg-gray-800 flex h-14 items-center justify-center text-center text-4xl text-white tracking-wider shadow-lg">
        Fortnite Pathfinder
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="bg-gray-200 w-64 overflow-y-auto shadow-lg flex flex-col divide-y divide-gray-200 border-r-2 border-dashed border-gray-300">
          {/* Map Editor Section */}
          <h2 className="mt-3 bg-gray-800 h-12 flex items-center justify-center text-3xl font-bold text-yellow-400 tracking-wider drop-shadow-md">
            MAP EDITOR
          </h2>
          <div className="p-4 space-y-4">
            <ul className='flex flex-col space-y-2'>
              {/* Start Marker Button */}
              <li 
                className={`w-full flex h-10 overflow-hidden rounded-lg cursor-pointer transition-colors
                  ${activeTool === 'start' ? 'ring-2 ring-green-500' : ''}
                  ${startPosition ? 'ring-1 ring-green-500' : ''}`}
                onClick={() => {
                  if (!startPosition) {
                    handleToolSelect('start');
                  }
                }}
              >
                <div className='flex-1 bg-white flex items-center justify-between px-4 tracking-wider'>
                  Start Marker
                  {startPosition && (
                    <Check size={20} className="text-green-500" />
                  )}
                </div>
                <div className='w-12 bg-gray-800 flex items-center justify-center'>
                  <MapPin size={24} color="#00fa04" strokeWidth={1.5} />
                </div>
              </li>

              {/* End Marker Button */}
              <li 
                className={`w-full flex h-10 overflow-hidden rounded-lg cursor-pointer transition-colors
                  ${activeTool === 'end' ? 'ring-2 ring-red-500' : ''}
                  ${endPosition ? 'ring-1 ring-red-500' : ''}`}
                onClick={() => {
                  if (!endPosition) {
                    handleToolSelect('end');
                  }
                }}
              >
                <div className='flex-1 bg-white flex items-center justify-between px-4 tracking-wider'>
                  End Marker
                  {endPosition && (
                    <Check size={20} className="text-red-500" />
                  )}
                </div>
                <div className='w-12 bg-gray-800 flex items-center justify-center'>
                  <MapPin size={24} color="#ff0000" strokeWidth={1.5} />
                </div>
              </li>

              {/* Clear Map Button */}
              <li 
                className={`w-full flex h-10 overflow-hidden rounded-lg cursor-pointer transition-colors
                  ${startPosition || endPosition ? 'opacity-100' : 'opacity-50 cursor-not-allowed'}`}
                onClick={() => {
                  if (startPosition || endPosition) {
                    handleClearMap();
                  }
                }}
              >
                <div className='flex-1 bg-white flex items-center justify-between px-4 tracking-wider'>
                  Clear Map
                  {(startPosition || endPosition) && (
                    <span className="text-sm text-gray-500">
                      {[
                        startPosition && 'Start',
                        endPosition && 'End'
                      ].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
                <div className='w-12 bg-gray-800 flex items-center justify-center'>
                  <Trash2 
                    color="#ffffff" 
                    strokeWidth={1.5} 
                    className={startPosition || endPosition ? '' : 'opacity-50'}
                  />
                </div>
              </li>
            </ul>
          </div>

          {/* Algorithms Section */}
          <h2 className="bg-gray-800 h-12 flex items-center justify-center text-3xl font-bold text-yellow-400 tracking-wider drop-shadow-md">
            ALGORITHMS
          </h2>
          <div className="p-4 space-y-4">
            <ul className='flex flex-col space-y-2'>
              <li 
                className={`w-full text-center py-2 px-4 tracking-wider rounded-lg shadow-sm cursor-pointer transition-colors border
                  ${selectedAlgorithm === 'dijkstra' 
                    ? 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                onClick={() => setSelectedAlgorithm('dijkstra')}
              >
                Dijkstra
              </li>
              <li 
                className={`w-full text-center py-2 px-4 tracking-wider rounded-lg shadow-sm cursor-pointer transition-colors border
                  ${selectedAlgorithm === 'astar' 
                    ? 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                onClick={() => setSelectedAlgorithm('astar')}
              >
                A* Search
              </li>
            </ul>
          </div>

          {/* Run Route Section */}
          <h2 className="bg-gray-800 h-12 flex items-center justify-center text-3xl font-bold text-yellow-400 tracking-wider drop-shadow-md">
            RUN ROUTE
          </h2>
          <div className="p-4 space-y-4">
            <div className='pt-2'>
            <button 
                className={`w-full py-3 px-6 tracking-wider rounded-lg shadow-sm transition-all duration-200 border
                    ${(!selectedAlgorithm || !startPosition || !endPosition || isPathfinding)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                    : 'bg-green-500 text-white border-green-600 hover:bg-green-600 cursor-pointer'}`}
                disabled={!selectedAlgorithm || !startPosition || !endPosition || isPathfinding}
                onClick={runPathfinding}
              >
                {!startPosition || !endPosition 
                  ? `Set ${!startPosition && !endPosition ? 'start and end' : !startPosition ? 'start' : 'end'} marker${!startPosition && !endPosition ? 's' : ''}`
                  : !selectedAlgorithm 
                      ? 'Select an algorithm'
                      : isPathfinding
                        ? 'Finding path...'
                        : 'Run Pathfinding'}
              </button>
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-px bg-gray-200 shadow-md"></div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
        <Map 
          onGridClick={handleMapClick}
          startPosition={startPosition}
          endPosition={endPosition}
          activeTool={activeTool}
          path={path}
          isShowingFinalPath={isShowingFinalPath}
        />
        </div>
      </div>
    </div>
  );
}

export default App;

