
import React from 'react';
import { Plane, ChevronDown, Home } from 'lucide-react';
import { UserProfile, ServiceType } from '../types';

interface HeaderProps {
  user: UserProfile;
  activeService: ServiceType;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onSwitchService: (service: ServiceType) => void;
}

const Header: React.FC<HeaderProps> = ({ user, activeService, onOpenAuth, onOpenSettings, onSwitchService }) => {
  const navItems = [
    { id: ServiceType.TRANSLATION, label: '材料翻译' },
    { id: ServiceType.ITINERARY, label: '行程单定制' },
    { id: ServiceType.CERTIFICATE_GENERATOR, label: '标准证明生成' },
    { id: ServiceType.VISA_ASSESSMENT, label: '签证申请评估' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-morphism border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div 
            className="flex items-center space-x-2 cursor-pointer group"
            onClick={() => onSwitchService(ServiceType.GATEWAY)}
          >
            <div className="bg-orange-500 p-1.5 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
              <Plane className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-500 tracking-tight leading-none">
                沐海旅行
              </span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">
                Muhai Travel
              </span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6 text-sm font-bold">
            {/* 首页跳转按钮 - 仅在非首页状态下显示 */}
            {activeService !== ServiceType.GATEWAY && (
              <>
                <button
                  onClick={() => onSwitchService(ServiceType.GATEWAY)}
                  className="flex items-center space-x-1.5 transition-all px-3 py-1.5 rounded-xl border border-transparent text-slate-500 hover:text-orange-600 hover:bg-orange-50/50"
                >
                  <Home size={16} />
                  <span>首页</span>
                </button>
                <div className="w-px h-4 bg-slate-200"></div>
              </>
            )}

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSwitchService(item.id)}
                className={`transition-all px-2 py-1 rounded-md ${
                  activeService === item.id 
                  ? 'text-orange-600 bg-orange-50 scale-105' 
                  : 'text-slate-500 hover:text-orange-600'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <div className="w-px h-4 bg-slate-200 mx-2"></div>

            {user.isLoggedIn ? (
              <button 
                onClick={onOpenSettings}
                className="group flex items-center space-x-3 bg-white border border-slate-100 pl-1 pr-4 py-1 rounded-full hover:border-orange-200 transition-all shadow-sm active:scale-95"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                </div>
                <span className="text-slate-800 font-bold text-xs">{user.nickname}</span>
                <ChevronDown size={14} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
              </button>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="bg-orange-500 text-white px-6 py-2.5 rounded-full hover:bg-orange-600 transition-all shadow-md active:scale-95 font-bold"
              >
                登录 / 注册
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
