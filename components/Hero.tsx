
import React from 'react';
import { Sparkles, FileText, CheckCircle, Plane } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* 更加醒目突出的标签 */}
        <div className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-600 to-red-500 text-white shadow-xl shadow-orange-200/50 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Plane size={18} className="animate-pulse" />
          <span className="text-sm md:text-base font-extrabold tracking-wider">沐海旅行 · 专属签证翻译助手</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 leading-[1.4]">
          签证准备不求人<br />
          <span className="text-orange-600">1:1 还原布局</span> 翻译秒级达成
        </h1>
        
        <p className="max-w-4xl mx-auto text-lg text-slate-600 mb-10 leading-relaxed">
          沐海旅行致力于提升您的旅行体验，确保您的翻译材料<br />
          <span className="text-orange-600 font-bold underline decoration-orange-200 decoration-4 underline-offset-8">
            无遗漏、准排版、高效率，支持一键导出 Word 或 PDF，直接提交不返工。
          </span>
        </p>

        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {[
            { icon: <FileText className="w-5 h-5 text-orange-500" />, text: "排版 1:1 像素级还原" },
            { icon: <CheckCircle className="w-5 h-5 text-orange-500" />, text: "内容完整、翻译准确" },
            { icon: <Sparkles className="w-5 h-5 text-orange-500" />, text: "支持导出 Word/PDF" }
          ].map((item, i) => (
            <div key={i} className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
              {item.icon}
              <span className="text-sm font-medium text-slate-700">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
