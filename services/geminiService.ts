import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UserSelections, VerseSuggestion } from '../types.ts'; 

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.warn("API_KEY environment variable is not set. API calls will fail.");
  // It's better to throw an error early if the API key is essential for core functionality
  // throw new Error("API_KEY environment variable is not set."); 
}

const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_API_KEY_FALLBACK" }); // Provide a fallback or handle missing key more gracefully

export const fetchVerseSuggestion = async (selections: UserSelections): Promise<VerseSuggestion> => {
  const { job, age, gender, mood, situationDescription, generateImage } = selections;

  let situationContext = "";
  let contextForPromptAnalysis = "";

  if (situationDescription && situationDescription.trim() !== "" && situationDescription.trim() !== "듣고 있어요...") {
    situationContext = `사용자가 음성으로 직접 설명한 현재 상황: "${situationDescription}"`;
    contextForPromptAnalysis = "사용자가 직접 설명한 상세 상황";
  } else {
    situationContext = `사용자가 선택한 현재 기분/일반적 상황: ${mood}`;
    contextForPromptAnalysis = "사용자가 선택한 기분/일반적 상황";
  }

  const versePrompt = `
    당신은 사용자의 다양한 삶의 맥락(직업, 나이, 성별)과 현재 감정 상태 및 구체적인 상황 설명을 깊이 이해하고, 이에 가장 적합한 맞춤형 성경 구절을 '개역개정' 성경에서 추천하며, 해당 구절을 사용자의 상황에 맞게 적용할 수 있는 따뜻한 조언을 제공하는 지혜로운 조언자입니다.

    **매우 중요**: 사용자가 제공한 모든 정보(직업, 나이, 성별, 그리고 ${contextForPromptAnalysis})를 종합적으로 분석하여 구절을 추천하고, 그 구절에 대한 적용 내용을 작성해야 합니다.
    특히, 동일한 ${contextForPromptAnalysis}이라도 사용자의 직업, 나이, 성별에 따라 그 경험의 의미와 필요한 위로/지혜가 다를 수 있음을 반드시 고려하여, 각 개인의 독특한 상황에 맞는 구절을 선택하고, 그에 대한 적용 내용을 개인화해주세요.

    응답은 반드시 다음 JSON 형식이어야 합니다. 다른 설명이나 추가 텍스트 없이 JSON 객체만 반환해주세요:
    {
      "verseText": "여기에 성경 구절 내용을 한국어로 넣어주세요.",
      "reference": "여기에 성경책 이름, 장, 절을 정확히 넣어주세요. (예: 요한복음 3:16)",
      "applicationText": "여기에 추천된 성경 구절을 사용자의 구체적인 상황(직업, 나이, 성별, 현재 기분/상황)에 어떻게 적용할 수 있을지에 대한 1-2 문장의 따뜻하고 격려하는 조언을 한국어로 작성해주세요."
    }

    사용자 정보:
    - 직업: ${job}
    - 나이대: ${age}
    - 성별: ${gender}
    - ${situationContext}

    위 사용자 정보를 면밀히 분석하고, 이 모든 요소가 복합적으로 어우러졌을 때 사용자에게 가장 큰 위로, 힘, 또는 지혜를 줄 수 있는 '개역개정' 성경 구절 하나를 찾아주세요.
    추천하는 구절은 너무 길지 않으면서도 핵심적인 메시지를 명확히 전달해야 합니다.
    'applicationText'는 구절의 메시지가 사용자의 특정 상황에 어떻게 연결될 수 있는지, 실제적인 도움이나 관점 변화를 줄 수 있는 내용으로 작성해주세요.
    만약 사용자가 음성으로 "상세 상황"을 제공했다면, 그 내용을 가장 중요한 단서로 활용하되, 다른 인구학적 정보(직업, 나이, 성별)와 결합하여 그 상황에 가장 부합하는 구절과 적용 내용을 찾아야 합니다.
    만약 음성 입력 없이 "기분/일반적 상황"만 선택되었다면, 해당 기분과 함께 직업, 나이, 성별 정보를 종합적으로 고려하여 가장 적절한 구절과 적용 내용을 추천해주세요.
  `;

  let verseData: VerseSuggestion = { verseText: "", reference: "" };

  try {
    const verseResponse: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: versePrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.75, // Slightly increased for more creative application text
        topP: 0.95,
        topK: 40,
      }
    });

    let jsonStr = verseResponse.text.trim();
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }
    const parsedData = JSON.parse(jsonStr) as { verseText: string; reference: string; applicationText: string; };

    if (!parsedData.verseText || !parsedData.reference || !parsedData.applicationText) {
      console.error("Parsed data missing verseText, reference, or applicationText:", parsedData);
      throw new Error("API 응답에서 verseText, reference 또는 applicationText 필드가 누락되었습니다.");
    }
    verseData.verseText = parsedData.verseText;
    verseData.reference = parsedData.reference;
    verseData.applicationText = parsedData.applicationText;

  } catch (error) {
    console.error("Gemini API (text/application) 호출 또는 응답 처리 중 오류 발생:", error);
    if (error instanceof Error) {
        if (error.message.toLowerCase().includes("api key not valid") || error.message.toLowerCase().includes("invalid api key")) {
             throw new Error("제공된 API 키가 유효하지 않습니다. 설정을 확인해주세요.");
        }
        if (error.message.includes("quota") || error.message.includes("rate limit")) {
            throw new Error("API 사용량 한도에 도달했거나 요청 빈도가 너무 높습니다. 잠시 후 다시 시도해주세요.");
        }
        if (error.message.includes("responseMimeType: application/json")) {
             throw new Error("모델이 JSON 형식을 생성하는 데 어려움을 겪고 있습니다. 다시 시도해주세요.");
        }
         throw new Error(`성경 구절 및 적용 내용을 가져오는데 실패했습니다. (오류: ${error.message})`);
    }
    throw new Error("성경 구절 및 적용 내용을 가져오는 중 알 수 없는 오류가 발생했습니다.");
  }

  // If verse generation was successful AND user wants an image, attempt to generate an image
  if (generateImage && verseData.verseText) {
    try {
      const imagePrompt = `성경 구절 "${verseData.verseText} (${verseData.reference})"과 그 적용 내용 "${verseData.applicationText}"에 영감을 받은 이미지를 생성해주세요. 스타일은 현대적이고 세련된 기독교 예술 느낌으로, 희망과 평화, 영감을 주는 분위기여야 합니다. 이미지 자체에는 어떤 글자도 포함하지 마세요. 밝고 긍정적인 색감을 사용하고, 디지털 아트 또는 일러스트레이션 스타일이 좋습니다.`;
      
      const imageResponse = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: imagePrompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
      });

      if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0 && imageResponse.generatedImages[0].image?.imageBytes) {
        const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
        verseData.imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
      } else {
        console.warn("이미지 생성 응답이 비어있거나 이미지 바이트가 없습니다.");
        // verseData.imageUrl will remain undefined
      }
    } catch (imageError) {
      console.error("Gemini API (image) 호출 중 오류 발생 (이미지 생성은 선택 사항이므로 계속 진행합니다):", imageError);
      // Do not throw an error here, just log it. The verse text is more critical.
      // verseData.imageUrl will remain undefined.
    }
  }
  return verseData;
};