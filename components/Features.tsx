
import React from 'react';
import { Layout, FileSearch, Layers } from 'lucide-react';

const Features: React.FC = () => {
  const techFeatures = [
    { 
      icon: <Layers className="text-orange-600" />, 
      title: "标准化排版引擎", 
      desc: "内置 100+ 种签证常用证件模型，确保同类文件每次处理的结构、字体、间距完全统一。" 
    },
    { 
      icon: <Layout className="text-blue-600" />, 
      title: "像素级还原算法", 
      desc: "自动计算原稿坐标，采用智能定位技术，翻译后的文本与原图位置误差控制在毫米级。" 
    },
    { 
      icon: <FileSearch className="text-purple-600" />, 
      title: "无遗漏 OCR 识别", 
      desc: "深度优化针对印章遮挡、边缘微缩文字的识别能力，确保每一处细节都得到精准翻译。" 
    }
  ];

  return (
    <section id="features" className="py-24 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">核心亮点：标准、严谨、极致</h2>
          <p className="text-slate-600">沐海旅行专属智能翻译系统，为您的出境申请提供专业级的翻译保障</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {techFeatures.map((f, i) => (
            <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{f.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
