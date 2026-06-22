import React, { useState } from 'react';
import { usePipeline } from '../../context/PipelineContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export const Step1CompanyJob: React.FC = () => {
  const { state, dispatch } = usePipeline();
  const [company, setCompany] = useState(state.application.companyName);
  const [job, setJob] = useState(state.application.jobTitle);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !job.trim()) return;

    dispatch({
      type: 'SET_APPLICATION',
      payload: { companyName: company.trim(), jobTitle: job.trim() },
    });
    dispatch({ type: 'GO_NEXT' });
  };

  const loadDemoScenario = () => {
    // Fill state with 삼성전자 영업마케팅 deml scenario
    dispatch({
      type: 'SET_APPLICATION',
      payload: { companyName: '삼성전자', jobTitle: '영업마케팅' },
    });
    setCompany('삼성전자');
    setJob('영업마케팅');

    dispatch({
      type: 'SET_PROFILE',
      payload: {
        education: {
          school: '서울국립대학교',
          major: '경영학과',
          gpa: '4.1/4.5',
          status: '졸업예정',
        },
        certifications: ['컴퓨터활용능력 1급', 'ADsP (데이터분석준전문가)'],
        languageScores: [
          { test: '토익(TOEIC)', score: '920점' },
          { test: 'OPIC', score: 'AL' }
        ],
        skills: ['데이터 분석', '고객 커뮤니케이션', '시장 트렌드 분석', '엑셀/PPT'],
        experiences: [
          {
            id: 'demo-exp-1',
            title: '데이터분석 동아리 회장',
            organization: '교내 빅데이터 학회',
            period: '2025.03 ~ 2026.02',
            description: '동아리 회장으로서 공공 데이터셋을 분석하는 프로젝트를 리드함. 기수 인원 30명의 스터디를 조율하고, 패션 이커머스 트렌드 파악 및 구매 전환율 증대를 위한 매출 분석 보고서를 제작하여 학술 평점 최우수를 기록했음.',
          },
          {
            id: 'demo-exp-2',
            title: '카페 아르바이트생',
            organization: '투썸플레이스 강남점',
            period: '2024.01 ~ 2025.12 (2년)',
            description: '주말 피크 타임 파트타이머로 근무하며 월평균 매출 15% 기여. 대기 고객 혼잡 문제를 개선하기 위해 무인 키오스크 안내 배치를 주도적으로 재창안하고 포스 대기 동선을 기획하여 고객 평점 및 응대 효율 속도를 약 20% 단축했음.',
          },
          {
            id: 'demo-exp-3',
            title: '교내 마케팅 공모전 입상',
            organization: '경영대학 마케팅 파워스',
            period: '2024.09 ~ 2024.11',
            description: '데이터 세그먼테이션 기법에 기반하여 Z세대 공략 신규 런칭 음료 브랜딩 제안을 작성. SNS 데이터 크롤링 분석 결과를 반영해 핵심 채널 유저 반응 타겟을 공략하는 제안으로 은상을 수상함.',
          }
        ],
      },
    });

    dispatch({
      type: 'SET_JOB_POSTING',
      payload: {
        rawText: `삼성전자 한국총괄 영업마케팅 직무 채용 안내
[주요 역량 및 역할]
- 시장 트렌드 선점 및 경쟁력 확보를 위한 최신 마케팅 전략 수립
- 데이터 분석 기반의 신규 고객 세그먼트 타겟 마케팅 및 오프라인/온라인 채널 매출 경쟁력 극대화
- 다양한 내외부 파트너 및 고객사와의 원활한 협업과 고객 가치 제안 및 커뮤니케이션
- 문제를 적극적인 실행력으로 정의하고 주도적으로 해결하는 성향 필수`,
      },
    });
  };

  const isFormValid = company.trim().length > 0 && job.trim().length > 0;

  return (
    <div id="step-1-view" className="max-w-xl mx-auto py-8 px-4">
      {/* Demo Scenario Box */}
      <div id="demo-indicator" className="mb-8 p-4 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-3 transition-all duration-300">
        <div className="p-2 bg-blue-500 rounded-lg text-white shrink-0 mt-0.5 shadow-sm">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-blue-950 text-sm">삼성전자 영업마케팅 데모</h4>
          <p className="text-xs text-blue-700/90 mt-1 leading-relaxed">
            취업준비생 민준의 프로필, 경험 데이터 3가지 및 채용 공고를 원클릭으로 주입하여 잡스타의 STAR AI 도출 능력을 즉시 확인해보세요.
          </p>
          <button
            type="button"
            id="load-demo-btn"
            onClick={loadDemoScenario}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            데모 시나리오 불러오기
          </button>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">지원하고 싶은 기업과 직무를 입력해주세요</h2>
        <p className="text-sm text-gray-500 mt-2">나중에 자소서 본문 생성 시 해당 직무에 맞는 키워드 톤이 반영됩니다.</p>
      </div>

      <form onSubmit={handleNext} className="space-y-6 bg-white p-6 border border-gray-100 rounded-2xl shadow-sm">
        <div>
          <label htmlFor="companyName" className="block text-sm font-semibold text-gray-700 mb-1">
            기업명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="companyName"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-hidden text-gray-800 text-sm"
            placeholder="예: 삼성전자, 토스, 공공기관 등"
            required
          />
        </div>

        <div>
          <label htmlFor="jobTitle" className="block text-sm font-semibold text-gray-700 mb-1">
            지원 직무 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="jobTitle"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-hidden text-gray-800 text-sm"
            placeholder="예: 영업마케팅, 소프트웨어 엔지니어 등"
            required
          />
        </div>

        <button
          type="submit"
          id="step1-next-btn"
          disabled={!isFormValid}
          className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
            isFormValid
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>경력 프로필 입력하기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
