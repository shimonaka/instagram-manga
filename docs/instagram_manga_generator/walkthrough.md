# Instagram Manga Generator - Walkthrough

## 概要
Google Gemini 3.0 (Flash/Pro) を活用し、美容室の集客用漫画広告を自動生成するアプリケーションです。
指定された設計書に基づき、キャラクターの一貫性を維持した8枚構成のストーリーと画像を生成します。

## 主な機能
1.  **サロン情報入力**
    - 美容室名、強み（タグ選択）、特徴、画像（スタッフ・サロン）の登録
    - Google API Keyの入力（ブラウザ保存）
2.  **AI ストーリー生成**
    - サロンの強みに合わせた「共感型ーストーリー」を自動構築
    - ターゲット層、主人公設定（外見・悩み）、8枚の絵コンテ（セリフ・構図）を生成
3.  **AI 画像生成**
    - Gemini Image Generation モデル使用
    - **キャラクターの一貫性維持**: 主人公のプロフィールを全プロンプトに継続して適用
    - **テキスト内包生成**: 吹き出しとセリフを含んだ状態で画像を生成（モデル精度に依存しますが、プロンプトで強力に指示）
4.  **プレビュー & ダウンロード**
    - 生成されたストーリーと画像の確認
    - スライドごとの再生成機能

## 起動方法
以下のコマンドでローカル開発サーバーを起動してください。

```bash
npm run dev
```

ブラウザで `http://localhost:5173` が自動的に開きます（または手動でアクセス）。

## 検証手順

### 1. 準備
- [Google AI Studio](https://aistudio.google.com/app/apikey) でAPIキーを取得してください。
- `Gemini 1.5 Pro` や `Gemini 2.0 Flash` 等、画像生成が有効なモデルへのアクセス権が必要です。
  - *初期設定ではテキスト生成に `gemini-2.0-flash`、画像生成に `gemini-2.0-flash-exp` を使用しています。*

### 2. ストーリー生成の確認
1.  `Google API Key` を入力。
2.  `Salon Name` に任意の店名を入力（例：Hair Salon MIYABI）。
3.  `Salon Strengths` からタグをいくつか選択（例：髪質改善、カット技術）。
4.  `Generate Story` ボタンをクリック。
    - -> "Writing Logic..." 画面が表示され、数秒～数十秒で結果画面へ遷移することを確認。

### 3. 画像生成の確認
1.  結果画面にて、「Generate Image」ボタン（各スライド）または「Generate All Images」ボタンをクリック。
2.  以下の点を確認してください：
    - **画風**: 日本の少女漫画風（パステルカラー）であること。
    - **一貫性**: 1枚目と他のスライドで、主人公（髪型・服装）が概ね同一人物に見えること。
    - **テキスト**: 画像内に日本語のセリフ（吹き出し）が含まれていること。

## 技術詳細
- **Frontend**: React + Vite + TypeScript
- **Styling**: CSS Modules + Global CSS Variables (Glassmorphism Design)
- **State**: Rect Context / Local State
- **API**: Google Generative AI API (Direct fetch)

## 既知の制限事項
- Geminiの画像生成モデル（特に日本語テキスト描画）は開発段階（Extension/Experimental）の場合があり、生成された文字が崩れる可能性があります。その場合は何度か再生成を試してください。
