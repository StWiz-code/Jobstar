import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { PipelineState, ApplicationInfo, ApplicantProfile, JobPosting, StarCard, EssayQuestion, EssayResult } from '../types';

type PipelineAction =
  | { type: 'SET_APPLICATION'; payload: ApplicationInfo }
  | { type: 'SET_PROFILE'; payload: ApplicantProfile }
  | { type: 'SET_JOB_POSTING'; payload: JobPosting }
  | { type: 'SET_STAR_CARDS'; payload: StarCard[] }
  | { type: 'SELECT_STAR'; payload: string }
  | { type: 'UPDATE_STAR_FIELD'; payload: { id: string; field: keyof StarCard; value: any } }
  | { type: 'ADD_QUESTION'; payload: EssayQuestion }
  | { type: 'UPDATE_QUESTION'; payload: { id: string; field: keyof EssayQuestion; value: any } }
  | { type: 'REMOVE_QUESTION'; payload: string }
  | { type: 'SET_RESULTS'; payload: EssayResult[] }
  | { type: 'UPDATE_RESULT_CONTENT'; payload: { questionId: string; content: string } }
  | { type: 'UPDATE_RESULT_STATUS'; payload: { questionId: string; status: EssayResult['status']; errorMessage?: string } }
  | { type: 'GO_NEXT' }
  | { type: 'GO_PREV' }
  | { type: 'GO_TO_STEP'; payload: 1 | 2 | 3 | 4 | 5 | 6 }
  | { type: 'LOAD_STATE'; payload: PipelineState }
  | { type: 'RESET_STATE' };

const initialProfile: ApplicantProfile = {
  education: {
    school: '',
    major: '',
    gpa: '',
    status: '재학',
  },
  certifications: [],
  languageScores: [],
  skills: [],
  experiences: [],
};

const defaultState: PipelineState = {
  currentStep: 1,
  application: { companyName: '', jobTitle: '' },
  profile: initialProfile,
  jobPosting: { rawText: '' },
  starCards: [],
  selectedStarId: null,
  questions: [
    { id: 'q1', questionText: '지원동기와 직무 역량을 서술해 주세요.', charLimit: 500, includeSpaces: true }
  ],
  results: [],
};

function pipelineReducer(state: PipelineState, action: PipelineAction): PipelineState {
  switch (action.type) {
    case 'SET_APPLICATION':
      return { ...state, application: action.payload };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'SET_JOB_POSTING':
      return { ...state, jobPosting: action.payload };
    case 'SET_STAR_CARDS':
      return { ...state, starCards: action.payload };
    case 'SELECT_STAR':
      return { ...state, selectedStarId: action.payload };
    case 'UPDATE_STAR_FIELD':
      return {
        ...state,
        starCards: state.starCards.map((card) =>
          card.id === action.payload.id
            ? { ...card, [action.payload.field]: action.payload.value }
            : card
        ),
      };
    case 'ADD_QUESTION':
      return { ...state, questions: [...state.questions, action.payload] };
    case 'UPDATE_QUESTION':
      return {
        ...state,
        questions: state.questions.map((q) =>
          q.id === action.payload.id ? { ...q, [action.payload.field]: action.payload.value } : q
        ),
      };
    case 'REMOVE_QUESTION':
      return { ...state, questions: state.questions.filter((q) => q.id !== action.payload) };
    case 'SET_RESULTS':
      return { ...state, results: action.payload };
    case 'UPDATE_RESULT_CONTENT':
      return {
        ...state,
        results: state.results.map((res) =>
          res.questionId === action.payload.questionId
            ? { ...res, content: action.payload.content }
            : res
        ),
      };
    case 'UPDATE_RESULT_STATUS':
      return {
        ...state,
        results: state.results.map((res) =>
          res.questionId === action.payload.questionId
            ? { ...res, status: action.payload.status, errorMessage: action.payload.errorMessage }
            : res
        ),
      };
    case 'GO_NEXT':
      return { ...state, currentStep: Math.min(6, state.currentStep + 1) as any };
    case 'GO_PREV':
      return { ...state, currentStep: Math.max(1, state.currentStep - 1) as any };
    case 'GO_TO_STEP':
      return { ...state, currentStep: action.payload };
    case 'LOAD_STATE':
      return { ...action.payload };
    case 'RESET_STATE':
      return { ...defaultState };
    default:
      return state;
  }
}

const PipelineContext = createContext<{
  state: PipelineState;
  dispatch: React.Dispatch<PipelineAction>;
} | null>(null);

export const PipelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(pipelineReducer, defaultState);

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('jobstar-pipeline-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      }
    } catch (e) {
      console.error('Failed to load saved state:', e);
    }
  }, []);

  // Save to sessionStorage when state changes
  useEffect(() => {
    try {
      sessionStorage.setItem('jobstar-pipeline-state', JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, [state]);

  return (
    <PipelineContext.Provider value={{ state, dispatch }}>
      {children}
    </PipelineContext.Provider>
  );
};

export const usePipeline = () => {
  const context = useContext(PipelineContext);
  if (!context) {
    throw new Error('usePipeline must be used within a PipelineProvider');
  }
  return context;
};
