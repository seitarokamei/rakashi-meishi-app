'use client';

import { useState, useRef, useCallback } from 'react';
import { OcrResult } from '@/lib/types';
import Image from 'next/image';

interface ImageOcrUploadProps {
  onOcrComplete: (result: OcrResult, file: File) => void;
  onError?: (message: string) => void;
}

export function ImageOcrUpload({ onOcrComplete, onError }: ImageOcrUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onError?.('画像ファイルを選択してください');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onError?.('ファイルサイズは10MB以下にしてください');
      return;
    }

    // プレビュー表示
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setIsProcessing(true);
    try {
      // Base64に変換してAPIへ送信
      const base64 = await fileToBase64(file);
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mediaType: file.type,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'OCR処理に失敗しました');
      }

      const result = await response.json();
      onOcrComplete(result, file);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'OCR処理に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  }, [onOcrComplete, onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
        {isProcessing ? (
          <div className="space-y-2">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-muted-foreground">Google Cloud Vision でOCR処理中...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📇</div>
            <p className="text-sm font-medium">名刺画像をドラッグ＆ドロップ</p>
            <p className="text-xs text-muted-foreground">または クリックして選択（JPG・PNG・WebP、最大10MB）</p>
          </div>
        )}
      </div>

      {preview && !isProcessing && (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border">
          <Image src={preview} alt="名刺プレビュー" fill className="object-contain" />
        </div>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // data:image/jpeg;base64, の部分を除去
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
