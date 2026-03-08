
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import TranslationZone from './components/TranslationZone';
import ItineraryZone from './components/ItineraryZone';
import FormFillingZone from './components/FormFillingZone';
import VisaAssessmentZone from './components/VisaAssessmentZone';
import Features from './components/Features';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import AccountSettings from './components/AccountSettings';
import Gateway from './components/Gateway';
import { UserProfile, ServiceType } from './types';
import { Loader2, Construction } from 'lucide-react';

const INITIAL_USER: UserProfile = {
  id: '',
  nickname: '',
  avatar: '',
  mobile: '',
  isLoggedIn: false
};

function App() {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('muhai_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [activeService, setActiveService] = useState<ServiceType>(ServiceType.GATEWAY);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('muhai_user', JSON.stringify(user));
  }, [user]);

  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(INITIAL_USER);
    setIsSettingsOpen(false);
  };

  const handleUpdateUser = (updated: UserProfile) => {
    setUser(updated);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeService]);

  const renderContent = () => {
    switch (activeService) {
      case ServiceType.GATEWAY:
        return <Gateway onSelect={setActiveService} />;
      
      case ServiceType.TRANSLATION:
        return (
          <>
            <Hero />
            <section className="relative z-10">
              <TranslationZone />
            </section>
            <Features />
          </>
        );
      
      case ServiceType.ITINERARY:
        return <ItineraryZone />;
      
      case ServiceType.FORM_FILLING:
        return <FormFillingZone />;

      case ServiceType.VISA_ASSESSMENT:
        return <VisaAssessmentZone />;
      
      default:
        return <Gateway onSelect={setActiveService} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        user={user} 
        activeService={activeService}
        onOpenAuth={() => setIsAuthOpen(true)} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSwitchService={setActiveService}
      />
      
      <main className="transition-all duration-500">
        {renderContent()}

        {/* 呼吁行动区 - 根据服务类型调整显示 */}
        {activeService !== ServiceType.GATEWAY && activeService !== ServiceType.ITINERARY && activeService !== ServiceType.FORM_FILLING && activeService !== ServiceType.VISA_ASSESSMENT && (
          <section className="py-24 bg-orange-50 overflow-hidden relative">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                材料准备繁琐？<br />
                <span className="text-orange-600 italic">沐海旅行让这一步变得更简单。</span>
              </h2>
              <p className="text-slate-600 mb-10 text-lg">
                专为“签证申请”深度优化的智能引擎。<br />
                现在开始上传，感受丝滑般的翻译排版体验。
              </p>
              <button 
                onClick={() => {
                  if (user.isLoggedIn) {
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  } else {
                    setIsAuthOpen(true);
                  }
                }}
                className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all shadow-xl hover:shadow-orange-200 active:scale-95"
              >
                {user.isLoggedIn ? '立即体验 1:1 翻译' : '登录开启特权'}
              </button>
            </div>
          </section>
        )}
      </main>
      
      <Footer />

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLogin={handleLogin} 
      />
      
      {user.isLoggedIn && (
        <AccountSettings 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          user={user}
          onUpdate={handleUpdateUser}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
