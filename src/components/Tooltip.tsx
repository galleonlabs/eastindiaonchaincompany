import React, { useState } from "react";

interface HoverTooltipProps {
  text: string;
  children: React.ReactNode;
}

const HoverTooltip: React.FC<HoverTooltipProps> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-10 p-2 text-sm text-white bg-gray-800 rounded-md shadow-md -top-8 left-1/2 transform -translate-x-1/2">
          {text}
        </div>
      )}
    </div>
  );
};

export default HoverTooltip;
