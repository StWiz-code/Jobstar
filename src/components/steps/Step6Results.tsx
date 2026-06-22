import React, { useEffect, useState, useRef } from 'react';
import { usePipeline } from '../../context/PipelineContext';
import { RefreshCw, Clipboard, Check, Download, AlertTriangle, ArrowLeft, Home } from 'lucide-react';

export const Step6Results: React.FC = () => {
  const { state, dispatch } = usePipeline();
  const { questions, starCards, selectedStarId, application, results } = state;

  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});
  const initTriggerRef = useRef(false);

  // Selected Star Card
  const selectedStar = starCards.find((c) => c.id === selectedStarId);

  // Trigger individual request to api
  const generateEssay = async (questionId: string) => {
    const q = questions.find((item) => item.id === questionId);
    if (!q || !selectedStar) return;

    dispatch({
      type: 'UPDATE_RESULT_STATUS',
      payload: { questionId, status: 'generating' },
    });

    try {
      const response = await fetch('/api/essay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application,
          matchedKeywords: selectedStar.matchedKeywords,
          star: {
            experienceTitle: selectedStar.experienceTitle,
            situation: selectedStar.situation,
            task: selectedStar.task,
            action: selectedStar.action,
            result: selectedStar.result,
          },
          question: q,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || '자소서 대리 생성 중 서버 오류가 발생했습니다.');
      }

      const data = await response.json();
      dispatch({
        type: 'UPDATE_RESULT_CONTENT',
        payload: { questionId, content: data.content || '' },
      });
      dispatch({
        type: 'UPDATE_RESULT_STATUS',
        payload: { questionId, status: 'done' },
      });
    } catch (err: any) {
      console.error(err);
      dispatch({
        type: 'UPDATE_RESULT_STATUS',
        payload: { questionId, status: 'error', errorMessage: err.message || '네트워크 응답 오류 발생' },
      });
    }
  };

  // Launch initial generation for all idle results on mount
  useEffect(() => {
    if (initTriggerRef.current) return;
    initTriggerRef.current = true;

    results.forEach((res) => {
      if (res.status === 'idle') {
        generateEssay(res.questionId);
      }
    });
  }, [results, questions, selectedStar]);

  const handleTextChange = (qId: string, text: string) => {
    dispatch({
      type: 'UPDATE_RESULT_CONTENT',
      payload: { questionId: qId, content: text },
    });
  };

  const copyText = (qId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMap((prev) => ({ ...prev, [qId]: true }));
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [qId]: false }));
    }, 2000);
  };

  const downloadAllTxt = () => {
    let content = `=========================================\n`;
    content += `잡스타(JobSTAR) - 자기소개서 결과 보고서\n`;
    content += `=========================================\n`;
    content += `지원 회사: ${application.companyName}\n`;
    content += `지원 직무: ${application.jobTitle}\n`;
    if (selectedStar) {
      content += `기반 경험: ${selectedStar.experienceTitle}\n`;
    }
    content += `작성 일자: ${new Date().toLocaleDateString()}\n\n`;

    questions.forEach((q, idx) => {
      const res = results.find((r) => r.questionId === q.id);
      content += `-----------------------------------------\n`;
      content += `문항 ${idx + 1}. ${q.questionText}\n`;
      content += `(제한 글자수: ${q.charLimit}자 - ${q.includeSpaces ? '공백 포함' : '공백 제외'})\n`;
      content += `-----------------------------------------\n`;
      content += `${res?.content || '(작성 실패 혹은 생성 오류)'}\n\n`;
    });

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `잡스타_자기소개서_${application.companyName}_${application.jobTitle}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleRestart = () => {
    if (confirm('모든 입력값이 리셋됩니다. 처음 단계로 돌아가시겠습니까?')) {
      dispatch({ type: 'RESET_STATE' });
    }
  };

  const getCharCounts = (text: string) => {
    const withSpaces = text.length;
    const withoutSpaces = text.replace(/\s/g, '').length;
    return { withSpaces, withoutSpaces };
  };

  return (
    <div id="step-6-view" className="max-w-3xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">🎉 AI STAR 맞춤 자기소개서 완성!</h2>
        <p className="text-sm text-gray-500 mt-2">
          선택하신 STAR의 상황-과제-액션-결과가 정교하게 흐르는 두괄식 합격 자기소개서 내용이 완성되었습니다.
        </p>
      </div>

      <div className="space-y-8">
        {questions.map((q, idx) => {
          const res = results.find((r) => r.questionId === q.id);
          const currentText = res?.content || '';
          const { withSpaces, withoutSpaces } = getCharCounts(currentText);
          const currentLength = q.includeSpaces ? withSpaces : withoutSpaces;

          // Check for deviances: alert if more than ±10% target limit
          const isDeviant = currentText.length > 0 && Math.abs(currentLength - q.charLimit) > (q.charLimit * 0.1);

          return (
            <div
              key={q.id}
              id={`result-card-${q.id}`}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gray-50/50 p-5 border-b border-gray-100 flex justify-between items-start gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 px-2.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold font-mono">
                      문항 {idx + 1} 결과
                    </span>
                    <span className="text-xs text-slate-400">({q.charLimit}자 - {q.includeSpaces ? '공백포함' : '공백제외'})</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-800 leading-relaxed">{q.questionText}</h4>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => generateEssay(q.id)}
                    disabled={res?.status === 'generating'}
                    className="p-1.5 bg-white hover:bg-gray-100 border border-gray-150 text-gray-600 rounded-lg hover:text-blue-600 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    title="이 문항 재생성하기"
                  >
                    <RefreshCw className={`w-4 h-4 ${res?.status === 'generating' ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                {res?.status === 'generating' ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-4 border-blue-50/70 border-t-blue-600 animate-spin" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">합격급 표현 및 두괄식 문장 조합 중...</span>
                  </div>
                ) : res?.status === 'error' ? (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl space-y-2 text-xs">
                    <p className="font-semibold">⚠️ 자기소개서 생성 과정에서 실패했습니다.</p>
                    <p>{res.errorMessage}</p>
                    <button
                      type="button"
                      onClick={() => generateEssay(q.id)}
                      className="px-3 py-1.5 bg-red-600 text-white font-semibold rounded-lg text-[11px] cursor-pointer"
                    >
                      다시 시도하기
                    </button>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={currentText}
                      onChange={(e) => handleTextChange(q.id, e.target.value)}
                      rows={12}
                      className="w-full text-sm text-gray-800 bg-gray-50/30 border border-gray-150 rounded-xl p-4 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden leading-relaxed resize-none"
                    />

                    {/* Word Counts and Warnings */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 text-xs">
                      <div className="flex flex-wrap items-center gap-4 text-gray-500">
                        <span>
                          공백 포함: <strong className="text-gray-700 font-mono">{withSpaces}</strong>자
                        </span>
                        <span>
                          공백 제외: <strong className="text-gray-700 font-mono">{withoutSpaces}</strong>자
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="font-medium">
                          평가 대상 기준: <strong className="text-blue-600 font-bold font-mono">{currentLength}</strong>자 / {q.charLimit}자
                        </span>
                      </div>

                      {isDeviant && (
                        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 p-1 px-3 border border-amber-100 rounded-lg text-[10px] font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>목표 제한 ({q.charLimit}자)에서 일부 과다 또는 부족 상태입니다.</span>
                        </div>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => copyText(q.id, currentText)}
                        className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 hover:text-indigo-800 border border-indigo-100 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        {copiedMap[q.id] ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>복사 완료!</span>
                          </>
                        ) : (
                          <>
                            <Clipboard className="w-4 h-4" />
                            <span>본문 복사</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* Global actions */}
        <div className="bg-blue-600 text-white rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
          <div>
            <h4 className="font-bold text-base">모든 문항 자기소개서가 완성되었습니다!</h4>
            <p className="text-xs text-blue-100 mt-1">
              언제든지 다운로드 받거나 복수 기입 상태로 다른 채용공고를 연쇄 분석할 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={downloadAllTxt}
            className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-blue-50 text-blue-700 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
          >
            <Download className="w-4 h-4" />
            <span>파일 일체 다운로드 (.txt)</span>
          </button>
        </div>
      </div>

      {/* Navigation Footer Controls */}
      <div id="step-nav-buttons" className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => dispatch({ type: 'GO_PREV' })}
          className="px-5 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-sm flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>문항 수정</span>
        </button>

        <button
          type="button"
          onClick={handleRestart}
          className="px-5 py-3 bg-stone-100 hover:bg-stone-200 border border-gray-200 text-stone-700 font-bold rounded-xl text-sm flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Home className="w-4 h-4" />
          <span>첫 단계로 리셋</span>
        </button>
      </div>
    </div>
  );
};
