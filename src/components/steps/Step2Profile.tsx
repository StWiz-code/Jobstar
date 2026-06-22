import React, { useState } from 'react';
import { usePipeline } from '../../context/PipelineContext';
import { ArrowLeft, ArrowRight, Plus, Trash2, GraduationCap, Award, Globe, Briefcase } from 'lucide-react';
import { Experience } from '../../types';

export const Step2Profile: React.FC = () => {
  const { state, dispatch } = usePipeline();
  
  // Step 2 Local States
  const [school, setSchool] = useState(state.profile.education?.school || '');
  const [major, setMajor] = useState(state.profile.education?.major || '');
  const [gpa, setGpa] = useState(state.profile.education?.gpa || '');
  const [status, setStatus] = useState(state.profile.education?.status || '재학');

  const [certInput, setCertInput] = useState('');
  const [certifications, setCertifications] = useState<string[]>(state.profile.certifications || []);

  const [langTest, setLangTest] = useState('');
  const [langScore, setLangScore] = useState('');
  const [languageScores, setLanguageScores] = useState<{ test: string; score: string }[]>(state.profile.languageScores || []);

  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(state.profile.skills || []);

  const [experiences, setExperiences] = useState<Experience[]>(state.profile.experiences || []);

  // Inline Experience Form state
  const [expTitle, setExpTitle] = useState('');
  const [expOrg, setExpOrg] = useState('');
  const [expPeriod, setExpPeriod] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [showExpForm, setShowExpForm] = useState(false);

  // Synchronizers
  const updateStoreProfile = (newExperiences = experiences) => {
    dispatch({
      type: 'SET_PROFILE',
      payload: {
        education: { school, major, gpa, status: status as any },
        certifications,
        languageScores,
        skills,
        experiences: newExperiences,
      },
    });
  };

  const handleNext = () => {
    if (!school.trim() || !major.trim() || experiences.length === 0) return;
    updateStoreProfile();
    dispatch({ type: 'GO_NEXT' });
  };

  const handlePrev = () => {
    updateStoreProfile();
    dispatch({ type: 'GO_PREV' });
  };

  const addCert = () => {
    if (certInput.trim() && !certifications.includes(certInput.trim())) {
      const newList = [...certifications, certInput.trim()];
      setCertifications(newList);
      setCertInput('');
    }
  };

  const removeCert = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const addLang = () => {
    if (langTest.trim() && langScore.trim()) {
      setLanguageScores([...languageScores, { test: langTest.trim(), score: langScore.trim() }]);
      setLangTest('');
      setLangScore('');
    }
  };

  const removeLang = (index: number) => {
    setLanguageScores(languageScores.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    if (!expTitle.trim() || !expOrg.trim() || !expPeriod.trim() || !expDesc.trim()) return;
    const newExp: Experience = {
      id: Date.now().toString(),
      title: expTitle.trim(),
      organization: expOrg.trim(),
      period: expPeriod.trim(),
      description: expDesc.trim(),
    };
    const updated = [...experiences, newExp];
    setExperiences(updated);
    
    // Clear exp form
    setExpTitle('');
    setExpOrg('');
    setExpPeriod('');
    setExpDesc('');
    setShowExpForm(false);
  };

  const removeExperience = (id: string) => {
    const updated = experiences.filter((exp) => exp.id !== id);
    setExperiences(updated);
  };

  const isFormValid = school.trim().length > 0 && major.trim().length > 0 && experiences.length > 0;

  return (
    <div id="step-2-view" className="max-w-3xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">취업 준비 경험 및 이력 프로필 작성</h2>
        <p className="text-sm text-gray-500 mt-2">
          최종 매칭된 STAR 카드를 분석하고 최적화하기 위해 본인의 이력과 대표 활동 기록을 입력해주세요.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Education Section */}
        <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">학력 사항 <span className="text-red-500">*</span></h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">학교명</label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="예: 한국대학교"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">전공명</label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="예: 경영학과"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">학점 (선택)</label>
              <input
                type="text"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                placeholder="예: 4.1/4.5"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">재학 상태</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden text-sm"
              >
                <option value="재학">재학</option>
                <option value="휴학">휴학</option>
                <option value="졸업예정">졸업예정</option>
                <option value="졸업">졸업</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Certifications & Languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Certifications Card */}
          <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">자격증</h3>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCert(); } }}
                  placeholder="예: 정보처리기사 (Enter 입력)"
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white outline-hidden text-sm"
                />
                <button
                  type="button"
                  onClick={addCert}
                  className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-xs border border-gray-200 cursor-pointer"
                >
                  추가
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 min-h-[40px]">
                {certifications.length === 0 ? (
                  <span className="text-xs text-gray-400 self-center">추가된 자격증이 없습니다.</span>
                ) : (
                  certifications.map((cert, index) => (
                    <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100">
                      {cert}
                      <button type="button" onClick={() => removeCert(index)} className="text-blue-500 hover:text-blue-700 focus:outline-hidden">×</button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Language Scores Card */}
          <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">어학 성적</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={langTest}
                  onChange={(e) => setLangTest(e.target.value)}
                  placeholder="시험명 (예: 토익)"
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white outline-hidden text-sm"
                />
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={langScore}
                    onChange={(e) => setLangScore(e.target.value)}
                    placeholder="점수 (예: 920)"
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white outline-hidden text-sm"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLang(); } }}
                  />
                  <button
                    type="button"
                    onClick={addLang}
                    className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-xs border border-gray-200 cursor-pointer"
                  >
                    추가
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 min-h-[40px]">
                {languageScores.length === 0 ? (
                  <span className="text-xs text-gray-400 self-center">추가된 어학성적이 없습니다.</span>
                ) : (
                  languageScores.map((lang, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-lg border border-neutral-200">
                      <strong>{lang.test}</strong>: {lang.score}
                      <button type="button" onClick={() => removeLang(index)} className="ml-1 text-neutral-400 hover:text-neutral-700 font-bold focus:outline-hidden">×</button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Skills TagInput */}
        <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1 px-2.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold font-mono">My Smart Skills</span>
            <h3 className="text-lg font-bold text-gray-900">핵심 실무 지식 / 보유역량</h3>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              placeholder="본인이 보유한 지식 혹은 소프트스킬을 쉼표 또는 엔터로 추가해보세요 (예: 파이썬, 데이터 인사이트 추출, 협상)"
              className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white outline-hidden text-sm"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium text-xs cursor-pointer shadow-xs"
            >
              추가
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {skills.length === 0 ? (
              <span className="text-xs text-gray-400">데이터분석, 고객관계기획 등 본인의 키워드를 기입해 두면 AI가 관련 키워드를 찾아 자소서에 녹여냅니다.</span>
            ) : (
              skills.map((skill, index) => (
                <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-150">
                  {skill}
                  <button type="button" onClick={() => removeSkill(index)} className="text-indigo-400 hover:text-indigo-700 font-bold focus:outline-hidden">×</button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* 4. Experience & Career Cards Section */}
        <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">나의 상세 경험/활동 기록 <span className="text-red-500">*</span></h3>
            </div>
            <button
              type="button"
              id="add-exp-btn"
              onClick={() => setShowExpForm(!showExpForm)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              경험 카드 추가
            </button>
          </div>

          {/* New Experience Form */}
          {showExpForm && (
            <div id="new-exp-form" className="mb-6 p-4 border border-blue-100 rounded-2xl bg-blue-50/40 space-y-4">
              <h4 className="text-sm font-bold text-gray-800">새 경험 카드 기입</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">활동/직무명 *</label>
                  <input
                    type="text"
                    value={expTitle}
                    onChange={(e) => setExpTitle(e.target.value)}
                    placeholder="예: 카페 아르바이트, 학과 홍보대사"
                    className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl focus:border-blue-500 outline-hidden text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">소속 기관/단체 *</label>
                  <input
                    type="text"
                    value={expOrg}
                    onChange={(e) => setExpOrg(e.target.value)}
                    placeholder="예: 투썸플레이스 강남대치점"
                    className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl focus:border-blue-500 outline-hidden text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">활동 기간 *</label>
                  <input
                    type="text"
                    value={expPeriod}
                    onChange={(e) => setExpPeriod(e.target.value)}
                    placeholder="예: 2024.01~2025.12"
                    className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl focus:border-blue-500 outline-hidden text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">세부 한 일(자유 서술) *</label>
                <textarea
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="본인이 담당했던 역할, 실행 과제, 실질적인 결과 혹은 느낀 점 위주로 2~3줄 이상 충분히 작성해주세요. 상세할수록 고도화된 STAR 카드를 자동으로 만들어낼 수 있습니다."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl focus:border-blue-500 outline-hidden text-sm resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpForm(false)}
                  className="px-3 py-2 bg-white hover:bg-gray-150 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={addExperience}
                  disabled={!expTitle.trim() || !expOrg.trim() || !expPeriod.trim() || !expDesc.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                >
                  저장하기
                </button>
              </div>
            </div>
          )}

          {/* Experience Lists */}
          <div className="space-y-4">
            {experiences.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-150 rounded-xl">
                <p className="text-sm text-gray-400">등록된 활동 세부 경험이 없습니다.</p>
                <p className="text-xs text-blue-500 font-semibold mt-1">상단의 &apos;경험 카드 추가&apos; 버튼을 통해 최소 1개 이상의 경험을 작성해야 단계가 완료됩니다.</p>
              </div>
            ) : (
              experiences.map((exp) => (
                <div key={exp.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-gray-800">{exp.title}</span>
                      <span className="text-xs text-gray-500">|</span>
                      <span className="text-xs text-gray-600 font-medium">{exp.organization}</span>
                      <span className="text-xs text-gray-400 font-mono">({exp.period})</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExperience(exp.id)}
                    className="p-1 px-2.5 bg-white hover:bg-red-50 hover:text-red-500 border border-gray-150 text-gray-400 rounded-lg text-xs cursor-pointer flex items-center gap-1 shadow-xs transition-colors self-end md:self-start"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>삭제</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Navigation Footer Controls */}
      <div id="step-nav-buttons" className="flex justify-between items-center mt-8 pt-4 border-t border-gray-150-f">
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
          id="profile-next-btn"
          onClick={handleNext}
          disabled={!isFormValid}
          className={`px-6 py-3 font-semibold rounded-xl text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
            isFormValid
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm'
              : 'bg-gray-150 text-gray-400 cursor-not-allowed border border-gray-200'
          }`}
        >
          <span>채용공고 입력하기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
