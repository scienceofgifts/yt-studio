import React, { useState } from 'react';
import { useAmbience } from '../../../context/AmbienceContext';
import { SCENE_ELEMENT_GROUPS } from '../../../data/catalog';
import {
  Boxes,
  ShieldAlert,
  UserX,
  Users,
  Lamp,
  BookOpen,
  Trees,
  Check,
  Plus,
  X,
  RotateCcw,
} from 'lucide-react';

export const ElementsSection: React.FC = () => {
  const { config, updateConfig, resetSection } = useAmbience();
  const { elements } = config;
  const [customInput, setCustomInput] = useState('');

  const toggleItem = (category: 'lightSources' | 'interiorObjects' | 'outdoorElements' | 'livingSubjects', id: string) => {
    updateConfig((prev) => {
      const currentList = prev.elements[category];
      const nextList = currentList.includes(id)
        ? currentList.filter((item) => item !== id)
        : [...currentList, id];

      return {
        ...prev,
        elements: {
          ...prev.elements,
          [category]: nextList,
        },
      };
    });
  };

  const addCustomElement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    updateConfig((prev) => ({
      ...prev,
      elements: {
        ...prev.elements,
        customElements: [...prev.elements.customElements, customInput.trim()],
      },
    }));
    setCustomInput('');
  };

  const removeCustomElement = (idx: number) => {
    updateConfig((prev) => ({
      ...prev,
      elements: {
        ...prev.elements,
        customElements: prev.elements.customElements.filter((_, i) => i !== idx),
      },
    }));
  };

  return (
    <section className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 mb-8 backdrop-blur-sm transition-all shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-[#1E2B3E]">
        <div>
          <h2 className="text-base font-semibold text-[#F2EEE6] flex items-center gap-2 font-display">
            <Boxes className="w-4 h-4 text-[#E8AE62]" />
            8. Scene Elements & Architectural Props
          </h2>
          <p className="text-xs text-[#A1AEC0] mt-0.5">
            Explicitly toggle furniture, lanterns, books, outdoor nature, and uninhabited sanctuary rules
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Master Control: Exclude All People and Animals */}
          <label className="flex items-center gap-2.5 cursor-pointer bg-[#0B1018] border border-[#E8AE62]/60 px-3.5 py-1.5 rounded-xl shadow-xs">
            <UserX className="w-4 h-4 text-[#E8AE62] shrink-0" />
            <span className="text-xs font-semibold text-[#E8AE62]">
              Exclude People & Animals:
            </span>
            <input
              type="checkbox"
              checked={elements.excludePeopleAndAnimals}
              onChange={(e) =>
                updateConfig((prev) => ({
                  ...prev,
                  elements: {
                    ...prev.elements,
                    excludePeopleAndAnimals: e.target.checked,
                    livingSubjects: e.target.checked ? [] : prev.elements.livingSubjects,
                  },
                  video: {
                    ...prev.video,
                    preventPeopleAndAnimals: e.target.checked,
                  },
                }))
              }
              className="sr-only"
            />
            <span
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                elements.excludePeopleAndAnimals ? 'bg-[#E8AE62] justify-end' : 'bg-[#1E2B3E] justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-[#0B1018] shadow-xs"></span>
            </span>
            <span className={`text-xs font-mono font-bold ${elements.excludePeopleAndAnimals ? 'text-[#E8AE62]' : 'text-[#A1AEC0]'}`}>
              {elements.excludePeopleAndAnimals ? 'ON' : 'OFF'}
            </span>
          </label>

          <button
            type="button"
            onClick={() => resetSection('elements')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#192434] rounded-lg transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {elements.excludePeopleAndAnimals && (
        <div className="mb-5 p-3.5 bg-amber-950/20 border border-[#E8AE62]/30 rounded-xl text-xs text-[#E8AE62]/90 flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#E8AE62] shrink-0" />
          <span>
            Sanctuary Mode: Living character artifacts are strictly suppressed to guarantee timeless looping stillness.
          </span>
        </div>
      )}

      {/* Grid of Categories */}
      <div className="space-y-5">
        {/* Light Sources */}
        <div>
          <label className="text-xs font-semibold text-[#F2EEE6] mb-2.5 flex items-center gap-1.5 font-mono">
            <Lamp className="w-3.5 h-3.5 text-[#E8AE62]" />
            Light Sources ({elements.lightSources.length} Selected)
          </label>
          <div className="flex flex-wrap gap-2">
            {SCENE_ELEMENT_GROUPS.lightSources.map((item) => {
              const isSelected = elements.lightSources.includes(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItem('lightSources', item.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62] font-semibold'
                      : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6] hover:border-[#283952]'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-[#E8AE62]" />}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interior Objects */}
        <div className="pt-4 border-t border-[#1E2B3E]">
          <label className="text-xs font-semibold text-[#F2EEE6] mb-2.5 flex items-center gap-1.5 font-mono">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            Interior Details & Objects ({elements.interiorObjects.length} Selected)
          </label>
          <div className="flex flex-wrap gap-2">
            {SCENE_ELEMENT_GROUPS.interiorObjects.map((item) => {
              const isSelected = elements.interiorObjects.includes(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItem('interiorObjects', item.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62] font-semibold'
                      : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6] hover:border-[#283952]'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-[#E8AE62]" />}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Outdoor Elements */}
        <div className="pt-4 border-t border-[#1E2B3E]">
          <label className="text-xs font-semibold text-[#F2EEE6] mb-2.5 flex items-center gap-1.5 font-mono">
            <Trees className="w-3.5 h-3.5 text-emerald-400" />
            Outdoor & Architecture ({elements.outdoorElements.length} Selected)
          </label>
          <div className="flex flex-wrap gap-2">
            {SCENE_ELEMENT_GROUPS.outdoorElements.map((item) => {
              const isSelected = elements.outdoorElements.includes(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItem('outdoorElements', item.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#192434] border-[#E8AE62] text-[#E8AE62] font-semibold'
                      : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6] hover:border-[#283952]'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-[#E8AE62]" />}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Living Subjects */}
        <div className="pt-4 border-t border-[#1E2B3E]">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-semibold text-[#F2EEE6] flex items-center gap-1.5 font-mono">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              Living Subjects (Wildlife & Figures)
            </label>
            {elements.excludePeopleAndAnimals && (
              <span className="text-[11px] text-[#E8AE62] font-medium">
                Disabled by master exclusion switch
              </span>
            )}
          </div>

          <div
            className={`flex flex-wrap gap-2 transition-opacity ${
              elements.excludePeopleAndAnimals ? 'opacity-30 pointer-events-none' : 'opacity-100'
            }`}
          >
            {SCENE_ELEMENT_GROUPS.livingSubjects.map((item) => {
              const isSelected = elements.livingSubjects.includes(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={elements.excludePeopleAndAnimals}
                  onClick={() => toggleItem('livingSubjects', item.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#192434] border-purple-500 text-purple-300'
                      : 'bg-[#0E1520] border-[#1E2B3E] text-[#A1AEC0] hover:text-[#F2EEE6]'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-purple-400" />}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Props */}
        <div className="pt-4 border-t border-[#1E2B3E]">
          <label className="block text-xs font-semibold text-[#F2EEE6] mb-2 font-mono">
            Custom Props & Focal Objects
          </label>
          <form onSubmit={addCustomElement} className="flex gap-2 mb-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. Antique brass telescope, steaming mug of spiced cider, velvet footstool"
              className="flex-1 px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-lg text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#E8AE62]"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-lg flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </form>

          {elements.customElements.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {elements.customElements.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs bg-[#192434] border border-[#283952] rounded-lg text-[#F2EEE6] flex items-center gap-1.5"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeCustomElement(idx)}
                    className="text-[#A1AEC0] hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
