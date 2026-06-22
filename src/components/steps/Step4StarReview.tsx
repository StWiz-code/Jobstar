import React, { useState } from 'react';
import { usePipeline } from '../../context/PipelineContext';
import { ArrowLeft, ArrowRight, CheckCircle2, Edit3, Award, Flame, Lightbulb, BookOpen } from 'lucide-react';
import { StarCard } from '../../types';

export const Step4StarReview: React.FC = () => {
  const { state, dispatch } = usePipeline();
  const selectedStarId = state.selectedStarId;

  // Local editing flag or state so users can make live tuning
  const handleSelectCard = (id: string) => {
    dispatch({ type: 'SELECT_STAR', payload: id });
  };

  const handleFieldChange = (id: string, field: keyof StarCard, value: any) => {
    dispatch({
      type: 'UPDATE_STAR_FIELD',
      payload: { id, field, value },
    });
  };

  const handleNext = () => {
    if (!selectedStarId) return;
    dispatch({ type: 'GO_NEXT' });
  };

  const handlePrev = () => {
    dispatch({ type: 'GO_PREV' });
  };

  return (
    <div id="step-4-view" className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">AI가 도출한 STAR 경험 확인 및 수정</h2>
        <p className="text-sm text-gray-500 mt-2">
          채용 정보와 최적 매치되는 에피소드 3선이 추출되었습니다. 이 중 마음에 드는 경험 하나를 택하여 세부내용을 직접 다듬은 뒤 최종 확정하세요!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of 3 Star Cards */}
        <div className="lg:col-span-12 space-y-6">
          {state.starCards.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-150 rounded-2xl">
              <p className="text-sm text-gray-400">도출된 STAR 카드가 존재하지 않습니다. 이전 단계로 가셔서 채용공고 분석을 다시 시도해주세요.</p>
            </div>
          ) : (
            state.starCards.map((card, idx) => {
              const isSelected = selectedStarId === card.id;
              
              return (
                <div
                  key={card.id}
                  id={`star-card-item-${card.id}`}
                  onClick={() => handleSelectCard(card.id)}
                  className={`border-2 rounded-2xl transition-all duration-300 relative cursor-pointer overflow-hidden ${
                    isSelected
                      ? 'border-blue-600 bg-white shadow-md ring-4 ring-blue-50/50'
                      : 'border-gray-200/80 bg-gray-50/50 hover:bg-white hover:border-blue-300'
                  }`}
                >
                  {/* Selection Indicator Top Bar */}
                  {isSelected && (
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 w-full absolute top-0 left-0" />
                  )}

                  <div className="p-6 pt-7">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 px-3 rounded-full bg-blue-50 text-blue-700 text-xs font-bold font-mono">
                          경험 피드 {idx + 1}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900">{card.experienceTitle}</h3>
                      </div>
                      
                      {/* Fit Score Display */}
                      <div className="flex items-center gap-2 self-end sm:self-auto bg-blue-52 bg-white p-1 px-3 border border-gray-150 rounded-xl shadow-xs">
                        <span className="text-xs text-gray-500 font-medium">채용 접합도</span>
                        <span className="text-sm font-bold text-blue-600 font-mono">{card.fitScore}점</span>
                        <div className="w-12 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${card.fitScore}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Matched Keywords & Reason */}
                    <div className="p-3 bg-neutral-55 bg-gray-50 rounded-xl border border-gray-100/80 mb-6 space-y-2">
                      <div className="text-xs text-gray-600 flex flex-wrap gap-1 items-center">
                        <strong className="text-gray-700">매칭 키워드:</strong>
                        {(card.matchedKeywords || []).map((word, wIdx) => (
                          <span key={wIdx} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-semibold border border-blue-100/50">
                            {word}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        <strong className="text-gray-700">매칭 이유:</strong> {card.fitReason}
                      </p>
                    </div>

                    {/* Editor / STAR Fields */}
                    {isSelected ? (
                      <div className="space-y-4 pt-1 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-blue-600 flex items-center gap-1 mb-2">
                          <Edit3 className="w-3.5 h-3.5" />
                          이 에피소드의 STAR 상세 내용을 확인 및 직접 인라인 수정할 수 있습니다
                        </h4>
                        
                        {/* Situation Editor */}
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 shrink-0 w-fit p-1 px-2.5 rounded-md mb-1.5">
                            <Flame className="w-3.5 h-3.5" /> Situation (상황 정보)
                          </label>
                          <textarea
                            value={card.situation}
                            onChange={(e) => handleFieldChange(card.id, 'situation', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 text-sm bg-stone-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden leading-relaxed text-gray-700"
                            placeholder="상황에 대해 수정할 점이 있다면 타이핑해 보세요."
                          />
                        </div>

                        {/* Task Editor */}
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 shrink-0 w-fit p-1 px-2.5 rounded-md mb-1.5">
                            <Lightbulb className="w-3.5 h-3.5" /> Task (구체적 해결과제)
                          </label>
                          <textarea
                            value={card.task}
                            onChange={(e) => handleFieldChange(card.id, 'task', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 text-sm bg-stone-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden leading-relaxed text-gray-700"
                            placeholder="당면했던 과제 목표에 대해 수정해 보세요."
                          />
                        </div>

                        {/* Action Editor */}
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-violet-700 bg-violet-50 shrink-0 w-fit p-1 px-2.5 rounded-md mb-1.5">
                            <BookOpen className="w-3.5 h-3.5" /> Action (구체적인 실행 행동)
                          </label>
                          <textarea
                            value={card.action}
                            onChange={(e) => handleFieldChange(card.id, 'action', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 text-sm bg-stone-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-hidden leading-relaxed text-gray-700"
                            placeholder="본인이 취했던 실무적 액션을 정밀하게 수정해보세요. 이 부분이 구체적일수록 높은 설득력을 발휘합니다."
                          />
                        </div>

                        {/* Result Editor */}
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 shrink-0 w-fit p-1 px-2.5 rounded-md mb-1.5">
                            <Award className="w-3.5 h-3.5" /> Result (활동 성과 및 보상)
                          </label>
                          <textarea
                            value={card.result}
                            onChange={(e) => handleFieldChange(card.id, 'result', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 text-sm bg-stone-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden leading-relaxed text-gray-700"
                            placeholder="구체적인 결과 수치 혹은 기여도를 정리해 보세요."
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                          <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-100">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>현재 카드가 최종 선택되었습니다</span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-medium text-gray-500 pt-3 border-t border-gray-100/50 pointer-events-none">
                        <div> Situation (상황) - {card.situation.slice(0, 15)}...</div>
                        <div> Task (과제) - {card.task.slice(0, 15)}...</div>
                        <div> Action (행동) - {card.action.slice(0, 15)}...</div>
                        <div> Result (결과) - {card.result.slice(0, 15)}...</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
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
          id="starreview-next-btn"
          onClick={handleNext}
          disabled={!selectedStarId}
          className={`px-6 py-3 font-semibold rounded-xl text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
            selectedStarId
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
          }`}
        >
          <span>이 경험 확정 후 문항 설정하기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
