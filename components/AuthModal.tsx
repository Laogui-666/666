
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Lock, Phone, ShieldCheck, ArrowRight, RefreshCcw, ShieldAlert, Eye, EyeOff, User, Info } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  // 基础状态
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [loginMethod, setLoginMethod] = useState<'sms' | 'password'>('sms');
  const [timer, setTimer] = useState(0);
  // Fix: Changed NodeJS.Timeout to any to avoid namespace issues in browser environment
  const timerRef = useRef<any>(null);

  // 验证状态
  const [captchaText, setCaptchaText] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  
  // 找回密码状态
  const [isResetVerified, setIsResetVerified] = useState(false); 
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 统一重置所有状态
  const resetAllStates = useCallback(() => {
    setMode('login');
    setLoginMethod('sms');
    setIsResetVerified(false);
    setCaptchaInput('');
    setCaptchaError(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(false);
    setShowPassword(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(0);
  }, []);

  // 生成图形验证码
  const generateCaptcha = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    setCaptchaText(result);
    setCaptchaInput('');
    setCaptchaError(false);
  }, []);

  // 弹窗打开/关闭逻辑
  useEffect(() => {
    if (isOpen) {
      resetAllStates();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen, resetAllStates]);

  // 切换模式时自动刷新验证码
  useEffect(() => {
    if (isOpen && (mode === 'register' || mode === 'reset')) {
      generateCaptcha();
    }
  }, [mode, isOpen, generateCaptcha]);

  // 绘制验证码 (优化性能：仅在文字改变时重绘)
  useEffect(() => {
    if (captchaText && canvasRef.current && (mode === 'register' || mode === 'reset')) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < 4; i++) {
          ctx.strokeStyle = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},0.2)`;
          ctx.beginPath();
          ctx.moveTo(Math.random()*canvas.width, Math.random()*canvas.height);
          ctx.lineTo(Math.random()*canvas.width, Math.random()*canvas.height);
          ctx.stroke();
        }
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < captchaText.length; i++) {
          ctx.fillStyle = i % 2 === 0 ? '#ea580c' : '#dc2626';
          ctx.save();
          ctx.translate(25 + i * 25, 20);
          ctx.rotate((Math.random() - 0.5) * 0.4);
          ctx.fillText(captchaText[i], 0, 0);
          ctx.restore();
        }
      }
    }
  }, [captchaText, mode]);

  const validatePassword = (pwd: string) => {
    return pwd.length >= 8 && pwd.length <= 16 && /[a-zA-Z]/.test(pwd) && /[0-9]/.test(pwd);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 第一步：身份验证
    if (mode === 'reset' && !isResetVerified) {
      if (captchaInput.toUpperCase() !== captchaText) {
        setCaptchaError(true);
        setTimeout(() => setCaptchaError(false), 500);
        generateCaptcha();
        return;
      }
      setIsResetVerified(true);
      return;
    }

    // 注册模式校验
    if (mode === 'register' && captchaInput.toUpperCase() !== captchaText) {
      setCaptchaError(true);
      setTimeout(() => setCaptchaError(false), 500);
      generateCaptcha();
      return;
    }

    // 密码修改提交
    if (mode === 'reset' && isResetVerified) {
      if (!validatePassword(newPassword) || newPassword !== confirmPassword) {
        setPasswordError(true);
        setTimeout(() => setPasswordError(false), 500);
        return;
      }
    }

    onLogin({
      id: 'user_123',
      nickname: '沐海体验官',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=muhai',
      mobile: '158****5069',
      isLoggedIn: true
    });
    onClose();
  };

  const startSmsTimer = () => {
    if (timer > 0) return;
    setTimer(60);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  if (!isOpen) return null;

  const inputBaseClass = "w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm font-medium";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
          <X size={20} />
        </button>

        <div className="p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {mode === 'login' ? '欢迎回来' : mode === 'register' ? '开启签证之旅' : '找回登录密码'}
            </h2>
            <p className="text-slate-500 text-sm">
              {mode === 'login' ? '管理您的翻译资产' : 
               mode === 'register' ? '注册即享 1:1 高清翻译排版权益' : '验证身份后重新设置您的密码'}
            </p>
          </div>

          {mode === 'login' && (
            <div className="flex border-b border-slate-100 mb-6">
              {['sms', 'password'].map((method) => (
                <button 
                  key={method}
                  onClick={() => setLoginMethod(method as any)}
                  className={`flex-1 pb-3 text-sm font-bold transition-all relative ${loginMethod === method ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {method === 'sms' ? '验证码登录' : '密码登录'}
                  {loginMethod === method && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full"></div>}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative">
                {loginMethod === 'password' && mode === 'login' ? <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /> : <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />}
                <input 
                  type={loginMethod === 'password' && mode === 'login' ? "text" : "tel"} 
                  placeholder={loginMethod === 'password' && mode === 'login' ? "手机号 / 账户名" : "请输入手机号"} 
                  disabled={mode === 'reset' && isResetVerified}
                  className={`${inputBaseClass} ${mode === 'reset' && isResetVerified ? 'opacity-50' : ''}`}
                  required
                />
              </div>

              {mode === 'login' && loginMethod === 'password' && (
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="请输入登录密码" 
                      className={inputBaseClass}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="flex justify-end pr-1">
                    <button type="button" onClick={() => setMode('reset')} className="text-xs text-slate-400 hover:text-orange-600 transition-colors font-medium">忘记密码？</button>
                  </div>
                </div>
              )}

              {(mode === 'register' || mode === 'reset' || (mode === 'login' && loginMethod === 'sms')) && (
                <div className={mode === 'reset' && isResetVerified ? 'hidden' : 'space-y-4'}>
                  {(mode === 'register' || mode === 'reset') && (
                    <div className="flex space-x-3 mb-4 animate-in fade-in slide-in-from-top-2">
                      <div className={`relative flex-1 group ${captchaError ? 'animate-shake' : ''}`}>
                        <ShieldAlert className={`absolute left-4 top-1/2 -translate-y-1/2 ${captchaError ? 'text-red-500' : 'text-slate-400'}`} size={18} />
                        <input 
                          type="text" 
                          placeholder="图形码" 
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value)}
                          className={`${inputBaseClass} ${captchaError ? 'border-red-500' : ''}`}
                          required
                        />
                      </div>
                      <div onClick={generateCaptcha} className="bg-slate-50 border border-slate-100 rounded-2xl flex items-center p-1 cursor-pointer hover:bg-slate-100 group">
                        <canvas ref={canvasRef} width="110" height="40" className="rounded-xl"></canvas>
                        <RefreshCcw size={16} className="mx-2 text-slate-400 group-hover:text-orange-500 transition-colors" />
                      </div>
                    </div>
                  )}
                  <div className="flex space-x-3">
                    <div className="relative flex-1">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="text" placeholder="短信验证码" className={inputBaseClass} required />
                    </div>
                    <button 
                      type="button" 
                      disabled={timer > 0} 
                      onClick={startSmsTimer}
                      className="px-4 py-4 bg-slate-100 text-slate-600 text-xs font-bold rounded-2xl hover:bg-slate-200 disabled:opacity-50 min-w-[100px] transition-colors"
                    >
                      {timer > 0 ? `${timer}s` : '获取验证码'}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'reset' && isResetVerified && (
                <div className="space-y-3 pt-4 border-t border-dashed border-slate-200 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold text-green-600 tracking-wider">身份验证通过，请设置新密码</span>
                  </div>
                  {[
                    { val: newPassword, set: setNewPassword, ph: "设置新密码" },
                    { val: confirmPassword, set: setConfirmPassword, ph: "再次输入新密码" }
                  ].map((field, idx) => (
                    <div key={idx} className="relative">
                      <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${passwordError ? 'text-red-500' : 'text-slate-400'}`} size={18} />
                      <input 
                        type={showPassword ? "text" : "password"}
                        placeholder={field.ph}
                        value={field.val}
                        onChange={(e) => field.set(e.target.value)}
                        className={`${inputBaseClass} ${passwordError ? 'border-red-500 bg-red-50' : ''}`}
                        required
                      />
                      {idx === 0 && (
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      )}
                    </div>
                  ))}
                  <div className={`flex items-start space-x-2 p-3 rounded-xl border transition-all ${passwordError ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50/50 text-blue-600 border-blue-100'}`}>
                    <Info size={14} className="mt-0.5 shrink-0" />
                    <p className="text-[11px] leading-relaxed">密码需 8-16 位，包含字母和数字。</p>
                  </div>
                </div>
              )}
            </div>

            <button className="w-full bg-gradient-to-r from-orange-600 to-red-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-orange-200 hover:shadow-orange-300 active:scale-[0.98] transition-all flex items-center justify-center group">
              {mode === 'login' ? '立即登录' : mode === 'register' ? '极速注册' : !isResetVerified ? '下一步' : '重置并登录'}
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-400">{mode === 'login' ? '还没有账号？' : '想起密码了？'}</span>
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="ml-2 text-orange-600 font-bold hover:underline">
              {mode === 'login' ? '立即注册' : '点击登录'}
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .animate-shake { animation: shake 0.2s ease-in-out 2; }
        @keyframes shake-input { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
        .animate-shake-input { animation: shake-input 0.4s ease-in-out; }
      `}</style>
    </div>
  );
};

export default AuthModal;
