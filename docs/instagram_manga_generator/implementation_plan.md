# Implementation Plan - Instagram Manga Generator

## Goal Description
Instagram向けの漫画生成アプリ（SPA）を構築する。
ユーザーが提供した設計書に基づき、美容室の集客を目的とした8枚構成の漫画広告を自動生成する。
**最優先事項: キャラクターの一貫性維持、テキストの画像内生成（オーバーレイではない）。**

## User Review Required
- **モデルの利用可否**: ユーザー指定の `Gemini 3.0 Flash` (テキスト) と `Gemini 3 Pro` (画像) のAPIエンドポイントとパラメータ仕様。
  - *Note*: API仕様が不明な場合は、現状利用可能な最新の `gemini-2.0-flash` 等で仮実装し、モデル名を差し替え可能な設計とする。
- **テキスト生成**: 画像内へのテキスト埋め込み精度はモデルの能力に依存するため、プロンプトでの指示を強化する。

## Proposed Changes

### 1. Project Initialization
- **Framework**: Vite + React + TypeScript
- **Styling**: Vanilla CSS (CSS Modules or Global CSS with Variables)
  - "Premium" aesthetic: Glassmorphism, gradients, animations.
  - Fonts: Noto Sans JP, Noto Serif JP.

### 2. Core Logic (src/lib)
- **Gemini API Client**:
  - `generateStory(apiKey, salonInfo)`: Uses `Gemini 3.0 Flash`. Returns JSON with story structure.
  - `generateImage(apiKey, prompt)`: Uses `Gemini 3 Pro`.
- **Prompt Engineering**:
  - **Consistency**: Maintain a robust `protagonist` object (appearance, age, style) and inject it into *every* prompt.
  - **Text Rendering**: Prompts will strictly format requests as "Manga panel, [Character Action], speech bubble containing text: '[Dialogue]'".
  - **Localization**: UI and prompt instructions localized to Japanese.

### 3. State Management
- React Context or standard generic hook for:
  - `step` (input -> generating -> result)
  - `storyData` (JSON)
  - `generatedImages` (Map of slide index to base64)
  - `apiKey` (Stored in localStorage)

### 4. UI Components
- **InputForm**:
  - Salon Name, Strength Tags (toggleable), Staff/Salon Image Upload.
  - **Japanese Labels**: All UI text translated to Japanese.
- **LoadingScreen**:
  - Animated indication of "Generating Story..." vs "Generating Image X...".
  - Japanese localized status messages.
- **ResultPreview**:
  - Carousel/Grid view of 8 slides.
  - "Generate/Regenerate" button per slide.
  - Download button.
  - Japanese localized buttons (e.g., "全スライド画像生成").

## Verification Plan
### Automated Tests
- Type checking with TypeScript `tsc`.
- Basic component rendering tests (optional).

### Manual Verification
1.  **Setup**: Enter a valid Google AI Studio API Key.
2.  **Story Gen**: Input salon details -> Verify 8-slide story JSON is generated with consistent protagonist settings.
3.  **Image Gen**: Generate all 8 images -> Verify:
    - Character looks the same in Slide 1 and Slide 8.
    - Japanese text is readable inside speech bubbles.
    - Style is "Shoujo Manga / Pastel".
4.  **UI/UX**: Verify glassmorphism, smooth transitions, and mobile responsiveness.
