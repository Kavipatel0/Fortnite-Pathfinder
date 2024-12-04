import Map from './Map';
import { useState, useEffect, useRef } from 'react';
import { MapPin, Trash2, Check } from 'lucide-react';
import {Graph} from './Graph.js';
import Papa from "papaparse"
import LoadingScreen from "./Loading Screen";
import battlebusAnimation from "./assets/Battle Bus Video.mp4";
import errorIcon from "./assets/Error Icon.png";
import topRect from "./assets/Rectangle Top.png";
import bottomRect from "./assets/Rectangle Bottom.png";
import fortniteMap1 from './assets/FortniteMap1.jpg';
import fortniteMap2 from './assets/FortniteMap2.jpg';
import fortniteMap3 from './assets/FortniteMap3.jpg';


function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [startPosition, setStartPosition] = useState(null);
  const [endPosition, setEndPosition] = useState(null);
  const [graph, setGraph] = useState(null);
  const [path, setPath] = useState([]);
  const [isPathfinding, setIsPathfinding] = useState(false);
  const [isShowingFinalPath, setIsShowingFinalPath] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(2);
  const [notLoaded, setNotLoaded] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const videoRef = useRef(null);
  const [showError, setShowError] = useState(false);
  const [mapNumber, setMapNumber] = useState(1);


  const handleClose = () => {
    setShowError(false);
  };

  const handleVideoEnd = () => {
    setFadeOut(true);
    setTimeout(() => {
      setVideoPlaying(false);
    }, 200);
  };

  const getCSVPath = (mapNum) => {
    switch(mapNum) {
      case 1:
        return '/data/FortniteMarkedData1.csv';
      case 2:
        return '/data/FortniteMarkedData2.csv';
      case 3:
        return '/data/FortniteMarkedData3.csv';
      default:
        return '/data/FortniteMarkedData1.csv';
    }
  };

  const readCSV = async (mapNum) => {
    try {
      const response = await fetch(getCSVPath(mapNum));
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
  
  useEffect(() => {
    const initializeData = async () => {
      try {
        handleClearMap();
        
        const data = await readCSV(mapNumber);
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
  }, [mapNumber]);

  useEffect(() => {
    if (!notLoaded && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('Video playback failed:', error);
        // Fallback in case video fails to play
        setVideoPlaying(false);
      });
    }
  }, [notLoaded]);



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


  const speedRef = useRef(animationSpeed);
  useEffect(() => {
    speedRef.current = animationSpeed;
  }, [animationSpeed]);

  const runPathfinding = () => {
    if (!graph || !startPosition || !endPosition || isPathfinding) return;
  
    setIsPathfinding(true);
    setIsShowingFinalPath(false);
    
    const start = [startPosition.x, startPosition.y];
    const end = [endPosition.x, endPosition.y];
    
    let result;
    if (selectedAlgorithm === 'dijkstra') {
      result = graph.dijkstra(start, end);
    } else if (selectedAlgorithm === 'astar') {
      result = graph.aStar(start, end);
    }
  
    if (result) {
      if (result[0] === -1) {
        setShowError(true);
        setPath([]);
        setIsShowingFinalPath(false);
        setIsPathfinding(false);
        handleClearMap();
        return;
      }
  
      setPath([]);
      const visitedCells = result[1];
      const finalPath = result[2];
      let animationFrameId;
  
      // Pre-calculate all the batches
      const cellsPerBatch = (() => {
        const totalCells = visitedCells.length;
        switch(speedRef.current) {
          case 1: return Math.max(15, Math.floor(totalCells / 700));  // Slow
          case 2: return Math.max(25, Math.floor(totalCells / 500));  // Medium
          case 3: return Math.max(80, Math.floor(totalCells / 300));  // Fast
          default: return 40;
        }
      })();
  
      let currentIndex = 0;
      let lastTimestamp = 0;
      const frameInterval = 16.67;  // 60 FPS
  
      const animate = (timestamp) => {
        if (currentIndex >= visitedCells.length) {
          cancelAnimationFrame(animationFrameId);
          setPath(finalPath);
          setIsShowingFinalPath(true);
          setIsPathfinding(false);
          return;
        }
  
        // Control frame rate
        if (timestamp - lastTimestamp < frameInterval) {
          animationFrameId = requestAnimationFrame(animate);
          return;
        }
  
        const endIndex = Math.min(currentIndex + cellsPerBatch, visitedCells.length);
        const newCells = visitedCells.slice(currentIndex, endIndex);
        
        setPath(prevPath => [...prevPath, ...newCells]);
        currentIndex = endIndex;
        lastTimestamp = timestamp;
        
        animationFrameId = requestAnimationFrame(animate);
      };
  
      // Start animation
      animationFrameId = requestAnimationFrame(animate);
  
      // Cleanup function
      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  };

  return (
    <>
    {notLoaded ? (
  <LoadingScreen setNotLoaded={setNotLoaded} />
    ) : videoPlaying ? (
      <div className={`fixed inset-0 w-full h-full bg-black ${fadeOut ? "fade-out" : ""}`}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
          onEnded={handleVideoEnd}
        >
          <source src={battlebusAnimation} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    ) : (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <header className="bg-gray-800 flex h-14 items-center justify-center text-center text-4xl text-white tracking-wider shadow-lg">
        Fortnite Pathfinder
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="bg-gray-200 w-64 overflow-y-auto shadow-lg flex flex-col divide-y divide-gray-200 border-r-2 border-dashed border-gray-300">
          {/* Map Selector Section */}
        <h2 className="bg-gray-800 h-12 flex items-center justify-center text-3xl font-bold text-yellow-400 tracking-wider drop-shadow-md">
          MAP SELECTOR
        </h2>
        <div className="p-4">
          <div className='grid grid-cols-3 gap-4'>
            <div className={`bg-white rounded-lg h-16 aspect-square cursor-pointer hover:ring-2  transition-all shadow-md flex items-center justify-center ${
              mapNumber === 1 
                ? 'border-2 border-green-400 hover:ring-green-400' 
                : 'hover:ring-blue-400'
            }`}
            onClick={() => setMapNumber(1)}>
              <div className="relative">
                <img src={fortniteMap1} className="rounded-lg" alt="Fortnite map" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white tracking-widest text-3xl">M1</span>
                </div>
              </div>
            </div>
            <div className={`bg-white rounded-lg h-16 aspect-square cursor-pointer hover:ring-2  transition-all shadow-md flex items-center justify-center ${
              mapNumber === 2 
                ? 'border-2 border-green-400 hover:ring-green-400' 
                : 'hover:ring-blue-400'
            }`}
            onClick={() => setMapNumber(2)}>
              <div className="relative">
                <img src={fortniteMap2} className="rounded-lg" alt="Fortnite map" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white tracking-widest text-3xl">M2</span>
                </div>
              </div>
            </div>
            <div className={`bg-white rounded-lg h-16 aspect-square cursor-pointer hover:ring-2  transition-all shadow-md flex items-center justify-center ${
              mapNumber === 3 
                ? 'border-2 border-green-400 hover:ring-green-400' 
                : 'hover:ring-blue-400'
            }`}
            onClick={() => setMapNumber(3)}>
              <div className="relative">
                <img src={fortniteMap3} className="rounded-lg" alt="Fortnite map" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white tracking-widest text-3xl">M3</span>
                </div>
              </div>
            </div>
            
            
          </div>
        </div>
          {/* Map Editor Section */}
          <h2 className="bg-gray-800 h-12 flex items-center justify-center text-3xl font-bold text-yellow-400 tracking-wider drop-shadow-md">
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

          {/* Speed Section */}
          <h2 className="bg-gray-800 h-12 flex items-center justify-center text-3xl font-bold text-yellow-400 tracking-wider drop-shadow-md">
            ALGORITHM SPEED
          </h2>
          <div className="p-4">
            <div className="flex flex-col items-center w-full">
              <input
                type="range"
                min="1"
                max="3"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                className="custom-slider w-4/5"
              />
              <div className="flex justify-between px-1 w-5/6 mt-2">
                <span className="text-gray-800 tracking-wider">Slow</span>
                <span className="text-gray-800 tracking-wider">Medium</span>
                <span className="text-gray-800 tracking-wider">Fast</span>
              </div>
            </div>
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
          {/* Error message*/}
          {showError && (
                <div className="absolute top-1/4 left-1/3 z-10 bg-[rgba(22,19,164,0.80)] flex flex-col items-center justify-center gap-3 px-10 py-4">
                  <img src={errorIcon} alt="" className="w-8" />
                  <h1 className="text-5xl text-white">THERE WAS A PROBLEM</h1>
                  <img src={topRect} alt="" />
                  <p className="text-xl tracking-wider text-[#5AABFF]">
                    You cannot place a marker in this spot!
                  </p>
                  <img src={bottomRect} alt="" />
                  <button
                    className="px-6 py-2 bg-[#FFFB00] text-xl"
                    onClick={handleClose}
                  >
                    Continue
                  </button>
                </div>
              )}
        <Map 
          onGridClick={handleMapClick}
          startPosition={startPosition}
          endPosition={endPosition}
          activeTool={activeTool}
          path={path}
          isShowingFinalPath={isShowingFinalPath}
          mapNumber={mapNumber}
        />
        </div>
      </div>
    </div>
    )}
    </>
  );
}

export default App;

