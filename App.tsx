
import React, { useState, useMemo, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import MyExercises from './pages/MyExercises';
import WorkoutDay from './pages/WorkoutDay';
import Summary from './pages/Summary';
import { Sparkles, Menu, Home, BarChart4, Dumbbell, Shirt, Footprints, Shield, Hand, ChevronLeft, ChevronRight, X, Weight, Repeat, Zap, Gauge, TrendingUp, Flame, MapPin, NotebookText, Clock, HeartPulse } from 'lucide-react';
import StretchingPage from './pages/StretchingPage';
import type { ExerciseLog } from './types';


const dayLabels: { [key: string]: string } = {
  'Día 5': 'Cardio',
  'Día 1': 'Pecho y Bíceps',
  'Día 2': 'Pierna y Glúteo',
  'Día 3': 'Hombro y Espalda',
  'Día 4': 'Tríceps y Antebrazo',
};

const DAY_TABS = Object.values(dayLabels);
const TABS_ORDER = [...DAY_TABS, 'Estiramientos', 'Resumen'];
const DAY_LABEL_TO_KEY = Object.fromEntries(Object.entries(dayLabels).map(([key, label]) => [label, key]));

const tabIcons: { [key: string]: React.ElementType } = {
  'Inicio': Home,
  'Resumen': BarChart4,
  'Pecho y Bíceps': Shirt,
  'Pierna y Glúteo': Footprints,
  'Hombro y Espalda': Shield,
  'Tríceps y Antebrazo': Hand,
  'Cardio': HeartPulse,
  'Estiramientos': Sparkles,
};

// Helper to convert date object to 'YYYY-MM-DD' string, respecting local timezone
const toYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const useActiveDates = () => {
  const { summaryLogs } = useAppContext();

  return useMemo(() => {
    const datesWithData = new Set<string>();
    
    const parseAndFormat = (dateString: string): string | null => {
        if (!dateString || !dateString.includes('-')) return null;
        try {
            const date = new Date(dateString + 'T00:00:00');
            if (!isNaN(date.getTime())) {
                return toYYYYMMDD(date);
            }
        } catch (e) { /* ignore parse errors */ }
        return null;
    }

    summaryLogs.forEach(log => {
        const formattedDate = parseAndFormat(log.date);
        if(formattedDate) datesWithData.add(formattedDate);
    });

    return datesWithData;
  }, [summaryLogs]);
};

const MonthCalendarModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const activeDates = useActiveDates();
  const [viewDate, setViewDate] = useState(new Date());
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const changeMonth = (amount: number) => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(1);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const calendarGrid = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

    const grid = [];
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    for (let i = 0; i < dayOffset; i++) {
      grid.push({ day: daysInPrevMonth - dayOffset + i + 1, isCurrentMonth: false, dateStr: '' });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      grid.push({ day: i, isCurrentMonth: true, dateStr: toYYYYMMDD(date) });
    }
    const remainingSlots = 42 - grid.length;
    for (let i = 1; i <= remainingSlots; i++) {
      grid.push({ day: i, isCurrentMonth: false, dateStr: '' });
    }
    return grid;
  }, [viewDate]);

  if (!isOpen) return null;
  const todayStr = toYYYYMMDD(new Date());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn" onClick={onClose}>
      <div className="bg-gray-800/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl p-4 w-full max-w-sm m-4 animate-scaleIn" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-white/10 transition">
            <ChevronLeft className="w-5 h-5 text-cyan-400" />
          </button>
          <div className="font-bold text-lg text-white capitalize">
            {viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </div>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-white/10 transition">
            <ChevronRight className="w-5 h-5 text-cyan-400" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2 font-semibold">
          <div>L</div><div>M</div><div>X</div><div>J</div><div>V</div><div>S</div><div>D</div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarGrid.map((item, index) => {
            const hasData = item.isCurrentMonth && activeDates.has(item.dateStr);
            const isToday = item.isCurrentMonth && item.dateStr === todayStr;

            let classes = "w-10 h-10 flex items-center justify-center rounded-full text-sm transition ";
            if (item.isCurrentMonth) {
              classes += "text-white ";
            } else {
              classes += "text-gray-600 ";
            }

            if (hasData) {
                classes += "bg-cyan-500/80 font-bold ";
            }
            if (isToday && !hasData) {
                classes += "ring-2 ring-cyan-400 ";
            } else if (isToday && hasData) {
                classes += "ring-2 ring-white/80 ";
            }

            return (
              <div key={index} className={classes}>
                {item.day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SummaryMonthCalendarModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: string) => void;
  currentDate: string;
}> = ({ isOpen, onClose, onDateSelect, currentDate }) => {
  const activeDates = useActiveDates();
  const [viewDate, setViewDate] = useState(() => {
    const date = new Date(currentDate + 'T00:00:00');
    return isNaN(date.getTime()) ? new Date() : date;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const changeMonth = (amount: number) => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(1);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const calendarGrid = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

    const grid = [];
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    for (let i = 0; i < dayOffset; i++) {
      grid.push({ day: daysInPrevMonth - dayOffset + i + 1, isCurrentMonth: false, dateStr: '' });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      grid.push({ day: i, isCurrentMonth: true, dateStr: toYYYYMMDD(date) });
    }
    const remainingSlots = 42 - grid.length;
    for (let i = 1; i <= remainingSlots; i++) {
      grid.push({ day: i, isCurrentMonth: false, dateStr: '' });
    }
    return grid;
  }, [viewDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] animate-fadeIn" onClick={onClose}>
      <div className="bg-gray-800/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl p-4 w-full max-w-sm m-4 animate-scaleIn" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-white/10 transition">
            <ChevronLeft className="w-5 h-5 text-cyan-400" />
          </button>
          <div className="font-bold text-lg text-white capitalize">
            {viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </div>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-white/10 transition">
            <ChevronRight className="w-5 h-5 text-cyan-400" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2 font-semibold">
          <div>L</div><div>M</div><div>X</div><div>J</div><div>V</div><div>S</div><div>D</div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarGrid.map((item, index) => {
            const hasData = item.isCurrentMonth && activeDates.has(item.dateStr);
            const isSelected = item.isCurrentMonth && item.dateStr === currentDate;

            let classes = "w-10 h-10 flex items-center justify-center rounded-full text-sm transition ";
            if (item.isCurrentMonth) {
              if (hasData) {
                classes += "bg-cyan-500/80 font-bold text-white cursor-pointer hover:bg-cyan-400 ";
              } else {
                classes += "text-gray-500 cursor-not-allowed ";
              }
            } else {
              classes += "text-gray-600 ";
            }

            if (isSelected) {
                classes += "ring-2 ring-white/80 ";
            }
            
            return (
              <button
                key={index}
                className={classes}
                disabled={!hasData}
                onClick={() => hasData && onDateSelect(item.dateStr)}
              >
                {item.day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const DailySummaryModal: React.FC<{ date: string | null; onClose: () => void; onDateChange: (newDate: string) => void; }> = ({ date, onClose, onDateChange }) => {
    const { summaryLogs, sedeColorStyles } = useAppContext();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (date) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [date, onClose]);

    const dailyData = useMemo(() => {
      if (!date) return { groupedItems: {} };

      const itemsForDate: ExerciseLog[] = [
          ...summaryLogs.filter(log => log.date === date),
      ];

      const groupedItems = itemsForDate.reduce((acc, item) => {
          const dayKey = item.day || 'Otros';
          if (!acc[dayKey]) {
              acc[dayKey] = [];
          }
          acc[dayKey].push(item);
          return acc;
      }, {} as { [key: string]: ExerciseLog[] });

      return { groupedItems };
    }, [date, summaryLogs]);


    if (!date) return null;

    const getSedeColor = (sedeName: string) => sedeColorStyles.get(sedeName)?.tag || 'bg-gray-500 text-white';

    const formatDisplayDate = (dateString: string): string => {
        const d = new Date(dateString + 'T00:00:00');
        if (!isNaN(d.getTime())) {
            const weekday = d.toLocaleDateString('es-ES', { weekday: 'long' });
            const day = d.getDate();
            const month = d.toLocaleDateString('es-ES', { month: 'long' });
            const year = d.getFullYear();

            const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
            
            return `${capitalize(weekday)} ${day} ${capitalize(month)} ${year}`;
        }
        return dateString;
    };
    
    const dayOrder = ['Día 5', 'Día 1', 'Día 2', 'Día 3', 'Día 4', 'Otros'];
    const sortedDayKeys = Object.keys(dailyData.groupedItems).sort((a, b) => {
        const indexA = dayOrder.indexOf(a);
        const indexB = dayOrder.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    return (
        <>
            <SummaryMonthCalendarModal
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                onDateSelect={(newDate) => {
                    onDateChange(newDate);
                    setIsCalendarOpen(false);
                }}
                currentDate={date}
            />
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn" onClick={onClose}>
                <div className="bg-gray-800/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl p-6 w-full max-w-2xl m-4 animate-scaleIn flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <button onClick={() => setIsCalendarOpen(true)} className="text-xl font-bold text-cyan-400 capitalize hover:text-cyan-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/70 rounded-md px-2 py-1 -ml-2">
                            {formatDisplayDate(date)}
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition" aria-label="Cerrar">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar pr-2 space-y-6">
                        {Object.keys(dailyData.groupedItems).length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-400">No hay registros para este día.</p>
                            </div>
                        ) : (
                            <>
                                {sortedDayKeys.map(dayKey => {
                                    const items = dailyData.groupedItems[dayKey];
                                    const dayLabel = dayLabels[dayKey] || dayKey;
                                    const Icon = tabIcons[dayLabel] || Dumbbell;
                                    const isNadaTab = dayKey === 'Día 5';

                                    return (
                                      <div key={dayKey} className="space-y-4">
                                          <div className="flex items-center gap-3">
                                              <Icon className="w-7 h-7 text-cyan-400" />
                                              <h3 className="text-xl font-bold text-cyan-300">{dayLabel}</h3>
                                          </div>
                                          {items.map(item => {
                                              const log = item as ExerciseLog;
                                              const hasSeries = log.series && log.series.trim() !== '';
                                              const hasReps = log.reps && log.reps.trim() !== '';
                                              const hasKilos = log.kilos && log.kilos.trim() !== '';
                                              const hasTiempo = log.tiempo && log.tiempo.trim() !== '';
                                              const hasCalorias = log.calorias && log.calorias.trim() !== '';
                                              const hasMetrics = hasSeries || hasReps || hasKilos || hasTiempo || hasCalorias;

                                              return (
                                                  <div key={log.id} className="bg-black/20 rounded-lg p-4 border border-white/10">
                                                      <div className="flex items-center gap-3">
                                                          <div>
                                                              <h3 className="font-bold text-white truncate">{log.exerciseName}</h3>
                                                              <span className={`${getSedeColor(log.sede)} text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1`}><MapPin className="w-3 h-3"/>{log.sede}</span>
                                                          </div>
                                                      </div>
                                                      {hasMetrics && (
                                                          <div className="mt-4 pt-4 border-t border-gray-700/50 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-sm">
                                                              {isNadaTab && hasTiempo && <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-cyan-400 flex-shrink-0"/><div><p className="text-xs text-gray-400">Tiempo</p><p className="font-semibold text-white">{log.tiempo} Min</p></div></div>}
                                                              {hasSeries && <div className="flex items-center gap-2">
                                                                  {isNadaTab ? <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0"/> : <BarChart4 className="w-5 h-5 text-cyan-400 flex-shrink-0"/>}
                                                                  <div><p className="text-xs text-gray-400">{isNadaTab ? 'Velocidad' : 'Series'}</p><p className="font-semibold text-white">{log.series}{isNadaTab ? ' Km/h' : ''}</p></div>
                                                              </div>}
                                                              {hasReps && <div className="flex items-center gap-2">
                                                                  {isNadaTab ? <Gauge className="w-5 h-5 text-cyan-400 flex-shrink-0"/> : <Repeat className="w-5 h-5 text-cyan-400 flex-shrink-0"/>}
                                                                  <div><p className="text-xs text-gray-400">{isNadaTab ? 'Distancia' : 'Reps'}</p><p className="font-semibold text-white">{log.reps}{isNadaTab && log.distanceUnit ? ` ${log.distanceUnit === 'KM' ? 'Kilómetros' : 'Metros'}` : ''}</p></div>
                                                              </div>}
                                                              {isNadaTab && hasCalorias && <div className="flex items-center gap-2"><Flame className="w-5 h-5 text-cyan-400 flex-shrink-0"/><div><p className="text-xs text-gray-400">Calorías</p><p className="font-semibold text-white">{log.calorias} Kcal</p></div></div>}
                                                              {hasKilos && <div className="flex items-center gap-2">
                                                                  {isNadaTab ? <TrendingUp className="w-5 h-5 text-cyan-400 flex-shrink-0"/> : <Weight className="w-5 h-5 text-cyan-400 flex-shrink-0"/>}
                                                                  <div><p className="text-xs text-gray-400">{isNadaTab ? 'Inclinación' : 'Kilos'}</p><p className="font-semibold text-white">{log.kilos}{isNadaTab ? ' %' : ' kgs'}</p></div>
                                                              </div>}
                                                              {!isNadaTab && hasTiempo && <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-cyan-400 flex-shrink-0"/><div><p className="text-xs text-gray-400">Tiempo</p><p className="font-semibold text-white">{log.tiempo} Min</p></div></div>}
                                                              {!isNadaTab && hasCalorias && <div className="flex items-center gap-2"><Flame className="w-5 h-5 text-cyan-400 flex-shrink-0"/><div><p className="text-xs text-gray-400">Calorías</p><p className="font-semibold text-white">{log.calorias} Kcal</p></div></div>}
                                                          </div>
                                                      )}
                                                      {log.notes && (
                                                          <div className={`${hasMetrics ? 'mt-3 pt-3 border-t border-gray-700/50' : 'mt-4 pt-4 border-t border-gray-700/50'}`}>
                                                              <div className="flex items-start gap-2 text-gray-300 text-sm italic">
                                                                  <NotebookText className="w-4 h-4 mt-0.5 flex-shrink-0 text-cyan-400" />
                                                                  <p className="whitespace-pre-wrap">{log.notes}</p>
                                                              </div>
                                                          </div>
                                                      )}
                                                  </div>
                                              )
                                          })}
                                      </div>
                                    )
                                })}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};


// The user refers to this as "calendario inicio"
const HomeWeekCalendar: React.FC<{ onClick: () => void; }> = ({ onClick }) => {
  const activeDates = useActiveDates();

  const weekDates = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const firstDayOfWeek = new Date(today);
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    firstDayOfWeek.setDate(today.getDate() + diff);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek);
      date.setDate(firstDayOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  const todayStr = toYYYYMMDD(new Date());

  return (
    <button onClick={onClick} className="w-full max-w-md focus-glow rounded-lg" aria-label="Abrir calendario mensual">
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDates.map(date => {
          const dateStr = toYYYYMMDD(date);
          const hasData = activeDates.has(dateStr);
          const isToday = dateStr === todayStr;

          const dayOfWeek = date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').toUpperCase();
          const dayOfMonth = date.getDate();
          
          let classes = "flex flex-col items-center justify-center p-1 rounded-lg transition-all duration-300 aspect-square text-xs ";
          if (hasData) {
            classes += "bg-cyan-500/80 text-white font-bold shadow-lg shadow-cyan-500/20";
          } else {
            classes += "bg-white/5 text-gray-400";
          }
          if (isToday && !hasData) {
              classes += " ring-2 ring-cyan-400";
          } else if (isToday && hasData) {
              classes += " ring-2 ring-white/80";
          }

          return (
            <div key={dateStr} className={classes}>
              <span className="font-semibold tracking-wider">{dayOfWeek}</span>
              <span className="text-lg font-bold mt-0.5">{dayOfMonth}</span>
            </div>
          );
        })}
      </div>
    </button>
  );
};

// The user refers to this as "calendario pestañas"
const SedeWeekCalendar: React.FC<{ onDateClick: (date: string) => void }> = ({ onDateClick }) => {
  const activeDates = useActiveDates();

  const weekDates = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const firstDayOfWeek = new Date(today);
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    firstDayOfWeek.setDate(today.getDate() + diff);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek);
      date.setDate(firstDayOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  const todayStr = toYYYYMMDD(new Date());

  return (
    <div className="w-full max-w-md">
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDates.map(date => {
          const dateStr = toYYYYMMDD(date);
          const hasData = activeDates.has(dateStr);
          const isToday = dateStr === todayStr;

          const dayOfWeek = date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').toUpperCase();
          const dayOfMonth = date.getDate();
          
          let classes = "flex flex-col items-center justify-center p-1 rounded-lg transition-all duration-300 aspect-square text-xs focus-glow btn-active ";
          if (hasData) {
            classes += "bg-cyan-500/80 text-white font-bold shadow-lg shadow-cyan-500/20 cursor-pointer hover:brightness-110";
          } else {
            classes += "bg-white/5 text-gray-400 cursor-not-allowed";
          }
          if (isToday && !hasData) {
              classes += " ring-2 ring-cyan-400";
          } else if (isToday && hasData) {
              classes += " ring-2 ring-white/80";
          }

          return (
            <button
              key={dateStr}
              className={classes}
              onClick={() => hasData && onDateClick(dateStr)}
              disabled={!hasData}
              aria-label={hasData ? `Ver resumen del ${dayOfMonth}/${date.getMonth() + 1}` : `Sin datos para el ${dayOfMonth}/${date.getMonth() + 1}`}
            >
              <span className="font-semibold tracking-wider">{dayOfWeek}</span>
              <span className="text-lg font-bold mt-0.5">{dayOfMonth}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};


const AppContent: React.FC = () => {
  const { activeSede, setActiveSede } = useAppContext();
  const [activeTab, setActiveTab] = useState('Inicio');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMonthCalendarOpen, setIsMonthCalendarOpen] = useState(false);
  const [dailySummaryDate, setDailySummaryDate] = useState<string | null>(null);

  const handleSedeSelected = (sedeName: string) => {
    setActiveSede(sedeName);
    setActiveTab('Resumen');
  };

  const renderContent = () => {
    if (!activeSede) {
      return <MyExercises onSedeSelected={handleSedeSelected} />;
    }

    switch (activeTab) {
      case 'Inicio':
        return <MyExercises onSedeSelected={handleSedeSelected} />;
      case 'Resumen':
        return <Summary />;
      case 'Estiramientos':
        return <StretchingPage />;
      default:
        if (DAY_LABEL_TO_KEY[activeTab]) {
            return <WorkoutDay dayName={DAY_LABEL_TO_KEY[activeTab]} />;
        }
        return <MyExercises onSedeSelected={handleSedeSelected} />;
    }
  };

  const getSidebarButtonClasses = (tabName: string) => {
    return `w-full text-left py-3 px-4 font-semibold text-lg transition-all duration-300 focus:outline-none rounded-lg flex items-center gap-4 transform hover:-translate-y-0.5 ${
      activeTab === tabName
        ? 'bg-cyan-500/80 text-white shadow-lg shadow-cyan-500/20'
        : 'text-gray-300 hover:bg-white/10 hover:text-white'
    }`;
  };
  
  const handleHomeClick = () => {
    setActiveSede(null);
    setActiveTab('Inicio');
    setIsSidebarOpen(false);
  };
  
  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
    setIsSidebarOpen(false);
  };

  const displayedTabs = activeSede ? TABS_ORDER : [];

  return (
    <>
      <MonthCalendarModal isOpen={isMonthCalendarOpen} onClose={() => setIsMonthCalendarOpen(false)} />
      <DailySummaryModal date={dailySummaryDate} onClose={() => setDailySummaryDate(null)} onDateChange={setDailySummaryDate} />
      <div className="min-h-screen bg-transparent text-gray-100 font-sans">
        <header className="sticky top-0 z-20 bg-gray-900/50 backdrop-blur-xl border-b border-white/10 p-4">
          <div className="container mx-auto flex items-center justify-between">
            {activeSede ? (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-md text-gray-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                aria-label="Abrir menú de navegación"
              >
                <Menu className="w-6 h-6" />
              </button>
            ) : (
              <div className="w-10 h-10" />
            )}
            
            <div className="flex-grow flex justify-center items-center">
              {activeSede ? <SedeWeekCalendar onDateClick={setDailySummaryDate} /> : <HomeWeekCalendar onClick={() => setIsMonthCalendarOpen(true)} />}
            </div>
            <div className="w-10" />
          </div>
        </header>

        {/* Sidebar Backdrop */}
        <div
            className={`fixed inset-0 bg-black z-30 transition-opacity duration-300 ${isSidebarOpen ? 'bg-opacity-60' : 'bg-opacity-0 pointer-events-none'}`}
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
        ></div>

        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 h-full w-72 bg-gray-900/60 backdrop-blur-xl border-r border-white/10 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-5 flex flex-col h-full">
                <button
                  onClick={handleHomeClick}
                  className="flex items-center justify-center gap-4 text-center py-3 px-4 transition-all duration-300 focus:outline-none rounded-lg text-gray-300 hover:bg-white/10 hover:text-white mb-6 w-full"
                  aria-label="Ir a la página de inicio"
                >
                  <Home className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                  <div>
                    <span className="block text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                      Inicio
                    </span>
                    {activeSede && (
                      <span className="block text-sm font-bold text-white uppercase -mt-1 tracking-wider">
                        {activeSede}
                      </span>
                    )}
                  </div>
                </button>
                <nav className="flex-grow space-y-3">
                    {displayedTabs.map((tab) => {
                        const Icon = tabIcons[tab] || Dumbbell;
                        return (
                            <button
                                key={tab}
                                onClick={() => handleTabClick(tab)}
                                className={getSidebarButtonClasses(tab)}
                            >
                                <Icon className="w-6 h-6" />
                                <span>{tab}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </aside>

        <main className="container mx-auto p-2 sm:p-4">
          {renderContent()}
        </main>
      </div>
    </>
  );
}

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
