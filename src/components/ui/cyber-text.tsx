"use client";
import React, { useEffect, useState } from "react";

const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+<>?";

interface CyberTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function CyberText({ text, className = "", delay = 0 }: CyberTextProps) {
  const [displayText, setDisplayText] = useState<string>(
    text.split("").map((c) => (c === " " ? " " : ALPHABETS[0])).join("")
  );
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    timeoutId = setTimeout(() => {
      let iteration = 0;
      let intervalId: NodeJS.Timeout;
      
      // We want the effect to sweep from left to right, locking characters.
      // 3 iterations per character looks smooth.
      const maxIterations = text.length * 3; 

      intervalId = setInterval(() => {
        setDisplayText((currentText) => {
          return text
            .split("")
            .map((char, index) => {
              // If the index has been 'passed' by the iteration, show the actual character
              if (index < iteration / 3) {
                return text[index];
              }
              // Don't scramble spaces
              if (char === " ") return " ";
              
              // Scramble remaining characters
              return ALPHABETS[Math.floor(Math.random() * ALPHABETS.length)];
            })
            .join("");
        });

        if (iteration >= maxIterations) {
          clearInterval(intervalId);
          setDisplayText(text); // Ensure final state is exactly correct
        }

        iteration += 1;
      }, 30);

      return () => clearInterval(intervalId);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [text, delay]);

  return (
    <span className={className}>
      {displayText}
    </span>
  );
}
