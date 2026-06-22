// 1단계: 지원 정보
export interface ApplicationInfo {
  companyName: string;
  jobTitle: string;
}

// 2단계: 지원자 프로필
export interface ApplicantProfile {
  education: {
    school: string;
    major: string;
    gpa?: string;
    status: '재학' | '휴학' | '졸업예정' | '졸업';
  };
  certifications: string[];                       // 자격증 목록
  languageScores: { test: string; score: string }[]; // 어학 (예: 토익 920)
  skills: string[];                               // 보유 역량
  experiences: Experience[];                      // 경험/경력
}

export interface Experience {
  id: string;
  title: string;        // 활동/직무명
  organization: string; // 소속
  period: string;       // 기간 (예: 2023.03~2024.02)
  description: string;  // 한 일 (자유 서술)
}

// 3단계: 채용공고
export interface JobPosting {
  rawText: string;
  extractedKeywords?: string[]; // 호출1 결과 캐싱
}

// 4단계: STAR 카드 (AI 도출)
export interface StarCard {
  id: string;
  experienceTitle: string;   // 어떤 경험 기반인지
  fitScore: number;          // 0~100 공고 적합도
  fitReason: string;         // 적합 이유 한 줄
  matchedKeywords: string[]; // 매칭된 공고 키워드
  situation: string;
  task: string;
  action: string;
  result: string;
}

// 5단계: 자소서 문항
export interface EssayQuestion {
  id: string;
  questionText: string;
  charLimit: number;
  includeSpaces: boolean; // 공백 포함 글자수 기준 여부
}

// 6단계: 자소서 결과
export interface EssayResult {
  questionId: string;
  content: string;
  status: 'idle' | 'generating' | 'done' | 'error';
  errorMessage?: string;
}

// 전체 파이프라인 상태 (단일 소스)
export interface PipelineState {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
  application: ApplicationInfo;
  profile: ApplicantProfile;
  jobPosting: JobPosting;
  starCards: StarCard[];          // 도출된 3개
  selectedStarId: string | null;  // 확정된 1개
  questions: EssayQuestion[];
  results: EssayResult[];
}
