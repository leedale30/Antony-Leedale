
import React, { useState, useEffect } from 'react';
import { TabButton } from './components/TabButton';
import { LandingPage } from './components/LandingPage';
import { ThreeBackground } from './components/ThreeBackground';
import { GlobalChatAssistant } from './components/GlobalChatAssistant';

// Tool Components
import { ChatBot } from './components/ChatBot';
import { AiTraining } from './components/AiTraining';
import { SmartManager } from './components/SmartManager';
import { WorksheetWizard } from './components/WorksheetWizard';
import { ListeningSkills } from './components/ListeningSkills';
import { QuizMaker } from './components/QuizMaker';
import { StudyGuideGenerator } from './components/StudyGuideGenerator';
import { RubricGenerator } from './components/RubricGenerator';
import { PblArchitect } from './components/PblArchitect';
import { ZpdGuide } from './components/ZpdGuide';
import { AssessmentTools } from './components/AssessmentTools';
import { DifferentiationTool } from './components/DifferentiationTool';
import { SelHub } from './components/SelHub';
import { StudentWellbeing } from './components/StudentWellbeing';
import { LiteracyStation } from './components/LiteracyStation';
import { StemSolver } from './components/StemSolver';
import { MathGlossaryGenerator } from './components/MathGlossaryGenerator';
import { ExperimentDesigner } from './components/ExperimentDesigner';
import { PhysicsSimulations } from './components/PhysicsSimulations';
import { CsVoyager } from './components/CsVoyager';
import { DebateCoach } from './components/DebateCoach';
import { CareerConnector } from './components/CareerConnector';
import { FlashcardGenerator } from './components/FlashcardGenerator';
import { EscapeRoomBuilder } from './components/EscapeRoomBuilder';
import { MagicConverter } from './components/MagicConverter';
import { PresentationMaker } from './components/PresentationMaker';
import { InfographicMaker } from './components/InfographicMaker';
import { ColoringPageMaker } from './components/ColoringPageMaker';
import { ImageTools } from './components/ImageTools';
import { VideoTools } from './components/VideoTools';
import { VideoLessonPlanner } from './components/VideoLessonPlanner';
import { ClassroomDj } from './components/ClassroomDj';
import { CourseMarket } from './components/CourseMarket';
import { SuisColab } from './components/SuisColab';
import { GlobalTranslator } from './components/GlobalTranslator';
import { AudioTools } from './components/AudioTools';
import { PhonicsLab } from './components/PhonicsLab';
import { GeoDiscovery } from './components/GeoDiscovery';
import { BioByte } from './components/BioByte';
import { GroundedSearch } from './components/GroundedSearch';
import { KnowledgeExplorer } from './components/KnowledgeExplorer';
import { StaffRoom } from './components/StaffRoom';
import { SmartWhiteboard } from './components/SmartWhiteboard';
import { ClassroomToolkit } from './components/ClassroomToolkit';
import { GamifiedQuiz } from './components/GamifiedQuiz';
import { GameIdeaGenerator } from './components/GameIdeaGenerator';
import { MusicTheoryBear } from './components/MusicTheoryBear';
import { TomChat } from './components/TomChat';

// Icons
import { 
    IconChat, IconCertificate, IconClipboard, IconDocument, IconEar, IconBrain, 
    IconNotebook, IconTable, IconBlueprint, IconLadder, IconCheck, IconLayers, 
    IconHeart, IconSun, IconBook, IconCalculator, IconPi, IconBeaker, IconAtom, 
    IconCode, IconScale, IconBriefcase, IconCards, IconKey, IconMagic, 
    IconPresentation, IconChart, IconPalette, IconImage, IconVideo, IconFilm, 
    IconHeadphones, IconAcademic, IconGroup, IconTranslate, IconAudio, IconWave, 
    IconGlobe, IconDna, IconSearch, IconNetwork, IconCoffee, IconBoard, IconTools, 
    IconSword, IconGame, IconMusic, IconRobot 
} from './components/Icons';

