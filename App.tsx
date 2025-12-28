
import React, { useState, useCallback } from 'react';
import { ThreeBackground } from './components/ThreeBackground';
import { ChatBot } from './components/ChatBot';
import { ImageTools } from './components/ImageTools';
import { VideoTools } from './components/VideoTools';
import { AudioTools } from './components/AudioTools';
import { GroundedSearch } from './components/GroundedSearch';
import { GameIdeaGenerator } from './components/GameIdeaGenerator';
import { AssessmentTools } from './components/AssessmentTools';
import { WorksheetWizard } from './components/WorksheetWizard';
import { GlobalTranslator } from './components/GlobalTranslator';
import { StemSolver } from './components/StemSolver';
import { DifferentiationTool } from './components/DifferentiationTool';
import { FlashcardGenerator } from './components/FlashcardGenerator';
import { RubricGenerator } from './components/RubricGenerator';
import { SelHub } from './components/SelHub';
import { PblArchitect } from './components/PblArchitect';
import { EscapeRoomBuilder } from './components/EscapeRoomBuilder';
import { ExperimentDesigner } from './components/ExperimentDesigner';
import { DebateCoach } from './components/DebateCoach';
import { LiteracyStation } from './components/LiteracyStation';
import { CareerConnector } from './components/CareerConnector';
import { MagicConverter } from './components/MagicConverter';
import { ClassroomToolkit } from './components/ClassroomToolkit';
import { GamifiedQuiz } from './components/GamifiedQuiz';
import { MathGlossaryGenerator } from './components/MathGlossaryGenerator';
import { InfographicMaker } from './components/InfographicMaker';
import { PresentationMaker } from './components/PresentationMaker';
import { PhysicsSimulations } from './components/PhysicsSimulations';
import { SuisColab } from './components/SuisColab';
import { CsVoyager } from './components/CsVoyager';
import { SmartManager } from './components/SmartManager';
import { KnowledgeExplorer } from './components/KnowledgeExplorer';
import { CourseMarket } from './components/CourseMarket';
import { MusicTheoryBear } from './components/MusicTheoryBear';
import { ClassroomDj } from './components/ClassroomDj';
import { StaffRoom } from './components/StaffRoom';
import { SmartWhiteboard } from './components/SmartWhiteboard';
import { PhonicsLab } from './components/PhonicsLab';
import { GeoDiscovery } from './components/GeoDiscovery';
import { BioByte } from './components/BioByte';
import { StudyGuideGenerator } from './components/StudyGuideGenerator';
import { ListeningSkills } from './components/ListeningSkills';
import { SchoolLogo } from './components/SchoolLogo';
import { TabButton } from './components/TabButton';
import { 
    IconChat, IconImage, IconVideo, IconAudio, IconSearch, 
    IconGame, IconCheck, IconDocument, IconTranslate, IconCalculator,
    IconLayers, IconCards, IconTable, IconHeart, IconBlueprint, IconKey,
    IconBeaker, IconScale, IconBook, IconBriefcase, IconMagic, IconTools, IconSword, IconPi, IconChart, IconPresentation, IconAtom, IconGroup, IconCode, IconClipboard, IconNetwork, IconAcademic, IconMusic, IconHeadphones, IconCoffee, IconBoard, IconWave, IconGlobe, IconDna, IconNotebook, IconEar
} from './components/Icons';

