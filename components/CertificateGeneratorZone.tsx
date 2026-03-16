import React, { useState, useRef } from 'react';
import { FileText, Upload, Download, Eye, Loader2, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { TEMPLATE_REGISTRY } from '../templates/registry';
import { extractCertificateData } from '../services/geminiService';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface FormData {
  name: string;
  passportNo: string;
  companyName: string;
  companyAddress: string;
  companyTel: string;
  position: string;
  monthlyIncome: string;
  joinDate: string;
  destination: string;
  startDate: string;
  endDate: string;
  currentDate: string;
}

const CertificateGeneratorZone: React.FC = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState('GEN_EMPLOYMENT_CERTIFICATE_V1');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    passportNo: '',
    companyName: '',
    companyAddress: '',
    companyTel: '',
    position: '',
    monthlyIncome: '',
    joinDate: '',
    destination: '',
    startDate: '',
    endDate: '',
    currentDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  });
  const [isExtracting, setIsExtracting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templates = Object.values(TEMPLATE_REGISTRY).filter(t => t.id.startsWith('GEN_'));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsExtracting(true);
    try {
      const extractedData = await extractCertificateData(Array.from(files));
      setFormData(prev => ({
        ...prev,
        ...extractedData
      }));
    } catch (error) {
      console.error("Extraction failed:", error);
      alert("智能提取失败，请手动填写。");
    } finally {
      setIsExtracting(false);
    }
  };

  const generateCertificate = () => {
    const template = TEMPLATE_REGISTRY.EMPLOYMENT_CERTIFICATE;
    let html = template.html;

    // Replace placeholders
    Object.entries(formData).forEach(([key, value]) => {
      const placeholder = `{{${key.toUpperCase()}}}`;
      html = html.replace(new RegExp(placeholder, 'g'), value || '__________');
    });

    setGeneratedHtml(html);
    setShowPreview(true);
  };

  const downloadPdf = async () => {
    const opt = {
      margin: 10,
      filename: `${formData.name || 'Certificate'}_Employment.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    await html2pdf().set(opt).from(generatedHtml).save();
  };

  const downloadWord = () => {
    // Simple HTML to Word export via Blob
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + generatedHtml + footer;
    
    const blob = new Blob(['\ufeff', sourceHTML], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.name || 'Certificate'}_Employment.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Form & Controls */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="text-blue-600" />
              标准证明一键生成
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                {isExtracting ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                智能提取填充
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                onChange={handleFileUpload}
                accept="image/*,.pdf,.docx"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">选择证明模板</label>
              <select 
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="GEN_EMPLOYMENT_CERTIFICATE_V1">在职证明 (标准签证版)</option>
                <option value="GEN_RETIREMENT_CERTIFICATE_V1" disabled>退休证明 (即将上线)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">个人基本信息</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">姓名 (拼音/英文)</label>
                  <input name="name" value={formData.name} onChange={handleInputChange} placeholder="ZHANG SAN" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">护照号码</label>
                  <input name="passportNo" value={formData.passportNo} onChange={handleInputChange} placeholder="E12345678" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">入职日期</label>
                  <input name="joinDate" value={formData.joinDate} onChange={handleInputChange} placeholder="June 1, 2015" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">职位</label>
                  <input name="position" value={formData.position} onChange={handleInputChange} placeholder="Manager" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">月收入</label>
                  <input name="monthlyIncome" value={formData.monthlyIncome} onChange={handleInputChange} placeholder="RMB 15,000" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">单位及行程信息</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">单位名称 (英文)</label>
                  <input name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="ABC Technology Co., Ltd." className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">单位地址 (英文)</label>
                  <input name="companyAddress" value={formData.companyAddress} onChange={handleInputChange} placeholder="No. 123, Road Name, Beijing, China" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">单位电话</label>
                  <input name="companyTel" value={formData.companyTel} onChange={handleInputChange} placeholder="+86-10-12345678" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">出访目的地</label>
                  <input name="destination" value={formData.destination} onChange={handleInputChange} placeholder="France" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">出发日期</label>
                    <input name="startDate" value={formData.startDate} onChange={handleInputChange} placeholder="2026-05-01" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">返回日期</label>
                    <input name="endDate" value={formData.endDate} onChange={handleInputChange} placeholder="2026-05-15" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={generateCertificate}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-gray-200"
            >
              <RefreshCw size={20} />
              一键生成证明
            </button>
          </div>
        </div>

        {/* Right: Real-time Preview */}
        <div className="hidden lg:block w-[450px] sticky top-6 self-start">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 overflow-hidden">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">实时预览</h3>
            <div className="border border-gray-100 rounded-xl overflow-auto h-[600px] bg-gray-50 p-4">
              <div 
                className="bg-white shadow-sm p-6 origin-top scale-[0.6] w-[210mm] min-h-[297mm]"
                dangerouslySetInnerHTML={{ __html: generatedHtml || '<div style="text-align:center; padding-top: 100px; color: #999;">填写信息后点击生成预览</div>' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Full Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900">证明预览</h3>
                <p className="text-sm text-gray-500">请核对信息是否准确，如有误请关闭弹窗修改</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={downloadWord}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-md shadow-blue-100"
                >
                  <FileText size={18} />
                  导出 Word
                </button>
                <button 
                  onClick={downloadPdf}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all font-medium shadow-md shadow-gray-200"
                >
                  <Download size={18} />
                  导出 PDF
                </button>
                <button 
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 md:p-12 bg-gray-50">
              <div 
                className="bg-white shadow-xl mx-auto w-full max-w-[210mm] min-h-[297mm] p-[15mm] md:p-[25mm]"
                dangerouslySetInnerHTML={{ __html: generatedHtml }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateGeneratorZone;
