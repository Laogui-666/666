
import React from 'react';
import { FileText, Map, FileEdit, ArrowRight, Sparkles, FileSearch, FileCheck } from 'lucide-react';
import { ServiceType } from '../types';

interface GatewayProps {
  onSelect: (service: ServiceType) => void;
}

const Gateway: React.FC<GatewayProps> = ({ onSelect }) => {
  const services = [
    {
      id: ServiceType.TRANSLATION,
      title: '材料翻译',
      desc: '精准高效1:1排版布局还原',
      icon: <FileText className="w-10 h-10 text-orange-600" />,
      color: 'bg-orange-50',
      tag: '明星功能'
    },
    {
      id: ServiceType.ITINERARY,
      title: '行程单定制',
      desc: '针对签证申请专项优化，提高过签率',
      icon: <Map className="w-10 h-10 text-blue-600" />,
      color: 'bg-blue-50',
      tag: '省心必备'
    },
    {
      id: ServiceType.CERTIFICATE_GENERATOR,
      title: '标准证明生成',
      desc: '一键生成在职证明等各类标准文书',
      icon: <FileCheck className="w-10 h-10 text-emerald-600" />,
      color: 'bg-emerald-50',
      tag: '效率神器'
    },
    {
      id: ServiceType.VISA_ASSESSMENT,
      title: '签证申请评估',
      desc: '大数据分析，智能评估获签概率',
      icon: <FileSearch className="w-10 h-10 text-purple-600" />,
      color: 'bg-purple-50',
      tag: '全新上线'
    }
  ];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center pt-32 pb-20 px-4">
      <div className="text-center mb-16 max-w-2xl">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-100 text-orange-600 text-sm font-bold mb-6">
          <Sparkles size={16} />
          <span>沐海旅行 · 您的个人签证管家</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
          让签证准备变得<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-500">前所未有的简单</span>
        </h1>
        <p className="text-slate-500 text-lg">
          选择您需要的服务，立即开始体验
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl">
        {services.map((service) => (
          <div 
            key={service.id}
            onClick={() => onSelect(service.id)}
            className="group relative bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-orange-200/30 transition-all duration-500 cursor-pointer hover:-translate-y-2 overflow-hidden"
          >
            {/* Hover Decor */}
            <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl`}></div>
            
            <div className="relative z-10">
              <div className={`w-20 h-20 ${service.color} rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                {service.icon}
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-slate-900">{service.title}</h3>
                <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {service.tag}
                </span>
              </div>
              
              <p className="text-slate-500 mb-8 leading-relaxed">
                {service.desc}
              </p>
              
              <div className="flex items-center text-orange-600 font-bold group/btn">
                <span>立即进入</span>
                <ArrowRight size={18} className="ml-2 group-hover/btn:translate-x-2 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gateway;
