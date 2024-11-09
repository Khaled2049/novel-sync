import React, { useState, useEffect, ChangeEvent, MouseEvent } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

const DigitalTimer: React.FC = () => {
  const [time, setTime] = useState<number>(0); // time in seconds
  const [isActive, setIsActive] = useState<boolean>(false);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (!isActive && time !== 0) {
      if (interval) clearInterval(interval);
    }

    if (time === 0) {
      if (interval) clearInterval(interval);
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time]);

  useEffect(() => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    setTime(totalSeconds);
  }, [hours, minutes, seconds]);

  const handleStartStop = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsActive(!isActive);
  };

  const handleReset = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsActive(false);
    setTime(0);
    setHours(0);
    setMinutes(0);
    setSeconds(0);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    unit: "hours" | "minutes" | "seconds"
  ) => {
    const value = Math.max(0, parseInt(e.target.value) || 0);
    switch (unit) {
      case "hours":
        setHours(value);
        break;
      case "minutes":
        setMinutes(Math.min(value, 59));
        break;
      case "seconds":
        setSeconds(Math.min(value, 59));
        break;
    }
  };

  const formatTime = (time: number): string => {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = time % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const totalSetTime = hours * 3600 + minutes * 60 + seconds;
  const progress = totalSetTime > 0 ? (time / totalSetTime) * 100 : 0;

  return (
    <div className="max-w-md mx-auto text-center items-center justify-center">
      <div className="relative w-48 h-48 mx-auto">
        <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center relative">
          <div className="text-4xl font-mono font-bold text-gray-800">
            {formatTime(time)}
          </div>
        </div>
        <svg className="absolute top-0 left-0" width="192" height="192">
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="16"
            strokeDasharray="552.8"
            strokeDashoffset={552.8 - (progress / 100) * 552.8}
            transform="rotate(-90 96 96)"
          />
        </svg>
      </div>

      <div className="mb-8 flex justify-between items-center mt-4">
        <div className="flex flex-col items-center">
          <input
            type="number"
            min="0"
            value={hours}
            onChange={(e) => handleChange(e, "hours")}
            className="w-16 bg-transparent text-center text-2xl font-semibold text-gray-800 focus:outline-none"
          />
          <span className="text-sm text-gray-500">Hours</span>
        </div>
        <div className="text-2xl font-semibold text-gray-400">:</div>
        <div className="flex flex-col items-center">
          <input
            type="number"
            min="0"
            max="59"
            value={minutes}
            onChange={(e) => handleChange(e, "minutes")}
            className="w-16 bg-transparent text-center text-2xl font-semibold text-gray-800 focus:outline-none"
          />
          <span className="text-sm text-gray-500">Minutes</span>
        </div>
        <div className="text-2xl font-semibold text-gray-400">:</div>
        <div className="flex flex-col items-center">
          <input
            type="number"
            min="0"
            max="59"
            value={seconds}
            onChange={(e) => handleChange(e, "seconds")}
            className="w-16 bg-transparent text-center text-2xl font-semibold text-gray-800 focus:outline-none"
          />
          <span className="text-sm text-gray-500">Seconds</span>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={handleStartStop}
          className={`p-4 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
            isActive
              ? "bg-red-500 hover:bg-red-600 focus:ring-red-500"
              : "bg-green-500 hover:bg-green-600 focus:ring-green-500"
          }`}
        >
          {isActive ? (
            <Pause size={32} color="white" />
          ) : (
            <Play size={32} color="white" />
          )}
        </button>
        <button
          onClick={handleReset}
          className="p-4 bg-gray-500 text-white rounded-full transition-colors duration-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          <RotateCcw size={32} />
        </button>
      </div>
    </div>
  );
};

export default DigitalTimer;
