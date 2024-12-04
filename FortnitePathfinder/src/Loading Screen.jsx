import React, { useState, useEffect } from "react";
import bgImage from "./assets/Images/loading-screen-bg.jpg";
import crosshairImage from "./assets/Images/crosshair.png";
import dashpatternImage from "./assets/Images/dash-pattern.jpg";
import "./Loading Screen.css";

function LoadingScreen({ setNotLoaded }) {
  const [filled, setFilled] = useState(0);
  useEffect(() => {
    if (filled < 100) {
      const timer = setTimeout(() => setFilled((prev) => prev + 5), 50);
      return () => clearTimeout(timer);
    } else {
      // add a short delay to visually see the entire bar loaded before loading the next page
      const delayTimer = setTimeout(() => setNotLoaded(false), 500);
      return () => clearTimeout(delayTimer);
    }
  }, [filled, setNotLoaded]);

  return (
    <div
      className="mx-auto w-screen h-screen bg-cover bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-yellow-400 w-70 h-20 px-6 py-2 flex items-center gap-3 absolute top-0 right-0">
        <p className="text-white text-5xl tracking-wider">
          Fortnite Pathfinder
        </p>
        <img className="w-10" src={crosshairImage} alt="" />
      </div>
      <div className="w-[80vw] h-screen flex items-end">
        <div className="my-28 text-4xl flex flex-col items-start gap-5">
          <p className="text-white tracking-wide">
            CONNECTING
            <span className="blinking-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </p>
          <div className="relative overflow-hidden w-[80vw] h-5 bg-slate-500">
            <div
              style={{
                height: "100%",
                width: `${filled}%`,
                backgroundColor: "#0C4279",
                transition: "width 0.5s",
                backgroundImage: `url(${dashpatternImage})`,
                backgroundBlendMode: "overlay",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
