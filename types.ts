export interface UserSelections {
  job: string;
  age: string;
  gender: string;
  mood: string;
  situationDescription?: string; // For voice input
  generateImage: boolean; // To control image generation
}

export interface VerseSuggestion {
  verseText: string;
  reference: string;
  imageUrl?: string; // Optional: for the generated image
  applicationText?: string; // Optional: for personalized application of the verse
}

export interface SelectOption {
  value: string;
  label: string;
}