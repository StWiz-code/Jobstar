import React, { useState } from 'react';
import { usePipeline } from '../../context/PipelineContext';
import { ArrowLeft, ArrowRight, Plus, Trash2, HelpCircle } from 'lucide-react';
import { EssayQuestion } from '../../types';

export const Step5Questions: React.FC = () => {
  const { state, dispatch } = usePipeline();
  const questions = state.questions;

  const handleAddQuestion = () => {
    const newQ: EssayQuestion = {
      id: `q-${Date.now()}`,
      questionText: '',
      charLimit: 500,
      includeSpaces: true,
    };
    dispatch({ type: 'ADD_QUESTION', payload: newQ });
  };

  const handleUpdateQuestion = (id: string, field: keyof EssayQuestion, value: any) => {
    dispatch({
      type: 'UPDATE_QUESTION',
      payload: { id, field, value },
    });
  };

  const handleRemoveQuestion = (id: string) => {
    if (questions.length === 1) return; // Prevent removing last question
    dispatch({ type: 'REMOVE_QUESTION', payload: id });
  };

  const handlePrev = () => {
    dispatch({ type: 'GO_PREV' });
  };

  const handleNext = () => {
    if (questions.some((q) => !q.questionText.trim())) return;

    // Initialize EssayResults in Context state
    const initialResults = questions.map((q) => ({
      questionId: q.id,
      content: '',
      status: 'idle' as const,
    }));
    dispatch({ type: 'SET_RESULTS', payload: initialResults });

    // Transition directly to Step 6 (Step6Results will handle calling the fetch triggers on mount/layout)
    dispatch({ type: 'GO_NEXT' });
  };

  const isFormValid = questions.length > 0 && questions.every((q) => q.questionText.trim().length > 0);

  return (
    <div id="step-5-view" className="max-w-xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">작성하려는 자기소개서 문항을 완성해 주세요</h2>
        <p className="text-sm text-gray-500 mt-2">
          선정한 STAR 경험 에피소드를 녹여낼 문항과 타겟 글자수를 기입합니다. 여러 문항이 있는 경우 추가 버튼을 눌러 함께 생성할 수 있습니다.
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            id={`question-input-card-${q.id}`}
            className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-4 relative group"
          >
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-xs font-bold text-blue-600 font-mono">문항 {idx + 1}</span>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(q.id)}
                  className="text-gray-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                자소서 질문 내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={q.questionText}
                onChange={(e) => handleUpdateQuestion(q.id, 'questionText', e.target.value)}
                placeholder="예: 우리 회사 지원동기와 해당 직무에 적합한 본인만의 강점(경험)을 구체적으로 소개하여 주세요."
                rows={4}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden leading-relaxed resize-none text-gray-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">목표 글자수 제한 *</label>
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus-within:bg-white focus-within:border-blue-500">
                  <input
                    type="number"
                    value={q.charLimit}
                    onChange={(e) => handleUpdateQuestion(q.id, 'charLimit', Math.max(10, parseInt(e.target.value) || 0))}
                    className="w-full bg-transparent border-0 outline-hidden text-sm text-gray-800 font-semibold font-mono"
                    min={100}
                    max={3000}
                  />
                  <span className="text-xs text-gray-400 font-medium shrink-0">자 내외</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">글자수 기준 여부</label>
                <div className="flex p-0.5 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleUpdateQuestion(q.id, 'includeSpaces', true)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      q.includeSpaces ? 'bg-white shadow-xs text-blue-600' : 'text-gray-500 hover:bg-white/50'
                    }`}
                  >
                    공백 포함
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuestion(q.id, 'includeSpaces', false)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      !q.includeSpaces ? 'bg-white shadow-xs text-blue-600' : 'text-gray-500 hover:bg-white/50'
                    }`}
                  >
                    공백 제외
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          id="add-question-btn"
          onClick={handleAddQuestion}
          className="w-full py-3.5 border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-2xl text-xs font-semibold text-gray-500 hover:text-blue-600 bg-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>자기소개서 문항 추가</span>
        </button>

        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-105 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-700 leading-relaxed">
            한 번의 STAR 분석 결과를 바탕으로, 서로 다른 역량 평가 유형의 복수 질문들을 연속해서 빌드해낼 수 있는 특화 다중 생성기입니다.
          </p>
        </div>
      </div>

      {/* Navigation Footer Controls */}
      <div id="step-nav-buttons" className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handlePrev}
          className="px-5 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-sm flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>이전 단계</span>
        </button>

        <button
          type="button"
          id="questions-next-btn"
          onClick={handleNext}
          disabled={!isFormValid}
          className={`px-6 py-3 font-semibold rounded-xl text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
            isFormValid
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
          }`}
        >
          <span>자소서 맞춤 생성하기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
