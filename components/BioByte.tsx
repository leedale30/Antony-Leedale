import React, { useState, useCallback } from 'react';
import { getGeminiAI, Type } from '../services/geminiService';
import type { Language } from '../App';
import { IconDna, IconBeaker } from './Icons';

interface EvolutionStage {
    name: string;
    description: string;
    traits: string[];
    imageUrl?: string;
}

export const BioByte: React.FC<{ lang: Language }> = ({ lang }) => {
    // Game State
    const [dnaPoints, setDnaPoints] = useState(0);
    const [stage, setStage] = useState<EvolutionStage>({
        name: "Primordial Blob",
        description: "A simple single-celled organism floating in the ancient soup.",
        traits: ["Microscopic"],
        imageUrl: "" // Will generate initially
    });
    
    // Quiz State
    const [question, setQuestion] = useState<{q: string, options: string[], answer: number} | null>(null);
    const [quizResult, setQuizResult] = useState('');
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
    
    // Evolution State
    const [traitInput, setTraitInput] = useState('');
    const [isEvolving, setIsEvolving] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "BioByte: Evolution Lab",
            subtitle: "Evolve your creature by mastering biology knowledge.",
            points: "DNA Points",
            evolveBtn: "Evolve Creature (Cost: 100 DNA)",
            quizBtn: "Research (Earn DNA)",
            traitLabel: "Desired Trait (e.g. Wings, Bioluminescence)",
            currentForm: "Current Organism",
            loadingQuiz: "Analyzing DNA sequences...",
            loadingEvo: "Mutating...",
            correct: "Correct! +50 DNA",
            wrong: "Mutation Failed. Try again."
        },
        zh: {
            title: "BioByte: 进化实验室",
            subtitle: "通过掌握生物学知识来进化你的生物。",
            points: "DNA 点数",
            evolveBtn: "进化生物 (消耗: 100 DNA)",
            quizBtn: "研究 (赚取 DNA)",
            traitLabel: "期望特征 (例如：翅膀，生物发光)",
            currentForm: "当前生物",
            loadingQuiz: "正在分析 DNA 序列...",
            loadingEvo: "正在变异...",
            correct: "正确！+50 DNA",
            wrong: "突变失败。请重试。"
        }
    }[lang];

    const generateImage = useCallback(async (currentStage: EvolutionStage) => {
        if (!ai) return;
        try {
            const prompt = `Pixel art style. A biology evolution game sprite. 
            Organism Name: ${currentStage.name}.
            Traits: ${currentStage.traits.join(', ')}.
            Description: ${currentStage.description}.
            White background. Center the creature.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: { parts: [{ text: prompt }] },
                config: { imageConfig: { aspectRatio: "1:1", imageSize: "1K" } }
            });

            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part && part.inlineData) {
                setStage(prev => ({...prev, imageUrl: `data:image/png;base64,${part.inlineData.data}`}));
            }
        } catch (e) {
            console.error("Image gen failed", e);
        }
    }, [ai]);

    // Initial image generation if empty
    React.useEffect(() => {
        if (!stage.imageUrl) generateImage(stage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const generateQuiz = async () => {
        if (!ai) return;
        setIsLoadingQuiz(true);
        setQuestion(null);
        setQuizResult('');

        try {
            const prompt = `Generate a multiple choice biology question.
            Difficulty: Adaptive based on current points (${dnaPoints}).
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            Format: JSON object { "q": string, "options": [string, string, string, string], "answer": number (index 0-3) }.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });

            if (response.text) {
                setQuestion(JSON.parse(response.text));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingQuiz(false);
        }
    };

    const handleAnswer = (index: number) => {
        if (!question) return;
        if (index === question.answer) {
            setDnaPoints(p => p + 50);
            setQuizResult(t.correct);
            setTimeout(() => {
                setQuestion(null);
                setQuizResult('');
            }, 1500);
        } else {
            setQuizResult(t.wrong);
        }
    };

    const evolveCreature = async () => {
        if (!ai || dnaPoints < 100 || !traitInput) return;
        setIsEvolving(true);
        setDnaPoints(p => p - 100);

        try {
            const newTraits = [...stage.traits, traitInput];
            
            const prompt = `Evolve this organism based on the new trait: "${traitInput}".
            Previous Name: ${stage.name}.
            Previous Traits: ${stage.traits.join(', ')}.
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            
            Return JSON: { "name": "New Creative Name", "description": "Short biological description of how it adapted." }`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });

            if (response.text) {
                const data = JSON.parse(response.text);
                const newStage = {
                    name: data.name,
                    description: data.description,
                    traits: newTraits,
                    imageUrl: '' // Clear image to trigger regeneration
                };
                setStage(newStage);
                await generateImage(newStage);
            }
            setTraitInput('');
        } catch (e) {
            console.error(e);
            setDnaPoints(p => p + 100); // Refund on error
        } finally {
            setIsEvolving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-12 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <span className="text-green-400"><IconDna /></span> {t.title}
                    </h2>
                    <p className="text-gray-400 text-sm">{t.subtitle}</p>
                </div>
                <div className="bg-green-900/40 px-6 py-2 rounded-xl border border-green-500/50 flex items-center gap-2">
                    <IconDna />
                    <span className="text-2xl font-mono font-bold text-green-400">{dnaPoints}</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
                {/* Left: Creature Tank */}
                <div className="flex-1 glass-panel rounded-3xl p-8 border border-green-500/20 bg-black/40 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/microbial-mat.png')] opacity-10 pointer-events-none"></div>
                    
                    {stage.imageUrl ? (
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-green-500/20 blur-3xl rounded-full animate-pulse"></div>
                            <img 
                                src={stage.imageUrl} 
                                alt={stage.name} 
                                className="w-64 h-64 md:w-80 md:h-80 object-contain pixelated relative z-10 drop-shadow-2xl animate-float" 
                            />
                        </div>
                    ) : (
                        <div className="w-64 h-64 flex items-center justify-center">
                            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    <div className="mt-8 text-center z-10">
                        <h3 className="text-3xl font-black text-white mb-2">{stage.name}</h3>
                        <p className="text-green-200/70 italic max-w-md mx-auto mb-4">{stage.description}</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {stage.traits.map((trait, i) => (
                                <span key={i} className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-300 uppercase tracking-wider font-bold">
                                    {trait}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Lab Controls */}
                <div className="w-full lg:w-96 flex flex-col gap-6">
                    {/* Evolution Control */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Evolution Chamber</h4>
                        <input 
                            type="text" 
                            value={traitInput}
                            onChange={(e) => setTraitInput(e.target.value)}
                            placeholder={t.traitLabel}
                            className="w-full bg-black/40 border border-green-500/30 rounded-xl p-3 text-white focus:border-green-400 outline-none mb-4"
                        />
                        <button 
                            onClick={evolveCreature}
                            disabled={isEvolving || dnaPoints < 100 || !traitInput}
                            className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                                dnaPoints >= 100 
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:scale-105 shadow-lg shadow-green-900/50' 
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {isEvolving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></div>
                                    {t.loadingEvo}
                                </>
                            ) : t.evolveBtn}
                        </button>
                    </div>

                    {/* Research / Quiz Area */}
                    <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Research Lab</h4>
                        
                        {!question && !isLoadingQuiz && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <IconBeaker />
                                <p className="text-gray-500 my-4 text-sm">Analyze genetic data to earn DNA.</p>
                                <button 
                                    onClick={generateQuiz}
                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/10"
                                >
                                    {t.quizBtn}
                                </button>
                                {quizResult && <p className={`mt-4 font-bold ${quizResult.includes('Correct') ? 'text-green-400' : 'text-red-400'}`}>{quizResult}</p>}
                            </div>
                        )}

                        {isLoadingQuiz && (
                            <div className="flex-1 flex items-center justify-center text-green-400 animate-pulse">
                                {t.loadingQuiz}
                            </div>
                        )}

                        {question && (
                            <div className="flex-1 flex flex-col animate-fade-in">
                                <p className="text-lg font-bold text-white mb-6 leading-relaxed">{question.q}</p>
                                <div className="space-y-3">
                                    {question.options.map((opt, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => handleAnswer(i)}
                                            className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-green-500/20 border border-white/10 hover:border-green-500/50 transition-all text-sm text-gray-200"
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};