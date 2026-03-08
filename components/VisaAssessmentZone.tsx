import React, { useState, useRef } from 'react';
import { FileText, Upload, Download, Loader2, CheckCircle2, X, AlertTriangle, ShieldCheck, FileSearch, Sparkles, Globe } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import ReactMarkdown from 'react-markdown';
import { generateVisaAssessment } from '../services/geminiService';

const COUNTRY_CATEGORIES: Record<string, string[]> = {
  "申根国家": ["奥地利", "比利时", "捷克", "丹麦", "爱沙尼亚", "芬兰", "法国", "德国", "希腊", "匈牙利", "冰岛", "意大利", "拉脱维亚", "列支敦士登", "立陶宛", "卢森堡", "马耳他", "荷兰", "挪威", "波兰", "葡萄牙", "罗马尼亚", "斯洛伐克", "斯洛文尼亚", "西班牙", "瑞典", "瑞士"],
  "亚洲": ["日本", "韩国", "新加坡", "泰国", "越南"],
  "大洋洲": ["澳大利亚", "新西兰"],
  "北美": ["美国", "加拿大"],
  "欧洲(非申根)": ["英国", "爱尔兰", "塞尔维亚"]
};

const VisaAssessmentZone: React.FC = () => {
  const [importedFiles, setImportedFiles] = useState<File[]>([]);
  const [advantages, setAdvantages] = useState('');
  const [risks, setRisks] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [targetCountry, setTargetCountry] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assessmentReport, setAssessmentReport] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    setImportedFiles(prev => [...prev, ...fileArray]);
  };

  const handleAnalyze = async () => {
    if (importedFiles.length === 0) {
      alert("请先上传文件");
      return;
    }

    if (!targetCountry) {
      alert("请选择申请国家");
      return;
    }

    setIsAnalyzing(true);
    setAssessmentReport(null);

    try {
      // Add a 2-minute timeout to prevent infinite spinning
      const timeoutPromise = new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error("Analysis timed out. Please try again with fewer or smaller files.")), 120000)
      );

      const report = await Promise.race([
        generateVisaAssessment(importedFiles, advantages, risks, targetCountry),
        timeoutPromise
      ]);
      
      setAssessmentReport(report);
    } catch (error: any) {
      console.error("Analysis failed", error);
      alert(error.message || "分析失败，请重试");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadReportPdf = () => {
    const element = document.getElementById('assessment-report-content');
    if (!element) return;

    const opt: any = {
      margin: 20,
      filename: `Visa_Assessment_Report_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pt-32">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-4 flex items-center justify-center">
          <FileSearch className="mr-3 text-orange-500" size={32} />
          签证申请评估
        </h2>
        <p className="text-slate-500">
          基于大数据分析，结合您的申请材料与个人情况，为您提供客观中立的签证通过率评估与建议。
        </p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden p-8">
        
        {/* 0. Country Selection */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
            <Globe className="mr-2 text-blue-500" size={18} />
            申请国家 (Target Country)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => {
                const newCategory = e.target.value;
                setSelectedCategory(newCategory);
                // Reset country when category changes
                setTargetCountry('');
              }}
              className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold appearance-none cursor-pointer"
            >
              <option value="">洲/区域 (Region)</option>
              {Object.keys(COUNTRY_CATEGORIES).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select
              value={targetCountry}
              onChange={(e) => setTargetCountry(e.target.value)}
              disabled={!selectedCategory}
              className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">国家 (Country)</option>
              {selectedCategory && COUNTRY_CATEGORIES[selectedCategory]?.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 1. File Upload Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700 flex items-center">
              <Upload className="mr-2 text-orange-500" size={20} />
              上传申请材料 (Upload Documents)
            </h3>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-orange-50 text-orange-600 hover:bg-orange-100 px-4 py-2 rounded-lg font-bold text-sm flex items-center transition-all"
            >
              <Upload className="mr-2" size={16} />
              添加文件
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              multiple
              onChange={handleFileSelect}
            />
          </div>

          {/* File List */}
          <div 
            className={`w-full bg-slate-50 border-2 border-dashed ${isDragging ? 'border-orange-500 bg-orange-50' : 'border-slate-300'} rounded-2xl p-4 transition-all min-h-[120px] flex flex-col justify-center`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
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
              <div className="text-center text-slate-400 py-8">
                <Upload size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm font-medium">点击添加或将文件拖拽至此处上传</p>
                <p className="text-xs mt-1 opacity-70">支持 PDF, Word, JPG, PNG</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Remarks Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
              <ShieldCheck className="mr-2 text-green-500" size={18} />
              优势备注 (Advantages)
            </label>
            <textarea
              value={advantages}
              onChange={(e) => setAdvantages(e.target.value)}
              placeholder="例如：有发达国家出入境记录，名下有房产，工作稳定..."
              className="w-full h-32 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
              <AlertTriangle className="mr-2 text-red-500" size={18} />
              风险备注 (Risks)
            </label>
            <textarea
              value={risks}
              onChange={(e) => setRisks(e.target.value)}
              placeholder="例如：单身，无资产证明，自由职业，白本护照..."
              className="w-full h-32 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-sm resize-none"
            />
          </div>
        </div>

        {/* 3. Action Button */}
        <div className="flex justify-center mb-8">
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || importedFiles.length === 0}
            className={`w-full md:w-auto px-12 py-4 rounded-xl font-bold text-lg flex items-center justify-center shadow-lg transition-all active:scale-95 ${
              isAnalyzing || importedFiles.length === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl'
            }`}
          >
            {isAnalyzing ? <Loader2 className="animate-spin mr-2" size={24} /> : <Sparkles className="mr-2 text-orange-500" size={24} />}
            {isAnalyzing ? '正在深度分析中...' : '一键智能评估'}
          </button>
        </div>

        {/* 4. Report Section */}
        {assessmentReport && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-t-2 border-slate-100 pt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                  <FileText className="mr-2 text-orange-500" size={24} />
                  评估报告 (Assessment Report)
                </h3>
                <button 
                  onClick={downloadReportPdf}
                  className="bg-white border border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-600 px-4 py-2 rounded-lg font-bold text-sm flex items-center transition-all shadow-sm"
                >
                  <Download className="mr-2" size={16} />
                  导出报告 PDF
                </button>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-inner max-h-[800px] overflow-y-auto custom-scrollbar">
                <div id="assessment-report-content" className="prose prose-slate max-w-none p-4 bg-white">
                  {/* Custom Header for Report */}
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">签证评估报告</h1>
                    <p className="text-slate-400 text-sm">{new Date().toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  
                  <ReactMarkdown
                    components={{
                      h2: ({node, ...props}) => {
                        const text = String(props.children);
                        if (text.includes('核心优势')) {
                          return <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4" {...props} />;
                        } else if (text.includes('风险点')) {
                          return <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4 bg-red-50 inline-block px-2 py-1 rounded text-red-600" {...props} />;
                        } else if (text.includes('综合评估')) {
                          return <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4" {...props} />;
                        }
                        return <h2 className="text-xl font-bold text-slate-800 mt-6 mb-4" {...props} />;
                      },
                      blockquote: ({node, ...props}) => (
                        <div className="bg-red-50 text-red-500 p-4 rounded-lg text-sm font-medium mb-6 leading-relaxed border border-red-100">
                          {props.children}
                        </div>
                      ),
                      strong: ({node, ...props}) => {
                         const text = String(props.children);
                         if (text.includes('出签概率在')) {
                           return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">{props.children}</span>
                         }
                         return <strong className="font-bold text-slate-900" {...props} />
                      },
                      li: ({node, ...props}) => (
                        <li className="mb-2 text-slate-700 leading-relaxed" {...props} />
                      )
                    }}
                  >
                    {assessmentReport}
                  </ReactMarkdown>
                  
                  {/* Watermark or Footer for Report */}
                  <div className="mt-12 pt-6 border-t border-slate-100 text-center">
                     <div className="flex items-center justify-center space-x-2 text-slate-300 font-bold text-lg opacity-50">
                        <Sparkles size={20} />
                        <span>沐海旅行 · 智能签证评估</span>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VisaAssessmentZone;
