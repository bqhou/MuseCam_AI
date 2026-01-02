export enum AspectRatio {
  NINE_SIXTEEN = '9:16',
  SIXTEEN_NINE = '16:9',
  THREE_FOUR = '3:4',
  ONE_ONE = '1:1',
}

export interface VideoDimensions {
  width: number;
  height: number;
}

export interface PromptSuggestion {
  text: string;
  category: string;
}
