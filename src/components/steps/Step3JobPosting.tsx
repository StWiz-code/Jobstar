import React, { useState } from 'react';
import { usePipeline } from '../../context/PipelineContext';
import { ArrowLeft, ArrowRight, Loader2, FileText } from 'lucide-react';

export const Step3JobPosting: React.FC = () => {
  const { state, dispatch } = usePipeline();
  const [rawText, setRawText] = useState(state.jobPosting.rawText);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleNext = async () => {
    if (rawText.trim().length < 50) return;
    setLoading(true);
    setErrorMsg('');

    // Update state first
    dispatch({
      type: 'SET_JOB_POSTING',
      payload: { rawText },
    });

    try {
      const response = await fetch('/api/star', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application: state.application,
          profile: state.profile,
          jobPosting: { rawText },
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'STAR 카드 도출 API 호출 실패');
      }

      const data = await response.json();
      
      if (!data.starCards || !Array.isArray(data.starCards)) {
        throw new Error('의도치 않은 응답 형식이 전달되었습니다.');
      }

      // Add frontend generated unique IDs to each card
      const enrichedCards = data.starCards.map((card: any, idx: number) => ({
        ...card,
        id: card.id || `star-card-${idx}-${Date.now()}`,
      }));

      dispatch({ type: 'SET_STAR_CARDS', payload: enrichedCards });

      // Automatically select the first card by default if any
      if (enrichedCards.length > 0) {
        dispatch({ type: 'SELECT_STAR', payload: enrichedCards[0].id });
      }

      dispatch({ type: 'GO_NEXT' });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '네트워크 문제 혹은 잘못된 채용공고 분석 오류가 발생했습니다. 다시 빌드하거나 프롬프트 제한을 체크해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    dispatch({
      type: 'SET_JOB_POSTING',
      payload: { rawText },
    });
    dispatch({ type: 'GO_PREV' });
  };

  const canSubmit = rawText.trim().length >= 50 && !loading;

  return (
    <div id="step-3-view" className="max-w-2xl mx-auto py-8 px-4">
      {loading ? (
        <div id="loading-container" className="flex flex-col items-center justify-center py-24 px-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-blue-50/70 border-t-blue-600 animate-spin" />
            <FileText className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">핵심역량 자소서 적합점 및 STAR 분석 중...</h3>
          <p className="text-sm text-gray-500 max-w-md mt-3 leading-relaxed">
            채용 공고의 상세 조건(직무 성향, 요구 지식, 채널 극대화 등)을 분석하여 지원자의 경력 에피소드 중 가장 시너지가 높은 스토리를 3개 찾아 정리하고 성과를 도출하고 있습니다. 약 3초~7초 정도 대기시간이 발생할 수 있습니다.
          </p>
          <div className="mt-6 flex flex-col gap-1.5 w-full max-w-xs text-xs font-mono text-gray-400 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div>🚀 AI Coach: Smart Matcher Activating...</div>
            <div>📊 Profile &amp; Exp Matching...</div>
            <div>🤖 Building STAR Structures...</div>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">지원을 원하는 채용공고의 전문을 입력하세요</h2>
            <p className="text-sm text-gray-500 mt-2">
              우대사항, 직무요건, 공고 역할 내용이 담긴 줄 서술 전문 혹은 요약 텍스트를 그대로 복사하여 붙여넣으세요.
            </p>
          </div>

          <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-semibold text-gray-700">채용공고 텍스트 (최소 50글자 이상 기입) <span className="text-red-500">*</span></label>
                <span className={`text-xs ${rawText.trim().length >= 50 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                  {rawText.trim().length} / 50자 이상
                </span>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="여기에 채용공고 우대 스킬셋과 매칭 상세 설명을 입력해주세요. 지원회사 채용 사이트에 기재된 텍스트 전체를 드래그 앤 드롭 혹은 붙여넣으시면 더욱 완벽하게 분석됩니다."
                rows={10}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden text-sm resize-none text-gray-800 leading-relaxed"
              />
            </div>

            {errorMsg && (
              <div id="step3-error-box" className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 leading-relaxed">
                <div>⚠️ {errorMsg}</div>
                <div className="mt-1 font-medium">네트워크 통신 오류 혹은 API 한도 체크가 요망됩니다. 다시 생성 요청 버튼을 클릭해주세요.</div>
              </div>
            )}

            <p className="text-xs text-slate-400">
              ※ 업로드되거나 붙여넣으신 채용 정보 데이터는 외부 서버에 절대 추가 기록 또는 보존되지 않으며, 안전하게 실시간 매칭 프롬프트 검토용으로만 증발 폐기 처리됩니다.
            </p>
          </div>

          {/* Navigation Controls */}
          <div id="step-nav-buttons" className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrev}
              disabled={loading}
              className="px-5 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-sm flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>이전 단계</span>
            </button>
            <button
              type="button"
              id="jobposting-next-btn"
              onClick={handleNext}
              disabled={!canSubmit}
              className={`px-6 py-3 font-semibold rounded-xl text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                canSubmit
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
            >
              <span>경험 매칭 &amp; STAR 도출하기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
