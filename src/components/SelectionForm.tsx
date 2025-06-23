import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserSelections, SelectOption } from '../types.ts';
import { JOB_OPTIONS, AGE_OPTIONS, GENDER_OPTIONS, MOOD_OPTIONS } from '../constants.ts';

// Define SpeechGrammar and SpeechGrammarList interfaces (for completeness)
interface SpeechGrammar {
  src: string;
  weight?: number;
}

interface SpeechGrammarList {
  readonly length: number;
  addFromString(string: string, weight?: number): void;
  addFromURI(src: string, weight?: number): void;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
}

// Define the event types for speech recognition
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string; 
  readonly message: string;
}


// Define the SpeechRecognition instance interface
interface ISpeechRecognition {
  grammars: SpeechGrammarList;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;

  onaudiostart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: ISpeechRecognition, ev: Event) => any) | null;

  abort(): void;
  start(): void;
  stop(): void;
}

// Define the SpeechRecognition constructor interface
interface SpeechRecognitionStatic {
  new (): ISpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionStatic;
    webkitSpeechRecognition?: SpeechRecognitionStatic;
  }
}

interface SelectionFormProps {
  selections: UserSelections;
  onSelectionChange: (field: keyof UserSelections, value: string | boolean | undefined) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onResetSelections: () => void;
}

const SelectInput: React.FC<{
  id: keyof UserSelections;
  label: string;
  value: string; // Assuming select inputs will always deal with string values
  options: SelectOption[];
  onChange: (value: string) => void;
  Icon?: React.ElementType;
}> = ({ id, label, value, options, onChange, Icon }) => (
  <div>
    <label htmlFor={id as string} className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
      {Icon && <Icon className="w-5 h-5 mr-2 text-sky-600" />}
      {label}
    </label>
    <select
      id={id as string}
      name={id as string}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition duration-150 ease-in-out"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

// Icons
const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);
const BriefcaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.073a2.25 2.25 0 0 1-2.25 2.25h-12a2.25 2.25 0 0 1-2.25-2.25v-4.073M15.75 8.106A4.505 4.505 0 0 0 12 7.5c-1.096 0-2.117.37-2.923.998M15.75 8.106V6.375c0-1.243-.996-2.25-2.218-2.25H10.468C9.246 4.125 8.25 5.132 8.25 6.375v1.731m7.5 0-3-3m0 0-.75.75M12 7.5l-.75.75m-2.25-1.731v1.731m0 0-3 3m0 0L6 11.25m3-3.144V8.106M15.75 8.106l2.25 2.25M3.75 14.151l2.25-2.25M12 15.75l.375.375a3.75 3.75 0 1 0 5.25-5.25L12 6.375m-3.375 9.375L12 15.75m-3.375-9.375L6 3.75M12 15.75l-.375.375a3.75 3.75 0 1 1-5.25-5.25L12 6.375" />
  </svg>
);
const FaceSmileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75s.168-.75.375-.75S9.75 9.336 9.75 9.75Zm4.5 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Z" />
  </svg>
);
const CalendarDaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
  </svg>
);
const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15c1.657 0 3-1.343 3-3V6c0-1.657-1.343-3-3-3S9 4.343 9 6v6c0 1.657 1.343 3 3 3Z" />
  </svg>
);
const StopCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 0 1 9 14.437V9.564Z" />
  </svg>
);
const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);
const PhotoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);
const ArrowPathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);


