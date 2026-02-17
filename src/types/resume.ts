export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  portfolio: string;
  summary: string;
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  isPresent: boolean;
  description: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  graduationYear: string;
  gpa: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export interface ResumeData {
  personal: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skillCategories: SkillCategory[];
  customSummary: string;
  template: ResumeTemplate;
  accentColor: string;
}

export type ResumeTemplate = 'modern' | 'professional' | 'creative';

export const STEPS = ['Personal Info', 'Experience', 'Education', 'Skills', 'Summary'] as const;
export type StepName = (typeof STEPS)[number];

export function newExperience(): Experience {
  return {
    id: crypto.randomUUID?.() || Date.now().toString(),
    company: '',
    title: '',
    startDate: '',
    endDate: '',
    isPresent: false,
    description: [''],
  };
}

export function newEducation(): Education {
  return {
    id: crypto.randomUUID?.() || Date.now().toString() + Math.random(),
    school: '',
    degree: '',
    field: '',
    graduationYear: '',
    gpa: '',
  };
}

export function newSkillCategory(): SkillCategory {
  return {
    id: crypto.randomUUID?.() || Date.now().toString() + Math.random(),
    name: '',
    skills: [],
  };
}

export function defaultResumeData(): ResumeData {
  return {
    personal: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedIn: '',
      portfolio: '',
      summary: '',
    },
    experiences: [newExperience()],
    education: [newEducation()],
    skillCategories: [{ id: '1', name: 'Technical Skills', skills: [] }],
    customSummary: '',
    template: 'modern',
    accentColor: '#3b82f6',
  };
}
