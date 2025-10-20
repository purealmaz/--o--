import React, { useState, useRef, ChangeEvent } from 'react';
import { identifyIngredientsFromImage } from '../services/geminiService';
import { Spinner } from './common/Spinner';
import { XIcon, PhotoIcon } from './common/Icons';
import { Translation, Language } from '../utils/translations';

interface ImageUploaderProps {
  onIngredientsIdentified: (ingredients: string[]) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setError: (error: string | null) => void;
  t: Translation;
  language: Language;
}

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        resolve('');
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    data: await base64EncodedDataPromise,
    mimeType: file.type,
  };
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onIngredientsIdentified, 
  isAnalyzing,
  setIsAnalyzing,
  setError,
  t,
  language
}) => {
  const [image, setImage] = useState<{ file: File; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage({
        file,
        url: URL.createObjectURL(file),
      });
      setError(null);
    }
  };

  const handleRemoveImage = () => {
    if (image) {
      URL.revokeObjectURL(image.url);
    }
    setImage(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const imageData = await fileToGenerativePart(image.file);
      if (!imageData.data) {
        throw new Error(t.imageReadError);
      }
      const ingredients = await identifyIngredientsFromImage(imageData, language);
      if (ingredients.length === 0) {
        setError(t.imageRecognitionError);
      } else {
        onIngredientsIdentified(ingredients);
        handleRemoveImage(); // Clear image after successful analysis
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t.imageAnalysisError);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {!image && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition-colors"
        >
            <PhotoIcon className="w-10 h-10 text-muted-foreground mb-2"/>
          <p className="text-foreground font-semibold text-sm">{t.uploadPhoto}</p>
          <p className="text-xs text-muted-foreground">{t.dragAndDrop}</p>
        </div>
      )}

      {image && (
        <div className="space-y-4">
          <div className="relative group w-full aspect-video rounded-lg overflow-hidden border border-border">
            <img src={image.url} alt={t.ingredientsPreview} className="w-full h-full object-cover" />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
              aria-label={t.removeImage}
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors disabled:bg-muted disabled:text-muted-foreground"
          >
            {isAnalyzing ? (
              <>
                <Spinner />
                {t.analyzing}
              </>
            ) : (
              t.identifyIngredients
            )}
          </button>
        </div>
      )}
    </div>
  );
};