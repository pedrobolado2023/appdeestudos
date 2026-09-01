import React, { useState, useEffect } from 'react';
import { Map, Layers, Brain, BarChart3, HardDrive, Sparkles } from 'lucide-react';
import { UserProfile, AccessStatus, StudyStage, Question } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { DuolingoMap } from './components/DuolingoMap';
import { QuizArena } from './components/QuizArena';
import { AnkiDeck } from './components/AnkiDeck';
import { StatsView } from './components/StatsView';
import { PaywallModal } from './components/PaywallModal';
import { PDFUploadModal } from './components/PDFUploadModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'quiz' | 'anki' | 'stats'>('map');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [access, setAccess] = useState<AccessStatus | null>(null);
  const [stages, setStages] = useState<StudyStage[]>([]);
  const [currentStage, setCurrentStage] = useState<StudyStage | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [inQuizMode, setInQuizMode] = useState(false);

  // Modais
  const [showPaywall, setShowPaywall] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);

  const loadInitialData = async () => {
    try {
      const profileData = await api.getProfile();
      setUser(profileData.user);
      setAccess(profileData.access);

      const stagesData = await api.getStages();
      setStages(stagesData);

      const questionsData = await api.getQuestions();
      setQuestions(questionsData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleStartStage = (stage: StudyStage) => {
    setCurrentStage(stage);
    setInQuizMode(true);
  };

  const handleFinishQuiz = () => {
    setInQuizMode(false);
    setCurrentStage(null);
    loadInitialData();
  };

  if (!user || !access) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-400">Carregando QA Concursos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header Superior Fixo */}
      {!inQuizMode && (
        <Header
          user={user}
          access={access}
          onOpenPaywall={() => setShowPaywall(true)}
          onOpenKnowledge={() => setShowKnowledge(true)}
        />
      )}

      {/* Conteúdo Principal */}
      <main className="flex-1">
        {inQuizMode ? (
          <QuizArena
            stage={currentStage}
            questions={questions}
            onFinish={handleFinishQuiz}
            onRefreshProfile={loadInitialData}
          />
        ) : (
          <>
            {activeTab === 'map' && (
              <DuolingoMap stages={stages} onStartStage={handleStartStage} />
            )}

            {activeTab === 'quiz' && (
              <div className="max-w-md mx-auto px-4 py-4 pb-28">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black text-white">Banco de Questões</h2>
                  <button
                    onClick={() => setShowKnowledge(true)}
                    className="p-2 bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <HardDrive className="w-4 h-4" />
                    <span>Upload PDFs (RAG)</span>
                  </button>
                </div>
                <QuizArena
                  stage={null}
                  questions={questions}
                  onFinish={() => setActiveTab('map')}
                  onRefreshProfile={loadInitialData}
                />
              </div>
            )}

            {activeTab === 'anki' && (
              <AnkiDeck onRefreshProfile={loadInitialData} />
            )}

            {activeTab === 'stats' && (
              <StatsView user={user} />
            )}
          </>
        )}
      </main>

      {/* Barra de Navegação Inferior (Estilo App Mobile) */}
      {!inQuizMode && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 py-2.5 px-6">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === 'map' ? 'text-emerald-400 scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Map className="w-5 h-5" />
              <span className="text-[10px] font-bold">Trilha</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === 'quiz' ? 'text-emerald-400 scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-5 h-5" />
              <span className="text-[10px] font-bold">Questões</span>
            </button>

            <button
              onClick={() => setActiveTab('anki')}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === 'anki' ? 'text-indigo-400 scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Brain className="w-5 h-5" />
              <span className="text-[10px] font-bold">Anki SM-2</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === 'stats' ? 'text-amber-400 scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-[10px] font-bold">Perfil</span>
            </button>
          </div>
        </nav>
      )}

      {/* Modais Globais */}
      {showPaywall && (
        <PaywallModal
          access={access}
          onClose={() => setShowPaywall(false)}
          onPaymentSuccess={loadInitialData}
        />
      )}

      {showKnowledge && (
        <PDFUploadModal onClose={() => setShowKnowledge(false)} />
      )}
    </div>
  );
};

export default App;
