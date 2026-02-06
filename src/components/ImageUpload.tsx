import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
    label: string;
    image: string | undefined;
    onChange: (base64: string | undefined) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ label, image, onChange }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onChange(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const clearImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(undefined);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className={styles.container}>
            <label className={styles.label}>{label}</label>
            <div
                className={`${styles.uploadArea} ${dragActive ? styles.active : ''} ${image ? styles.hasImage : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={inputRef}
                    className={styles.input}
                    accept="image/*"
                    onChange={handleChange}
                />

                {image ? (
                    <div className={styles.previewContainer}>
                        <img src={image} alt="Preview" className={styles.preview} />
                        <button type="button" className={styles.clearButton} onClick={clearImage}>
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className={styles.placeholder}>
                        <Upload size={24} className={styles.icon} />
                        <span>Click or Drag Image</span>
                    </div>
                )}
            </div>
        </div>
    );
};
