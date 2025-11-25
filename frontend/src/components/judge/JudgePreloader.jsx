import React from 'react';
import './JudgePreloader.css';

export default function JudgePreloader() {
  return (
    <div className="judge-preloader">
      <div className="preloader-content">
        <img src="/assets/main-logo.png" alt="Logo" className="preloader-logo" />
        
        {/* Google Chrome */}
        <div className="infinityChrome">
          <div></div>
          <div></div>
          <div></div>
        </div>

        {/* Safari and others */}
        <div className="infinity">
          <div>
            <span></span>
          </div>
          <div>
            <span></span>
          </div>
          <div>
            <span></span>
          </div>
        </div>

        {/* SVG Filter */}
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style={{ display: 'none' }}>
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>

        <p className="preloader-text">Loading Judge Panel...</p>
      </div>
    </div>
  );
}
