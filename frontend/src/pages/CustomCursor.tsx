import React, { useState, useEffect } from "react";
import "./login/Login.css";

const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      className="custom-cursor"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: 'fixed', 
        pointerEvents: 'none', 
        transition: 'transform 0.1s ease', 
        transform: 'translate(-50%, -50%)', 
      }}
    />
  );
};

export default CustomCursor;
