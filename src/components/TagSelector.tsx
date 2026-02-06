import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import styles from './TagSelector.module.css';

interface TagSelectorProps {
    label: string;
    tags: string[];
    selectedTags: string[];
    onChange: (tags: string[]) => void;
    allowCustom?: boolean;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
    label,
    tags,
    selectedTags,
    onChange,
    allowCustom = true
}) => {
    const [customInput, setCustomInput] = useState('');

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            onChange(selectedTags.filter(t => t !== tag));
        } else {
            onChange([...selectedTags, tag]);
        }
    };

    const addCustomTag = () => {
        if (customInput.trim() && !selectedTags.includes(customInput.trim())) {
            onChange([...selectedTags, customInput.trim()]);
            setCustomInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCustomTag();
        }
    };

    return (
        <div className={styles.container}>
            <label className={styles.label}>{label}</label>
            <div className={styles.tagList}>
                {tags.map(tag => (
                    <button
                        key={tag}
                        type="button"
                        className={`${styles.tag} ${selectedTags.includes(tag) ? styles.selected : ''}`}
                        onClick={() => toggleTag(tag)}
                    >
                        {tag}
                        {selectedTags.includes(tag) && <span className={styles.check}>✓</span>}
                    </button>
                ))}
                {/* Render custom tags that are NOT in the preset list */}
                {selectedTags.filter(t => !tags.includes(t)).map(tag => (
                    <button
                        key={tag}
                        type="button"
                        className={`${styles.tag} ${styles.selected} ${styles.custom}`}
                        onClick={() => toggleTag(tag)}
                    >
                        {tag}
                        <X size={14} className={styles.removeIcon} />
                    </button>
                ))}
            </div>

            {allowCustom && (
                <div className={styles.inputGroup}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="その他の特徴を追加..."
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button type="button" className={styles.addButton} onClick={addCustomTag}>
                        <Plus size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};
