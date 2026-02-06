import { useState } from 'react';
import { InputForm } from './components/InputForm';
import { ResultPreview } from './components/ResultPreview';
import { generateStory, generateImage } from './lib/gemini';
import { generateStoryPrompt, generateImagePrompt } from './lib/prompts';
import type { StoryData, SalonInfo, AppStep } from './types';
import { Sparkles, AlertCircle } from 'lucide-react';
import './App.css';

function App() {
  const [step, setStep] = useState<AppStep>('input');
  const [apiKey, setApiKey] = useState('');
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  // Removed redundant protagonist state, using storyData.protagonist


  const handleStorySubmit = async (salon: SalonInfo, key: string) => {
    setApiKey(key);
    setError(null);
    setStep('generating');

    try {
      const prompt = generateStoryPrompt(salon);
      const story = await generateStory(key, prompt);

      // Basic validation
      if (!story.slides || story.slides.length !== 8) {
        throw new Error('生成されたストーリーが8枚構成ではありませんでした。もう一度お試しください。');
      }

      setStoryData(story);
      setStep('result');
    } catch (err: any) {
      setError(err.message || 'ストーリー生成に失敗しました');
      setStep('input');
    }
  };


  const handleGenerateImage = async (slideId: number, previousImage?: string) => {
    if (!storyData || !apiKey) return;

    const slide = storyData.slides.find(s => s.id === slideId);
    if (!slide) return;

    setLoadingImages(prev => ({ ...prev, [slideId]: true }));
    setError(null);

    try {
      // Use provided previous image OR try to find one from the previous slide index logic
      // But for 'Generate All', we pass it explicitly.
      // For manual single generation, we check the state.
      let refImage = previousImage;
      if (!refImage && slideId > 1) {
        refImage = generatedImages[slideId - 1]; // Try to get from state
      }

      // Add context instruction if reference image exists
      const prompt = generateImagePrompt(slide, storyData.protagonist)
        + (refImage ? " \n(IMPORTANT: Maintain consistency with the character and style in the provided reference image.)" : "");

      const base64Image = await generateImage(apiKey, prompt, refImage);

      setGeneratedImages(prev => ({
        ...prev,
        [slideId]: base64Image
      }));

      return base64Image;
    } catch (err: any) {
      setError(`スライド ${slideId} の画像生成に失敗しました: ${err.message}`);
      throw err; // Re-throw for sequential handling
    } finally {
      setLoadingImages(prev => ({ ...prev, [slideId]: false }));
    }
  };

  const handleGenerateAll = async () => {
    if (!storyData) return;

    let lastImage: string | undefined = undefined;

    for (const slide of storyData.slides) {
      // stricter sequence: force regeneration or just fill missing?
      // User wants consistent flow, so ideally we generate strictly 1->2->3...
      // If 1 exists, use it as seed for 2.

      if (generatedImages[slide.id]) {
        lastImage = generatedImages[slide.id];
        continue; // Skip if already exists? Or should we regenerate? 
        // Usually 'Generate All' implies filling gaps or generating everything.
        // Let's assume filling gaps for now, or use the "Reset" to clear first if they want fresh start.
      }

      try {
        // If slide 1, lastImage is undefined.
        // If slide 2, lastImage is slide 1's image.
        lastImage = await handleGenerateImage(slide.id, lastImage);
      } catch (e) {
        console.error(`Stopped generation at slide ${slide.id} due to error`);
        break; // Stop if chain breaks
      }
    }
  };

  const resetApp = () => {
    setStep('input');
    setStoryData(null);
    setGeneratedImages({});
    setError(null);
  };

  return (
    <div className="app-container">
      {/* Header / Logo Area */}
      <header style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5em', marginBottom: '10px' }}>
          Instagram 漫画ジェネレーター
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          サロン集客用の漫画広告をAIで自動生成
        </p>
      </header>

      {/* Error Banner */}
      {error && (
        <div style={{
          maxWidth: '800px', margin: '0 auto 20px',
          padding: '12px', background: '#FDEDEC', color: '#C0392B',
          borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Main Content */}
      <main>
        {step === 'input' && (
          <InputForm onSubmit={handleStorySubmit} initialApiKey={apiKey} />
        )}

        {step === 'generating' && (
          <div className="glass-card" style={{
            maxWidth: '400px', margin: '40px auto', padding: '40px',
            textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center'
          }}>
            <Sparkles size={48} className="spin" style={{ color: 'var(--color-accent)' }} />
            <h2 style={{ fontSize: '1.5em' }}>ストーリー構成中...</h2>
            <p>サロンの強みを分析し、漫画のプロットを作成しています。</p>
          </div>
        )}

        {step === 'result' && storyData && (
          <ResultPreview
            story={storyData}
            images={generatedImages}
            loadingImages={loadingImages}
            onGenerateImage={handleGenerateImage}
            onGenerateAll={handleGenerateAll}
            onReset={resetApp}
          />
        )}
      </main>
    </div>
  );
}

export default App;