export type Tab = 'plan' | 'worksheet' | 'rubric' | 'pbl' | 'assess' | 'diff' | 'sel' | 'literacy' | 'stem' | 'lab' | 'debate' | 'career' | 'flashcards' | 'escape' | 'visuals' | 'video' | 'tutor' | 'research' | 'translate' | 'gamify' | 'convert' | 'toolkit' | 'quizgame' | 'mathGlossary' | 'infographic' | 'presentation' | 'physics' | 'colab' | 'cs' | 'ems' | 'graph' | 'market' | 'music' | 'dj' | 'staff' | 'board' | 'phonics' | 'geo' | 'bio' | 'study' | 'listening';
export type Language = 'en' | 'zh';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('plan');
  const [lang, setLang] = useState<Language>('en');
  const [showDragon, setShowDragon] = useState(true);

  const toggleLang = () => setLang(prev => prev === 'en' ? 'zh' : 'en');

  const t = {
      en: {
          title: "SUIS\nSmart Hub",
          subtitle: "智协",
          core: "CORE",
          media: "MEDIA",
          global: "GLOBAL",
          tools: "TOOLS",
          tabs: {
              assistant: "Assistant",
              worksheet: "Worksheet Wizard",
              rubric: "Rubric Builder",
              pbl: "PBL Architect",
              assess: "Grade & Feedback",
              diff: "Differentiate",
              sel: "SEL Hub",
              literacy: "Literacy Station",
              stem: "STEM Solver",
              lab: "Science Lab",
              debate: "Debate Coach",
              career: "Career Connector",
              flashcards: "Flashcards",
              escape: "Escape Room",
              visuals: "Class Visuals",
              shorts: "Edu-Shorts",
              comm: "Communicator",
              tutor: "Language Tutor",
              fact: "Fact Checker",
              gamify: "Game Ideas",
              convert: "Magic Converter",
              toolkit: "Classroom Toolkit",
              quizgame: "Roguelike Review",
              mathGlossary: "Math Glossary",
              infographic: "Infographic Maker",
              presentation: "Slides Maker",
              physics: "Physics Lab",
              colab: "SUIS COLAB",
              cs: "CS Voyager",
              ems: "Smart Manager",
              graph: "Knowledge Graph",
              market: "StudyHub",
              music: "Music Theory Bear",
              dj: "Classroom DJ",
              staff: "Staff Room",
              board: "Smart Board",
              phonics: "Phonics Lab",
              geo: "Geo Discovery",
              bio: "BioByte Evolution",
              study: "Study Guide",
              listening: "Listening Lab"
          },
          headers: {
              plan: "Teacher's Command Center",
              worksheet: "Worksheet Wizard",
              rubric: "Rubric Builder",
              pbl: "Project Based Learning Architect",
              assess: "AI Assessment & Grading",
              diff: "Differentiation Engine",
              sel: "Social Emotional Learning Hub",
              literacy: "Decodable Text Generator",
              stem: "STEM Step-by-Step Solver",
              lab: "Safe Science Experiment Designer",
              debate: "Debate & Critical Thinking Coach",
              career: "Real-World Career Connector",
              flashcards: "Flashcard Generator",
              escape: "Classroom Escape Room Builder",
              visuals: "Classroom Visuals Generator",
              video: "Educational Video Creator",
              translate: "Global Communicator",
              tutor: "Live Language Tutor",
              research: "Grounded Fact Checker",
              gamify: "Lesson Gamification",
              convert: "Magic Resource Converter",
              toolkit: "Classroom Toolkit",
              quizgame: "Roguelike Review Quest",
              mathGlossary: "Math Glossary Generator",
              infographic: "Educational Infographic Maker",
              presentation: "Presentation Slides Generator",
              physics: "Interactive Physics Laboratory",
              colab: "SUIS Collaborative Learning Hub",
              cs: "Computer Science Voyager Curriculum",
              ems: "Smart Classroom Manager",
              graph: "Interactive Knowledge Graph Explorer",
              market: "StudyHub Course Marketplace",
              music: "Music Theory Bear",
              dj: "Classroom DJ & AI Composer",
              staff: "Teachers' Lounge & Relax Zone",
              board: "Interactive Smart Whiteboard",
              phonics: "Phonics & Pronunciation Lab",
              geo: "Geography & Culture Discovery",
              bio: "BioByte Evolution Lab",
              study: "Smart Study Guide Generator",
              listening: "ESL Listening Skills Lab"
          }
      },
      zh: {
          title: "SUIS\n智协",
          subtitle: "Smart Hub",
          core: "核心功能",
          media: "多媒体",
          global: "全球化",
          tools: "工具",
          tabs: {
              assistant: "智能助手",
              worksheet: "作业生成",
              rubric: "评分标准生成",
              pbl: "PBL 架构师",
              assess: "评分反馈",
              diff: "差异化教学",
              sel: "SEL 中心",
              literacy: "识字加油站",
              stem: "理科解题",
              lab: "科学实验",
              debate: "辩论教练",
              career: "职业连接",
              flashcards: "闪卡生成",
              escape: "密室逃脱",
              visuals: "教学配图",
              shorts: "教育短视频",
              comm: "多语沟通",
              tutor: "语言导师",
              fact: "事实核查",
              gamify: "游戏创意",
              convert: "魔法转换器",
              toolkit: "课堂工具箱",
              quizgame: "复习大冒险",
              mathGlossary: "数学词汇表",
              infographic: "信息图制作",
              presentation: "演示文稿制作",
              physics: "物理实验室",
              colab: "SUIS 协作平台",
              cs: "CS 探索者",
              ems: "智能班级管家",
              graph: "知识图谱",
              market: "StudyHub",
              music: "乐理小熊",
              dj: "课堂 DJ",
              staff: "教师休息室",
              board: "智能白板",
              phonics: "自然拼读",
              geo: "地理发现",
              bio: "生物进化",
              study: "学习指南",
              listening: "听力实验室"
          },
          headers: {
              plan: "教师指挥中心",
              worksheet: "作业生成向导",
              rubric: "评分标准生成器",
              pbl: "项目式学习 (PBL) 架构师",
              assess: "AI 智能评分与反馈",
              diff: "差异化教学引擎",
              sel: "社交情感学习 (SEL) 中心",
              literacy: "可解码文本生成器",
              stem: "STEM 分步解题助手",
              lab: "安全科学实验设计器",
              debate: "辩论与批判性思维教练",
              career: "现实世界职业连接器",
              flashcards: "闪卡生成器",
              escape: "教室密室逃脱生成器",
              visuals: "课堂视觉素材生成器",
              video: "教育视频创作者",
              translate: "全球沟通助手",
              tutor: "实时语言导师",
              research: "事实核查工具",
              gamify: "课程游戏化生成器",
              convert: "魔法资源转换器",
              toolkit: "课堂工具箱",
              quizgame: "复习大冒险生成器",
              mathGlossary: "数学词汇生成器",
              infographic: "教育信息图制作器",
              presentation: "演示文稿幻灯片生成器",
              physics: "交互式物理实验室",
              colab: "SUIS 学习协作中心",
              cs: "计算机科学探索者课程",
              ems: "智能班级管理系统",
              graph: "交互式知识图谱探索器",
              market: "StudyHub 课程市场",
              music: "乐理小熊",
              dj: "课堂 DJ 与 AI 作曲家",
              staff: "教师休息室与放松区",
              board: "交互式智能白板",
              phonics: "自然拼读与发音实验室",
              geo: "地理与文化探索中心",
              bio: "BioByte 进化实验室",
              study: "智能学习指南生成器",
              listening: "ESL 听力技能生成实验室"
          }
      }
  }[lang];

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'plan': return <ChatBot lang={lang} onNavigate={setActiveTab} />;
      case 'worksheet': return <WorksheetWizard lang={lang} />;
      case 'rubric': return <RubricGenerator lang={lang} />;
      case 'pbl': return <PblArchitect lang={lang} />;
      case 'assess': return <AssessmentTools lang={lang} />;
      case 'diff': return <DifferentiationTool lang={lang} />;
      case 'sel': return <SelHub lang={lang} />;
      case 'literacy': return <LiteracyStation lang={lang} />;
      case 'stem': return <StemSolver lang={lang} />;
      case 'lab': return <ExperimentDesigner lang={lang} />;
      case 'debate': return <DebateCoach lang={lang} />;
      case 'career': return <CareerConnector lang={lang} />;
      case 'flashcards': return <FlashcardGenerator lang={lang} />;
      case 'escape': return <EscapeRoomBuilder lang={lang} />;
      case 'visuals': return <ImageTools lang={lang} />;
      case 'video': return <VideoTools lang={lang} />;
      case 'tutor': return <AudioTools lang={lang} />;
      case 'research': return <GroundedSearch lang={lang} />;
      case 'translate': return <GlobalTranslator lang={lang} />;
      case 'gamify': return <GameIdeaGenerator lang={lang} />;
      case 'convert': return <MagicConverter lang={lang} />;
      case 'toolkit': return <ClassroomToolkit lang={lang} />;
      case 'quizgame': return <GamifiedQuiz lang={lang} />;
      case 'mathGlossary': return <MathGlossaryGenerator lang={lang} />;
      case 'infographic': return <InfographicMaker lang={lang} />;
      case 'presentation': return <PresentationMaker lang={lang} />;
      case 'physics': return <PhysicsSimulations lang={lang} />;
      case 'colab': return <SuisColab lang={lang} />;
      case 'cs': return <CsVoyager lang={lang} />;
      case 'ems': return <SmartManager lang={lang} />;
      case 'graph': return <KnowledgeExplorer lang={lang} />;
      case 'market': return <CourseMarket lang={lang} />;
      case 'music': return <MusicTheoryBear lang={lang} />;
      case 'dj': return <ClassroomDj lang={lang} />;
      case 'staff': return <StaffRoom lang={lang} />;
      case 'board': return <SmartWhiteboard lang={lang} />;
      case 'phonics': return <PhonicsLab lang={lang} />;
      case 'geo': return <GeoDiscovery lang={lang} />;
      case 'bio': return <BioByte lang={lang} />;
      case 'study': return <StudyGuideGenerator lang={lang} />;
      case 'listening': return <ListeningSkills lang={lang} />;
      default: return <ChatBot lang={lang} onNavigate={setActiveTab} />;
    }
  }, [activeTab, lang]);

  return (
    <div className="min-h-screen text-gray-100 font-sans selection:bg-gem-purple selection:text-white relative overflow-hidden bg-[#020617]">
      <ThreeBackground showDragon={showDragon} />
      {/* BackgroundDecorations removed as requested */}
      
      <div className="relative z-10 flex flex-col md:flex-row h-screen overflow-hidden">
        {/* Sidebar Navigation */}
        <nav className="glass-panel w-full md:w-20 lg:w-64 p-4 flex md:flex-col items-center md:items-start md:space-y-6 overflow-x-auto md:overflow-visible md:overflow-y-auto z-50 border-r border-white/10 scrollbar-hide">
          <div className="mb-2 md:mb-6 flex flex-col items-center md:items-start w-full">
            
            {/* Logo and Title Container */}
            <div className="flex items-center gap-3 w-full mb-4">
                <SchoolLogo className="w-10 h-10 md:w-14 md:h-14 shrink-0 shadow-lg rounded-full bg-white hidden md:block" />
                
                <div className="hidden lg:block flex-1">
                    <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gem-blue-light to-gem-purple tracking-tighter whitespace-pre-line leading-none">
                    {t.title}
                    </h1>
                    <span className="text-[10px] text-gem-teal font-bold tracking-widest block mt-1">{t.subtitle}</span>
                </div>

                <div className="flex lg:hidden items-center justify-between w-full">
                     <div className="flex items-center gap-2">
                         <SchoolLogo className="w-8 h-8 rounded-full bg-white" />
                         <h1 className="text-xl font-black text-gem-blue-light">SUIS</h1>
                     </div>
                     <button onClick={toggleLang} className="px-2 py-1 text-[10px] font-bold border border-white/20 rounded hover:bg-white/10 transition-colors">
                        {lang === 'en' ? 'CN' : 'EN'}
                     </button>
                </div>

                <button onClick={toggleLang} className="hidden lg:block px-2 py-1 text-[10px] font-bold border border-white/20 rounded hover:bg-white/10 transition-colors h-fit self-start">
                    {lang === 'en' ? 'CN' : 'EN'}
                </button>
            </div>
            
            {/* Dragon Toggle Button */}
            <button 
                onClick={() => setShowDragon(!showDragon)}
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all w-full border ${showDragon ? 'bg-white/10 border-gem-blue text-gem-blue-light' : 'bg-transparent border-white/10 text-gray-500 hover:text-gray-300'}`}
            >
                <span className="text-lg">🐉</span>
                <span className="hidden lg:inline">{showDragon ? "Dragon: ON" : "Dragon: OFF"}</span>
            </button>
          </div>

          <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 w-full pr-2">
            <div className="hidden md:block text-[10px] uppercase text-gray-500 font-bold mt-2 mb-1 tracking-wider flex justify-between">
                <span>{t.core}</span>
            </div>
            <TabButton label={t.tabs.assistant} isActive={activeTab === 'plan'} onClick={() => setActiveTab('plan')} icon={<IconChat />} />
            <TabButton label={t.tabs.ems} isActive={activeTab === 'ems'} onClick={() => setActiveTab('ems')} icon={<IconClipboard />} />
            <TabButton label={t.tabs.worksheet} isActive={activeTab === 'worksheet'} onClick={() => setActiveTab('worksheet')} icon={<IconDocument />} />
            <TabButton label={t.tabs.listening} isActive={activeTab === 'listening'} onClick={() => setActiveTab('listening')} icon={<IconEar />} />
            <TabButton label={t.tabs.study} isActive={activeTab === 'study'} onClick={() => setActiveTab('study')} icon={<IconNotebook />} />
            <TabButton label={t.tabs.rubric} isActive={activeTab === 'rubric'} onClick={() => setActiveTab('rubric')} icon={<IconTable />} />
            <TabButton label={t.tabs.pbl} isActive={activeTab === 'pbl'} onClick={() => setActiveTab('pbl')} icon={<IconBlueprint />} />
            <TabButton label={t.tabs.assess} isActive={activeTab === 'assess'} onClick={() => setActiveTab('assess')} icon={<IconCheck />} />
            <TabButton label={t.tabs.diff} isActive={activeTab === 'diff'} onClick={() => setActiveTab('diff')} icon={<IconLayers />} />
            <TabButton label={t.tabs.sel} isActive={activeTab === 'sel'} onClick={() => setActiveTab('sel')} icon={<IconHeart />} />
            <TabButton label={t.tabs.literacy} isActive={activeTab === 'literacy'} onClick={() => setActiveTab('literacy')} icon={<IconBook />} />
            <TabButton label={t.tabs.stem} isActive={activeTab === 'stem'} onClick={() => setActiveTab('stem')} icon={<IconCalculator />} />
            <TabButton label={t.tabs.mathGlossary} isActive={activeTab === 'mathGlossary'} onClick={() => setActiveTab('mathGlossary')} icon={<IconPi />} />
            <TabButton label={t.tabs.lab} isActive={activeTab === 'lab'} onClick={() => setActiveTab('lab')} icon={<IconBeaker />} />
            <TabButton label={t.tabs.physics} isActive={activeTab === 'physics'} onClick={() => setActiveTab('physics')} icon={<IconAtom />} />
            <TabButton label={t.tabs.cs} isActive={activeTab === 'cs'} onClick={() => setActiveTab('cs')} icon={<IconCode />} />
            <TabButton label={t.tabs.debate} isActive={activeTab === 'debate'} onClick={() => setActiveTab('debate')} icon={<IconScale />} />
            <TabButton label={t.tabs.career} isActive={activeTab === 'career'} onClick={() => setActiveTab('career')} icon={<IconBriefcase />} />
            <TabButton label={t.tabs.flashcards} isActive={activeTab === 'flashcards'} onClick={() => setActiveTab('flashcards')} icon={<IconCards />} />
            <TabButton label={t.tabs.escape} isActive={activeTab === 'escape'} onClick={() => setActiveTab('escape')} icon={<IconKey />} />
            <TabButton label={t.tabs.convert} isActive={activeTab === 'convert'} onClick={() => setActiveTab('convert')} icon={<IconMagic />} />
            
            <div className="hidden md:block text-[10px] uppercase text-gray-500 font-bold mt-4 mb-1 tracking-wider">{t.media}</div>
            <TabButton label={t.tabs.presentation} isActive={activeTab === 'presentation'} onClick={() => setActiveTab('presentation')} icon={<IconPresentation />} />
            <TabButton label={t.tabs.infographic} isActive={activeTab === 'infographic'} onClick={() => setActiveTab('infographic')} icon={<IconChart />} />
            <TabButton label={t.tabs.visuals} isActive={activeTab === 'visuals'} onClick={() => setActiveTab('visuals')} icon={<IconImage />} />
            <TabButton label={t.tabs.shorts} isActive={activeTab === 'video'} onClick={() => setActiveTab('video')} icon={<IconVideo />} />
            <TabButton label={t.tabs.dj} isActive={activeTab === 'dj'} onClick={() => setActiveTab('dj')} icon={<IconHeadphones />} />
            
            <div className="hidden md:block text-[10px] uppercase text-gray-500 font-bold mt-4 mb-1 tracking-wider">{t.global}</div>
            <TabButton label={t.tabs.market} isActive={activeTab === 'market'} onClick={() => setActiveTab('market')} icon={<IconAcademic />} />
            <TabButton label={t.tabs.colab} isActive={activeTab === 'colab'} onClick={() => setActiveTab('colab')} icon={<IconGroup />} />
            <TabButton label={t.tabs.comm} isActive={activeTab === 'translate'} onClick={() => setActiveTab('translate')} icon={<IconTranslate />} />
            <TabButton label={t.tabs.tutor} isActive={activeTab === 'tutor'} onClick={() => setActiveTab('tutor')} icon={<IconAudio />} />
            <TabButton label={t.tabs.phonics} isActive={activeTab === 'phonics'} onClick={() => setActiveTab('phonics')} icon={<IconWave />} />
            <TabButton label={t.tabs.geo} isActive={activeTab === 'geo'} onClick={() => setActiveTab('geo')} icon={<IconGlobe />} />
            <TabButton label={t.tabs.bio} isActive={activeTab === 'bio'} onClick={() => setActiveTab('bio')} icon={<IconDna />} />
            <TabButton label={t.tabs.fact} isActive={activeTab === 'research'} onClick={() => setActiveTab('research')} icon={<IconSearch />} />
            <TabButton label={t.tabs.graph} isActive={activeTab === 'graph'} onClick={() => setActiveTab('graph')} icon={<IconNetwork />} />
            <TabButton label={t.tabs.staff} isActive={activeTab === 'staff'} onClick={() => setActiveTab('staff')} icon={<IconCoffee />} />
            
            <div className="hidden md:block text-[10px] uppercase text-gray-500 font-bold mt-4 mb-1 tracking-wider">{t.tools}</div>
            <TabButton label={t.tabs.board} isActive={activeTab === 'board'} onClick={() => setActiveTab('board')} icon={<IconBoard />} />
            <TabButton label={t.tabs.toolkit} isActive={activeTab === 'toolkit'} onClick={() => setActiveTab('toolkit')} icon={<IconTools />} />
            <TabButton label={t.tabs.quizgame} isActive={activeTab === 'quizgame'} onClick={() => setActiveTab('quizgame')} icon={<IconSword />} />
            <TabButton label={t.tabs.gamify} isActive={activeTab === 'gamify'} onClick={() => setActiveTab('gamify')} icon={<IconGame />} />
            <TabButton label={t.tabs.music} isActive={activeTab === 'music'} onClick={() => setActiveTab('music')} icon={<IconMusic />} />
          </div>
          
          <div className="mt-auto hidden md:block pt-6 border-t border-white/10 w-full">
             <p className="text-[10px] text-gray-400 text-center">
                © {new Date().getFullYear()} SCHOOLCLASS.NET<br/>
                Powered by Gemini 3.0
             </p>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto relative scrollbar-hide">
            <div className="max-w-7xl mx-auto pb-20 md:pb-0">
                <header className="mb-8 flex justify-between items-end animate-fade-in">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                            {t.headers[activeTab]}
                        </h2>
                        <div className="h-1 w-20 bg-gradient-to-r from-gem-blue to-gem-purple rounded-full"></div>
                    </div>
                    <div className="hidden md:block text-right">
                         <span className="px-3 py-1 bg-gem-blue/20 border border-gem-blue/50 rounded-full text-xs text-gem-blue-light font-mono">
                            Model: Gemini 3.0 Pro & Flash
                         </span>
                    </div>
                </header>
                {renderContent()}
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;
