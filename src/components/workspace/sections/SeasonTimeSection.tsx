import React from 'react';
import { useAmbience } from '../../../context/AmbienceContext';
import { SEASONS, TIMES_OF_DAY } from '../../../data/catalog';
import { Season, TimeOfDay } from '../../../types/ambience';
import {
  Calendar,
  Clock,
  Sprout,
  Sun,
  Leaf,
  Snowflake,
  Sunrise,
  SunMedium,
  SunDim,
  Sparkles,
  Sunset,
  CloudSun,
  MoonStar,
  Moon,
  Eclipse,
  Sliders,
  Check,
  RotateCcw,
} from 'lucide-react';

export const SeasonTimeSection: React.FC = () => {
  const { config, updateConfig, resetSection } = useAmbience();

  const getSeasonIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sprout': return <Sprout className="w-4 h-4 text-emerald-400" />;
      case 'Sun': return <Sun className="w-4 h-4 text-[#E8AE62]" />;
      case 'Leaf': return <Leaf className="w-4 h-4 text-amber-500" />;
      case 'Snowflake': return <Snowflake className="w-4 h-4 text-sky-300" />;
      default: return <Clock className="w-4 h-4 text-[#A1AEC0]" />;
    }
  };

  const getTimeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sunrise': return <Sunrise className="w-4 h-4 text-rose-300" />;
      case 'SunMedium': return <SunMedium className="w-4 h-4 text-[#E8AE62]" />;
      case 'Sun': return <Sun className="w-4 h-4 text-amber-300" />;
      case 'SunDim': return <SunDim className="w-4 h-4 text-amber-200" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-[#E8AE62]" />;
      case 'Sunset': return <Sunset className="w-4 h-4 text-orange-400" />;
      case 'CloudSun': return <CloudSun className="w-4 h-4 text-indigo-300" />;
      case 'MoonStar': return <MoonStar className="w-4 h-4 text-blue-300" />;
      case 'Moon': return <Moon className="w-4 h-4 text-indigo-200" />;
      case 'Eclipse': return <Eclipse className="w-4 h-4 text-purple-300" />;
      default: return <Sliders className="w-4 h-4 text-[#A1AEC0]" />;
    }
  };

  return (
    <section className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 mb-8 backdrop-blur-sm transition-all shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-[#1E2B3E]">
        <div>
          <h2 className="text-base font-semibold text-[#F2EEE6] flex items-center gap-2 font-display">
            <Calendar className="w-4 h-4 text-[#E8AE62]" />
            3. Season & Solar Time
          </h2>
          <p className="text-xs text-[#A1AEC0] mt-0.5">
            Set the calendar environment and specific time-of-day solar temperature
          </p>
        </div>

        <button
          type="button"
          onClick={() => resetSection('environment')}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#192434] rounded-lg transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Season Segmented Control */}
      <div className="mb-6">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1AEC0] mb-2 font-mono">
          Season
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {SEASONS.map((season) => {
            const isSelected = config.season === season.id;

            return (
              <button
                key={season.id}
                type="button"
                onClick={() =>
                  updateConfig((prev) => ({
                    ...prev,
                    season: season.id as Season,
                  }))
                }
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#192434] border-[#E8AE62] ring-1 ring-[#E8AE62]/40 shadow-md text-[#E8AE62]'
                    : 'bg-[#0E1520] hover:bg-[#151F2E] border-[#1E2B3E] hover:border-[#283952] text-[#F2EEE6]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#0B1018] border border-[#1E2B3E]">
                    {getSeasonIcon(season.icon)}
                  </div>
                  <span className={`text-xs font-medium ${isSelected ? 'text-[#E8AE62] font-semibold' : 'text-[#F2EEE6]'}`}>
                    {season.name}
                  </span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#E8AE62] stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time of Day Grid */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1AEC0] mb-2 font-mono">
          Time of Day
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {TIMES_OF_DAY.map((time) => {
            const isSelected = config.timeOfDay === time.id;

            return (
              <button
                key={time.id}
                type="button"
                onClick={() =>
                  updateConfig((prev) => ({
                    ...prev,
                    timeOfDay: time.id as TimeOfDay,
                  }))
                }
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#192434] border-[#E8AE62] ring-1 ring-[#E8AE62]/40 shadow-md'
                    : 'bg-[#0E1520] hover:bg-[#151F2E] border-[#1E2B3E] hover:border-[#283952]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-[#0B1018] border border-[#1E2B3E]">
                    {getTimeIcon(time.icon)}
                  </div>
                  {isSelected && <Check className="w-3 h-3 text-[#E8AE62] stroke-[3]" />}
                </div>
                <div>
                  <div className={`text-xs font-semibold ${isSelected ? 'text-[#E8AE62]' : 'text-[#F2EEE6]'}`}>
                    {time.name}
                  </div>
                  <div className="text-[11px] text-[#A1AEC0] mt-0.5 truncate">
                    {time.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Time Input */}
        {config.timeOfDay === 'custom' && (
          <div className="mt-4 p-4 bg-[#0B1018] border border-[#1E2B3E] rounded-xl">
            <label className="block text-xs font-medium text-[#F2EEE6] mb-1.5">
              Custom Time / Atmospheric Hour
            </label>
            <input
              type="text"
              value={config.customTimeOfDay || ''}
              onChange={(e) =>
                updateConfig((prev) => ({
                  ...prev,
                  customTimeOfDay: e.target.value,
                }))
              }
              placeholder="e.g. 3:00 AM witching hour with waning gibbous moon"
              className="w-full px-3 py-2 text-xs bg-[#101722] border border-[#1E2B3E] rounded-lg text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#E8AE62]"
            />
          </div>
        )}
      </div>
    </section>
  );
};
