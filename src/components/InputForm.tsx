import React, { useState, useEffect } from 'react';
import type { SalonInfo } from '../types';
import { TagSelector } from './TagSelector';
import { ImageUpload } from './ImageUpload';
import { Sparkles, Key } from 'lucide-react';
import styles from './InputForm.module.css';

interface InputFormProps {
    onSubmit: (data: SalonInfo, apiKey: string) => void;
    initialApiKey?: string;
}

const STRENGTH_TAGS = [
    '髪質改善', 'ハイライトカラー', '縮毛矯正', 'トリートメント',
    'カット技術', 'インナーカラー', 'ヘッドスパ', '白髪染め'
];

const FEATURE_TAGS = [
    '駅近', '個室あり', 'キッズスペース', '深夜営業',
    '完全予約制', 'マンツーマン施術', '駐車場完備', 'オーガニック使用'
];

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, initialApiKey = '' }) => {
    const [apiKey, setApiKey] = useState(initialApiKey);
    const [salonName, setSalonName] = useState('');
    const [strengths, setStrengths] = useState<string[]>([]);
    const [features, setFeatures] = useState<string[]>([]);
    const [staffImage, setStaffImage] = useState<string | undefined>(undefined);
    const [salonImage, setSalonImage] = useState<string | undefined>(undefined);

    useEffect(() => {
        // Load from localStorage if available and not passed via props
        const storedKey = localStorage.getItem('gemini_api_key');
        if (storedKey && !initialApiKey) setApiKey(storedKey);
    }, [initialApiKey]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiKey || !salonName || strengths.length === 0) {
            alert('必須項目（APIキー、サロン名、強み）を入力してください。');
            return;
        }

        // Save API key
        localStorage.setItem('gemini_api_key', apiKey);

        onSubmit({
            name: salonName,
            strengths,
            features,
            staffImage,
            salonImage
        }, apiKey);
    };

    return (
        <form className={`${styles.form} glass-card`} onSubmit={handleSubmit}>
            <h2 className={styles.title}>
                <Sparkles className={styles.titleIcon} />
                ジェネレーター設定
            </h2>

            <div className={styles.section}>
                <label className={styles.label}>
                    <Key size={16} /> Google API Key
                    <span className={styles.required}>*</span>
                </label>
                <input
                    type="password"
                    className={styles.input}
                    placeholder="Gemini APIキーを入力"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />
                <p className={styles.help}>
                    キーはブラウザに保存されます。<a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Google AI Studio</a> で取得してください。
                </p>
            </div>

            <div className={styles.section}>
                <label className={styles.label}>
                    サロン名
                    <span className={styles.required}>*</span>
                </label>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="例: Hair Salon MIYABI"
                    value={salonName}
                    onChange={(e) => setSalonName(e.target.value)}
                />
            </div>

            <div className={styles.row}>
                <ImageUpload
                    label="スタッフ画像 (任意)"
                    image={staffImage}
                    onChange={setStaffImage}
                />
                <ImageUpload
                    label="サロン画像 (任意)"
                    image={salonImage}
                    onChange={setSalonImage}
                />
            </div>

            <TagSelector
                label="サロンの強み (少なくとも1つ選択)"
                tags={STRENGTH_TAGS}
                selectedTags={strengths}
                onChange={setStrengths}
            />

            <TagSelector
                label="その他の特徴"
                tags={FEATURE_TAGS}
                selectedTags={features}
                onChange={setFeatures}
            />

            <button type="submit" className={styles.submitButton}>
                <Sparkles size={18} />
                ストーリー生成
            </button>
        </form>
    );
};
