
import React, { useState, useMemo, useEffect } from 'react';
import { Plane, Calendar, MapPin, Plus, Trash2, Upload, Loader2, FileCheck, CheckCircle2, Download, AlertCircle, FileSearch, Globe, ChevronRight, Navigation, MessageSquareText, Building2, Phone, Sparkles, Map, RotateCcw, FileCode, Languages, FileText } from 'lucide-react';
import { generateItinerary, parseItineraryFiles, generateChineseItinerary } from '../services/geminiService';
// @ts-ignore
import html2pdf from 'html2pdf.js';

// 中国省份城市数据
const CHINA_PROVINCES = ["北京市", "上海市", "天津市", "重庆市", "广东省", "四川省", "浙江省", "江苏省", "湖北省", "福建省", "山东省", "河南省", "陕西省", "湖南省", "辽宁省", "安徽省"];
const CHINA_CITIES_DATA: Record<string, string[]> = {
  "北京市": ["北京市"],
  "上海市": ["上海市"],
  "天津市": ["天津市"],
  "重庆市": ["重庆市"],
  "广东省": ["广州市", "深圳市", "珠海市", "汕头市", "佛山市", "东莞市"],
  "四川省": ["成都市", "绵阳市", "自贡市", "泸州市", "德阳市"],
  "浙江省": ["杭州市", "宁波市", "温州市", "嘉兴市", "湖州市", "绍兴市"],
  "江苏省": ["南京市", "无锡市", "徐州市", "常州市", "苏州市", "南通市"],
  "湖北省": ["武汉市", "黄石市", "十堰市", "宜昌市", "襄阳市"],
  "福建省": ["福州市", "厦门市", "莆田市", "三明市", "泉州市"],
  "山东省": ["济南市", "青岛市", "淄博市", "枣庄市", "东营市"],
  "河南省": ["郑州市", "开封市", "洛阳市", "平顶山市"],
  "陕西省": ["西安市", "铜川市", "宝鸡市", "咸阳市"],
  "湖南省": ["长沙市", "株洲市", "湘潭市", "衡阳市"],
  "辽宁省": ["沈阳市", "大连市", "鞍山市", "抚顺市"],
  "安徽省": ["合肥市", "芜湖市", "蚌埠市", "淮南市"]
};

