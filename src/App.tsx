import React, { useState, useCallback } from 'react';
import { SelectionForm } from './components/SelectionForm.tsx';
import { VerseDisplay } from './components/VerseDisplay.tsx';
import { LoadingSpinner } from './components/LoadingSpinner.tsx';
import { fetchVerseSuggestion } from './services/geminiService.ts';
import { UserSelections, VerseSuggestion } from './types.ts';
import { JOB_OPTIONS, AGE_OPTIONS, GENDER_OPTIONS, MOOD_OPTIONS } from './constants.ts';

const App: React.FC = () => {
  const initialSelections: UserSelections = {
    job: JOB_OPTIONS[0]?.value || '',
    age: AGE_OPTIONS[0]?.value || '',
    gender: GENDER_OPTIONS[0]?.value || '',
    mood: MOOD_OPTIONS[0]?.value || '',
    situationDescription: undefined,
    generateImage: true, // Default to generating images
  };

  const [selections, setSelections] = useState<UserSelections>(initialSelections);
  const [verseSuggestion, setVerseSuggestion] = useState<VerseSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectionChange = useCallback((field: keyof UserSelections, value: string | boolean | undefined) => {
    setSelections(prev => {
      const updatedSelections = { ...prev, [field]: value };
      
      if (field === 'mood' && prev.situationDescription) {
        updatedSelections.situationDescription = undefined;
      }
      return updatedSelections;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setVerseSuggestion(null);
    try {
      if (!import.meta.env.VITE_API_KEY) {
        throw new Error("API 키가 설정되지 않았습니다. .env 파일에 VITE_API_KEY를 확인해주세요.");
      }
      const suggestion = await fetchVerseSuggestion(selections);
      setVerseSuggestion(suggestion);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || '구절을 가져오는 중 오류가 발생했습니다.');
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selections]);

  const handleResetSelections = useCallback(() => {
    setSelections(initialSelections);
    setVerseSuggestion(null);
    setError(null);
    // If speech recognition is active, it should be stopped by SelectionForm's own logic or this could be an area for enhancement
  }, [initialSelections]);

  return (
    <div className="container mx-auto max-w-2xl p-6 bg-white shadow-2xl rounded-lg">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center text-sky-600 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mr-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6-2.292m0 0V3.75m0 12.553a2.25 2.25 0 0 0-1.07 1.916l.007.007c.07.24.298.422.568.422H12.5c.271 0 .498-.182.568-.422l.007-.007A2.25 2.25 0 0 0 13.07 16.25D12.522 16.05 12 15.75l-.522.303Z" />
          </svg>
          <h1 className="text-4xl font-bold tracking-tight">성경 구절 추천기</h1>
        </div>
        <p className="text-gray-600 text-lg">당신에게 힘이 되는 말씀을 찾아드립니다.</p>
      </header>

      <SelectionForm
        selections={selections}
        onSelectionChange={handleSelectionChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onResetSelections={handleResetSelections}
      />

      {isLoading && <LoadingSpinner />}
      {error && <p className="mt-6 text-center text-red-600 bg-red-100 p-3 rounded-md animate-fadeIn">{error}</p>}
      
      {!isLoading && !error && verseSuggestion && (
         <VerseDisplay suggestion={verseSuggestion} />
      )}
      {!isLoading && !error && !verseSuggestion && (
        <p className="mt-6 text-center text-gray-500 italic">정보를 선택하거나 음성으로 상황을 설명하고 '구절 찾기' 버튼을 눌러주세요.</p>
      )}
       <footer className="mt-10 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} 성경 구절 추천기. API 제공: Google Gemini.</p>
        <p className="mt-1">개역개정 성경 기반</p>
      </footer>
    </div>
  );
};

export default App;
