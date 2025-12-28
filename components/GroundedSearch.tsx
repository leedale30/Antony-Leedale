import React, { useState, useCallback } from 'react';
import { getGeminiAI } from '../services/geminiService';
import { IconLink } from './Icons';
import type { Language } from '../App';

type SearchMode = 'web' | 'maps';

interface Source {
    uri: string;
    title: string;
}

export const GroundedSearch: React.FC<{ lang: Language }> = ({ lang }) => {
    const [mode, setMode] = useState<SearchMode>('web');
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string>('');
    const [sources, setSources] = useState<Source[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
    
    const ai = getGeminiAI();

    const t = {
        en: {
            btnWeb: "Web Search",
            btnMaps: "Maps Search",
            phWeb: "Ask about recent events...",
            phMaps: "Find places near you...",
            btnSearch: "Search",
            locWarn: "Location permission helps improve Maps search results.",
            loading: "Searching...",
            resTitle: "Result",
            srcTitle: "Sources:",
            errMsg: "An error occurred during the search."
        },
        zh: {
            btnWeb: "网页搜索",
            btnMaps: "地图搜索",
            phWeb: "询问近期事件...",
            phMaps: "查找附近地点...",
            btnSearch: "搜索",
            locWarn: "获取位置权限有助于提高地图搜索的准确性。",
            loading: "搜索中...",
            resTitle: "结果",
            srcTitle: "来源：",
            errMsg: "搜索过程中发生错误。"
        }
    }[lang];

    const fetchUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (err) => {
                    console.warn(`Geolocation error: ${err.message}`);
                    setError(lang === 'zh' ? "无法获取位置。" : "Could not get location.");
                }
            );
        }
    };

    const handleSearch = useCallback(async () => {
        if (!query || !ai) return;

        setIsLoading(true);
        setResult('');
        setSources([]);
        setError(null);

        try {
            const tools = mode === 'web' 
                ? [{googleSearch: {}}]
                : [{googleMaps: {}}];
            
            const toolConfig = (mode === 'maps' && userLocation)
                ? { toolConfig: { retrievalConfig: { latLng: userLocation } } }
                : {};

            const finalQuery = query + (lang === 'zh' ? " (Answer in Chinese)" : "");

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: finalQuery,
                config: {
                    tools: tools,
                    ...toolConfig
                },
            });

            setResult(response.text);

            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            const extractedSources: Source[] = groundingChunks.map((chunk: any) => ({
                uri: chunk.web?.uri || chunk.maps?.uri || '#',
                title: chunk.web?.title || chunk.maps?.title || 'Unknown Source',
            })).filter((s: Source) => s.uri !== '#');
            
            setSources(extractedSources);

        } catch (err) {
            console.error(err);
            setError(t.errMsg);
        } finally {
            setIsLoading(false);
        }
    }, [query, mode, userLocation, ai, lang, t.errMsg]);
    
    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex justify-center space-x-2 mb-4 bg-gem-slate p-2 rounded-xl">
                <button onClick={() => setMode('web')} className={`px-4 py-2 w-full rounded-lg ${mode === 'web' ? 'bg-gem-blue text-white' : 'hover:bg-gem-onyx'}`}>{t.btnWeb}</button>
                <button onClick={() => { setMode('maps'); fetchUserLocation(); }} className={`px-4 py-2 w-full rounded-lg ${mode === 'maps' ? 'bg-gem-blue text-white' : 'hover:bg-gem-onyx'}`}>{t.btnMaps}</button>
            </div>
            
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={mode === 'web' ? t.phWeb : t.phMaps}
                    className="flex-1 p-3 bg-gem-slate border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gem-blue"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} disabled={isLoading || !query} className="p-3 bg-gem-blue text-white rounded-lg disabled:bg-gray-500 hover:bg-gem-blue-light transition-colors">
                    {t.btnSearch}
                </button>
            </div>

            {mode === 'maps' && !userLocation && <p className="text-sm text-center text-yellow-400 mt-2">{t.locWarn}</p>}
            
            <div className="mt-6">
                {isLoading && <p className="text-center">{t.loading}</p>}
                {error && <p className="text-center text-red-400">{error}</p>}
                {result && (
                    <div className="bg-gem-slate p-4 rounded-lg">
                        <h3 className="text-xl font-semibold mb-2">{t.resTitle}</h3>
                        <p className="whitespace-pre-wrap">{result}</p>
                        {sources.length > 0 && (
                            <div className="mt-4 border-t border-gray-600 pt-4">
                                <h4 className="font-semibold">{t.srcTitle}</h4>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    {sources.map((source, index) => (
                                        <li key={index}>
                                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-gem-blue-light hover:underline flex items-center">
                                                <IconLink /> <span className="ml-2">{source.title}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};