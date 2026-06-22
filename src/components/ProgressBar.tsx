import React from 'react';
import { usePipeline } from '../context/PipelineContext';

const STEPS = [
  { num: 1, label: '기업·직무' },
  { num: 2, label: '경력 프로필' },
  { num: 3, label: '채용공고' },
  { num: 4, label: 'STAR 도출' },
  { num: 5, label: '문항 구성' },
  { num: 6, label: '자소서 완성' },
];

export const ProgressBar: React.FC = () => {
  const { state, dispatch } = usePipeline();
  const current = state.currentStep;

  // Let them jump to previous steps they have already filled,
  // but prevent jumping forward without fulfilling conditions.
  const handleStepClick = (num: number) => {
    if (num < current) {
      dispatch({ type: 'GO_TO_STEP', payload: num as any });
    }
  };

  return (
    <div id="step-progress-container" className="w-full bg-white border-b border-gray-200 py-4 px-4 sticky top-0 z-40 shadow-xs">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Background Connecting Line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[3px] bg-gray-200 -z-1" />
          
          {/* Active Connecting Line Progress */}
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-blue-600 transition-all duration-300 -z-1"
            style={{ width: `${((current - 1) / (STEPS.length - 1)) * 100}%` }}
          />

          {STEPS.map((step) => {
            const isCompleted = step.num < current;
            const isActive = step.num === current;
            
            return (
              <button
                key={step.num}
                id={`progress-step-btn-${step.num}`}
                onClick={() => handleStepClick(step.num)}
                disabled={step.num >= current}
                className="flex flex-col items-center group focus:outline-hidden disabled:cursor-not-allowed"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 scale-110 shadow-md'
                      : isCompleted
                      ? 'bg-emerald-500 text-white ring-2 ring-emerald-100 hover:bg-emerald-600 cursor-pointer'
                      : 'bg-white text-gray-400 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.num
                  )}
                </div>
                <span
                  className={`text-[11px] md:text-xs mt-2 font-medium transition-colors hidden sm:block ${
                    isActive ? 'text-blue-600 font-semibold' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
