import fortniteMap from './assets/FortniteMap.jpg';
import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

function Map({ onGridClick, startPosition, endPosition, activeTool, path = [], isShowingFinalPath = false }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const GRID_SIZE = 400;
  const CELL_SCALE = 1;

  useEffect(() => {
    if (!canvasRef.current || !imgRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const computedStyle = window.getComputedStyle(imgRef.current);
    const width = parseInt(computedStyle.width);
    canvas.width = width;
    canvas.height = width;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all cells in the path
    if (path && path.length > 0) {
        path.forEach((coord) => {
            if (Array.isArray(coord) && coord.length === 2) {
                const [x, y] = coord;
                // Use blue for final path, yellow for visited cells during animation
                const color = isShowingFinalPath ? 'rgba(0, 0, 255, 1)' : 'rgba(157, 77, 187, 0.7)';
                markCellOnCanvas(ctx, x, y, width, color);
            }
        });
    }
}, [isImageLoaded, path, isShowingFinalPath]);

  const markCellOnCanvas = (ctx, x, y, width, color) => {
      const baseCellSize = width / GRID_SIZE;
      const cellSize = baseCellSize * CELL_SCALE;
      const pixelX = (x * baseCellSize) - (cellSize - baseCellSize) / 2;
      const pixelY = (y * baseCellSize) - (cellSize - baseCellSize) / 2;

      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
      ctx.globalAlpha = 1.0;

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(pixelX, pixelY, cellSize, cellSize);
  };

  const handleClick = (e) => {
      if (!activeTool || !containerRef.current || !imgRef.current) return;
  
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = containerRef.current.scrollTop;
      const scrollLeft = containerRef.current.scrollLeft;
  
      const imageDisplayWidth = imgRef.current.offsetWidth;
      
      const x = (e.clientX - rect.left + scrollLeft);
      const y = (e.clientY - rect.top + scrollTop);
      
      const baseCellSize = imageDisplayWidth / GRID_SIZE;
      const gridX = Math.floor(x / baseCellSize);
      const gridY = Math.floor(y / baseCellSize);
  
      if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
          onGridClick({ x: gridX, y: gridY });
      }
  };

  const getMarkerPosition = (position) => {
      if (!position || !containerRef.current) return null;
      
      const width = containerRef.current.clientWidth;
      const baseCellSize = width / GRID_SIZE;
      
      return {
          left: `${position.x * baseCellSize}px`,
          top: `${position.y * baseCellSize}px`
      };
  };

  const handleImageLoad = () => {
      setIsImageLoaded(true);
  };

  return (
      <div className="w-full h-full p-4">
          <div 
              ref={containerRef}
              className="w-full h-full rounded-3xl overflow-auto relative"
              onClick={handleClick}
          >
              <img 
                  ref={imgRef}
                  src={fortniteMap} 
                  alt="Fortnite Map" 
                  className="aspect-square w-full h-auto"
                  onLoad={handleImageLoad}
              />
              <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 aspect-square w-full h-auto"
              />
              
              {startPosition && getMarkerPosition(startPosition) && (
                  <div 
                      className="absolute pointer-events-none"
                      style={{
                          ...getMarkerPosition(startPosition),
                          transform: 'translate(-45%, -85%)'
                      }}
                  >
                      <MapPin size={32} color="#00fa04" strokeWidth={2} />
                  </div>
              )}

              {endPosition && getMarkerPosition(endPosition) && (
                  <div 
                      className="absolute pointer-events-none"
                      style={{
                          ...getMarkerPosition(endPosition),
                          transform: 'translate(-45%, -85%)'
                      }}
                  >
                      <MapPin size={32} color="#ff0000" strokeWidth={2} />
                  </div>
              )}

              {activeTool && (
                  <div 
                      className="fixed pointer-events-none"
                      style={{
                          left: 0,
                          top: 0,
                          transform: 'translate(-45%, -85%)',
                          cursor: 'pointer'
                      }}
                  >
                      <MapPin 
                          size={32} 
                          color={activeTool === 'start' ? "#00fa04" : "#ff0000"} 
                          strokeWidth={2} 
                      />
                  </div>
              )}
          </div>
      </div>
  );
}

export default Map;