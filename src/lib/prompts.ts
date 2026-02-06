import type { SalonInfo, ProtagonistInfo, SlideData } from '../types';

export const SYSTEM_PROMPT_STORY = `
あなたは美容室集客専門の凄腕Instagram漫画広告クリエイターです。
ターゲット層の共感を呼び、サロンへの来店を強く促す「8枚構成の漫画ストーリー」を作成してください。

# 入力データ
サロン名: {salonName}
サロンの強み: {strengths}
その他の特徴: {features}

# 指示
1. サロンの強みに基づいて、ターゲットとなる詳細なペルソナ（年齢、職業、悩み）を定義してください。
2. そのターゲットに合致する「髪の悩みを抱える主人公」を設定してください。
3. 以下の「共感型ストーリー構成」に従って、必ず【8枚】のスライドを作成してください。
   - 1-2枚目: 共感・問題提起 (読者に「これは私のことだ！」と思わせる)
   - 3-4枚目: 問題の深掘り (悩みの深刻さ、感情的なつらさ)
   - 5枚目: 解決策の提示 (サロン・スタイリストとの出会い)
   - 6枚目: 変化・施術 (施術プロセス、感動体験)
   - 7枚目: ビフォーアフター・喜び (劇的な変化、自信の回復)
   - 8枚目: 行動喚起 (予約への誘導)

# 出力フォーマット
以下のTypeScriptインターフェースに適合する有効なJSONオブジェクトのみを出力してください。Markdownのコードブロックは不要です。

interface StoryData {
  target: { age: string; persona: string; mainConcern: string; }; // 全て日本語
  protagonist: { name: string; age: string; job: string; appearance: string; hairProblem: string; }; // 全て日本語
  slides: Array<{
    id: number; // 1 to 8
    title: string; // 日本語
    composition: string; // カメラアングルや背景（シンプル・パステル調）
    characters: string; // キャラクターのポーズ・表情。主人公の外見特徴と一致させること。
    dialogue: string; // 日本語のセリフ。吹き出し用。20文字以内。
    narration: string; // 日本語のナレーション。
    emotion: string; // 感情タグ (例: 悲しみ, 喜び, 期待)
    imagePrompt: string; // 画像生成用プロンプト (英語)。
  }>;
}

# Image Prompt (imagePrompt) の重要制約
- 必ず【英語】で記述すること。
- スタイル指定を含めること: "Japanese Shoujo Manga style, pastel colors, soft lighting, 1:1 aspect ratio, high quality illustration".
- キャラクターの一貫性を保つため、全スライドのプロンプトに主人公の具体的な外見特徴（髪型、髪色、服装）を含めること。
`;

export function generateStoryPrompt(salon: SalonInfo): string {
  return SYSTEM_PROMPT_STORY
    .replace('{salonName}', salon.name)
    .replace('{strengths}', salon.strengths.join(', '))
    .replace('{features}', salon.features.join(', '));
}

export function generateImagePrompt(slide: SlideData, protagonist: ProtagonistInfo): string {
  // Construct a prompt that enforces consistency and text rendering
  // Note: Gemini 3 Pro supports text rendering if requested properly.

  const baseStyle = "Japanese Shoujo Manga style, pastel colors, soft watercolor touch, high quality, 1:1 square ratio.";
  const charDesc = `Character: ${protagonist.appearance}, ${protagonist.age} years old female, ${protagonist.job} style.`;
  const scene = `Scene: ${slide.imagePrompt}. Composition: ${slide.composition}. Emotion: ${slide.emotion}.`;

  // Text rendering instruction
  const textInstruction = `
    Integrate a speech bubble with the following Japanese text exactly: "${slide.dialogue}".
    Ensure the text is legible, dark color on white bubble.
  `;

  return `${baseStyle}
${charDesc}
${scene}
${textInstruction}`;
}
