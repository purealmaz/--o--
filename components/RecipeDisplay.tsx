import React, { useState, useRef, useEffect } from 'react';
import { BookmarkIcon, SpeakerWaveIcon, PlayIcon, PauseIcon, DownloadIcon } from './common/Icons';
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
          return <h3 key={index} className="text-xl font-semibold mt-4 mb-2">{trimmedLine.substring(4)}</h3>;
        }
        if (trimmedLine.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-bold mt-6 mb-3">{trimmedLine.substring(3)}</h2>;
        }
        if (trimmedLine.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-extrabold mt-4 mb-4">{trimmedLine.substring(2)}</h1>;
        }
        if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
          return <li key={index} className="ml-5 list-disc">{trimmedLine.substring(2)}</li>;
        }
        if (trimmedLine === '') {
          return <br key={index} />;
        }
        return <p key={index} className="leading-relaxed">{line}</p>;
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


  const proseClasses = `prose max-w-none prose-headings:text-card-foreground prose-p:text-card-foreground/90 prose-li:text-card-foreground/90`;
  
  const actionButtonClasses = "inline-flex items-center gap-2 px-4 py-2 bg-primary-100/80 text-primary-800 font-semibold rounded-lg hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50";
  const playerButtonClasses = "p-2 text-foreground/70 hover:text-primary-700 hover:bg-primary-100 rounded-full transition-colors disabled:opacity-50";


  return (
    <div className="bg-card p-6 sm:p-8 rounded-2xl shadow-lg border border-foreground/10 animate-fade-in space-y-4">
      <div className={proseClasses}>
        {formatRecipe(recipe)}
      </div>
      <div className="pt-4 border-t border-foreground/10">
        {audioError && <p className="text-sm text-red-600 mb-2">{audioError}</p>}
        <div className="flex flex-wrap items-center justify-end gap-3">
            {audioData && (
                 <div className="flex items-center gap-2 bg-background p-1.5 rounded-full border border-foreground/10">
                     <button onClick={handlePlayPause} className={playerButtonClasses}>
                         {isPlaying ? <PauseIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6"/>}
                     </button>
                      <button onClick={handleDownload} className={playerButtonClasses}>
                         <DownloadIcon className="w-6 h-6"/>
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
              onClick={onSave}
              className={actionButtonClasses}
            >
              <BookmarkIcon className="w-5 h-5" />
              {t.saveRecipe}
            </button>
        </div>
      </div>
    </div>
  );
};