// 全球热门旅游国家及城市数据
const WORLD_CITIES_MAP: Record<string, string[]> = {
  "奥地利": ["维也纳", "萨尔茨堡", "因斯布鲁克", "格拉茨", "哈尔施塔特"],
  "比利时": ["布鲁塞尔", "布鲁日", "安特卫普", "根特", "列日"],
  "保加利亚": ["索菲亚", "普罗夫迪夫", "大特尔诺沃", "瓦尔纳", "布尔加斯"],
  "克罗地亚": ["萨格勒布", "杜布罗夫尼克", "斯普利特", "普拉", "赫瓦尔"],
  "捷克": ["布拉格", "卡罗维发利", "布尔诺", "库特纳霍拉", "奥洛慕茨"],
  "丹麦": ["哥本哈根", "奥胡斯", "欧登塞", "奥尔堡", "里伯"],
  "爱沙尼亚": ["塔林", "塔尔图", "帕尔努", "科赫特拉-耶尔韦", "维尔扬迪"],
  "芬兰": ["赫尔济基", "罗瓦涅米", "图尔库", "坦佩雷", "拉赫蒂"],
  "法国": ["巴黎", "尼斯", "里昂", "马赛", "斯特拉斯堡", "波尔多"],
  "德国": ["柏林", "慕尼黑", "汉堡", "科隆", "法兰克福", "海德堡"],
  "希腊": ["雅典", "圣托里尼", "米科诺斯", "克里特岛", "萨洛尼卡"],
  "匈牙利": ["布达佩斯", "德布勒森", "佩奇", "埃格尔", "塞格德"],
  "冰岛": ["雷克雅未克", "阿克雷里", "维克", "蓝湖", "赫本"],
  "意大利": ["罗马", "威尼斯", "佛罗伦萨", "米兰", "那不勒斯", "五渔村"],
  "拉脱维亚": ["里加", "尤尔马拉", "道加瓦皮尔斯", "利耶帕亚", "文茨皮尔斯"],
  "列支敦士登": ["瓦杜兹", "沙恩", "特里森贝格", "马尔本"],
  "立陶宛": ["维尔纽斯", "考纳斯", "克莱佩达", "希奥利艾", "特拉凯"],
  "卢森堡": ["卢森堡市", "埃希特纳赫", "维安登", "迪基希"],
  "马耳他": ["瓦莱塔", "斯利马", "圣朱利安斯", "姆迪纳", "戈佐岛"],
  "荷兰": ["阿姆斯特丹", "鹿特丹", "海域", "乌得勒支", "埃因霍温"],
  "挪威": ["奥斯陆", "卑尔根", "特罗姆瑟", "斯塔万格", "弗洛姆"],
  "波兰": ["华沙", "克拉科夫", "格但斯克", "波兹南", "弗罗茨瓦夫"],
  "葡萄牙": ["里斯本", "波尔图", "阿尔加维", "科尔多瓦", "马德拉"],
  "罗马尼亚": ["布加勒斯特", "布拉索夫", "锡纳亚", "克卢日-内波卡", "蒂米什瓦拉"],
  "斯洛伐克": ["布拉迪斯拉发", "科希策", "普雷绍夫", "班斯卡-比斯特里察"],
  "斯洛文尼亚": ["卢布尔雅那", "布莱德", "波斯托伊纳", "马里博尔", "皮兰"],
  "西班牙": ["马德里", "巴塞罗那", "塞维利亚", "格拉纳达", "瓦伦西亚"],
  "瑞典": ["斯德哥尔摩", "哥德堡", "马尔默", "乌普萨拉", "基律纳"],
  "瑞士": ["伯尔尼", "苏瑞世", "日内瓦", "卢赛恩", "因特拉肯"],
  "日本": ["东京", "大阪", "京都", "奈良", "福冈", "札幌"],
  "韩国": ["首尔", "釜山", "济州岛", "仁川"],
  "泰国": ["曼谷", "普吉岛", "清迈", "苏梅岛", "芭提雅"],
  "美国": ["纽约", "洛杉矶", "旧金山", "芝加哥", "拉斯维加斯", "华盛顿"],
  "澳大利亚": ["悉尼", "墨尔本", "布里斯班", "珀斯", "黄金海岸"],
  "英国": ["伦敦", "爱丁堡", "曼彻斯特", "伯明翰", "牛津", "剑桥"]
};

// 国家分类数据
const COUNTRY_CATEGORIES: Record<string, string[]> = {
  "申根国家": ["奥地利", "比利时", "捷克", "丹麦", "爱沙尼亚", "芬兰", "法国", "德国", "希腊", "匈牙利", "冰岛", "意大利", "拉脱维亚", "列支敦士登", "立陶宛", "卢森堡", "马耳他", "荷兰", "挪威", "波兰", "葡萄牙", "罗马尼亚", "斯洛伐克", "斯洛文尼亚", "西班牙", "瑞典", "瑞士"],
  "亚洲": ["日本", "韩国", "新加坡", "泰国", "越南"],
  "大洋洲": ["澳大利亚", "新西兰"],
  "北美": ["美国", "加拿大"],
  "欧洲(非申根)": ["英国", "爱尔兰", "塞尔维亚"]
};

interface CityItem {
  id: string;
  city: string;
  startDate: string;
  endDate: string;
  nights: number;
  hotelName?: string;
  hotelAddress?: string;
  hotelPhone?: string;
}

interface CountryGroup {
  id: string;
  category: string;
  country: string;
  cities: CityItem[];
}

const GENERATING_MESSAGES = [
  "正在深度解析行程逻辑并剔除国内段...",
  "正在按照最新英文行程单框架排版...",
  "正在执行景点动线优化...",
  "正在核对各城市闭馆日（如周一/周日）...",
  "正在整合酒店详细信息与电话...",
  "正在强制执行单元格智能合并...",
  "正在生成签证级全英文行程文件..."
];

