import { SelectOption } from './types.ts';

export const JOB_OPTIONS: SelectOption[] = [
  { value: "학생", label: "학생" },
  { value: "직장인 (사무직)", label: "직장인 (사무직)" },
  { value: "직장인 (현장직)", label: "직장인 (현장직)" },
  { value: "자영업자/사업가", label: "자영업자/사업가" },
  { value: "주부", label: "주부" },
  { value: "예술/창작", label: "예술/창작" },
  { value: "의료/봉사", label: "의료/봉사" },
  { value: "교육/연구", label: "교육/연구" },
  { value: "은퇴자", label: "은퇴자" },
  { value: "취업준비생", label: "취업준비생" },
  { value: "특별한 직업 없음", label: "특별한 직업 없음" },
];

export const AGE_OPTIONS: SelectOption[] = [
  { value: "10대", label: "10대" },
  { value: "20대 초반", label: "20대 초반" },
  { value: "20대 후반", label: "20대 후반" },
  { value: "30대 초반", label: "30대 초반" },
  { value: "30대 후반", label: "30대 후반" },
  { value: "40대", label: "40대" },
  { value: "50대", label: "50대" },
  { value: "60대 이상", label: "60대 이상" },
];

export const GENDER_OPTIONS: SelectOption[] = [
  { value: "남성", label: "남성" },
  { value: "여성", label: "여성" },
  { value: "밝히고 싶지 않음", label: "밝히고 싶지 않음" },
];

export const MOOD_OPTIONS: SelectOption[] = [
  { value: "최고의 컨디션, 감사함, 모든 게 잘 풀림", label: "오늘 폼 미쳤다! / 갓생 사는 중 😎" },
  { value: "현실 자각으로 인한 무기력함, 깊은 슬픔, 의욕 상실", label: "현타 제대로 옴 / 의욕 바닥 🫠" },
  { value: "걱정이 많고 생각이 복잡함, 불안 초조, 정신적 안정 필요", label: "머릿속 복잡 / 멘탈 관리 시급 🤯" },
  { value: "마음의 평화와 안정감, 소소하지만 확실한 행복", label: "오늘따라 평온 / 찐행복 모먼트 😌" },
  { value: "극심한 분노, 답답함, 좌절감, 억울함", label: "킹받네 / 빡침주의보 💢" },
  { value: "결정하기 어려움, 무엇을 해야 할지 모르는 혼란스러움", label: "선택장애 제대로 / 어떡하지? 😵‍💫" },
  { value: "극심한 외로움, 소속감 부재, 사람들과 연결되고 싶은 마음", label: "나만 혼자인 기분 / 너무 외로워 🥺" },
  { value: "큰 기대감, 희망에 부풀어 있음, 긍정적인 미래 예감", label: "가슴이 웅장해진다 / 뭔가 될 것 같아! ✨" },
  { value: "과거의 행동에 대한 후회와 죄책감, 반성하는 마음", label: "내가 왜 그랬을까 / 반성 모드 🙏" },
  { value: "정신적 공허함, 삶의 의미나 목적을 찾고 싶은 마음", label: "마음이 공허해 / 의미를 찾고 싶어 🤔" },
  { value: "모든 걸 다 놓고 싶을 만큼 지침, 번아웃 직전", label: "다 때려치고 싶다 / 번아웃 직전 🔥" },
  { value: "노력의 결실을 맺음, 작지만 확실한 성공과 행복", label: "플렉스 성공! / 소확행 만끽 중 🥳" },
];
