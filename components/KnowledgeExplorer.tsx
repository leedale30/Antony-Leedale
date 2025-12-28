import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getGeminiAI, Type } from '../services/geminiService';
import type { Language } from '../App';

interface Node {
    id: string;
    x: number;
    y: number;
    color: string;
    radius: number;
}

interface Link {
    source: string;
    target: string;
}

export const KnowledgeExplorer: React.FC<{ lang: Language }> = ({ lang }) => {
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Knowledge Graph Explorer",
            subtitle: "Visualize connections between concepts.",
            search: "Explore Topic",
            placeholder: "e.g. Artificial Intelligence, The Renaissance",
            loading: "Mapping Knowledge...",
            instruction: "Click a node to expand it."
        },
        zh: {
            title: "知识图谱探索器",
            subtitle: "可视化概念之间的联系。",
            search: "探索主题",
            placeholder: "例如：人工智能，文艺复兴",
            loading: "绘制知识中...",
            instruction: "点击节点以展开。"
        }
    }[lang];

    const generateGraph = useCallback(async (centerTopic: string, currentNodes: Node[]) => {
        if (!ai) return;
        setIsLoading(true);

        try {
            const prompt = `Generate a knowledge graph for "${centerTopic}".
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            Return JSON with:
            - "nodes": Array of strings (related concepts, max 6).
            - "edges": Array of pairs [source, target] showing connections.
            Make sure the center topic is included.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            nodes: { type: Type.ARRAY, items: { type: Type.STRING } },
                            edges: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
                        }
                    }
                }
            });

            const data = JSON.parse(response.text || '{}');
            if (data.nodes) {
                // Use a larger internal resolution for crisp rendering
                const canvasW = 1200;
                const canvasH = 800;
                const centerX = canvasW / 2;
                const centerY = canvasH / 2;

                const newNodes: Node[] = [...currentNodes];
                const newLinks: Link[] = [];
                const centerNode = newNodes.find(n => n.id === centerTopic) || { 
                    id: centerTopic, 
                    x: centerX, 
                    y: centerY, 
                    color: '#A855F7', 
                    radius: 35 
                };
                
                if (!newNodes.some(n => n.id === centerNode.id)) newNodes.push(centerNode);

                const angleStep = (2 * Math.PI) / data.nodes.length;
                data.nodes.forEach((label: string, i: number) => {
                    if (label === centerTopic) return;
                    // Check if node exists
                    let node = newNodes.find(n => n.id === label);
                    if (!node) {
                        const dist = 180 + Math.random() * 60;
                        node = {
                            id: label,
                            x: centerNode.x + Math.cos(angleStep * i) * dist,
                            y: centerNode.y + Math.sin(angleStep * i) * dist,
                            color: '#38BDF8',
                            radius: 25
                        };
                        newNodes.push(node);
                    }
                    newLinks.push({ source: centerTopic, target: label });
                });

                setNodes(newNodes);
                setLinks(prev => [...prev, ...newLinks]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [ai, lang]);

    const handleSearch = () => {
        setNodes([]);
        setLinks([]);
        generateGraph(topic, []);
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        
        // CRITICAL FIX: Scale mouse coordinates to match canvas internal resolution
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Simple hit test
        const clickedNode = nodes.find(n => Math.hypot(n.x - x, n.y - y) < n.radius);
        if (clickedNode) {
            generateGraph(clickedNode.id, nodes);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw Links
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 2;
            links.forEach(link => {
                const s = nodes.find(n => n.id === link.source);
                const t = nodes.find(n => n.id === link.target);
                if (s && t) {
                    ctx.beginPath();
                    ctx.moveTo(s.x, s.y);
                    ctx.lineTo(t.x, t.y);
                    ctx.stroke();
                }
            });

            // Draw Nodes
            nodes.forEach(node => {
                ctx.fillStyle = node.color;
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Text Background for readability
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                const textWidth = ctx.measureText(node.id).width;
                ctx.fillRect(node.x - textWidth/2 - 4, node.y - 8, textWidth + 8, 16);

                ctx.fillStyle = 'white';
                ctx.font = 'bold 14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(node.id, node.x, node.y);
            });
        };
        
        render();
    }, [nodes, links]);

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-12 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{t.title}</h2>
                    <p className="text-gray-400">{t.subtitle}</p>
                </div>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={t.placeholder}
                        className="bg-black/40 border border-gray-600 rounded-xl p-3 text-white focus:border-gem-blue outline-none w-64"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch} disabled={isLoading} className="bg-gem-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50">
                        {isLoading ? t.loading : t.search}
                    </button>
                </div>
            </div>

            <div className="flex-1 glass-panel rounded-2xl border border-white/10 relative overflow-hidden bg-black/50">
                <canvas 
                    ref={canvasRef} 
                    width={1200} 
                    height={800} 
                    onClick={handleCanvasClick}
                    className="w-full h-full cursor-pointer object-contain"
                />
                <div className="absolute bottom-4 left-4 text-xs text-gray-500 bg-black/60 px-2 py-1 rounded pointer-events-none">
                    {t.instruction}
                </div>
            </div>
        </div>
    );
};