const calculateNights = (start: string, end: string): number => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate.getTime() - startDate.getTime();
  if (diffTime < 0) return 0;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const ItineraryZone: React.FC = () => {
  const [visaCategory, setVisaCategory] = useState('');
  const [visaCountry, setVisaCountry] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [exitDate, setExitDate] = useState('');
  
  const [depProvince, setDepProvince] = useState('');
  const [depCity, setDepCity] = useState('');
  const [retProvince, setRetProvince] = useState('');
  const [retCity, setRetCity] = useState('');

  const [specialRequirements, setSpecialRequirements] = useState('');

  const [route, setRoute] = useState<CountryGroup[]>([
    { id: 'c1', category: '', country: '', cities: [{ id: 't1', city: '', startDate: '', endDate: '', nights: 0 }] }
  ]);
  const [flights, setFlights] = useState<any[]>([]);
  const [files, setFiles] = useState<{ flight?: File, hotel?: File, reference?: File }>({});
  const [isParsing, setIsParsing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genMessageIdx, setGenMessageIdx] = useState(0);
  const [resultHtml, setResultHtml] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [chineseResultHtml, setChineseResultHtml] = useState<string | null>(null);
  const [isGeneratingChinese, setIsGeneratingChinese] = useState(false);
  const [chineseSourceFile, setChineseSourceFile] = useState<File | null>(null);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    let timer: any;
    if (isGenerating) {
      setGenMessageIdx(0);
      timer = setInterval(() => {
        setGenMessageIdx(prev => (prev + 1) % GENERATING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isGenerating]);

  const getCategoryByCountry = (country: string): string => {
    if (!country) return "";
    for (const [cat, countries] of Object.entries(COUNTRY_CATEGORIES)) {
      if (countries.includes(country)) return cat;
    }
    return "";
  };

  const matchProvince = (input: string): string => {
    if (!input) return "";
    const cleanInput = input.trim();
    const matched = CHINA_PROVINCES.find(p => p.includes(cleanInput) || cleanInput.includes(p.replace("省", "").replace("市", "")));
    return matched || "";
  };

  const matchCityOfCountry = (country: string, inputCity: string): string => {
    if (!country || !inputCity) return inputCity || "";
    const cityList = WORLD_CITIES_MAP[country] || [];
    const cleanInput = inputCity.trim();
    const matched = cityList.find(c => c.includes(cleanInput) || cleanInput.includes(c));
    return matched || inputCity;
  };

  const handleImport = async () => {
    if (!files.flight && !files.hotel) {
      alert("请先上传机票或酒店确认单");
      return;
    }
    setIsParsing(true);
    setErrorMsg(null);
    try {
      const parsed = await parseItineraryFiles(files);
      if (parsed.entryDate) setEntryDate(parsed.entryDate);
      if (parsed.exitDate) setExitDate(parsed.exitDate);
      if (parsed.flights) setFlights(parsed.flights);

      const matchedDepProv = matchProvince(parsed.departureProvince);
      if (matchedDepProv) {
        setDepProvince(matchedDepProv);
        if (parsed.departureCity) {
          const citiesInProv = CHINA_CITIES_DATA[matchedDepProv] || [];
          const matchedDepCity = citiesInProv.find(c => c.includes(parsed.departureCity) || parsed.departureCity.includes(c));
          if (matchedDepCity) setDepCity(matchedDepCity);
        }
      }

      const matchedRetProv = matchProvince(parsed.returnProvince);
      if (matchedRetProv) {
        setRetProvince(matchedRetProv);
        if (parsed.returnCity) {
          const citiesInProv = CHINA_CITIES_DATA[matchedRetProv] || [];
          const matchedRetCity = citiesInProv.find(c => c.includes(parsed.returnCity) || parsed.returnCity.includes(c));
          if (matchedRetCity) setRetCity(matchedRetCity);
        }
      }

      if (parsed.route && Array.isArray(parsed.route)) {
        const newRoute = parsed.route.map((r: any) => {
          const cat = getCategoryByCountry(r.country);
          return {
            id: Math.random().toString(36).substr(2, 9),
            category: cat,
            country: r.country,
            cities: (r.cities || []).map((c: any) => ({
              id: Math.random().toString(36).substr(2, 9),
              city: matchCityOfCountry(r.country, c.city),
              startDate: c.startDate || '',
              endDate: c.endDate || '',
              nights: calculateNights(c.startDate, c.endDate),
              hotelName: c.hotelName || '',
              hotelAddress: c.hotelAddress || '',
              hotelPhone: c.hotelPhone || ''
            }))
          };
        });
        setRoute(newRoute);

        const finalVisaCountry = parsed.visaCountry || newRoute[0]?.country;
        if (finalVisaCountry) {
          const cat = getCategoryByCountry(finalVisaCountry);
          if (cat) {
            setVisaCategory(cat);
            setVisaCountry(finalVisaCountry);
          }
        }
      }
    } catch (e: any) {
      console.error("Import Error:", e);
      const message = e?.message || e?.error?.message || "";
      if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
        setErrorMsg("API 额度暂载耗尽（429），系统正在尝试重试或请稍后再试。");
      } else {
        setErrorMsg("智能填充部分失败，请手动完善。");
      }
    } finally {
      setIsParsing(false);
    }
  };

  const handleGenerate = async () => {
    if (!visaCountry || !entryDate || !exitDate) {
      alert("请填写必填项");
      return;
    }
    setResultHtml(null);
    setErrorMsg(null);
    setIsGenerating(true);
    try {
      const config = { 
        visaCountry, 
        entryDate, 
        exitDate, 
        route, 
        flights, 
        departureCity: depCity, 
        returnCity: retCity, 
        specialRequirements 
      };
      const html = await generateItinerary(config, files);
      setResultHtml(html);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (e: any) {
      console.error("Generate Error:", e);
      const message = e?.message || e?.error?.message || "生成失败，请检查网络连接或尝试简化特殊要求。";
      if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
        setErrorMsg("API 额度暂载耗尽（429），请联系客服或稍后再试。");
      } else {
        setErrorMsg(message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadWord = () => {
    if (!resultHtml) return;
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'>
        <style>
          @page Section1 { size: 841.9pt 595.3pt; margin: 36.0pt; mso-page-orientation: landscape; }
          div.Section1 { page: Section1; }
          body { font-family: 'Arial', sans-serif; }
          table { border-collapse: collapse; width: 100%; border: 0.5pt solid black; }
          th, td { border: 0.5pt solid black; padding: 6pt; text-align: center; vertical-align: middle; font-size: 10pt; }
        </style>
      </head>
      <body><div class="Section1">${resultHtml}</div></body></html>
    `;
    const blob = new Blob(['\ufeff', header], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Visa_Itinerary_${visaCountry}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadHtml = () => {
    if (!resultHtml) return;
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Visa Itinerary - ${visaCountry}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; }
          </style>
      </head>
      <body>${resultHtml}</body>
      </html>
    `;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Visa_Itinerary_${visaCountry}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateChinese = async (source: string | File) => {
    setChineseResultHtml(null);
    setIsGeneratingChinese(true);
    try {
      const html = await generateChineseItinerary(source);
      setChineseResultHtml(html);
      // Scroll to Chinese result
      setTimeout(() => {
        const element = document.getElementById('chinese-result-section');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e: any) {
      console.error("Generate Chinese Itinerary Error:", e);
      const message = e?.message || e?.error?.message || "";
      if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
        alert("API 额度暂载耗尽（429），请稍后再试。");
      } else {
        alert("生成中文行程单失败，请重试。");
      }
    } finally {
      setIsGeneratingChinese(false);
    }
  };

  const downloadChinesePdf = () => {
    if (!chineseResultHtml) return;

    // Create an iframe to isolate the content from the main app's styles (Tailwind oklch)
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(chineseResultHtml);
    doc.close();

    // Wait for content to load (images, fonts)
    iframe.onload = () => {
        const element = doc.body;
        
        const opt = {
          margin: 0,
          filename: `Chinese_Itinerary_${visaCountry || 'Export'}.pdf`,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
        };

        html2pdf().set(opt).from(element).save().then(() => {
          document.body.removeChild(iframe);
        });
    };
  };

  const getLastDate = (currentGroupId: string, currentCityId: string): string => {
    let lastDate = entryDate;
    
    for (const group of route) {
      for (const city of group.cities) {
        if (group.id === currentGroupId && city.id === currentCityId) {
          return lastDate;
        }
        if (city.endDate) {
          lastDate = city.endDate;
        } else if (city.startDate) {
          lastDate = city.startDate;
        }
      }
    }
    return lastDate;
  };

  const updateCityField = (countryId: string, cityId: string, field: keyof CityItem, value: any) => {
    setRoute(prev => prev.map(r => r.id === countryId ? {
      ...r,
      cities: (r.cities || []).map(c => c.id === cityId ? {
        ...c, [field]: value,
        nights: (field==='startDate' || field==='endDate') ? calculateNights(field==='startDate'?value:c.startDate, field==='endDate'?value:c.endDate) : c.nights
      } : c)
    } : r));
  };

  const dateInputClass = "w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 transition-all focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 hover:bg-white cursor-pointer";

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/50">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-10 text-white">
          <div className="flex items-center space-x-4 mb-4">
             <div className="bg-orange-500 p-2.5 rounded-2xl"><Plane className="w-8 h-8" /></div>
             <div>
               <h1 className="text-3xl font-bold">签证行程单定制</h1>
               <p className="text-slate-400 text-sm italic">针对签证申请专项优化，提高过签率</p>
             </div>
          </div>
        </div>

        <div className="p-10 space-y-12">
          {errorMsg && (
            <div className="flex items-center space-x-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="shrink-0" size={20} />
              <p className="text-sm font-bold">{errorMsg}</p>
            </div>
          )}

          <section className="grid md:grid-cols-4 gap-6 pb-10 border-b border-slate-100">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">申请地区 *</label>
              <select value={visaCategory} onChange={e => { setVisaCategory(e.target.value); setVisaCountry(''); }} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold appearance-none cursor-pointer text-slate-700 focus:ring-2 focus:ring-orange-500/20 transition-all">
                <option value="">-- 选择区域 --</option>
                {Object.keys(COUNTRY_CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">申请国家 *</label>
              <select value={visaCountry} onChange={e => setVisaCountry(e.target.value)} disabled={!visaCategory} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold appearance-none cursor-pointer text-slate-700 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 transition-all">
                <option value="">-- 选择国家 --</option>
                {visaCategory && COUNTRY_CATEGORIES[visaCategory]?.map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">预计入境日期 *</label>
              <input type="date" min={today} value={entryDate} onChange={e => setEntryDate(e.target.value)} className={dateInputClass} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">预计离境日期 *</label>
              <input type="date" min={entryDate || today} value={exitDate} onChange={e => setExitDate(e.target.value)} className={dateInputClass} />
            </div>
          </section>

          <section className="space-y-6 pb-10 border-b border-slate-100">
            <div className="grid md:grid-cols-3 gap-6">
              <div className={`p-8 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all duration-300 ${files.flight ? 'border-green-500 bg-green-50/50 shadow-lg shadow-green-100/50' : 'border-slate-200 hover:border-orange-400'}`} onClick={() => document.getElementById('f-up')?.click()}>
                <input type="file" className="hidden" id="f-up" onChange={e => e.target.files && setFiles({...files, flight: e.target.files[0]})} />
                <div className="flex items-center space-x-4">
                  <div className={`p-4 rounded-2xl transition-colors ${files.flight ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                    {files.flight ? <FileCheck size={24} /> : <Upload size={24} />}
                  </div>
                  <div className="flex-1 truncate">
                    <p className={`font-bold ${files.flight ? 'text-green-800' : 'text-slate-800'}`}>{files.flight ? files.flight.name : '上传机票单'}</p>
                    <p className="text-[10px] text-slate-500">自动解析往返细节</p>
                  </div>
                </div>
              </div>

              <div className={`p-8 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all duration-300 ${files.hotel ? 'border-green-500 bg-green-50/50 shadow-lg shadow-green-100/50' : 'border-slate-200 hover:border-orange-400'}`} onClick={() => document.getElementById('h-up')?.click()}>
                <input type="file" className="hidden" id="h-up" onChange={e => e.target.files && setFiles({...files, hotel: e.target.files[0]})} />
                <div className="flex items-center space-x-4">
                  <div className={`p-4 rounded-2xl transition-colors ${files.hotel ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                    {files.hotel ? <FileCheck size={24} /> : <Upload size={24} />}
                  </div>
                  <div className="flex-1 truncate">
                    <p className={`font-bold ${files.hotel ? 'text-green-800' : 'text-slate-800'}`}>{files.hotel ? files.hotel.name : '上传酒店单'}</p>
                    <p className="text-[10px] text-slate-500">自动同步城市、酒店及电话</p>
                  </div>
                </div>
              </div>

              <div className={`p-8 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all duration-300 ${files.reference ? 'border-green-500 bg-green-50/50 shadow-lg shadow-green-100/50' : 'border-slate-200 hover:border-orange-400'}`} onClick={() => document.getElementById('ref-up')?.click()}>
                <input type="file" className="hidden" id="ref-up" onChange={e => e.target.files && setFiles({...files, reference: e.target.files[0]})} />
                <div className="flex items-center space-x-4">
                  <div className={`p-4 rounded-2xl transition-colors ${files.reference ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                    {files.reference ? <FileCheck size={24} /> : <Upload size={24} />}
                  </div>
                  <div className="flex-1 truncate">
                    <p className={`font-bold ${files.reference ? 'text-green-800' : 'text-slate-800'}`}>{files.reference ? files.reference.name : '参考资料 (选填)'}</p>
                    <p className="text-[10px] text-slate-500">闭馆日、景点清单等</p>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={handleImport} disabled={isParsing} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-bold flex items-center justify-center space-x-2 active:scale-[0.98] transition-all hover:bg-slate-800 disabled:opacity-70">
              {isParsing ? <Loader2 className="animate-spin" /> : <FileSearch />}
              <span>一键提取并导入详细行程</span>
            </button>
          </section>

          <section className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center">
                <MapPin className="mr-2 text-orange-500" />计划行程
              </h2>
              <div className="mt-8 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto px-4">
                 <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <Navigation size={18} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">出发城市</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <select value={depProvince} onChange={(e) => { setDepProvince(e.target.value); setDepCity(''); }} className="p-3 border rounded-xl font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all">
                         <option value="">选择省份</option>
                         {CHINA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                       </select>
                       <select value={depCity} onChange={(e) => setDepCity(e.target.value)} disabled={!depProvince} className="p-3 border rounded-xl font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50">
                         <option value="">选择城市</option>
                         {depProvince && CHINA_CITIES_DATA[depProvince]?.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                        <RotateCcw size={18} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">返回城市</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <select value={retProvince} onChange={(e) => { setRetProvince(e.target.value); setRetCity(''); }} className="p-3 border rounded-xl font-bold text-slate-700 bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all">
                         <option value="">选择省份</option>
                         {CHINA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                       </select>
                       <select value={retCity} onChange={(e) => setRetCity(e.target.value)} disabled={!retProvince} className="p-3 border rounded-xl font-bold text-slate-700 bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all disabled:opacity-50">
                         <option value="">选择城市</option>
                         {retProvince && CHINA_CITIES_DATA[retProvince]?.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>
              </div>
            </div>

            {route.map((group) => (
              <div key={group.id} className="p-8 bg-slate-50/50 rounded-[3rem] border border-slate-200">
                <div className="flex items-center justify-center space-x-4 mb-8">
                   <select value={group.category} onChange={e => setRoute(route.map(r => r.id === group.id ? {...r, category: e.target.value, country: ''} : r))} className="p-3 border rounded-xl font-bold bg-white">
                     <option value="">洲/区域</option>
                     {Object.keys(COUNTRY_CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                   </select>
                   <select value={group.country} disabled={!group.category} onChange={e => setRoute(route.map(r => r.id === group.id ? {...r, country: e.target.value} : r))} className="p-3 border rounded-xl font-bold bg-white min-w-[120px]">
                     <option value="">国家</option>
                     {group.category && COUNTRY_CATEGORIES[group.category]?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                   </select>
                   {route.length > 1 && <button onClick={() => setRoute(route.filter(r => r.id !== group.id))}><Trash2 className="text-red-400" /></button>}
                </div>
                {(group.cities || []).map(city => (
                   <div key={city.id} className="mb-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                     <div className="grid grid-cols-[1.5fr_1fr_1fr_80px] gap-4 mb-4 items-center">
                       <select value={city.city} onChange={e => updateCityField(group.id, city.id, 'city', e.target.value)} className="p-3 border rounded-xl font-bold text-slate-700 bg-white focus:border-orange-500 outline-none">
                          <option value="">-- 选择城市 --</option>
                          {group.country && WORLD_CITIES_MAP[group.country]?.map(c => <option key={c} value={c}>{c}</option>)}
                          {city.city && !WORLD_CITIES_MAP[group.country]?.includes(city.city) && <option value={city.city}>{city.city}</option>}
                       </select>
                       <input type="date" min={getLastDate(group.id, city.id)} value={city.startDate} onChange={e => updateCityField(group.id, city.id, 'startDate', e.target.value)} className="p-3 border rounded-xl font-bold text-slate-700" />
                       <input type="date" min={city.startDate || getLastDate(group.id, city.id)} value={city.endDate} onChange={e => updateCityField(group.id, city.id, 'endDate', e.target.value)} className="p-3 border rounded-xl font-bold text-slate-700" />
                       <div className="text-center font-bold text-orange-600 text-xs">{city.nights}N</div>
                     </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative">
                           <Building2 size={16} className="absolute left-3 top-3.5 text-slate-400" />
                           <input type="text" placeholder="酒店名称" value={city.hotelName} onChange={e => updateCityField(group.id, city.id, 'hotelName', e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-100 rounded-xl text-sm" />
                        </div>
                        <div className="relative">
                           <Phone size={16} className="absolute left-3 top-3.5 text-slate-400" />
                           <input type="text" placeholder="酒店电话" value={city.hotelPhone} onChange={e => updateCityField(group.id, city.id, 'hotelPhone', e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-100 rounded-xl text-sm" />
                        </div>
                     </div>
                   </div>
                ))}
                <button onClick={() => setRoute(route.map(r => r.id === group.id ? {...r, cities: [...(r.cities || []), {id: Math.random().toString(), city: '', startDate: '', endDate: '', nights: 0}]} : r))} className="text-orange-600 font-bold flex items-center mx-auto mt-4"><Plus size={16} /> 添加行程点</button>
              </div>
            ))}
            
            <button onClick={() => setRoute([...route, { id: Math.random().toString(36).substr(2, 9), category: '', country: '', cities: [{ id: Math.random().toString(36).substr(2, 9), city: '', startDate: '', endDate: '', nights: 0 }] }])} className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-400 font-bold hover:border-orange-400 transition-all">+ 添加国家段行程</button>

            <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="flex items-center space-x-2 ml-4">
                <div className="bg-orange-100 p-1.5 rounded-lg text-orange-600">
                  <Sparkles size={16} />
                </div>
                <label className="text-sm font-bold text-slate-700">
                  特殊行程要求 (智能系统将根据此项进行智能避雷与推荐)
                </label>
              </div>
              <textarea
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="例如：请在罗马行程中包含梵蒂冈博物馆；行程节奏舒缓；剔除任何国内段；景点之间请换行排版..."
                className="w-full p-6 bg-orange-50/30 border border-orange-100 rounded-[2.5rem] outline-none text-sm font-medium text-slate-700 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all shadow-inner resize-none min-h-[120px]"
              />
            </div>
          </section>

          <button onClick={handleGenerate} disabled={isGenerating} className="w-full py-7 bg-gradient-to-r from-orange-600 to-red-500 text-white rounded-[2.5rem] font-bold text-xl shadow-xl flex items-center justify-center transition-all disabled:opacity-70">
            {isGenerating ? <div className="flex items-center"><Loader2 className="animate-spin mr-3" /> <span>{GENERATING_MESSAGES[genMessageIdx]}</span></div> : '立即生成专业行程单'}
          </button>
        </div>
      </div>

      {resultHtml && (
        <div className="mt-20 space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
           <div className="flex justify-between items-end px-4">
             <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center"><CheckCircle2 className="mr-3 text-green-500" size={30} /> 生成预览</h2>
                <p className="text-xs text-slate-400 italic">行程已深度核对日期、闭馆时间与必打卡景点逻辑</p>
             </div>
             <div className="flex space-x-3">
               <button onClick={downloadHtml} className="flex items-center space-x-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm">
                 <FileCode size={20} /> <span>导出 HTML</span>
               </button>
               <button onClick={downloadWord} className="flex items-center space-x-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all">
                 <Download size={20} /> <span>下载 Word 版</span>
               </button>
             </div>
           </div>
           <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="p-8 overflow-x-auto custom-scrollbar bg-slate-50 flex justify-center">
                <div className="bg-white min-w-[1100px] shadow-sm p-12 transform scale-95 origin-top" dangerouslySetInnerHTML={{ __html: resultHtml }} />
              </div>
           </div>
        </div>
      )}

      {/* Chinese Itinerary Generation Section */}
      <div className="mt-20 pt-10 border-t border-slate-200">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center">
            <Languages className="mr-3 text-blue-600" /> 中文行程单定制
          </h2>
          <p className="text-slate-500 mt-2">基于英文行程单或上传文件，一键生成符合国人阅读习惯的中文行程单</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Option 1: From Current Result */}
          <div className={`bg-white p-8 rounded-[2rem] border-2 border-dashed transition-all ${resultHtml ? 'border-blue-200 hover:border-blue-400 shadow-lg' : 'border-slate-100 opacity-60 cursor-not-allowed'}`}>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-blue-50 p-4 rounded-full text-blue-600">
                <FileCode size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">提取当前生成内容</h3>
              <p className="text-sm text-slate-500">直接使用上方生成的英文行程单内容</p>
              <button 
                onClick={() => resultHtml && handleGenerateChinese(resultHtml)} 
                disabled={!resultHtml || isGeneratingChinese}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {isGeneratingChinese ? <Loader2 className="animate-spin" /> : '一键生成中文版'}
              </button>
            </div>
          </div>

          {/* Option 2: Upload File */}
          <div className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-blue-200 hover:border-blue-400 shadow-lg transition-all">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-indigo-50 p-4 rounded-full text-indigo-600">
                <Upload size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">上传行程单文件</h3>
              <p className="text-sm text-slate-500">支持 PDF, Word, 图片等格式</p>
              
              {chineseSourceFile && (
                 <div className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-lg max-w-full animate-in fade-in zoom-in duration-300">
                    <FileText size={16} className="text-indigo-600 shrink-0" />
                    <span className="text-sm font-medium text-indigo-900 truncate max-w-[200px]">{chineseSourceFile.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); setChineseSourceFile(null); }} className="text-indigo-400 hover:text-indigo-600"><Trash2 size={14} /></button>
                 </div>
              )}

              <input 
                type="file" 
                id="chinese-file-upload" 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setChineseSourceFile(e.target.files[0]);
                  }
                }} 
              />
              
              <div className="flex w-full gap-3 mt-2">
                  <button 
                    onClick={() => document.getElementById('chinese-file-upload')?.click()}
                    disabled={isGeneratingChinese}
                    className="flex-1 py-3 border border-indigo-200 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all disabled:opacity-50 flex items-center justify-center text-sm"
                  >
                    {chineseSourceFile ? '更换文件' : '选择文件'}
                  </button>
                  
                  <button 
                    onClick={() => chineseSourceFile && handleGenerateChinese(chineseSourceFile)}
                    disabled={!chineseSourceFile || isGeneratingChinese}
                    className="flex-[1.5] py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center shadow-md text-sm"
                  >
                    {isGeneratingChinese ? <Loader2 className="animate-spin" /> : '开始生成'}
                  </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chinese Result Display */}
        {chineseResultHtml && (
          <div id="chinese-result-section" className="mt-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
             <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-12 text-center">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                   <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-4">中文行程单生成成功！</h2>
                <p className="text-slate-500 mb-10 text-lg">您的行程单已根据最新规则生成完毕，包含景点简介与优化排版。</p>
                
                <button 
                  onClick={downloadChinesePdf} 
                  className="inline-flex items-center space-x-3 px-12 py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 text-lg"
                >
                  <Download size={24} /> <span>立即下载 PDF 行程单</span>
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryZone;
