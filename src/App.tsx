/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PipelineProvider, usePipeline } from './context/PipelineContext';
import { ProgressBar } from './components/ProgressBar';
import { Step1CompanyJob } from './components/steps/Step1CompanyJob';
import { Step2Profile } from './components/steps/Step2Profile';
import { Step3JobPosting } from './components/steps/Step3JobPosting';
import { Step4StarReview } from './components/steps/Step4StarReview';
import { Step5Questions } from './components/steps/Step5Questions';
import { Step6Results } from './components/steps/Step6Results';
import { Sparkles, HelpCircle } from 'lucide-react';

function AppContent() {
  const { state } = usePipeline();

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <Step1CompanyJob />;
      case 2:
        return <Step2Profile />;
      case 3:
        return <Step3JobPosting />;
      case 4:
        return <Step4StarReview />;
      case 5:
        return <Step5Questions />;
      case 6:
        return <Step6Results />;
      default:
        return <Step1CompanyJob />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#1A1A2E] flex flex-col font-sans selection:bg-blue-100">
      {/* Top Banner Header branding */}
      <header className="bg-white border-b border-gray-150 py-3.5 px-6 shadow-xs sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#1E3A5F] text-white p-1.5 rounded-lg font-extrabold flex items-center justify-center tracking-tight shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[#1E3A5F] tracking-tight flex items-center gap-1.5">
                <span>잡스타</span>
                <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md font-bold font-mono">JobSTAR v2.0</span>
              </h1>
              <p className="text-[10px] text-gray-500 font-medium">AI 자소서 STAR 코파일럿</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
            <span className="hidden sm:inline-flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
              <span>바이브 코딩 &amp; STAR 도출 전문 설계</span>
            </span>
          </div>
        </div>
      </header>

      {/* Progress Bar (Sticky just under header) */}
      <ProgressBar />

      {/* Main Container Stage */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <div className="animate-fadeIn transition-opacity duration-300">
          {renderStep()}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-gray-150 py-4 text-center text-xs text-gray-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© 2026 JobSTAR Coach. All rights reserved.</span>
          <span className="font-mono text-[10px] text-gray-300">Created with @google/genai TypeScript SDK</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <PipelineProvider>
      <AppContent />
    </PipelineProvider>
  );
}
