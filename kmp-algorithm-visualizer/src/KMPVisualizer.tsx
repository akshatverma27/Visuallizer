import React, { useState, useEffect } from "react";
import "./KMPVisualizer.css";

interface CharacterBoxProps {
  char: string;
  state: "match" | "mismatch" | "current" | "default";
}

const CharacterBox: React.FC<CharacterBoxProps> = ({ char, state }) => {
  return <div className={`character-box ${state}`}>{char}</div>;
};

const KMPVisualizer: React.FC = () => {
  const [text, setText] = useState("ABCABABCABCABAB");
  const [pattern, setPattern] = useState("ABCABCAB");
  const [isRunning, setIsRunning] = useState(false);
  const [lps, setLps] = useState<number[]>([]);
  const [matches, setMatches] = useState<number[]>([]);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [patternPosition, setPatternPosition] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Compute LPS array
  const computeLPS = (pattern: string): number[] => {
    const lps: number[] = new Array(pattern.length).fill(0);
    let len = 0;
    let i = 1;

    while (i < pattern.length) {
      if (pattern[i] === pattern[len]) {
        len++;
        lps[i] = len;
        i++;
      } else {
        if (len !== 0) {
          len = lps[len - 1];
        } else {
          lps[i] = 0;
          i++;
        }
      }
    }

    return lps;
  };

  useEffect(() => {
    setLps(computeLPS(pattern));
  }, [pattern]);

  useEffect(() => {
    let timer: number;
    if (isRunning && currentPosition < text.length) {
      timer = window.setTimeout(() => {
        if (pattern[patternPosition] === text[currentPosition]) {
          if (patternPosition === pattern.length - 1) {
            setMatches([...matches, currentPosition - patternPosition]);
            setPatternPosition(lps[patternPosition]);
          } else {
            setPatternPosition(patternPosition + 1);
          }
          setCurrentPosition(currentPosition + 1);
        } else {
          if (patternPosition !== 0) {
            setPatternPosition(lps[patternPosition - 1]);
          } else {
            setCurrentPosition(currentPosition + 1);
          }
        }
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [
    isRunning,
    currentPosition,
    patternPosition,
    text,
    pattern,
    lps,
    matches,
  ]);

  const handleStartDemo = () => {
    if (pattern.length > text.length) {
      setError("Pattern length must be less than or equal to text length");
      return;
    }
    setError(null);
    setIsRunning(true);
    setCurrentPosition(0);
    setPatternPosition(0);
    setMatches([]);
  };

  const handleStopDemo = () => {
    setIsRunning(false);
  };

  const getCharacterState = (
    index: number
  ): "match" | "mismatch" | "current" | "default" => {
    if (index === currentPosition) return "current";
    if (index >= currentPosition - patternPosition && index < currentPosition) {
      return text[index] ===
        pattern[index - (currentPosition - patternPosition)]
        ? "match"
        : "mismatch";
    }
    return "default";
  };

  return (
    <div className="kmp-container">
      <div className="explanation-section">
        <h1>Knuth-Morris-Pratt Algorithm Visualizer</h1>
        <p>
          The KMP algorithm is a string matching algorithm that uses the LPS
          (Longest Prefix Suffix) array to avoid unnecessary comparisons. It's
          more efficient than the naive approach for pattern matching.
        </p>
        <button
          className="start-demo-btn"
          onClick={handleStartDemo}
          disabled={isRunning}
        >
          Start Demo
        </button>
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="input-section">
        <div className="input-group">
          <label htmlFor="text">Text:</label>
          <input
            id="text"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isRunning}
          />
        </div>
        <div className="input-group">
          <label htmlFor="pattern">Pattern:</label>
          <input
            id="pattern"
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            disabled={isRunning}
          />
        </div>
      </div>

      <div className="visualizer-section">
        <div className="text-row">
          {text.split("").map((char, index) => (
            <CharacterBox
              key={`text-${index}`}
              char={char}
              state={getCharacterState(index)}
            />
          ))}
        </div>
        <div className="pattern-row">
          {pattern.split("").map((char, index) => (
            <CharacterBox
              key={`pattern-${index}`}
              char={char}
              state={index === patternPosition ? "current" : "default"}
            />
          ))}
        </div>
      </div>

      <div className="lps-table">
        <h3>LPS Array:</h3>
        <div className="lps-cells">
          {lps.map((value, index) => (
            <div key={`lps-${index}`} className="lps-cell">
              {value}
            </div>
          ))}
        </div>
      </div>

      <div className="controls">
        <button
          className="control-btn"
          onClick={handleStopDemo}
          disabled={!isRunning}
        >
          Stop
        </button>
      </div>

      {matches.length > 0 && (
        <div className="matches">
          <h3>Matches found at positions:</h3>
          <p>{matches.join(", ")}</p>
        </div>
      )}
    </div>
  );
};

export default KMPVisualizer;
