import { useState } from 'react';
import type { StoryData } from '../types';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Sparkles, RefreshCw, Download, Package } from 'lucide-react';
import JSZip from 'jszip';
import styles from './ResultPreview.module.css';

interface ResultPreviewProps {
    story: StoryData;
    images: Record<number, string>;
    loadingImages: Record<number, boolean>;
    onGenerateImage: (slideId: number) => void;
    onGenerateAll: () => void;
    onReset: () => void;
}

export const ResultPreview: React.FC<ResultPreviewProps> = ({
    story,
    images,
    loadingImages,
    onGenerateImage,
    onGenerateAll,
    onReset
}) => {
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const activeSlide = story.slides[activeSlideIndex];

    const handleNext = () => {
        if (activeSlideIndex < story.slides.length - 1) setActiveSlideIndex(prev => prev + 1);
    };

    const handlePrev = () => {
        if (activeSlideIndex > 0) setActiveSlideIndex(prev => prev - 1);
    };

    const handleDownloadSingle = () => {
        const image = images[activeSlide.id];
        if (!image) return;

        const link = document.createElement('a');
        link.href = image;
        link.download = `slide_${activeSlide.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadAll = async () => {
        const zip = new JSZip();
        let count = 0;

        story.slides.forEach(slide => {
            const imgData = images[slide.id];
            if (imgData) {
                // Remove data:image/png;base64, prefix
                const base64Data = imgData.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
                zip.file(`slide_${slide.id}.png`, base64Data, { base64: true });
                count++;
            }
        });

        if (count === 0) {
            alert('ダウンロードする画像がありません。');
            return;
        }

        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "instagram_manga_images.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    const currentImage = images[activeSlide.id];
    const isLoading = loadingImages[activeSlide.id];

    return (
        <div className={styles.container}>
            {/* Header Info */}
            <div className={`${styles.header} glass-card`}>
                <div className={styles.targetInfo}>
                    <span className={styles.badge}>ターゲット: {story.target.persona} ({story.target.age})</span>
                    <span className={styles.badge}>悩み: {story.target.mainConcern}</span>
                </div>
                <div className={styles.actions}>
                    <button className={styles.secondaryButton} onClick={onGenerateAll}>
                        <Sparkles size={16} /> 全スライド画像生成
                    </button>
                    {Object.keys(images).length > 0 && (
                        <button className={styles.secondaryButton} onClick={handleDownloadAll} title="生成済みの画像をまとめてダウンロード">
                            <Package size={16} /> 一括ダウンロード
                        </button>
                    )}
                    <button className={styles.textButton} onClick={onReset}>
                        最初に戻る
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`${styles.main} glass-card`}>
                {/* Left: Image Preview */}
                <div className={styles.imageSection}>
                    <div className={styles.imageContainer}>
                        {currentImage ? (
                            <img src={currentImage} alt={`Slide ${activeSlide.id}`} className={styles.generatedImage} />
                        ) : (
                            <div className={styles.placeholder}>
                                {isLoading ? (
                                    <div className={styles.loader}>生成中...</div>
                                ) : (
                                    <>
                                        <ImageIcon size={48} className={styles.placeholderIcon} />
                                        <p>画像はまだ生成されていません</p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Text Overlay Preview (Simulated) */}
                        <div className={styles.overlayText}>
                            <div className={styles.speechBubble}>{activeSlide.dialogue}</div>
                        </div>
                    </div>

                    <div className={styles.imageActions}>
                        <button
                            className={styles.generateButton}
                            onClick={() => onGenerateImage(activeSlide.id)}
                            disabled={isLoading}
                        >
                            {isLoading ? <RefreshCw className={styles.spin} /> : <Sparkles />}
                            {currentImage ? '画像を再生成' : 'このスライドの画像を生成'}
                        </button>

                        {currentImage && (
                            <button
                                className={styles.downloadButton}
                                onClick={handleDownloadSingle}
                                title="この画像を保存"
                            >
                                <Download size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: Story Details */}
                <div className={styles.detailsSection}>
                    <div className={styles.slideHeader}>
                        <h3 className={styles.slideTitle}>スライド {activeSlide.id}: {activeSlide.title}</h3>
                        <span className={styles.emotionTag}>{activeSlide.emotion}</span>
                    </div>

                    <div className={styles.detailGroup}>
                        <h4>構図</h4>
                        <p>{activeSlide.composition}</p>
                    </div>

                    <div className={styles.detailGroup}>
                        <h4>シーン・キャラクター</h4>
                        <p>{activeSlide.characters}</p>
                    </div>

                    <div className={styles.detailGroup}>
                        <h4>セリフ (日本語)</h4>
                        <p className={styles.dialogueText}>「{activeSlide.dialogue}」</p>
                    </div>

                    {activeSlide.narration && (
                        <div className={styles.detailGroup}>
                            <h4>ナレーション</h4>
                            <p className={styles.narrationText}>{activeSlide.narration}</p>
                        </div>
                    )}

                    <div className={styles.detailGroup}>
                        <h4>画像プロンプト (英語)</h4>
                        <p className={styles.promptText}>{activeSlide.imagePrompt}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className={styles.navigation}>
                <button className={styles.navButton} onClick={handlePrev} disabled={activeSlideIndex === 0}>
                    <ChevronLeft /> 前へ
                </button>

                <div className={styles.thumbnails}>
                    {story.slides.map((slide, idx) => (
                        <button
                            key={slide.id}
                            className={`${styles.thumbBtn} ${idx === activeSlideIndex ? styles.activeThumb : ''}`}
                            onClick={() => setActiveSlideIndex(idx)}
                        >
                            {slide.id}
                            {images[slide.id] && <span className={styles.thumbIndicator}>•</span>}
                        </button>
                    ))}
                </div>

                <button className={styles.navButton} onClick={handleNext} disabled={activeSlideIndex === story.slides.length - 1}>
                    次へ <ChevronRight />
                </button>
            </div>
        </div>
    );
};
