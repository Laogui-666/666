import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Camera, User, Phone, Lock, Save, LogOut, ZoomIn, Check, ShieldCheck, ShieldAlert, Eye, EyeOff, Smartphone, KeyRound, Info, RefreshCcw, RotateCcw } from 'lucide-react';
import { UserProfile } from '../types';

interface AccountSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdate: (updated: UserProfile) => void;
  onLogout: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ isOpen, onClose, user, onUpdate, onLogout }) => {
  const [profile, setProfile] = useState<UserProfile>(user);
  
  // 状态：重置视图模式
  useEffect(() => {
    if (isOpen) {
      setProfile(user);
      setIsEditingMobile(false);
      setIsEditingPassword(false);
      setIsUsingSmsToReset(false);
      setIsSmsVerified(false);
      setNicknameError(false);
      setMobileError(false);
      setPasswordError(false);
    }
  }, [isOpen, user]);

  // 状态：手机号修改流程
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [oldMobileInput, setOldMobileInput] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [mobileCaptcha, setMobileCaptcha] = useState('');
  const [mobileSms, setMobileSms] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [smsTimer, setSmsTimer] = useState(0);

  // 状态：密码修改流程
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isUsingSmsToReset, setIsUsingSmsToReset] = useState(false); // 是否通过短信找回密码
  const [isSmsVerified, setIsSmsVerified] = useState(false); // 短信是否已验证通过
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasExistingPassword, setHasExistingPassword] = useState(true); 
  
  // 校验反馈状态
  const [nicknameError, setNicknameError] = useState(false);
  const [mobileError, setMobileError] = useState(false);
  const [passwordError, setPasswordError] = useState(false); 

  // 状态：头像处理
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(0.5); 
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const CROP_SIZE = 300; 

  const generateCaptcha = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
  }, []);

  useEffect(() => {
    if ((isEditingMobile || (isUsingSmsToReset && !isSmsVerified)) && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < 6; i++) {
          ctx.strokeStyle = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},0.15)`;
          ctx.beginPath();
          ctx.moveTo(Math.random()*canvas.width, Math.random()*canvas.height);
          ctx.lineTo(Math.random()*canvas.width, Math.random()*canvas.height);
          ctx.stroke();
        }
        ctx.font = 'bold 24px monospace';
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
  }, [captchaText, isEditingMobile, isUsingSmsToReset, isSmsVerified]);

  const handleSendSms = () => {
    setSmsTimer(60);
    const itv = setInterval(() => {
      setSmsTimer(t => {
        if (t <= 1) { clearInterval(itv); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const verifySmsStep = () => {
    if (mobileCaptcha.toUpperCase() !== captchaText || mobileSms.length < 4) {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 500);
      return;
    }
    setIsSmsVerified(true);
  };

  const getClampedOffset = useCallback((newOffset: { x: number, y: number }, currentZoom: number) => {
    if (!imageRef.current) return newOffset;
    const img = imageRef.current;
    const displayWidth = img.width * currentZoom;
    const displayHeight = img.height * currentZoom;
    const maxOffsetX = Math.max(0, (displayWidth - CROP_SIZE) / 2);
    const maxOffsetY = Math.max(0, (displayHeight - CROP_SIZE) / 2);
    return {
      x: Math.min(Math.max(newOffset.x, -maxOffsetX), maxOffsetX),
      y: Math.min(Math.max(newOffset.y, -maxOffsetY), maxOffsetY)
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = showCropper ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showCropper]);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setShowCropper(true);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        e.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const minZ = CROP_SIZE / Math.min(img.width, img.height);
    setMinZoom(minZ);
    if (zoom < minZ) setZoom(minZ);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const nextZoom = Math.min(Math.max(zoom + delta, minZoom), 5);
    const roundedZoom = parseFloat(nextZoom.toFixed(2));
    setZoom(roundedZoom);
    setOffset(prev => getClampedOffset(prev, roundedZoom));
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const rawOffset = { x: clientX - dragStart.x, y: clientY - dragStart.y };
    setOffset(getClampedOffset(rawOffset, zoom));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleCropSave = () => {
    if (!imageRef.current || !containerRef.current) return;
    const canvas = document.createElement('canvas');
    const size = 400; 
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const img = imageRef.current;
      const rect = containerRef.current.getBoundingClientRect();
      const circleRadius = CROP_SIZE / 2;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const displayWidth = img.width * zoom;
      const displayHeight = img.height * zoom;
      const sourceScale = img.naturalWidth / displayWidth;
      const cropX = (centerX - circleRadius - offset.x - (rect.width - displayWidth) / 2) * sourceScale;
      const cropY = (centerY - circleRadius - offset.y - (rect.height - displayHeight) / 2) * sourceScale;
      const cropSize = CROP_SIZE * sourceScale;
      ctx.drawImage(img, cropX, cropY, cropSize, cropSize, 0, 0, size, size);
      setProfile({ ...profile, avatar: canvas.toDataURL('image/jpeg', 0.9) });
      setShowCropper(false);
      setTempImage(null);
    }
  };

  const validatePassword = (pwd: string) => {
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    return pwd.length >= 8 && pwd.length <= 16 && hasLetter && hasNumber;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. 昵称校验
    if (profile.nickname.length === 0 || profile.nickname.length > 8) {
      setNicknameError(true);
      setTimeout(() => setNicknameError(false), 500);
      return;
    }

    let updatedProfile = { ...profile };

    // 2. 手机号校验
    if (isEditingMobile) {
      if ((oldMobileInput !== user.mobile && !user.mobile.includes('*')) || newMobile.length !== 11 || mobileSms.length < 4) {
         setMobileError(true);
         setTimeout(() => setMobileError(false), 500);
         return;
      }
      updatedProfile.mobile = newMobile;
    }

    // 3. 密码校验
    if (isEditingPassword) {
      if (isUsingSmsToReset && !isSmsVerified) {
        verifySmsStep();
        return;
      }

      if (!isUsingSmsToReset && hasExistingPassword && !oldPassword) { 
        setPasswordError(true);
        setTimeout(() => setPasswordError(false), 500);
        return; 
      }
      
      const isPwdValid = validatePassword(newPassword);
      if (!isPwdValid || newPassword !== confirmPassword) {
        setPasswordError(true);
        setTimeout(() => setPasswordError(false), 500);
        return;
      }
    }

    onUpdate(updatedProfile);
    setIsEditingMobile(false);
    setIsEditingPassword(false);
    setIsUsingSmsToReset(false);
    setIsSmsVerified(false);
    onClose(); 
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-slate-900">账号中心</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-36 h-36 rounded-full overflow-hidden border-[6px] border-white bg-slate-50 shadow-[0_15px_40px_rgba(0,0,0,0.08)]">
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-gradient-to-tr from-orange-600 to-red-500 text-white p-2.5 rounded-full shadow-xl ring-4 ring-white hover:scale-105 active:scale-95 transition-all"
                >
                  <Camera size={18} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
              </div>
            </div>

            <div className="space-y-8">
              {/* Nickname */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">显示昵称</label>
                   <span className={`text-[10px] font-medium ${nicknameError ? 'text-red-500' : 'text-slate-400'}`}>
                     {profile.nickname.length}/8
                   </span>
                </div>
                <div className={`relative group transition-all duration-300 ${nicknameError ? 'animate-shake-input' : ''}`}>
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${nicknameError ? 'text-red-500' : 'text-slate-300 group-focus-within:text-orange-500'}`} size={18} />
                  <input 
                    type="text" 
                    value={profile.nickname}
                    onChange={(e) => {
                      if (e.target.value.length <= 8) setProfile({...profile, nickname: e.target.value});
                      if (nicknameError) setNicknameError(false);
                    }}
                    placeholder="设置您的昵称 (最多8字)"
                    className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none transition-all text-sm font-semibold 
                      ${nicknameError ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-700'}
                    `}
                  />
                </div>
              </div>

              {/* Mobile Update */}
              <div className="space-y-3">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">手机绑定</label>
                  {!isEditingMobile && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsEditingMobile(true);
                        generateCaptcha();
                      }}
                      className="text-xs text-orange-600 font-bold hover:text-orange-700 transition-colors flex items-center"
                    >
                      <Smartphone size={12} className="mr-1" /> 修改号码
                    </button>
                  )}
                </div>
                
                {!isEditingMobile ? (
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="tel" 
                      value={profile.mobile}
                      disabled
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-slate-100 rounded-2xl text-sm font-semibold text-slate-400 cursor-not-allowed"
                    />
                  </div>
                ) : (
                  <div className={`space-y-3 animate-in fade-in slide-in-from-top-2 ${mobileError ? 'animate-shake-input' : ''}`}>
                    <div className="relative">
                      <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 ${mobileError ? 'text-red-500' : 'text-slate-300'}`} size={18} />
                      <input 
                        type="tel" 
                        placeholder="请输入完整原手机号" 
                        value={oldMobileInput}
                        onChange={(e) => {
                          setOldMobileInput(e.target.value);
                          if (mobileError) setMobileError(false);
                        }}
                        className={`w-full pl-12 pr-4 py-3.5 border rounded-xl text-sm outline-none transition-all
                          ${mobileError ? 'border-red-500 bg-red-50' : 'bg-white border-orange-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'}
                        `}
                      />
                    </div>
                    <div className="relative">
                      <Smartphone className={`absolute left-4 top-1/2 -translate-y-1/2 ${mobileError ? 'text-red-500' : 'text-slate-300'}`} size={18} />
                      <input 
                        type="tel" 
                        placeholder="请输入新的 11 位手机号" 
                        value={newMobile}
                        onChange={(e) => {
                          setNewMobile(e.target.value);
                          if (mobileError) setMobileError(false);
                        }}
                        className={`w-full pl-12 pr-4 py-3.5 border rounded-xl text-sm outline-none transition-all
                          ${mobileError ? 'border-red-500 bg-red-50' : 'bg-white border-orange-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'}
                        `}
                      />
                    </div>
                    <div className="flex space-x-3">
                      <div className="relative flex-1">
                        <ShieldAlert className={`absolute left-4 top-1/2 -translate-y-1/2 ${mobileError ? 'text-red-500' : 'text-slate-300'}`} size={18} />
                        <input 
                          type="text" 
                          placeholder="图形验证码" 
                          value={mobileCaptcha}
                          onChange={(e) => setMobileCaptcha(e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl text-xs outline-none transition-all
                             ${mobileError ? 'border-red-400' : 'border-slate-100 focus:border-orange-400'}
                          `}
                        />
                      </div>
                      <div onClick={generateCaptcha} className="bg-slate-50 border border-slate-100 rounded-xl flex items-center p-0.5 cursor-pointer hover:bg-slate-100 transition-colors">
                        <canvas ref={canvasRef} width="90" height="36" className="rounded-lg opacity-80"></canvas>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <div className="relative flex-1">
                        <ShieldCheck className={`absolute left-4 top-1/2 -translate-y-1/2 ${mobileError ? 'text-red-500' : 'text-slate-300'}`} size={18} />
                        <input 
                          type="text" 
                          placeholder="短信验证码" 
                          value={mobileSms}
                          onChange={(e) => setMobileSms(e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl text-xs outline-none transition-all
                             ${mobileError ? 'border-red-400' : 'border-slate-100 focus:border-orange-400'}
                          `}
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={handleSendSms}
                        disabled={smsTimer > 0}
                        className="px-4 bg-slate-900 text-white text-[10px] font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-40 min-w-[95px]"
                      >
                        {smsTimer > 0 ? `${smsTimer}s` : '获取验证码'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Password Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">登录密码</label>
                  {!isEditingPassword && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsEditingPassword(true);
                        setIsSmsVerified(false);
                        setPasswordError(false);
                        setOldPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="text-xs text-orange-600 font-bold hover:text-orange-700 transition-colors flex items-center"
                    >
                      <Lock size={12} className="mr-1" /> {hasExistingPassword ? '修改登录密码' : '设置初始密码'}
                    </button>
                  )}
                </div>
                
                {!isEditingPassword ? (
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="password" 
                      value="●●●●●●●●" 
                      disabled
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-slate-100 rounded-2xl text-sm font-medium text-slate-300 cursor-not-allowed"
                    />
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    {hasExistingPassword && !isUsingSmsToReset && (
                      <div className="relative group">
                        <KeyRound className={`absolute left-4 top-1/2 -translate-y-1/2 ${passwordError ? 'text-red-500' : 'text-slate-300'}`} size={18} />
                        <input 
                          type={showPassword ? "text" : "password"}
                          placeholder="当前账号原密码" 
                          value={oldPassword}
                          onChange={(e) => {
                            setOldPassword(e.target.value);
                            if (passwordError) setPasswordError(false);
                          }}
                          className={`w-full pl-12 pr-20 py-3.5 border rounded-xl text-sm outline-none transition-all
                             ${passwordError ? 'border-red-500 bg-red-50' : 'bg-white border-orange-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'}
                          `}
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            setIsUsingSmsToReset(true);
                            setIsSmsVerified(false);
                            generateCaptcha();
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-orange-600 font-bold hover:underline"
                        >
                          忘记？
                        </button>
                      </div>
                    )}

                    {isUsingSmsToReset && !isSmsVerified && (
                      <div className={`space-y-3 p-4 bg-orange-50/50 rounded-2xl border border-orange-100 animate-in fade-in slide-in-from-left-2 ${passwordError ? 'animate-shake-input' : ''}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider flex items-center">
                            <Smartphone size={12} className="mr-1" /> 短信找回验证
                          </span>
                          <button 
                            type="button" 
                            onClick={() => setIsUsingSmsToReset(false)}
                            className="text-[10px] text-slate-400 hover:text-slate-600"
                          >
                            返回
                          </button>
                        </div>
                        <div className="flex space-x-2">
                          <div className="relative flex-1">
                            <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input 
                              type="text" 
                              placeholder="图形码" 
                              value={mobileCaptcha}
                              onChange={(e) => setMobileCaptcha(e.target.value)}
                              className="w-full pl-9 pr-2 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-orange-400"
                            />
                          </div>
                          <div onClick={generateCaptcha} className="bg-white border border-slate-200 rounded-xl flex items-center px-1 cursor-pointer">
                            <canvas ref={canvasRef} width="60" height="28" className="opacity-80"></canvas>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="relative flex-1">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input 
                              type="text" 
                              placeholder="验证码" 
                              value={mobileSms}
                              onChange={(e) => setMobileSms(e.target.value)}
                              className="w-full pl-9 pr-2 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-orange-400"
                            />
                          </div>
                          <button 
                            type="button"
                            onClick={handleSendSms}
                            disabled={smsTimer > 0}
                            className="px-3 bg-slate-900 text-white text-[10px] font-bold rounded-xl hover:bg-slate-800 disabled:opacity-40"
                          >
                            {smsTimer > 0 ? `${smsTimer}s` : '获取'}
                          </button>
                        </div>
                        <button 
                          type="button" 
                          onClick={verifySmsStep}
                          className="w-full py-2 bg-orange-600 text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition-colors"
                        >
                          验证身份
                        </button>
                      </div>
                    )}

                    {(!isUsingSmsToReset || isSmsVerified) && (
                      <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                        {isSmsVerified && (
                          <div className="flex items-center space-x-1.5 px-1">
                            <Check className="text-green-500" size={12} />
                            <span className="text-[10px] font-bold text-green-600">验证成功，请重置密码</span>
                          </div>
                        )}
                        <div className="relative">
                          <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${passwordError ? 'text-red-500' : 'text-slate-300'}`} size={18} />
                          <input 
                            type={showPassword ? "text" : "password"}
                            placeholder="新密码" 
                            value={newPassword}
                            autoComplete="new-password"
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              if (passwordError) setPasswordError(false);
                            }}
                            className={`w-full pl-12 pr-12 py-3.5 border rounded-xl text-sm outline-none transition-all
                              ${passwordError ? 'border-red-500 bg-red-50 focus:ring-red-500/20' : 'bg-white border-orange-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'}
                            `}
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${passwordError ? 'text-red-500' : 'text-slate-300'}`} size={18} />
                          <input 
                            type={showPassword ? "text" : "password"}
                            placeholder="再次输入新密码" 
                            value={confirmPassword}
                            autoComplete="new-password"
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (passwordError) setPasswordError(false);
                            }}
                            className={`w-full pl-12 pr-12 py-3.5 border rounded-xl text-sm outline-none transition-all
                              ${passwordError ? 'border-red-500 bg-red-50 focus:ring-red-500/20' : 'bg-white border-orange-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'}
                            `}
                          />
                        </div>
                        <div className={`flex items-start space-x-2 p-3 rounded-xl border transition-all duration-300
                          ${passwordError ? 'bg-red-50 text-red-600 border-red-200 animate-shake-rule' : 'bg-blue-50/50 text-blue-600 border-blue-100'}
                        `}>
                          <Info size={14} className="mt-0.5 shrink-0" />
                          <p className="text-[11px] leading-relaxed">密码需 8-16 位，包含字母和数字。</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 space-y-4">
              <button 
                type="submit"
                className="w-full bg-slate-900 text-white py-4.5 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center active:scale-[0.98]"
              >
                <Save size={18} className="mr-2" />
                保存全部修改
              </button>
              <button 
                type="button"
                onClick={onLogout}
                className="w-full bg-white text-red-500 border border-red-100 py-4.5 rounded-2xl font-bold hover:bg-red-50 transition-all flex items-center justify-center active:scale-[0.98]"
              >
                <LogOut size={18} className="mr-2" />
                退出当前登录
              </button>
            </div>
          </form>
        </div>

        {/* Cropper Modal (Unchanged) */}
        {showCropper && tempImage && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowCropper(false)}></div>
            <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
              <div className="p-6 border-b flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                    <Camera size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900">调整头像展示</h3>
                </div>
                <button onClick={() => setShowCropper(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
              </div>
              <div className="flex-1 bg-slate-200 relative overflow-hidden cursor-move flex items-center justify-center min-h-[350px]"
                   ref={containerRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel} onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp}>
                <img ref={imageRef} src={tempImage} alt="Crop" onLoad={handleImageLoad} draggable={false} className="max-w-none transition-transform duration-75 ease-out select-none" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }} />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="relative border-2 border-white/60 shadow-[0_0_0_9999px_rgba(15,23,42,0.6)] rounded-full" style={{ width: `${CROP_SIZE}px`, height: `${CROP_SIZE}px` }}>
                    <div className="absolute inset-0 border border-white/20 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-white space-y-6 shrink-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center"><ZoomIn size={14} className="mr-1" /> 放大/缩小预览</span>
                    <span className="text-orange-600">{(zoom * 100).toFixed(0)}%</span>
                  </div>
                  <input type="range" min={minZoom} max="5" step="0.01" value={zoom} onChange={(e) => {
                    const next = parseFloat(e.target.value); setZoom(next); setOffset(prev => getClampedOffset(prev, next));
                  }} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600" />
                </div>
                <div className="flex space-x-4">
                  <button onClick={() => setShowCropper(false)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-colors">取消</button>
                  <button onClick={handleCropSave} className="flex-[2] bg-gradient-to-r from-orange-600 to-red-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-orange-100 flex items-center justify-center hover:opacity-90 transition-opacity"><Check size={18} className="mr-2" />确认并应用</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        .py-4\.5 { padding-top: 1.125rem; padding-bottom: 1.125rem; }
        
        @keyframes shake-input {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake-input {
          animation: shake-input 0.4s ease-in-out;
        }

        @keyframes shake-rule {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        .animate-shake-rule {
          animation: shake-rule 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AccountSettings;