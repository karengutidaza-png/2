
import React, { useState, useEffect, useRef } from 'react';
import type { NadaMetrics, NadaSession } from '../types';
import { useAppContext } from '../context/AppContext';
import { PlusCircle, MinusCircle, Zap, Gauge, TrendingUp, Flame, CalendarDays, BarChart4, NotebookText, Check, MapPin, Plus, Clock, X, ChevronUp, ChevronDown } from 'lucide-react';
import CalendarModal from './CalendarModal';

// --- HELPER FUNCTIONS ---

function parseCustomDate(dateString: string): Date | null {
  if (typeof dateString !== 'string' || !dateString.trim()) return null;
  if (dateString.includes('-')) {
    const date = new Date(dateString + 'T00:00:00');
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return null;
}

const formatDisplayDate = (dateString: string): string => {
  const date = parseCustomDate(dateString);
  if (date) {
    const formatted = date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    return (formatted.charAt(0).toUpperCase() + formatted.slice(1)).replace(/[,.]/g, '');
  }
  return dateString;
};

const formatMetric = (value: string | undefined, unit: string) => {
    if (!value || value.trim() === '') return '-';
    // For time, the format is self-descriptive (HH:MM:SS), so just return the value.
    if (unit.toLowerCase() === 'min') {
        return value;
    }
    if (value.toUpperCase().includes(unit.toUpperCase())) return value;
    if (!isNaN(parseFloat(value)) && isFinite(Number(value))) {
      return `${value} ${unit}`;
    }
    return value;
};

const TimeStepper: React.FC<{
  value: number;
  setValue: (updater: (prev: number) => number) => void;
  min: number;
  max: number;
  label: string;
  inputRef?: React.Ref<HTMLInputElement>;
}> = ({ value, setValue, min, max, label, inputRef }) => {
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const entryRef = useRef('');
  const justFocused = useRef(false);

  const adjustValue = (amount: number) => {
    setValue(prev => {
      let newValue = prev + amount;
      if (newValue > max) newValue = max;
      if (newValue < min) newValue = min;
      return newValue;
    });
  };

  const startChanging = (amount: number) => {
    adjustValue(amount);
    timeoutRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(() => {
        adjustValue(amount);
      }, 80);
    }, 500);
  };

  const stopChanging = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
  
  useEffect(() => {
    return () => stopChanging();
  }, []);
  
  const handleFocus = () => {
      justFocused.current = true;
  };

  const handleBlur = () => {
      entryRef.current = '';
      justFocused.current = false;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputType = (e.nativeEvent as InputEvent).inputType;
    const typedChar = (e.nativeEvent as InputEvent).data;

    if (inputType === 'insertText' && typedChar && /[0-9]/.test(typedChar)) {
        if (justFocused.current) {
            entryRef.current = ''; // Clear on first type after focus
            justFocused.current = false;
        }

        entryRef.current += typedChar;
        if (entryRef.current.length > 2) {
            entryRef.current = entryRef.current.slice(-2);
        }
        
        const numericValue = parseInt(entryRef.current, 10);
        if (!isNaN(numericValue)) {
            setValue(() => numericValue);
        }
    } else if (inputType === 'deleteContentBackward' || inputType === 'deleteContentForward') {
        entryRef.current = '';
        setValue(() => 0);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onMouseDown={() => startChanging(1)}
        onMouseUp={stopChanging}
        onMouseLeave={stopChanging}
        onTouchStart={(e) => { e.preventDefault(); startChanging(1); }}
        onTouchEnd={stopChanging}
        className="p-2 text-cyan-400 hover:text-cyan-300 transition-colors rounded-full hover:bg-white/10"
        aria-label={`Incrementar ${label}`}
      >
        <ChevronUp className="w-10 h-10" />
      </button>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={String(value).padStart(2, '0')}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="text-7xl font-semibold tabular-nums text-white my-2 w-28 text-center bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-lg"
        aria-label={label}
      />
      <button
        onMouseDown={() => startChanging(-1)}
        onMouseUp={stopChanging}
        onMouseLeave={stopChanging}
        onTouchStart={(e) => { e.preventDefault(); startChanging(-1); }}
        onTouchEnd={stopChanging}
        className="p-2 text-cyan-400 hover:text-cyan-300 transition-colors rounded-full hover:bg-white/10"
        aria-label={`Decrementar ${label}`}
      >
        <ChevronDown className="w-10 h-10" />
      </button>
      <span className="text-sm font-bold text-gray-400 mt-2">{label}</span>
    </div>
  );
};


const TimePickerModal: React.FC<{ initialValue: string; onSave: (value: string) => void; onClose: () => void; }> = ({ initialValue, onSave, onClose }) => {
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const minutesInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const parts = (initialValue || "0:0:00").split(':');
        let h = 0, m = 0, s = 0;

        if (parts.length === 3) {
            h = parseInt(parts[0], 10) || 0;
            m = parseInt(parts[1], 10) || 0;
            s = parseInt(parts[2], 10) || 0;
        } else if (parts.length === 2) {
            m = parseInt(parts[0], 10) || 0;
            s = parseInt(parts[1], 10) || 0;
        }
        
        setHours(Math.min(Math.max(h, 0), 99));
        setMinutes(Math.min(Math.max(m, 0), 59));
        setSeconds(Math.min(Math.max(s, 0), 59));
    }, [initialValue]);

    useEffect(() => {
        const timer = setTimeout(() => {
            minutesInputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);
    
    useEffect(() => {
        if (seconds >= 60) {
            setMinutes(m => m + Math.floor(seconds / 60));
            setSeconds(s => s % 60);
        }
        if (seconds < 0) {
            setMinutes(m => Math.max(m - 1, 0));
            setSeconds(59);
        }
    }, [seconds]);

    useEffect(() => {
        if (minutes >= 60) {
            setHours(h => h + Math.floor(minutes / 60));
            setMinutes(m => m % 60);
        }
        if (minutes < 0) {
            setHours(h => Math.max(h - 1, 0));
            setMinutes(59);
        }
    }, [minutes]);

    useEffect(() => {
        if (hours > 99) setHours(99);
        if (hours < 0) setHours(0);
    }, [hours]);

    const handleSave = () => {
        const timeString = hours > 0
            ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            : `${minutes}:${String(seconds).padStart(2, '0')}`;
        onSave(timeString);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[110] animate-fadeIn" onClick={onClose}>
            <div className="bg-gray-800/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl p-6 w-full max-w-md m-4 animate-scaleIn text-center" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-cyan-400 mb-6">Seleccionar Tiempo</h3>
                
                <div className="flex items-start justify-center gap-1 my-6