export type Language = 'en' | 'zh';
export type Theme = 'dark' | 'light';
export type Tab = 
    | 'plan' | 'training' | 'ems' | 'worksheet' | 'listening' | 'quizmaker' 
    | 'study' | 'rubric' | 'pbl' | 'zpd' | 'assess' | 'diff' | 'sel' | 'wellbeing' 
    | 'literacy' | 'stem' | 'mathGlossary' | 'lab' | 'physics' | 'cs' | 'debate' 
    | 'career' | 'flashcards' | 'escape' | 'convert' | 'presentation' | 'infographic' 
    | 'coloring' | 'visuals' | 'video' | 'videoPlan' | 'dj' | 'market' | 'colab' 
    | 'translate' | 'tutor' | 'phonics' | 'geo' | 'bio' | 'research' | 'graph' 
    | 'staff' | 'board' | 'toolkit' | 'quizgame' | 'gamify' | 'music' | 'tom';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('plan');
    const [lang, setLang] = useState<Language>('en');
    const [theme, setTheme] = useState<Theme>('dark');
    const [showLanding, setShowLanding] = useState(true);
    const [showDragon, setShowDragon] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar state

    const toggleLang = () => setLang(prev => prev === 'en' ? 'zh' : 'en');
    
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        if (newTheme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
    };

    const handleTabClick = (tab: Tab) => {
        setActiveTab(tab);
        setSidebarOpen(false); // Close sidebar on mobile after selection
    };

    const t = {
        en: {
            core: "Core",
            media: "Media",
            global: "Global",
            tools: "Tools",
            tabs: {
                assistant: "Smart Assistant",
                training: "AI Academy",
                ems: "Class Manager",
                worksheet: "Worksheets",
                listening: "Listening Lab",
                quizmaker: "Quiz Maker",
                study: "Study Guides",
                rubric: "Rubrics",
                pbl: "PBL Architect",
                zpd: "ZPD Scaffolding",
                assess: "Grading",
                diff: "Differentiation",
                sel: "SEL Hub",
                wellbeing: "Wellbeing",
                literacy: "Literacy",
                stem: "STEM Solver",
                mathGlossary: "Math Glossary",
                lab: "Lab Designer",
                physics: "Physics Sim",
                cs: "CS Voyager",
                debate: "Debate Coach",
                career: "Career Connect",
                flashcards: "Flashcards",
                escape: "Escape Room",
                convert: "Magic Converter",
                presentation: "Slides Maker",
                infographic: "Infographics",
                coloring: "Coloring Pages",
                visuals: "Visual Tools",
                shorts: "Veo Studio",
                videoPlan: "Video Planner",
                dj: "Classroom DJ",
                market: "Course Market",
                colab: "Colab Hub",
                comm: "Translator",
                tutor: "Audio Tutor",
                phonics: "Phonics Lab",
                geo: "Geo Discovery",
                bio: "BioByte",
                fact: "Deep Search",
                graph: "Knowledge Graph",
                staff: "Staff Room",
                board: "Whiteboard",
                toolkit: "Toolkit",
                quizgame: "Pixel Quest",
                gamify: "Game Ideas",
                music: "Music Bear",
                tom: "T.O.M."
            }
        },
        zh: {
            core: "核心",
            media: "媒体",
            global: "全球",
            tools: "工具",
            tabs: {
                assistant: "智能助手",
                training: "AI 学院",
                ems: "班级管理",
                worksheet: "作业生成",
                listening: "听力实验室",
                quizmaker: "测验制作",
                study: "学习指南",
                rubric: "评分标准",
                pbl: "PBL 架构",
                zpd: "ZPD 脚手架",
                assess: "智能评分",
                diff: "差异化教学",
                sel: "SEL 中心",
                wellbeing: "身心健康",
                literacy: "识字加油站",
                stem: "STEM 求解",
                mathGlossary: "数学词汇",
                lab: "实验设计",
                physics: "物理模拟",
                cs: "CS 探索",
                debate: "辩论教练",
                career: "职业连接",
                flashcards: "闪卡生成",
                escape: "密室逃脱",
                convert: "魔法转换",
                presentation: "幻灯片制作",
                infographic: "信息图",
                coloring: "填色页",
                visuals: "视觉工具",
                shorts: "Veo 演播室",
                videoPlan: "视频教案",
                dj: "课堂 DJ",
                market: "课程市场",
                colab: "协作中心",
                comm: "翻译助手",
                tutor: "语音导师",
                phonics: "自然拼读",
                geo: "地理发现",
                bio: "生物进化",
                fact: "深度搜索",
                graph: "知识图谱",
                staff: "休息室",
                board: "白板",
                toolkit: "工具箱",
                quizgame: "像素冒险",
                gamify: "游戏创意",
                music: "乐理小熊",
                tom: "T.O.M."
            }
        }
    }[lang];

    const renderContent = () => {
        switch (activeTab) {
            case 'plan': return <ChatBot lang={lang} onNavigate={setActiveTab} />;
            case 'training': return <AiTraining lang={lang} />;
            case 'ems': return <SmartManager lang={lang} />;
            case 'worksheet': return <WorksheetWizard lang={lang} />;
            case 'listening': return <ListeningSkills lang={lang} />;
            case 'quizmaker': return <QuizMaker lang={lang} />;
            case 'study': return <StudyGuideGenerator lang={lang} />;
            case 'rubric': return <RubricGenerator lang={lang} />;
            case 'pbl': return <PblArchitect lang={lang} />;
            case 'zpd': return <ZpdGuide lang={lang} />;
            case 'assess': return <AssessmentTools lang={lang} />;
            case 'diff': return <DifferentiationTool lang={lang} />;
            case 'sel': return <SelHub lang={lang} />;
            case 'wellbeing': return <StudentWellbeing lang={lang} />;
            case 'literacy': return <LiteracyStation lang={lang} />;
            case 'stem': return <StemSolver lang={lang} />;
            case 'mathGlossary': return <MathGlossaryGenerator lang={lang} />;
            case 'lab': return <ExperimentDesigner lang={lang} />;
            case 'physics': return <PhysicsSimulations lang={lang} />;
            case 'cs': return <CsVoyager lang={lang} />;
            case 'debate': return <DebateCoach lang={lang} />;
            case 'career': return <CareerConnector lang={lang} />;
            case 'flashcards': return <FlashcardGenerator lang={lang} />;
            case 'escape': return <EscapeRoomBuilder lang={lang} />;
            case 'convert': return <MagicConverter lang={lang} />;
            case 'presentation': return <PresentationMaker lang={lang} />;
            case 'infographic': return <InfographicMaker lang={lang} />;
            case 'coloring': return <ColoringPageMaker lang={lang} />;
            case 'visuals': return <ImageTools lang={lang} />;
            case 'video': return <VideoTools lang={lang} />;
            case 'videoPlan': return <VideoLessonPlanner lang={lang} />;
            case 'dj': return <ClassroomDj lang={lang} />;
            case 'market': return <CourseMarket lang={lang} />;
            case 'colab': return <SuisColab lang={lang} />;
            case 'translate': return <GlobalTranslator lang={lang} />;
            case 'tutor': return <AudioTools lang={lang} />;
            case 'phonics': return <PhonicsLab lang={lang} />;
            case 'geo': return <GeoDiscovery lang={lang} />;
            case 'bio': return <BioByte lang={lang} />;
            case 'research': return <GroundedSearch lang={lang} />;
            case 'graph': return <KnowledgeExplorer lang={lang} />;
            case 'staff': return <StaffRoom lang={lang} />;
            case 'board': return <SmartWhiteboard lang={lang} />;
            case 'toolkit': return <ClassroomToolkit lang={lang} />;
            case 'quizgame': return <GamifiedQuiz lang={lang} />;
            case 'gamify': return <GameIdeaGenerator lang={lang} />;
            case 'music': return <MusicTheoryBear lang={lang} />;
            case 'tom': return <TomChat lang={lang} />;
            default: return <ChatBot lang={lang} onNavigate={setActiveTab} />;
        }
    };

    return (
        <div className="flex h-screen bg-black text-gray-100 font-sans overflow-hidden relative transition-colors duration-500">
            <ThreeBackground showDragon={showDragon} theme={theme} />
            
            {showLanding ? (
                <LandingPage onEnter={() => setShowLanding(false)} lang={lang} toggleLang={toggleLang} />
            ) : (
                <>
                    <GlobalChatAssistant />

                    {/* Sidebar - Desktop: Static, Mobile: Off-canvas */}
                    <div className={`
                        fixed inset-y-0 left-0 z-40 w-64 bg-black/80 backdrop-blur-xl border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}>
                        <div className="p-4 flex items-center justify-between border-b border-white/10 h-20">
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-gem-blue to-gem-purple text-transparent bg-clip-text">SUIS 智协</h1>
                                <p className="text-[10px] text-gray-400 tracking-widest">SMART HUB</p>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
                            <div className="flex flex-col space-y-1 w-full px-2">
                                <div className="text-[9px] uppercase text-gray-500 font-bold mt-2 mb-1 tracking-[0.15em] pl-4">{t.core}</div>
                                <TabButton label={t.tabs.assistant} isActive={activeTab === 'plan'} onClick={() => handleTabClick('plan')} icon={<IconChat />} />
                                <TabButton label={t.tabs.training} isActive={activeTab === 'training'} onClick={() => handleTabClick('training')} icon={<IconCertificate />} />
                                <TabButton label={t.tabs.ems} isActive={activeTab === 'ems'} onClick={() => handleTabClick('ems')} icon={<IconClipboard />} />
                                <TabButton label={t.tabs.worksheet} isActive={activeTab === 'worksheet'} onClick={() => handleTabClick('worksheet')} icon={<IconDocument />} />
                                <TabButton label={t.tabs.listening} isActive={activeTab === 'listening'} onClick={() => handleTabClick('listening')} icon={<IconEar />} />
                                <TabButton label={t.tabs.quizmaker} isActive={activeTab === 'quizmaker'} onClick={() => handleTabClick('quizmaker')} icon={<IconBrain />} />
                                <TabButton label={t.tabs.study} isActive={activeTab === 'study'} onClick={() => handleTabClick('study')} icon={<IconNotebook />} />
                                <TabButton label={t.tabs.rubric} isActive={activeTab === 'rubric'} onClick={() => handleTabClick('rubric')} icon={<IconTable />} />
                                <TabButton label={t.tabs.pbl} isActive={activeTab === 'pbl'} onClick={() => handleTabClick('pbl')} icon={<IconBlueprint />} />
                                <TabButton label={t.tabs.zpd} isActive={activeTab === 'zpd'} onClick={() => handleTabClick('zpd')} icon={<IconLadder />} />
                                <TabButton label={t.tabs.assess} isActive={activeTab === 'assess'} onClick={() => handleTabClick('assess')} icon={<IconCheck />} />
                                <TabButton label={t.tabs.diff} isActive={activeTab === 'diff'} onClick={() => handleTabClick('diff')} icon={<IconLayers />} />
                                <TabButton label={t.tabs.sel} isActive={activeTab === 'sel'} onClick={() => handleTabClick('sel')} icon={<IconHeart />} />
                                <TabButton label={t.tabs.wellbeing} isActive={activeTab === 'wellbeing'} onClick={() => handleTabClick('wellbeing')} icon={<IconSun />} />
                                <TabButton label={t.tabs.literacy} isActive={activeTab === 'literacy'} onClick={() => handleTabClick('literacy')} icon={<IconBook />} />
                                <TabButton label={t.tabs.stem} isActive={activeTab === 'stem'} onClick={() => handleTabClick('stem')} icon={<IconCalculator />} />
                                <TabButton label={t.tabs.mathGlossary} isActive={activeTab === 'mathGlossary'} onClick={() => handleTabClick('mathGlossary')} icon={<IconPi />} />
                                <TabButton label={t.tabs.lab} isActive={activeTab === 'lab'} onClick={() => handleTabClick('lab')} icon={<IconBeaker />} />
                                <TabButton label={t.tabs.physics} isActive={activeTab === 'physics'} onClick={() => handleTabClick('physics')} icon={<IconAtom />} />
                                <TabButton label={t.tabs.cs} isActive={activeTab === 'cs'} onClick={() => handleTabClick('cs')} icon={<IconCode />} />
                                <TabButton label={t.tabs.debate} isActive={activeTab === 'debate'} onClick={() => handleTabClick('debate')} icon={<IconScale />} />
                                <TabButton label={t.tabs.career} isActive={activeTab === 'career'} onClick={() => handleTabClick('career')} icon={<IconBriefcase />} />
                                <TabButton label={t.tabs.flashcards} isActive={activeTab === 'flashcards'} onClick={() => handleTabClick('flashcards')} icon={<IconCards />} />
                                <TabButton label={t.tabs.escape} isActive={activeTab === 'escape'} onClick={() => handleTabClick('escape')} icon={<IconKey />} />
                                <TabButton label={t.tabs.convert} isActive={activeTab === 'convert'} onClick={() => handleTabClick('convert')} icon={<IconMagic />} />
                                
                                <div className="text-[9px] uppercase text-gray-500 font-bold mt-6 mb-1 tracking-[0.15em] pl-4">{t.media}</div>
                                <TabButton label={t.tabs.presentation} isActive={activeTab === 'presentation'} onClick={() => handleTabClick('presentation')} icon={<IconPresentation />} />
                                <TabButton label={t.tabs.infographic} isActive={activeTab === 'infographic'} onClick={() => handleTabClick('infographic')} icon={<IconChart />} />
                                <TabButton label={t.tabs.coloring} isActive={activeTab === 'coloring'} onClick={() => handleTabClick('coloring')} icon={<IconPalette />} />
                                <TabButton label={t.tabs.visuals} isActive={activeTab === 'visuals'} onClick={() => handleTabClick('visuals')} icon={<IconImage />} />
                                <TabButton label={t.tabs.shorts} isActive={activeTab === 'video'} onClick={() => handleTabClick('video')} icon={<IconVideo />} />
                                <TabButton label={t.tabs.videoPlan} isActive={activeTab === 'videoPlan'} onClick={() => handleTabClick('videoPlan')} icon={<IconFilm />} />
                                <TabButton label={t.tabs.dj} isActive={activeTab === 'dj'} onClick={() => handleTabClick('dj')} icon={<IconHeadphones />} />
                                
                                <div className="text-[9px] uppercase text-gray-500 font-bold mt-6 mb-1 tracking-[0.15em] pl-4">{t.global}</div>
                                <TabButton label={t.tabs.market} isActive={activeTab === 'market'} onClick={() => handleTabClick('market')} icon={<IconAcademic />} />
                                <TabButton label={t.tabs.colab} isActive={activeTab === 'colab'} onClick={() => handleTabClick('colab')} icon={<IconGroup />} />
                                <TabButton label={t.tabs.comm} isActive={activeTab === 'translate'} onClick={() => handleTabClick('translate')} icon={<IconTranslate />} />
                                <TabButton label={t.tabs.tutor} isActive={activeTab === 'tutor'} onClick={() => handleTabClick('tutor')} icon={<IconAudio />} />
                                <TabButton label={t.tabs.phonics} isActive={activeTab === 'phonics'} onClick={() => handleTabClick('phonics')} icon={<IconWave />} />
                                <TabButton label={t.tabs.geo} isActive={activeTab === 'geo'} onClick={() => handleTabClick('geo')} icon={<IconGlobe />} />
                                <TabButton label={t.tabs.bio} isActive={activeTab === 'bio'} onClick={() => handleTabClick('bio')} icon={<IconDna />} />
                                <TabButton label={t.tabs.fact} isActive={activeTab === 'research'} onClick={() => handleTabClick('research')} icon={<IconSearch />} />
                                <TabButton label={t.tabs.graph} isActive={activeTab === 'graph'} onClick={() => handleTabClick('graph')} icon={<IconNetwork />} />
                                <TabButton label={t.tabs.staff} isActive={activeTab === 'staff'} onClick={() => handleTabClick('staff')} icon={<IconCoffee />} />
                                
                                <div className="text-[9px] uppercase text-gray-500 font-bold mt-6 mb-1 tracking-[0.15em] pl-4">{t.tools}</div>
                                <TabButton label={t.tabs.board} isActive={activeTab === 'board'} onClick={() => handleTabClick('board')} icon={<IconBoard />} />
                                <TabButton label={t.tabs.toolkit} isActive={activeTab === 'toolkit'} onClick={() => handleTabClick('toolkit')} icon={<IconTools />} />
                                <TabButton label={t.tabs.quizgame} isActive={activeTab === 'quizgame'} onClick={() => handleTabClick('quizgame')} icon={<IconSword />} />
                                <TabButton label={t.tabs.gamify} isActive={activeTab === 'gamify'} onClick={() => handleTabClick('gamify')} icon={<IconGame />} />
                                <TabButton label={t.tabs.music} isActive={activeTab === 'music'} onClick={() => handleTabClick('music')} icon={<IconMusic />} />
                                <TabButton label={t.tabs.tom} isActive={activeTab === 'tom'} onClick={() => handleTabClick('tom')} icon={<IconRobot />} />
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/10 space-y-2">
                            <button onClick={toggleLang} className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-400 border border-white/5 flex items-center justify-center">
                                {lang === 'en' ? 'EN / 中文' : '中文 / EN'}
                            </button>
                            <button onClick={toggleTheme} className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-400 border border-white/5 flex items-center justify-center gap-2">
                                {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Overlay Backdrop */}
                    {sidebarOpen && (
                        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
                    )}

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col relative z-10 min-h-0 w-full">
                        {/* Header */}
                        <header className="h-16 md:h-20 border-b border-white/10 flex items-center justify-between px-4 md:px-8 backdrop-blur-md bg-black/20">
                            <div className="flex items-center space-x-4">
                                {/* Hamburger Button */}
                                <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-300 p-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <h2 className="text-lg md:text-xl font-bold text-white tracking-wide truncate max-w-[200px] md:max-w-none">{t.tabs[activeTab]}</h2>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button 
                                    onClick={() => setShowDragon(!showDragon)}
                                    className={`p-2 rounded-lg transition-colors ${showDragon ? 'text-gem-blue bg-gem-blue/10' : 'text-gray-500 hover:text-white'}`}
                                    title="Toggle Dragon"
                                >
                                    🐉
                                </button>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gem-blue to-gem-purple border border-white/20"></div>
                            </div>
                        </header>

                        {/* Scrollable Content */}
                        <main className="flex-1 overflow-y-auto p-2 md:p-8 relative scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {renderContent()}
                        </main>
                    </div>
                </>
            )}
        </div>
    );
};

export default App;
