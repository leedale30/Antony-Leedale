
import React, { useState, useRef, useCallback } from 'react';
import { getGeminiAI, Modality } from '../services/geminiService';
import type { Language } from '../App';
import { IconDownload, IconAudio } from './Icons';
import { decode, decodeAudioData } from '../utils/audioUtils';

type QuestionType = 'Multiple Choice' | 'Gap Fill' | 'True/False' | 'Matching';

const CURRICULUMS = [
    "Cambridge KET (A2)", "Cambridge PET (B1)", "Cambridge FCE (B2)", 
    "IELTS General", "IELTS Academic", "TOEFL iBT", 
    "IBDP English B", "A-Level English", 
    "Longman", "Shanghai Oxford (Nume)", "Jiangsu Yilin", 
    "General ESL (Beginner)", "General ESL (Intermediate)", "General ESL (Advanced)"
];

const QUESTION_TYPES: QuestionType[] = ['Multiple Choice', 'Gap Fill', 'True/False', 'Matching'];

export const ListeningSkills: React.FC<{ lang: Language }> = ({ lang }) => {
    const [curriculum, setCurriculum] = useState(CURRICULUMS[0]);
    const [level, setLevel] = useState('Grade 6');
    const [speakerCount, setSpeakerCount] = useState<'1' | '2'>('2');
    const [topic, setTopic] = useState('');
    const [length, setLength] = useState('Medium (2 mins)');
    const [selectedQTypes, setSelectedQTypes] = useState<QuestionType[]>(['Multiple Choice']);
    
    // Outputs
    const [script, setScript] = useState('');
    const [questions, setQuestions] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [activeTab, setActiveTab] = useState<'script' | 'questions'>('script');

    const audioRef = useRef<HTMLAudioElement>(null);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Listening Skills Lab",
            subtitle: "Generate exam-style listening tests with audio and papers.",
            config: "Configuration",
            curriculum: "Curriculum / Style",
            level: "Grade Level",
            speakers: "Speakers",
            topic: "Topic / Vocabulary",
            length: "Length",
            qType: "Question Types",
            generate: "Generate Exam Package",
            generating: "Creating...",
            tabs: { script: "Transcript", questions: "Question Paper" },
            downloadAudio: "Download Audio (WAV)",
            downloadPaper: "Download Paper (TXT)",
            downloadScript: "Download Script (TXT)",
            audioPlayer: "Audio Preview",
            status: {
                script: "Writing script...",
                questions: "Drafting questions...",
                audio: "Synthesizing audio (this may take a moment)...",
                done: "Ready!"
            }
        },
        zh: {
            title: "听力技能实验室",
            subtitle: "生成考试风格的听力测试，包含音频和试卷。",
            config: "配置",
            curriculum: "课程 / 风格",
            level: "年级",
            speakers: "说话人数",
            topic: "主题 / 词汇",
            length: "长度",
            qType: "题型",
            generate: "生成考试包",
            generating: "创建中...",
            tabs: { script: "听力原文", questions: "试卷" },
            downloadAudio: "下载音频 (WAV)",
            downloadPaper: "下载试卷 (TXT)",
            downloadScript: "下载原文 (TXT)",
            audioPlayer: "音频预览",
            status: {
                script: "正在编写剧本...",
                questions: "正在起草问题...",
                audio: "正在合成音频（可能需要片刻）...",
                done: "准备就绪！"
            }
        }
    }[lang];

    const handleQTypeChange = (type: QuestionType) => {
        if (selectedQTypes.includes(type)) {
            setSelectedQTypes(selectedQTypes.filter(t => t !== type));
        } else {
            setSelectedQTypes([...selectedQTypes, type]);
        }
    };

    const generateAll = useCallback(async () => {
        if (!ai || !topic) return;
        setIsLoading(true);
        setScript('');
        setQuestions('');
        setAudioUrl('');
        
        try {
            // 1. Generate Script
            setStatusMsg(t.status.script);
            const scriptPrompt = `Write a listening exam transcript.
            Curriculum Style: ${curriculum}.
            Target Level: ${level}.
            Topic: "${topic}".
            Speakers: ${speakerCount} person(s).
            Length: ${length}.
            Language: English.
            
            Structure:
            - If 2 speakers, use "Speaker A:" and "Speaker B:" prefixes clearly.
            - Ensure vocabulary fits the curriculum level.
            - Include natural pauses or hesitation if appropriate for the level.
            - Make sure the content allows for testing (dates, names, places, opinions).
            `;

            const scriptResponse = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: scriptPrompt,
            });
            const scriptText = scriptResponse.text || "Error generating script.";
            setScript(scriptText);

            // 2. Generate Questions
            setStatusMsg(t.status.questions);
            const qPrompt = `Create a question paper based on this transcript.
            
            Transcript:
            ${scriptText}
            
            Question Types to Include: ${selectedQTypes.join(', ')}.
            Format:
            - Section A: [Type 1]
            - Section B: [Type 2] etc.
            - Include an ANSWER KEY at the very bottom.
            `;

            const qResponse = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: qPrompt,
            });
            setQuestions(qResponse.text || "Error generating questions.");

            // 3. Generate Audio
            setStatusMsg(t.status.audio);
            
            // Clean script for TTS (remove "Speaker A:" for single voice if needed, but for multi-speaker api we need structure)
            // For gemini-2.5-flash-preview-tts, if 2 speakers, we use multiSpeakerVoiceConfig.
            
            let ttsConfig: any = {
                responseModalities: [Modality.AUDIO],
            };

            if (speakerCount === '2') {
                ttsConfig.speechConfig = {
                    multiSpeakerVoiceConfig: {
                        speakerVoiceConfigs: [
                            { speaker: 'Speaker A', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                            { speaker: 'Speaker B', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
                        ]
                    }
                };
            } else {
                ttsConfig.speechConfig = {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                };
            }

            // Important: For multi-speaker, the text input needs to be structured usually, 
            // but the prompt generation above ensures "Speaker A: ..." format which the model should interpret or we pass the raw script.
            // For simple single speaker, we might want to strip "Speaker:" tags, but keeping them adds context sometimes. 
            // Let's pass the raw script for now as the model is smart enough to diarize usually or read narratively.
            
            // Actually, specifically for multiSpeakerVoiceConfig, the model expects turn-based text or it assigns voices.
            // Let's prompt the script generator to use specific names if possible, but "Speaker A" matches our config.

            const audioResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: scriptText }] }],
                config: ttsConfig
            });

            const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio) {
                // Decode to Blob for player/download
                const binaryString = atob(base64Audio);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                
                // Gemini returns raw PCM usually 24kHz mono. 
                // To play in <audio> tag we need WAV container or decode via AudioContext.
                // For "Download" as file, we ideally want WAV.
                // Let's convert PCM to WAV Blob helper.
                
                const wavBlob = pcmToWav(bytes, 24000);
                const url = URL.createObjectURL(wavBlob);
                setAudioUrl(url);
            }

            setStatusMsg(t.status.done);

        } catch (error) {
            console.error(error);
            setStatusMsg("Error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, curriculum, level, topic, length, speakerCount, selectedQTypes, t]);

    // Helper to add WAV header
    const pcmToWav = (pcmData: Uint8Array, sampleRate: number) => {
        const numChannels = 1;
        const byteRate = sampleRate * numChannels * 2;
        const blockAlign = numChannels * 2;
        const wavHeader = new ArrayBuffer(44);
        const view = new DataView(wavHeader);

        const writeString = (offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + pcmData.length, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, 16, true); // Bits per sample
        writeString(36, 'data');
        view.setUint32(40, pcmData.length, true);

        return new Blob([wavHeader, pcmData], { type: 'audio/wav' });
    };

    const downloadText = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-7xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Configuration Panel */}
                <div className="w-full lg:w-1/3 glass-panel p-6 rounded-2xl border border-white/10 h-fit">
                    <h3 className="text-lg font-bold text-gem-blue mb-4 flex items-center gap-2">
                        <span className="text-xl">⚙️</span> {t.config}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.curriculum}</label>
                            <select value={curriculum} onChange={(e) => setCurriculum(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-2.5 text-white outline-none">
                                {CURRICULUMS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.level}</label>
                                <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-2.5 text-white outline-none">
                                    {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"].map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.speakers}</label>
                                <div className="flex bg-black/40 rounded-lg p-1 border border-gray-600">
                                    <button onClick={() => setSpeakerCount('1')} className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${speakerCount === '1' ? 'bg-gem-blue text-white' : 'text-gray-400'}`}>1 (Solo)</button>
                                    <button onClick={() => setSpeakerCount('2')} className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${speakerCount === '2' ? 'bg-gem-blue text-white' : 'text-gray-400'}`}>2 (Dual)</button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.topic}</label>
                            <input 
                                type="text" 
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full bg-black/40 border border-gray-600 rounded-lg p-2.5 text-white focus:border-gem-blue outline-none"
                                placeholder="e.g. Booking a flight, School hobbies..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.length}</label>
                            <select value={length} onChange={(e) => setLength(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-2.5 text-white outline-none">
                                <option>Short (30s - 1 min)</option>
                                <option>Medium (2 mins)</option>
                                <option>Long (4-5 mins)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t.qType}</label>
                            <div className="grid grid-cols-2 gap-2">
                                {QUESTION_TYPES.map(type => (
                                    <button 
                                        key={type}
                                        onClick={() => handleQTypeChange(type)}
                                        className={`px-2 py-2 rounded text-xs font-bold border transition-all text-left ${selectedQTypes.includes(type) ? 'bg-gem-blue/20 border-gem-blue text-white' : 'bg-transparent border-gray-700 text-gray-500'}`}
                                    >
                                        {selectedQTypes.includes(type) ? '✓ ' : ''}{type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={generateAll}
                            disabled={isLoading || !topic}
                            className="w-full bg-gradient-to-r from-gem-blue to-cyan-500 text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg mt-2"
                        >
                            {isLoading ? t.generating : t.generate}
                        </button>
                        {isLoading && <p className="text-center text-xs text-gem-blue animate-pulse mt-2">{statusMsg}</p>}
                    </div>
                </div>

                {/* Output Panel */}
                <div className="w-full lg:w-2/3 flex flex-col gap-6">
                    {/* Audio Player Card */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-black/40 flex flex-col md:flex-row items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-gem-blue/20 flex items-center justify-center text-gem-blue">
                            <IconAudio />
                        </div>
                        <div className="flex-1 w-full">
                            <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">{t.audioPlayer}</h4>
                            {audioUrl ? (
                                <audio ref={audioRef} controls src={audioUrl} className="w-full" />
                            ) : (
                                <div className="h-10 bg-white/5 rounded-full w-full animate-pulse"></div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <button 
                                disabled={!audioUrl}
                                onClick={() => {
                                    const a = document.createElement('a');
                                    a.href = audioUrl;
                                    a.download = `listening_test_${Date.now()}.wav`;
                                    a.click();
                                }}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-30"
                            >
                                <IconDownload /> {t.downloadAudio}
                            </button>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col min-h-[500px]">
                        <div className="flex border-b border-white/10 bg-black/20">
                            <button onClick={() => setActiveTab('script')} className={`flex-1 py-4 font-bold text-sm transition-all ${activeTab === 'script' ? 'bg-gem-blue/10 text-gem-blue border-b-2 border-gem-blue' : 'text-gray-400 hover:text-white'}`}>
                                {t.tabs.script}
                            </button>
                            <button onClick={() => setActiveTab('questions')} className={`flex-1 py-4 font-bold text-sm transition-all ${activeTab === 'questions' ? 'bg-gem-blue/10 text-gem-blue border-b-2 border-gem-blue' : 'text-gray-400 hover:text-white'}`}>
                                {t.tabs.questions}
                            </button>
                        </div>
                        
                        <div className="flex-1 p-6 relative">
                            <div className="prose prose-invert max-w-none h-full overflow-y-auto whitespace-pre-wrap">
                                {activeTab === 'script' ? (script || <span className="text-gray-600 italic">Script will appear here...</span>) : (questions || <span className="text-gray-600 italic">Questions will appear here...</span>)}
                            </div>
                            
                            <div className="absolute top-4 right-4">
                                <button 
                                    disabled={activeTab === 'script' ? !script : !questions}
                                    onClick={() => downloadText(activeTab === 'script' ? script : questions, `listening_${activeTab}_${Date.now()}.txt`)}
                                    className="bg-black/50 hover:bg-gem-blue text-white p-2 rounded-lg text-xs font-bold backdrop-blur-sm border border-white/10 transition-all flex items-center gap-2"
                                >
                                    <IconDownload /> {activeTab === 'script' ? t.downloadScript : t.downloadPaper}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
