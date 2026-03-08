
import React, { useState, useRef } from 'react';
import { FileText, Upload, Download, Save, Globe, Loader2, CheckCircle2, AlertCircle, Sparkles, ChevronRight, Printer, X } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { extractFormData } from '../services/geminiService';

interface FormFillingZoneProps {}

const COUNTRIES = [
  { id: 'spain', name: '西班牙 (Spain)', flag: '🇪🇸', available: true },
  { id: 'france', name: '法国 (France)', flag: '🇫🇷', available: false },
  { id: 'germany', name: '德国 (Germany)', flag: '🇩🇪', available: false },
  { id: 'italy', name: '意大利 (Italy)', flag: '🇮🇹', available: false },
];

const FormFillingZone: React.FC<FormFillingZoneProps> = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [importedFiles, setImportedFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCountrySelect = (id: string) => {
    if (id === 'spain') setSelectedCountry(id);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setImportedFiles(prev => [...prev, ...fileArray]);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (indexToRemove: number) => {
    setImportedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleStartExtraction = async () => {
    if (importedFiles.length === 0) return;

    setIsImporting(true);
    try {
      const results = await Promise.all(importedFiles.map(file => extractFormData(file, 'Spain')));
      
      // Merge all results
      const mergedData = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      
      setFormData((prev: any) => ({ ...prev, ...mergedData }));
      setImportedFiles([]); // Clear files after successful import
      alert("信息提取成功！已自动填充到表单。");
    } catch (error) {
      console.error("Import failed", error);
      alert("智能提取失败，请重试");
    } finally {
      setIsImporting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const downloadPdf = () => {
    const element = document.getElementById('visa-application-form');
    if (!element) return;

    const opt = {
      margin: 0,
      filename: `Visa_Application_${formData.surname || 'Form'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  if (!selectedCountry) {
    return (
      <div className="max-w-6xl mx-auto px-4 pt-32 pb-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">选择申请国家</h2>
          <p className="text-slate-500">选择您要申请的申根国家，我们将为您提供对应的标准申请表模板</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COUNTRIES.map((country) => (
            <div 
              key={country.id}
              onClick={() => country.available && handleCountrySelect(country.id)}
              className={`relative group bg-white rounded-3xl p-6 border-2 transition-all duration-300 ${
                country.available 
                  ? 'border-slate-100 hover:border-orange-500 cursor-pointer hover:shadow-xl hover:-translate-y-1' 
                  : 'border-slate-50 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="text-6xl mb-6">{country.flag}</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{country.name}</h3>
              <div className="flex items-center justify-between mt-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  country.available ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  {country.available ? '立即申请' : '即将上线'}
                </span>
                {country.available && <ChevronRight className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pt-32 relative">
      {/* Back Button */}
      <div className="absolute left-4 top-8 lg:top-32">
        <button 
          onClick={() => setSelectedCountry(null)}
          className="text-slate-500 hover:text-slate-800 font-bold flex items-center"
        >
          <ChevronRight className="rotate-180 mr-1" /> 返回国家选择
        </button>
      </div>

      <div className="flex flex-col items-center justify-center w-full space-y-6 mb-12">
        
        {/* 1. Top Row: Action Buttons */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-600 px-6 py-3 rounded-xl font-bold text-sm flex items-center transition-all shadow-sm"
          >
            <Upload className="mr-2" size={18} />
            上传文件
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            multiple
            onChange={handleFileSelect}
          />

          <button 
            onClick={handleStartExtraction}
            disabled={isImporting || importedFiles.length === 0}
            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center transition-all shadow-sm ${
              importedFiles.length > 0 
                ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-200' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isImporting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Sparkles className="mr-2" size={18} />}
            {isImporting ? '智能提取中...' : '开始智能提取'}
          </button>
        </div>

        {/* 2. Middle: File List Box */}
        <div className="w-full max-w-2xl bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4 transition-all">
          {importedFiles.length > 0 ? (
            <div className="w-full max-h-[240px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {importedFiles.map((file, index) => (
                <div key={index} className="bg-white border border-slate-200 text-slate-700 text-sm px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center overflow-hidden flex-1 mr-4">
                    <FileText size={16} className="mr-3 text-orange-500 flex-shrink-0" />
                    <span className="truncate font-medium">{file.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                     <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                     <button 
                       onClick={() => removeFile(index)}
                       className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1 transition-all"
                       title="Remove file"
                     >
                       <X size={16} />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[120px] flex flex-col items-center justify-center text-center text-slate-400">
              <Upload size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm font-medium">暂无文件，请点击上方按钮上传</p>
              <p className="text-xs mt-1 opacity-70">支持 PDF, Word, JPG, PNG</p>
            </div>
          )}
        </div>

        {/* 3. Bottom: Tabs */}
        <div className="flex bg-white rounded-xl p-1.5 shadow-sm border border-slate-200">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'edit' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            填写内容
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'preview' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            预览表格
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        {/* Form Input Panel */}
        <div className={`w-full max-w-3xl transition-all duration-300 ${activeTab === 'edit' ? 'block' : 'hidden'}`}>
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center">
                <FileText className="mr-2 text-orange-500" size={20} />
                填写申请信息
              </h3>
            </div>
            <div className="p-6 space-y-6">
              
              {/* Personal Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">个人信息 (Personal Information)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">姓 (Surname)</label>
                    <input type="text" name="surname" value={formData.surname || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">出生时姓氏 (Surname at birth)</label>
                    <input type="text" name="surnameAtBirth" value={formData.surnameAtBirth || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" placeholder="If different" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">名 (First Name)</label>
                    <input type="text" name="firstname" value={formData.firstname || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">出生日期 (Date of Birth)</label>
                    <input type="text" name="dateOfBirth" placeholder="DD-MM-YYYY" value={formData.dateOfBirth || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">出生地 (Place of Birth)</label>
                    <input type="text" name="placeOfBirth" value={formData.placeOfBirth || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">国籍 (Current Nationality)</label>
                    <input type="text" name="currentNationality" value={formData.currentNationality || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">性别 (Sex)</label>
                    <select name="gender" value={formData.gender || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold">
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">婚姻状况 (Marital Status)</label>
                    <select name="maritalStatus" value={formData.maritalStatus || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold">
                      <option value="">Select...</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widow">Widow</option>
                    </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">身份证号 (National ID Number)</label>
                   <input type="text" name="nationalId" value={formData.nationalId || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                </div>
              </div>

              {/* Passport Info */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">护照信息 (Travel Document)</h4>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">旅行证件类型 (Type)</label>
                    <select name="passportType" value={formData.passportType || 'Ordinary Passport'} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold">
                        <option value="Ordinary Passport">Ordinary Passport (普通护照)</option>
                        <option value="Diplomatic Passport">Diplomatic Passport (外交护照)</option>
                        <option value="Service Passport">Service Passport (公务护照)</option>
                        <option value="Official Passport">Official Passport (因公普通护照)</option>
                        <option value="Other">Other (其他)</option>
                    </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">护照号码 (Passport Number)</label>
                   <input type="text" name="passportNumber" value={formData.passportNumber || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">签发日期 (Issue Date)</label>
                    <input type="text" name="issueDate" placeholder="DD-MM-YYYY" value={formData.issueDate || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">有效期至 (Expiry Date)</label>
                    <input type="text" name="expiryDate" placeholder="DD-MM-YYYY" value={formData.expiryDate || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                  </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">签发机关 (Issued By)</label>
                   <input type="text" name="issuedBy" value={formData.issuedBy || 'CHINA'} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">联系方式 (Contact Info)</h4>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">家庭住址 (Home Address)</label>
                   <textarea name="homeAddress" value={formData.homeAddress || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold h-20" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">电子邮箱 (Email)</label>
                   <input type="text" name="email" value={formData.email || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">手机号码 (Mobile Phone)</label>
                   <input type="text" name="mobilePhone" value={formData.mobilePhone || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                </div>
              </div>

              {/* Occupation */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">职业信息 (Occupation)</h4>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">当前职业 (Current Occupation)</label>
                   <input type="text" name="occupation" value={formData.occupation || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">雇主/学校名称 (Employer/School Name)</label>
                   <input type="text" name="employerName" value={formData.employerName || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">雇主/学校地址 (Address)</label>
                   <textarea name="employerAddress" value={formData.employerAddress || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold h-20" />
                </div>
              </div>

              {/* Trip Details */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">旅行信息 (Trip Details)</h4>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">旅行目的 (Purpose)</label>
                    <select name="purpose" value={formData.purpose || 'Tourism'} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold">
                        <option value="Tourism">Tourism (旅游)</option>
                        <option value="Business">Business (商务)</option>
                        <option value="Visiting Family/Friends">Visiting Family/Friends (探亲访友)</option>
                        <option value="Cultural">Cultural (文化)</option>
                        <option value="Sports">Sports (体育)</option>
                        <option value="Official Visit">Official Visit (官方访问)</option>
                        <option value="Medical Reasons">Medical Reasons (医疗)</option>
                        <option value="Study">Study (学习)</option>
                        <option value="Other">Other (其他)</option>
                    </select>
                    {formData.purpose === 'Other' && (
                        <input type="text" name="otherPurpose" placeholder="Please specify" value={formData.otherPurpose || ''} onChange={handleInputChange} className="w-full mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                    )}
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">主要目的地 (Member State of Destination)</label>
                   <input type="text" name="memberStateOfDestination" value={formData.memberStateOfDestination || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">首入申根国 (Member State of First Entry)</label>
                   <input type="text" name="memberStateOfFirstEntry" value={formData.memberStateOfFirstEntry || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">入境次数 (Entries)</label>
                    <select name="entries" value={formData.entries || 'Multiple Entries'} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold">
                        <option value="Single Entry">Single Entry (单次)</option>
                        <option value="Two Entries">Two Entries (两次)</option>
                        <option value="Multiple Entries">Multiple Entries (多次)</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">预计入境日期 (Arrival)</label>
                    <input type="text" name="intendedDateOfArrival" placeholder="DD-MM-YYYY" value={formData.intendedDateOfArrival || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">预计离境日期 (Departure)</label>
                    <input type="text" name="intendedDateOfDeparture" placeholder="DD-MM-YYYY" value={formData.intendedDateOfDeparture || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                  </div>
                </div>
              </div>

              {/* Accommodation */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">住宿信息 (Accommodation)</h4>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">酒店/邀请人名称 (Name of Hotel/Host)</label>
                   <input type="text" name="hotelName" value={formData.hotelName || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">地址 (Address)</label>
                   <textarea name="hotelAddress" value={formData.hotelAddress || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold h-20" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">电话 (Telephone)</label>
                   <input type="text" name="hotelPhone" value={formData.hotelPhone || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">旅费支付方式 (Cost Coverage)</label>
                    <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2 text-xs font-bold text-slate-600">
                            <input type="checkbox" name="costCash" checked={formData.costCash || false} onChange={(e) => setFormData({...formData, costCash: e.target.checked})} className="rounded text-orange-500 focus:ring-orange-500" />
                            <span>Cash (现金)</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs font-bold text-slate-600">
                            <input type="checkbox" name="costCreditCard" checked={formData.costCreditCard || false} onChange={(e) => setFormData({...formData, costCreditCard: e.target.checked})} className="rounded text-orange-500 focus:ring-orange-500" />
                            <span>Credit Card (信用卡)</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs font-bold text-slate-600">
                            <input type="checkbox" name="costPrepaidAccom" checked={formData.costPrepaidAccom || false} onChange={(e) => setFormData({...formData, costPrepaidAccom: e.target.checked})} className="rounded text-orange-500 focus:ring-orange-500" />
                            <span>Prepaid Accom (预缴住宿)</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs font-bold text-slate-600">
                            <input type="checkbox" name="costPrepaidTransport" checked={formData.costPrepaidTransport || false} onChange={(e) => setFormData({...formData, costPrepaidTransport: e.target.checked})} className="rounded text-orange-500 focus:ring-orange-500" />
                            <span>Prepaid Transport (预缴交通)</span>
                        </label>
                    </div>
                </div>
              </div>

              {/* Application Details */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">申请详情 (Application Details)</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">申请地点 (Place)</label>
                        <input type="text" name="placeOfApplication" value={formData.placeOfApplication || 'Chengdu'} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">申请日期 (Date)</label>
                        <input type="text" name="dateOfApplication" value={formData.dateOfApplication || new Date().toLocaleDateString()} onChange={handleInputChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold" />
                    </div>
                </div>
              </div>

              {/* Export Button */}
              <div className="pt-6 pb-2">
                <button 
                  onClick={downloadPdf}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                  <Download className="mr-2" size={20} /> 导出 PDF 申请表
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className={`w-full max-w-4xl transition-all duration-300 ${activeTab === 'preview' ? 'block' : 'hidden'}`}>
           <div className="bg-slate-200/50 rounded-[2rem] p-8 h-full min-h-[800px] flex flex-col items-center overflow-auto">
             <div id="visa-application-form" className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[10mm] relative text-[10px] font-serif leading-tight mb-8">
               
               {/* Header */}
               <div className="flex justify-between items-start mb-4 border-b-2 border-black pb-2">
                  <div className="w-1/3">
                    <div className="bg-blue-800 text-yellow-400 w-16 h-10 flex items-center justify-center font-bold text-xs">EU Flag</div>
                  </div>
                  <div className="w-1/3 text-center">
                    <h1 className="font-bold text-lg uppercase">Solicitud de visado Schengen</h1>
                    <h2 className="font-bold text-md">Application for Schengen Visa</h2>
                    <h2 className="font-bold text-md">申根签证申请</h2>
                    <p className="text-[8px] mt-1">Impreso gratuito / This application form is free / 此表格免费提供</p>
                  </div>
                  <div className="w-1/3 flex justify-end">
                    <div className="border border-black w-[35mm] h-[45mm] flex items-center justify-center text-center text-gray-400">
                      FOTO<br/>PHOTO<br/>照片
                    </div>
                  </div>
               </div>

               {/* Form Grid */}
               <div className="grid grid-cols-2 border-t border-l border-black">
                 {/* Row 1 */}
                 <div className="col-span-1 border-r border-b border-black p-1">
                   <div className="text-[8px] text-gray-600">1. Apellido(s)/Surname(s) / 姓:</div>
                   <div className="font-bold text-sm mt-1 uppercase">{formData.surname}</div>
                 </div>
                 <div className="col-span-1 border-r border-b border-black p-1 bg-slate-100">
                   <div className="font-bold">PARTE RESERVADA A LA ADMINISTRACIÓN</div>
                 </div>

                 {/* Row 2 */}
                 <div className="col-span-1 border-r border-b border-black p-1">
                   <div className="text-[8px] text-gray-600">2. Apellido(s) de nacimiento / Surname at birth / 出生时姓氏:</div>
                   <div className="font-bold text-sm mt-1 uppercase">{formData.surnameAtBirth || formData.surname}</div>
                 </div>
                 <div className="col-span-1 border-r border-b border-black p-1 bg-slate-100">
                   {/* Official Use Only Section Placeholder */}
                 </div>

                 {/* Row 3 */}
                 <div className="col-span-1 border-r border-b border-black p-1">
                   <div className="text-[8px] text-gray-600">3. Nombre(s) / First name(s) / 名:</div>
                   <div className="font-bold text-sm mt-1 uppercase">{formData.firstname}</div>
                 </div>
                 <div className="col-span-1 border-r border-b border-black p-1 bg-slate-100"></div>

                 {/* Row 4: DOB, Birth Place */}
                 <div className="col-span-1 border-r border-b border-black p-0 grid grid-cols-2">
                    <div className="border-r border-black p-1">
                      <div className="text-[8px] text-gray-600">4. Fecha de nacimiento / Date of birth / 出生日期:</div>
                      <div className="font-bold text-sm mt-1">{formData.dateOfBirth}</div>
                    </div>
                    <div className="p-1">
                      <div className="text-[8px] text-gray-600">5. Lugar de nacimiento / Place of birth / 出生地:</div>
                      <div className="font-bold text-sm mt-1 uppercase">{formData.placeOfBirth}</div>
                    </div>
                 </div>
                 <div className="col-span-1 border-r border-b border-black p-1 bg-slate-100"></div>

                 {/* Row 5: Country of Birth, Nationality */}
                 <div className="col-span-1 border-r border-b border-black p-0 grid grid-cols-2">
                    <div className="border-r border-black p-1">
                      <div className="text-[8px] text-gray-600">6. País de nacimiento / Country of birth / 出生国:</div>
                      <div className="font-bold text-sm mt-1 uppercase">{formData.countryOfBirth || 'CHINA'}</div>
                    </div>
                    <div className="p-1">
                      <div className="text-[8px] text-gray-600">7. Nacionalidad actual / Current nationality / 现国籍:</div>
                      <div className="font-bold text-sm mt-1 uppercase">{formData.currentNationality || 'CHINESE'}</div>
                    </div>
                 </div>
                 <div className="col-span-1 border-r border-b border-black p-1 bg-slate-100"></div>

                 {/* Row 6: Sex, Marital Status */}
                 <div className="col-span-1 border-r border-b border-black p-0 grid grid-cols-2">
                    <div className="border-r border-black p-1">
                      <div className="text-[8px] text-gray-600">8. Sexo / Sex / 性别:</div>
                      <div className="mt-1">
                         <span className={formData.gender === 'Male' ? 'font-bold' : ''}>□ Varón/Male/男</span><br/>
                         <span className={formData.gender === 'Female' ? 'font-bold' : ''}>□ Mujer/Female/女</span>
                      </div>
                    </div>
                    <div className="p-1">
                      <div className="text-[8px] text-gray-600">9. Estado civil / Marital status / 婚姻状况:</div>
                      <div className="mt-1 text-[8px]">
                         <span className={formData.maritalStatus === 'Single' ? 'font-bold' : ''}>□ Soltero/Single/未婚</span> &nbsp;
                         <span className={formData.maritalStatus === 'Married' ? 'font-bold' : ''}>□ Casado/Married/已婚</span>
                      </div>
                    </div>
                 </div>
                 <div className="col-span-1 border-r border-b border-black p-1 bg-slate-100"></div>

                 {/* Row 7: National ID */}
                 <div className="col-span-1 border-r border-b border-black p-1">
                   <div className="text-[8px] text-gray-600">11. Número de documento nacional de identidad / National identity number / 公民身份证号码:</div>
                   <div className="font-bold text-sm mt-1">{formData.nationalId}</div>
                 </div>
                 <div className="col-span-1 border-r border-b border-black p-1 bg-slate-100"></div>

                 {/* Row 8: Passport Type */}
                 <div className="col-span-1 border-r border-b border-black p-1">
                   <div className="text-[8px] text-gray-600">12. Tipo de documento de viaje / Type of travel document / 旅行证件类型:</div>
                   <div className="mt-1 font-bold">
                     <span className={(!formData.passportType || formData.passportType === 'Ordinary Passport') ? 'font-black' : ''}>{(formData.passportType === 'Ordinary Passport' || !formData.passportType) ? '■' : '□'} Pasaporte ordinario / Ordinary Passport / 普通护照</span><br/>
                     <span className={formData.passportType === 'Diplomatic Passport' ? 'font-black' : ''}>{formData.passportType === 'Diplomatic Passport' ? '■' : '□'} Pasaporte diplomático / Diplomatic / 外交护照</span><br/>
                     <span className={formData.passportType === 'Service Passport' ? 'font-black' : ''}>{formData.passportType === 'Service Passport' ? '■' : '□'} Pasaporte de servicio / Service / 公务护照</span>
                   </div>
                 </div>
                 <div className="col-span-1 border-r border-b border-black p-1 bg-slate-100"></div>

                 {/* Row 9: Passport Details */}
                 <div className="col-span-1 border-r border-b border-black p-0 grid grid-cols-4">
                    <div className="border-r border-black p-1 col-span-1">
                      <div className="text-[8px] text-gray-600">13. Número / Number / 号码:</div>
                      <div className="font-bold text-xs mt-1">{formData.passportNumber}</div>
                    </div>
                    <div className="border-r border-black p-1 col-span-1">
                      <div className="text-[8px] text-gray-600">14. Fecha exp / Date of issue / 签发日期:</div>
                      <div className="font-bold text-xs mt-1">{formData.issueDate}</div>
                    </div>
                    <div className="border-r border-black p-1 col-span-1">
                      <div className="text-[8px] text-gray-600">15. Válido hasta / Valid until / 有效期至:</div>
                      <div className="font-bold text-xs mt-1">{formData.expiryDate}</div>
                    </div>
                    <div className="p-1 col-span-1">
                      <div className="text-[8px] text-gray-600">16. Expedido por / Issued by / 签发机关:</div>
                      <div className="font-bold text-xs mt-1">{formData.issuedBy || 'CHINA'}</div>
                    </div>
                 </div>
                 <div className="col-span-1 border-r border-b border-black p-1 bg-slate-100"></div>

                 {/* Row 10: Address & Email */}
                 <div className="col-span-1 border-r border-b border-black p-0 grid grid-cols-2">
                    <div className="border-r border-black p-1">
                      <div className="text-[8px] text-gray-600">19. Domicilio postal / Applicant's home address / 申请人住址:</div>
                      <div className="font-bold text-xs mt-1">{formData.homeAddress}</div>
                      <div className="font-bold text-xs mt-1">{formData.email}</div>
                    </div>
                    <div className="p-1">
                      <div className="text-[8px] text-gray-600">Teléfono / Telephone number / 电话号码:</div>
                      <div className="font-bold text-xs mt-1">{formData.mobilePhone}</div>
                    </div>
                 </div>
                 <div className="col-span-1 border-r border-b border-black p-1 bg-slate-100"></div>

                 {/* Row 11: Occupation */}
                 <div className="col-span-1 border-r border-b border-black p-1">
                   <div className="text-[8px] text-gray-600">21. Profesión actual / Current occupation / 当前职业:</div>
                   <div className="font-bold text-sm mt-1">{formData.occupation}</div>
                 </div>
                 <div className="col-span-1 border-r border-b border-black p-1 bg-slate-100"></div>

                 {/* Row 12: Employer */}
                 <div className="col-span-1 border-r border-b border-black p-1">
                   <div className="text-[8px] text-gray-600">22. Nombre, dirección y teléfono del empleador / Employer name, address and phone / 工作单位名称地址电话:</div>
                   <div className="font-bold text-xs mt-1">{formData.employerName}</div>
                   <div className="font-bold text-xs">{formData.employerAddress}</div>
                 </div>
                 <div className="col-span-1 border-r border-b border-black p-1 bg-slate-100"></div>

                 {/* Row 13: Purpose of Journey */}
                 <div className="col-span-1 border-r border-b border-black p-1">
                   <div className="text-[8px] text-gray-600">23. Motivo(s) del viaje / Main purpose(s) of the journey / 旅行目的:</div>
                   <div className="mt-1 font-bold text-[9px] grid grid-cols-2 gap-x-2">
                     <span>{(formData.purpose === 'Tourism' || !formData.purpose) ? '■' : '□'} Turismo / Tourism / 旅游</span>
                     <span>{formData.purpose === 'Business' ? '■' : '□'} Negocios / Business / 商务</span>
                     <span>{formData.purpose === 'Visiting Family/Friends' ? '■' : '□'} Visita a familiares / Visiting Family / 探亲访友</span>
                     <span>{formData.purpose === 'Cultural' ? '■' : '□'} Cultural / 文化</span>
                     <span>{formData.purpose === 'Sports' ? '■' : '□'} Sports / 体育</span>
                     <span>{formData.purpose === 'Official Visit' ? '■' : '□'} Visita oficial / Official / 官方</span>
                     <span>{formData.purpose === 'Medical Reasons' ? '■' : '□'} Motivos médicos / Medical / 医疗</span>
                     <span>{formData.purpose === 'Study' ? '■' : '□'} Estudios / Study / 学习</span>
                     <span className="col-span-2">{formData.purpose === 'Other' ? '■' : '□'} Otro / Other / 其他: {formData.purpose === 'Other' ? (formData.otherPurpose || '__________') : ''}</span>
                   </div>
                 </div>
                 <div className="col-span-1 border-r border-b border-black p-1 bg-slate-100"></div>

                 {/* Row 14: Destination */}
                 <div className="col-span-1 border-r border-b border-black p-1">
                   <div className="text-[8px] text-gray-600">25. Estado miembro de destino principal / Member State of main destination / 主要申根目的地:</div>
                   <div className="font-bold text-sm mt-1">{formData.memberStateOfDestination}</div>
                 </div>
                 <div className="col-span-1 border-r border-b border-black p-1 bg-slate-100"></div>

                 {/* Row 15: First Entry */}
                 <div className="col-span-1 border-r border-b border-black p-1">
                   <div className="text-[8px] text-gray-600">26. Estado miembro de primera entrada / Member State of first entry / 首入申根国:</div>
                   <div className="font-bold text-sm mt-1">{formData.memberStateOfFirstEntry}</div>
                 </div>
                 <div className="col-span-1 border-r border-b border-black p-1 bg-slate-100"></div>

                 {/* Row 16: Entries */}
                 <div className="col-span-1 border-r border-b border-black p-1">
                   <div className="text-[8px] text-gray-600">27. Número de entradas / Number of entries / 入境次数:</div>
                   <div className="mt-1 font-bold text-[9px]">
                     <span className={formData.entries === 'Single Entry' ? 'font-black' : ''}>{formData.entries === 'Single Entry' ? '■' : '□'} Una / Single / 单次</span> &nbsp;
                     <span className={formData.entries === 'Two Entries' ? 'font-black' : ''}>{formData.entries === 'Two Entries' ? '■' : '□'} Dos / Two / 两次</span> &nbsp;
                     <span className={(!formData.entries || formData.entries === 'Multiple Entries') ? 'font-black' : ''}>{(formData.entries === 'Multiple Entries' || !formData.entries) ? '■' : '□'} Múltiples / Multiple / 多次</span>
                   </div>
                 </div>
                 <div className="col-span-1 border-r border-b border-black p-1 bg-slate-100"></div>

                 {/* Row 17: Dates */}
                 <div className="col-span-1 border-r border-b border-black p-0 grid grid-cols-2">
                    <div className="border-r border-black p-1">
                      <div className="text-[8px] text-gray-600">28. Fecha de llegada / Intended date of arrival / 预计抵达日期:</div>
                      <div className="font-bold text-sm mt-1">{formData.intendedDateOfArrival}</div>
                    </div>
                    <div className="p-1">
                      <div className="text-[8px] text-gray-600">Fecha de salida / Intended date of departure / 预计离开日期:</div>
                      <div className="font-bold text-sm mt-1">{formData.intendedDateOfDeparture}</div>
                    </div>
                 </div>
                 <div className="col-span-1 border-r border-b border-black p-1 bg-slate-100"></div>

                 {/* Row 18: Hotel */}
                 <div className="col-span-2 border-r border-b border-black p-1">
                   <div className="text-[8px] text-gray-600">31. Apellido(s) y nombre(s) de la(s) persona(s) que han emitido la invitación en el Estado miembro... / Name and address of inviting person(s) or hotel(s) / 邀请人姓名或酒店名称地址:</div>
                   <div className="grid grid-cols-2 gap-4 mt-1">
                      <div>
                        <div className="font-bold text-sm">{formData.hotelName}</div>
                        <div className="font-bold text-xs">{formData.hotelAddress}</div>
                      </div>
                      <div>
                        <div className="text-[8px] text-gray-600">Teléfono / Telephone / 电话:</div>
                        <div className="font-bold text-sm">{formData.hotelPhone}</div>
                      </div>
                   </div>
                 </div>

                 {/* Row 19: Cost */}
                 <div className="col-span-2 border-r border-b border-black p-1">
                   <div className="text-[8px] text-gray-600">33. Los gastos de viaje y subsistencia / Cost of travelling and living / 旅费及生活费用:</div>
                   <div className="grid grid-cols-2 mt-1">
                      <div>
                        <div className="font-bold">■ por el propio solicitante / by the applicant himself / 由申请人支付</div>
                        <div className="ml-4 text-[8px]">
                          {formData.costCash ? '■' : '□'} Efectivo / Cash / 现金<br/>
                          {formData.costCreditCard ? '■' : '□'} Tarjeta de crédito / Credit card / 信用卡<br/>
                          {formData.costPrepaidAccom ? '■' : '□'} Alojamiento ya pagado / Pre-paid accommodation / 预缴住宿<br/>
                          {formData.costPrepaidTransport ? '■' : '□'} Transporte ya pagado / Pre-paid transport / 预缴交通
                        </div>
                      </div>
                      <div>
                        {/* Sponsor section */}
                      </div>
                   </div>
                 </div>

                 {/* Signature Section */}
                 <div className="col-span-2 border-r border-b border-black p-4 mt-4">
                    <div className="grid grid-cols-2 gap-8">
                       <div>
                         <div className="text-[8px] text-gray-600">Lugar y fecha / Place and date / 地点及日期:</div>
                         <div className="font-bold text-lg mt-4">{formData.placeOfApplication || 'Chengdu'}, {formData.dateOfApplication || new Date().toLocaleDateString()}</div>
                       </div>
                       <div>
                         <div className="text-[8px] text-gray-600">Firma / Signature / 签字:</div>
                         <div className="h-12 border-b border-black mt-4"></div>
                       </div>
                    </div>
                 </div>

               </div>
               
               <div className="mt-4 text-[8px] text-center text-gray-400">
                 V1.2024 - SPAIN SCHENGEN VISA APPLICATION FORM
               </div>
             </div>
             
             {/* Export Button for Preview */}
             <div className="pb-8">
                <button 
                  onClick={downloadPdf}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold text-lg flex items-center shadow-xl hover:shadow-2xl transition-all active:scale-95"
                >
                  <Download className="mr-2" size={20} /> 导出 PDF 申请表
                </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FormFillingZone;