export const SelectionForm: React.FC<SelectionFormProps> = ({ selections, onSelectionChange, onSubmit, isLoading, onResetSelections }) => {
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const SpeechRecognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;

  const onSelectionChangeRef = useRef(onSelectionChange);
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  const currentSituationDescriptionRef = useRef(selections.situationDescription);
  useEffect(() => {
    currentSituationDescriptionRef.current = selections.situationDescription;
  }, [selections.situationDescription]);

  useEffect(() => {
    if (!SpeechRecognition) {
      setSpeechError("이 브라우저에서는 음성 인식을 지원하지 않습니다.");
      return;
    }

    const recognition: ISpeechRecognition = new SpeechRecognition();
    recognition.continuous = false; 
    recognition.interimResults = true; 
    recognition.lang = 'ko-KR';

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError(null);
      onSelectionChangeRef.current('situationDescription', "듣고 있어요...");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let fullTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }
      if (fullTranscript.trim()) {
        onSelectionChangeRef.current('situationDescription', fullTranscript.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = "음성 인식 중 오류가 발생했습니다.";
      if (event.error === 'no-speech') errorMessage = "음성이 감지되지 않았습니다. 다시 시도해주세요.";
      else if (event.error === 'audio-capture') errorMessage = "마이크 접근에 문제가 발생했습니다. 권한을 확인해주세요.";
      else if (event.error === 'not-allowed') errorMessage = "마이크 사용이 허용되지 않았습니다. 브라우저 설정을 확인해주세요.";
      else if (event.error === 'network') errorMessage = "네트워크 오류로 음성 인식을 처리할 수 없습니다.";
      else errorMessage = `음성 인식 오류: ${event.error}`;
      setSpeechError(errorMessage);
      if (currentSituationDescriptionRef.current === "듣고 있어요...") {
         onSelectionChangeRef.current('situationDescription', undefined);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
       if (currentSituationDescriptionRef.current === "듣고 있어요...") { 
         onSelectionChangeRef.current('situationDescription', undefined);
      }
    };
    
    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort(); 
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current = null;
      }
    };
  }, [SpeechRecognition]); 

  const handleToggleListening = useCallback(() => {
    if (!recognitionRef.current) {
        setSpeechError("음성 인식 기능을 사용할 수 없습니다.");
        return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current.start();
      } catch (e) {
        let errorMsg = "음성 인식을 시작할 수 없습니다.";
        if (e instanceof Error) errorMsg = `${errorMsg} (${e.message})`;
        setSpeechError(errorMsg);
        setIsListening(false);
        if (currentSituationDescriptionRef.current === "듣고 있어요...") {
            onSelectionChangeRef.current('situationDescription', undefined);
        }
      }
    }
  }, [isListening, SpeechRecognition]);

  const handleClearSituationDescription = () => {
    onSelectionChange('situationDescription', undefined);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop(); 
    }
  };

  const handleReset = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    onResetSelections();
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectInput
          id="job"
          label="직업"
          value={selections.job}
          options={JOB_OPTIONS}
          onChange={(value) => onSelectionChange('job', value)}
          Icon={BriefcaseIcon}
        />
        <SelectInput
          id="age"
          label="나이"
          value={selections.age}
          options={AGE_OPTIONS}
          onChange={(value) => onSelectionChange('age', value)}
          Icon={CalendarDaysIcon}
        />
        <SelectInput
          id="gender"
          label="성별"
          value={selections.gender}
          options={GENDER_OPTIONS}
          onChange={(value) => onSelectionChange('gender', value)}
          Icon={UserIcon}
        />
        <SelectInput
          id="mood"
          label="현재 기분/상황 (선택)"
          value={selections.mood}
          options={MOOD_OPTIONS}
          onChange={(value) => onSelectionChange('mood', value)}
          Icon={FaceSmileIcon}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
          <MicrophoneIcon className="w-5 h-5 mr-2 text-sky-600" />
          음성으로 상황 설명하기
        </label>
        <button
          type="button"
          onClick={handleToggleListening}
          disabled={!SpeechRecognition || isLoading} 
          className={`w-full flex items-center justify-center py-2.5 px-4 border rounded-md shadow-sm text-sm font-medium 
                      ${isListening ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-500'} 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 
                      disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed transition duration-150 ease-in-out`}
          aria-pressed={isListening}
          aria-label={isListening ? "음성 입력 중지" : "음성으로 현재 상황 설명 시작"}
        >
          {isListening ? (
            <>
              <StopCircleIcon className="w-5 h-5 mr-2" />
              듣는 중... (클릭하여 중지)
            </>
          ) : (
            <>
              <MicrophoneIcon className="w-5 h-5 mr-2" />
              내 상황 말하기
            </>
          )}
        </button>
        {speechError && <p className="text-xs text-red-600 mt-1 animate-fadeIn">{speechError}</p>}
        {!SpeechRecognition && <p className="text-xs text-orange-600 mt-1">이 브라우저에서는 음성 인식을 지원하지 않습니다.</p>}
      </div>

      {selections.situationDescription && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200 animate-fadeIn">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-700 italic">"{selections.situationDescription}"</p>
            {selections.situationDescription !== "듣고 있어요..." && (
              <button
                type="button"
                onClick={handleClearSituationDescription}
                className="text-gray-400 hover:text-gray-600 ml-2"
                aria-label="입력된 음성 내용 지우기"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2 mt-4">
          <input
            type="checkbox"
            id="generateImage"
            checked={selections.generateImage}
            onChange={(e) => onSelectionChange('generateImage', e.target.checked)}
            disabled={isLoading || isListening}
            className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500 disabled:opacity-50"
          />
          <label htmlFor="generateImage" className="text-sm font-medium text-gray-700 flex items-center">
            <PhotoIcon className="w-5 h-5 mr-1.5 text-sky-600"/>
            말씀 이미지 함께 보기
          </label>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading || isListening}
          className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        >
          <ArrowPathIcon className="w-5 h-5 mr-2"/>
          다시 선택하기
        </button>
        <button
          type="submit"
          disabled={isLoading || isListening}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              구절 찾는 중...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              말씀 구절 찾기
            </>
          )}
        </button>
      </div>
    </form>
  );
};
