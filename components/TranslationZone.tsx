
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Upload, FileImage, FileText, AlertCircle, Loader2, Trash2, CheckCircle2, ListChecks, History, ArrowRight, RotateCcw, Clock, FileEdit, Printer, Languages, Sparkles, Info, FileCode, Eye, Download, X, ShieldCheck, Zap } from 'lucide-react';
import { TaskStatus, TranslationTask, TranslationType, PROCESSING_STEPS } from '../types';
import { processDocument } from '../services/geminiService';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const MAX_TASKS = 10;

const TranslationZone: React.FC = () => {
  const [tasks, setTasks] = useState<TranslationTask[]>([]);
  const [targetLang, setTargetLang] = useState('English');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewTask, setPreviewTask] = useState<TranslationTask | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalsRef = useRef<Record<string, any>>({});
  // const isProcessingBatch = useRef(false); // Changed to state for UI feedback if needed, but ref is fine for logic. 
  // Actually, let's keep isProcessingBatch as ref for logic to avoid re-renders, but we might need state for disabling buttons.
  // The original code used a ref `isProcessingBatch`. I will keep it as ref but add `isDownloading` state.
  const isProcessingBatchRef = useRef(false);

  useEffect(() => {
    return () => Object.values(intervalsRef.current).forEach(clearInterval);
  }, []);

  const queueTasks = useMemo(() => tasks.filter(t => t.status !== TaskStatus.COMPLETED), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.status === TaskStatus.COMPLETED), [tasks]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setErrorMsg(null);
    setInfoMsg(null);
    
    let incomingFiles = Array.from(files);
    const currentCount = tasks.length;
    const availableSlots = MAX_TASKS - currentCount;

    if (availableSlots <= 0) {
      setErrorMsg(`任务列表已满（上限 ${MAX_TASKS} 个），请先清理已完成或进行中的任务。`);
      return;
    }

    if (incomingFiles.length > availableSlots) {
      setInfoMsg(`单次处理上限为 ${MAX_TASKS} 个，已自动为您选取前 ${availableSlots} 个文件。`);
      incomingFiles = incomingFiles.slice(0, availableSlots);
    }

    const newTasks: TranslationTask[] = incomingFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      fileName: file.name,
      fileType: file.type,
      status: TaskStatus.PENDING,
      progress: 0,
      originalFile: file
    }));
    setTasks(prev => [...prev, ...newTasks]);
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
    handleFiles(e.dataTransfer.files);
  };

  const startTask = async (taskId: string, type: TranslationType = TranslationType.NORMAL) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.originalFile || task.status === TaskStatus.PROCESSING) return;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: TaskStatus.PROCESSING, progress: 5, type } : t));
    
    // Random speed factor for each task (0.8 to 1.2)
    const speedFactor = 0.8 + Math.random() * 0.4;

    try {
      intervalsRef.current[taskId] = setInterval(() => {
        setTasks(prev => prev.map(t => {
          if (t.id === taskId && t.status === TaskStatus.PROCESSING) {
            // Optimized non-linear progress simulation
            let increment = 0;
            // Phase 1: Initial analysis (0-30%) - Fast
            if (t.progress < 30) increment = 2.0 * speedFactor;
            // Phase 2: Translation (30-60%) - Moderate
            else if (t.progress < 60) increment = 1.2 * speedFactor;
            // Phase 3: Formatting (60-85%) - Slow
            else if (t.progress < 85) increment = 0.6 * speedFactor;
            // Phase 4: Finalizing (85-99%) - Very Slow (prevent stuck at 98%)
            else if (t.progress < 99) increment = 0.1 * speedFactor;
            
            const nextProgress = Math.min(parseFloat((t.progress + increment).toFixed(2)), 99);
            return { ...t, progress: nextProgress };
          }
          return t;
        }));
      }, 500); // Faster interval (500ms) for smoother animation

      const htmlResult = await processDocument(task.originalFile, targetLang, type);
      
      clearInterval(intervalsRef.current[taskId]);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: TaskStatus.COMPLETED, progress: 100, resultUrl: htmlResult, completedAt: Date.now() } : t));
    } catch (error: any) {
      clearInterval(intervalsRef.current[taskId]);
      const message = error?.message || error?.error?.message || "智能引擎响应超时或文件不合规";
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: TaskStatus.FAILED, error: message.includes("429") ? "API 额度暂载耗尽，请稍后再试" : message } : t));
      throw error; 
    }
  };

  const processBatch = async (type: TranslationType = TranslationType.NORMAL) => {
    if (isProcessingBatchRef.current) return;
    isProcessingBatchRef.current = true;
    
    const pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING);
    
    // Parallel processing
    await Promise.all(pendingTasks.map(async (task) => {
      try {
        await startTask(task.id, type);
      } catch (err) {
        console.error(`Task ${task.id} failed in batch:`, err);
      }
    }));
    
    isProcessingBatchRef.current = false;
  };

  const convertToRgb = (color: string) => {
    if (!color || !color.includes('oklch')) return color;
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return color;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
  };

  const downloadPdf = async (html: string, filename: string) => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      // Create a temporary container in the DOM to ensure styles are computed correctly
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '210mm'; // A4 width
      container.style.zIndex = '-100';
      container.style.backgroundColor = '#ffffff';
      container.innerHTML = html;
      document.body.appendChild(container);

      // Inject PDF-specific styles
      const style = document.createElement('style');
      style.innerHTML = `
        .pdf-export-wrapper { font-family: Arial, sans-serif; color: #000; width: 100%; }
        .pdf-export-wrapper table { width: 100% !important; border-collapse: collapse !important; table-layout: auto !important; margin-bottom: 10px !important; }
        .pdf-export-wrapper td, .pdf-export-wrapper th { border: 1px solid #000 !important; padding: 6px !important; word-break: break-word !important; font-size: 11px !important; }
        .pdf-export-wrapper img { max-width: 100% !important; height: auto !important; }
        /* Reset template-specific containers */
        .pdf-export-wrapper div[class*="container"], 
        .pdf-export-wrapper div[class*="certificate"], 
        .pdf-export-wrapper div[class*="register"] { 
          width: 100% !important; 
          max-width: 100% !important; 
          margin: 0 !important; 
          padding: 0 !important; 
          box-shadow: none !important;
          background: transparent !important;
          min-height: 0 !important;
        }
        .certification-footer { width: 100% !important; margin-top: 30px !important; border-top: 1px solid #000 !important; }
      `;
      container.appendChild(style);
      container.classList.add('pdf-export-wrapper');

      // Handle Images (Cross-origin)
      const images = container.getElementsByTagName('img');
      const imgPromises = Array.from(images).map(img => {
        const src = img.getAttribute('src');
        if (src && src.startsWith('http') && !src.includes(window.location.host)) {
          img.setAttribute('crossorigin', 'anonymous');
        }
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      await Promise.all(imgPromises);

      // COLOR FIX: Convert oklch colors to RGB
      // We must iterate all elements and inline their computed styles if they use oklch
      const allElements = container.querySelectorAll('*');
      allElements.forEach((el: any) => {
        const computed = window.getComputedStyle(el);
        const props = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor'];
        
        props.forEach(prop => {
          const val = computed[prop as any];
          if (val && val.includes('oklch')) {
            el.style[prop as any] = convertToRgb(val);
          }
        });
      });

      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `${filename.split('.')[0]}_Translated.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true,
          allowTaint: true,
          logging: false,
          scrollY: 0,
          windowWidth: 1200
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(container).save();
      
      document.body.removeChild(container);
    } catch (error) {
      console.error("PDF Download Error:", error);
      alert("PDF 生成失败，请尝试使用浏览器打印功能 (Ctrl+P) 另存为 PDF。");
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadHtml = (html: string, filename: string) => {
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${filename} - Translated</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; border: 1px solid black; }
            th, td { border: 1px solid black; padding: 8px; text-align: center; }
          </style>
      </head>
      <body>${html}</body>
      </html>
    `;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename.split('.')[0]}_Muhai_Translated.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const removeTask = (taskId: string) => {
    if (intervalsRef.current[taskId]) clearInterval(intervalsRef.current[taskId]);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20 -mt-8 relative z-20">
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4 px-6 py-4 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
            <Languages size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">目标语言</p>
            <select 
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-sm"
            >
              <option value="English">英语 (English)</option>
              <option value="Japanese">日语 (日本語)</option>
              <option value="Korean">韩语 (한국어)</option>
              <option value="French">法语 (Français)</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
           <Sparkles size={14} className="text-orange-400" />
           <span>支持 PDF / JPG / PNG / Word</span>
        </div>
      </div>

      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()} 
        className={`relative group border-2 border-dashed rounded-[3.5rem] p-16 lg:p-24 text-center cursor-pointer transition-all duration-500 overflow-hidden ${
          isDragging 
          ? 'border-orange-500 bg-orange-50 scale-[0.99] shadow-inner' 
          : 'border-slate-200 bg-white hover:border-orange-400 hover:shadow-2xl hover:shadow-orange-100'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative z-10">
          <div className="w-24 h-24 bg-orange-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
            <Upload className="text-orange-600 w-10 h-10" />
          </div>
          <h3 className="text-3xl font-extrabold text-slate-800 mb-4">点击或拖拽上传签证材料</h3>
          <p className="text-slate-400 max-w-sm mx-auto">
            智能系统将自动识别文档结构并进行 1:1 排版翻译，<br />
            支持多文件批量上传，一键导出 Word 或 HTML。
          </p>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          multiple 
          accept="image/*,.pdf,.doc,.docx"
          onChange={(e) => handleFiles(e.target.files)} 
        />
      </div>

      {errorMsg && (
        <div className="mt-6 flex items-center justify-center space-x-2 text-red-500 bg-red-50 py-3 rounded-2xl animate-shake">
          <AlertCircle size={18} />
          <span className="text-sm font-bold">{errorMsg}</span>
        </div>
      )}

      {infoMsg && (
        <div className="mt-6 flex items-center justify-center space-x-2 text-orange-600 bg-orange-50 py-3 rounded-2xl animate-in fade-in slide-in-from-top-4">
          <Info size={18} />
          <span className="text-sm font-bold">{infoMsg}</span>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-10 mt-16 animate-in fade-in slide-in-from-bottom-8">
          <div className="bg-white/60 backdrop-blur-md rounded-[3rem] border border-slate-100 p-8 shadow-xl">
            <div className="flex items-center justify-between mb-8">
               <h4 className="text-lg font-bold text-slate-800 flex items-center">
                 <ListChecks className="mr-2 text-orange-500" />
                 任务队列 ({queueTasks.length})
               </h4>
               {queueTasks.length > 0 && (
                 <div className="flex items-center space-x-4">
                   <button 
                    onClick={() => processBatch(TranslationType.NORMAL)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-orange-200 active:scale-95 transition-all flex items-center"
                   >
                     <Zap size={14} className="mr-1.5" />
                     全部一键翻译
                   </button>
                 </div>
               )}
            </div>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {queueTasks.length === 0 ? (
                <div className="py-20 text-center text-slate-300">
                  <Clock className="mx-auto mb-2 opacity-20" size={48} />
                  <p className="text-sm">暂无待处理任务</p>
                </div>
              ) : queueTasks.map(task => (
                <div key={task.id} className={`group bg-white p-4 rounded-[1.2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all ${task.status === TaskStatus.PROCESSING ? 'ring-2 ring-orange-100' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="bg-slate-50 p-2 rounded-lg text-slate-400">
                        {task.fileType.includes('image') ? <FileImage size={16} /> : <FileText size={16} />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-700 truncate text-sm">{task.fileName}</span>
                        {task.status === TaskStatus.PROCESSING && (
                          <span className="text-[9px] font-black text-orange-500 uppercase tracking-tighter animate-pulse">Processing...</span>
                        )}
                        {task.status === TaskStatus.PENDING && (
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Waiting</span>
                        )}
                        {task.status === TaskStatus.FAILED && (
                          <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">Failed</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {task.status === TaskStatus.PENDING && (
                        <>
                          <button 
                            onClick={() => startTask(task.id, TranslationType.NORMAL)} 
                            className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1.5 rounded-lg transition-all text-[10px] font-bold flex items-center active:scale-95"
                            title="开始翻译"
                          >
                            <Zap size={12} className="mr-1" />
                            翻译
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => removeTask(task.id)} 
                        className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {task.status === TaskStatus.PROCESSING && (
                    <div className="mt-3 p-3 bg-orange-50/30 rounded-xl border border-orange-100/50 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">当前状态</span>
                          <span className="flex items-center text-[11px] font-extrabold text-orange-600">
                            <Loader2 className="animate-spin mr-1.5" size={12} />
                            {PROCESSING_STEPS.find(step => task.progress <= step.percentage)?.label || '智能处理中...'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">完成度</span>
                          <span className="text-xs font-black text-orange-600 tabular-nums">{task.progress}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 bg-[length:200%_100%] animate-gradient-x rounded-full shadow-[0_0_10px_rgba(249,115,22,0.3)] transition-all duration-700 ease-out" 
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {task.status === TaskStatus.FAILED && (
                    <div className="flex items-center space-x-1.5 text-red-500 bg-red-50 p-2 rounded-lg mt-2">
                       <AlertCircle size={12} />
                       <span className="text-[10px] font-bold">{task.error}</span>
                       <button onClick={() => startTask(task.id)} className="ml-auto bg-white p-1 rounded-md shadow-sm"><RotateCcw size={10} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-[3rem] border border-slate-100 p-8 shadow-xl">
            <div className="flex items-center justify-between mb-8">
               <h4 className="text-lg font-bold text-slate-800 flex items-center">
                 <History className="mr-2 text-green-500" />
                 已生成结果 ({completedTasks.length})
               </h4>
               {completedTasks.length > 0 && (
                 <button 
                  onClick={() => setTasks(tasks.filter(t => t.status !== TaskStatus.COMPLETED))}
                  className="text-xs font-bold text-slate-400 hover:text-red-500"
                 >
                   清空列表
                 </button>
               )}
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {completedTasks.length === 0 ? (
                <div className="py-20 text-center text-slate-300">
                  <CheckCircle2 className="mx-auto mb-2 opacity-20" size={48} />
                  <p className="text-sm">尚未有完成的翻译文件</p>
                </div>
              ) : completedTasks.map(task => (
                <div key={task.id} className="bg-white/80 p-4 rounded-[1.2rem] border border-green-100 shadow-sm flex flex-col space-y-3 group animate-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="bg-green-100 p-2 rounded-lg text-green-600">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-slate-800 truncate text-sm leading-tight">{task.fileName}</p>
                          <span className="text-[9px] font-black text-green-500 uppercase tracking-tighter bg-green-50 px-1.5 py-0.5 rounded-md border border-green-100">Ready</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {task.type === TranslationType.CERTIFIED ? '认证翻译' : '普通翻译'} · {targetLang}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeTask(task.id)} 
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setPreviewTask(task)} 
                        className="flex-[1.5] bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-1.5 font-bold text-[11px] transition-all shadow-lg shadow-orange-100 active:scale-95"
                      >
                        <Eye size={13} /> 
                        <span>预览结果</span>
                      </button>
                      <button 
                        onClick={() => downloadPdf(task.resultUrl!, task.fileName)} 
                        disabled={isDownloading}
                        className={`flex-1 bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-1.5 font-bold text-[11px] transition-all shadow-lg active:scale-95 ${isDownloading ? 'opacity-70 cursor-wait' : ''}`}
                      >
                        {isDownloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                        <span>{isDownloading ? '导出中...' : '导出 PDF'}</span>
                      </button>
                      <button 
                        onClick={() => downloadHtml(task.resultUrl!, task.fileName)} 
                        className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 rounded-lg flex items-center justify-center transition-all active:scale-95"
                        title="导出 HTML"
                      >
                        <FileCode size={14} /> 
                      </button>
                    </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPreviewTask(null)}></div>
          <div className="relative bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between px-8 py-6 border-bottom border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                  <Eye className="mr-2 text-orange-500" />
                  翻译结果预览
                </h3>
                <p className="text-sm text-slate-400 mt-1">{previewTask.fileName}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => downloadPdf(previewTask.resultUrl!, previewTask.fileName)}
                  disabled={isDownloading}
                  className={`bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 hover:bg-slate-800 transition-all ${isDownloading ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  <span>{isDownloading ? '正在生成 PDF...' : '下载 PDF'}</span>
                </button>
                <button 
                  onClick={() => setPreviewTask(null)}
                  className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-slate-50 p-8">
              <div className="bg-white shadow-sm border border-slate-200 rounded-lg mx-auto max-w-[210mm] min-h-[297mm] p-[10mm] preview-content">
                <div dangerouslySetInnerHTML={{ __html: previewTask.resultUrl! }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 3; }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .animate-gradient-x { animation: gradient-x 3s ease infinite; }
        .preview-content * { max-width: 100%; box-sizing: border-box !important; }
        .preview-content table { width: 100% !important; border-collapse: collapse !important; table-layout: fixed !important; }
        .preview-content td, .preview-content th { word-break: break-all !important; overflow-wrap: break-word !important; padding: 5px !important; }
        .preview-content div[class*="container"], .preview-content div[class*="certificate"], .preview-content div[class*="register"] { 
          width: 100% !important; 
          max-width: 100% !important; 
          margin: 0 !important; 
          box-shadow: none !important;
          padding: 15mm !important;
        }
      `}</style>
    </div>
  );
};

export default TranslationZone;
