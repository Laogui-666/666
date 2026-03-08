
import React from 'react';
import { Mail, Github, Twitter, Plane } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-orange-500 p-1.5 rounded-lg">
                <Plane className="text-white w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-slate-900">沐海旅行·一站式签证服务平台</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              沐海国际旗下智能签证平台，专注于为出国签证申请提供高质量服务。
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-800 mb-6">核心服务</h4>
            <ul className="space-y-4 text-sm text-slate-600">
              <li>签证材料翻译</li>
              <li>行程定制</li>
              <li>签证申请评估</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-800 mb-6">联系我们</h4>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex items-center"><Mail className="w-4 h-4 mr-2" /> 1076842602@qq.com</li>
              <li>客服工作时间：10:00 - 18:00</li>
              <li className="flex space-x-4 pt-2">
                <Twitter className="w-5 h-5 cursor-pointer hover:text-orange-400" />
                <Github className="w-5 h-5 cursor-pointer hover:text-slate-900" />
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-200 pt-8 text-center">
          <p className="text-slate-400 text-xs">
            © {new Date().getFullYear()} 沐海旅行 (Muhai Travel). 版权所有.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
