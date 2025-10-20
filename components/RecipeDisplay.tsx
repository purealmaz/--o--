import React, { useState, useRef, useEffect } from 'react';
import { BookmarkIcon, SpeakerWaveIcon, PlayIcon, PauseIcon, DownloadIcon, ShareIcon } from './common/Icons';
import { Spinner } from './common/Spinner';
import { generateSpeechFromText } from '../services/geminiService';
import { decode, decodeAudioData, createWavBlob } from '../utils/audioUtils';
import { Translation, Language } from '../utils/translations';


const AUDIO_SAMPLE_RATE = 24000;
const AUDIO_CHANNELS = 1;

interface RecipeDisplayProps {
  recipe: string;
  onSave: () => void;
  t: Translation;
  language: Language;
}

export const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, onSave, t, language }) => {
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioData, setAudioData] = useState<{ base64: string; buffer: AudioBuffer; } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Clean up audio resources on component unmount or recipe change
  useEffect(() => {
    return () => {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [recipe]);

  if (!recipe) {
    return null;
  }

  const formatRecipe = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('### ')) {
          return <h3 key={index}>{trimmedLine.substring(4)}</h3>;
        }
        if (trimmedLine.startsWith('## ')) {
          return <h2 key={index}>{trimmedLine.substring(3)}</h2>;
        }
        if (trimmedLine.startsWith('# ')) {
          return <h1 key={index}>{trimmedLine.substring(2)}</h1>;
        }
        if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
          return <li key={index}>{trimmedLine.substring(2)}</li>;
        }
        if (trimmedLine === '') {
          return <br key={index} />;
        }
        return <p key={index}>{line}</p>;
      });
  };

  const handleReadAloud = async () => {
    setIsGeneratingAudio(true);
    setAudioError(null);
    setAudioData(null);
    setIsPlaying(false);

    try {
      const base64Audio = await generateSpeechFromText(recipe, language);
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
         audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: AUDIO_SAMPLE_RATE });
      }
      const pcmData = decode(base64Audio);
      const buffer = await decodeAudioData(pcmData, audioContextRef.current, AUDIO_SAMPLE_RATE, AUDIO_CHANNELS);
      setAudioData({ base64: base64Audio, buffer });
    } catch (err) {
      if (err instanceof Error) {
        setAudioError(err.message);
      } else {
        setAudioError(t.audioGenerationError);
      }
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioContextRef.current || !audioData) return;

    if (isPlaying) {
      audioSourceRef.current?.stop();
      setIsPlaying(false);
    } else {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioData.buffer;
      source.connect(audioContextRef.current.destination);
      source.start();
      source.onended = () => {
        setIsPlaying(false);
      };
      audioSourceRef.current = source;
      setIsPlaying(true);
    }
  };
  
  const extractTitle = (recipeText: string): string => {
    const lines = recipeText.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('# ')) {
        return trimmedLine.substring(2).replace(/[*_]/g, '').replace(/[^a-z0-9а-яё]/gi, '_').toLowerCase();
      }
      if(trimmedLine) return trimmedLine.replace(/[*_]/g, '').replace(/[^a-z0-9а-яё]/gi, '_').toLowerCase();
    }
    return "recipe";
  };
  
  const getShareTitle = (recipeText: string): string => {
    const lines = recipeText.split('\n');
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('# ')) {
            return trimmedLine.substring(2).replace(/[*_]/g, '');
        }
        if(trimmedLine) return trimmedLine.replace(/[*_]/g, '');
    }
    return t.untitledRecipe;
  };


  const handleDownload = () => {
    if (!audioData) return;
    const pcmData = decode(audioData.base64);
    const blob = createWavBlob(pcmData, AUDIO_SAMPLE_RATE, AUDIO_CHANNELS);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${extractTitle(recipe)}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const title = getShareTitle(recipe);
    const textToShare = recipe;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: textToShare,
        });
      } catch (error) {
        console.error('Error sharing recipe:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(textToShare);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      } catch (err) {
        console.error('Failed to copy recipe to clipboard:', err);
        alert('Failed to copy recipe.');
      }
    }
  };


  const proseClasses = `prose dark:prose-invert max-w-none prose-h1:font-black prose-h1:text-3xl prose-h2:font-bold prose-h2:text-2xl prose-h3:font-semibold prose-h3:text-xl prose-headings:text-card-foreground prose-p:text-card-foreground/90 prose-li:text-card-foreground/90 prose-li:my-1 prose-ul:list-disc prose-ol:list-decimal prose-strong:text-card-foreground`;
  
  const actionButtonClasses = "inline-flex items-center justify-center gap-2 px-4 py-2 bg-muted text-muted-foreground font-semibold rounded-md hover:bg-border hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors disabled:opacity-50";
  const playerButtonClasses = "p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors disabled:opacity-50";


  return (
    <div className="bg-card p-6 sm:p-8 rounded-lg shadow-lg border border-border animate-fade-in space-y-4">
      <article className={proseClasses}>
        {formatRecipe(recipe)}
      </article>
      <div className="pt-4 border-t border-border">
        {audioError && <p className="text-sm text-red-500 mb-2">{audioError}</p>}
        <div className="flex flex-wrap items-center justify-end gap-2">
            {audioData && (
                 <div className="flex items-center gap-1 bg-muted p-1 rounded-full border border-border mr-auto">
                     <button onClick={handlePlayPause} className={playerButtonClasses}>
                         {isPlaying ? <PauseIcon className="w-5 h-5"/> : <PlayIcon className="w-5 h-5"/>}
                     </button>
                      <button onClick={handleDownload} className={playerButtonClasses}>
                         <DownloadIcon className="w-5 h-5"/>
                     </button>
                 </div>
            )}
             <button
              onClick={handleReadAloud}
              className={actionButtonClasses}
              disabled={isGeneratingAudio}
            >
              {isGeneratingAudio ? <> <Spinner/> {t.voicing}... </> : <><SpeakerWaveIcon className="w-5 h-5" /> {t.readAloud}</>}
            </button>
            <button
              onClick={handleShare}
              className={actionButtonClasses}
              disabled={copySuccess}
            >
              {copySuccess ? (
                <>{t.copiedToClipboard}</>
              ) : (
                <><ShareIcon className="w-5 h-5" /> {t.shareRecipe}</>
              )}
            </button>
            <button
              onClick={onSave}
              className={`${actionButtonClasses} bg-primary/10 text-primary hover:bg-primary/20`}
            >
              <BookmarkIcon className="w-5 h-5" />
              {t.saveRecipe}
            </button>
        </div>
      </div>
    </div>
  );
};