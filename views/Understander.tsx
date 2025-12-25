
import React, { useState } from 'react';
import { analyzePatentTask } from '../services/gemini';

const Understander: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [mediaData, setMediaData] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const [analysis, setAnalysis] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setMediaData({
          data: base64String,
          mimeType: file.type || 'application/pdf',
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!content && !mediaData) return;
    setLoading(true);

    const systemInstruction = `你是一个顶尖的技术情报分析专家和专利资深审查员。
    任务：对用户提供的技术交底书或专利文档（文本或文件）进行“深度透视”。
    要求：
    1. 提炼技术核心点：用一句话精准描述其本质。
    2. 梳理创新链路：从痛点到手段，再到效果，构建逻辑闭环。
    3. 挖掘潜在缺陷：从侵权风险、可专利性、被绕过的可能性三个维度进行批判。
    4. 如果提供了文件（如PDF），请深度解析其中的图表含义和公式逻辑。
    5. 采用极简、专业且具视觉化感的 Markdown 格式。`;

    const prompt = `
    输入文本内容：
    ${content}

    请结合上传的文件（如有）进行全方位的技术理解与风险评估。`;

    try {
      const res = await analyzePatentTask(
        prompt, 
        systemInstruction, 
        true, 
        true, 
        mediaData ? [{ data: mediaData.data, mimeType: mediaData.mimeType }] : undefined
      );
      setAnalysis(res.response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Deep Insight</p>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900">Understander <span className="text-zinc-400 font-light">| 技术深度理解</span></h2>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading || (!content && !mediaData)}
          className={`px-8 py-3 rounded-2xl font-bold transition-all shadow-lg ${
            loading ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' : 'bg-zinc-900 text-white hover:scale-[1.02] shadow-zinc-200'
          }`}
        >
          {loading ? '正在进行深度透视...' : '一键极速分析'}
        </button>
      </header>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* Left Input Area */}
        <div className="w-1/3 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">交底书 / 专利原文文件</label>
              {mediaData && (
                <button onClick={() => setMediaData(null)} className="text-[10px] text-red-500 font-bold hover:underline">清除文件</button>
              )}
            </div>
            
            <div className={`relative w-full h-32 border-2 border-dashed rounded-[1.5rem] transition-all flex flex-col items-center justify-center p-4 bg-white shadow-sm ${mediaData ? 'border-blue-200 bg-blue-50/20' : 'border-zinc-200 hover:border-blue-300'}`}>
              {mediaData ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{mediaData.mimeType.includes('pdf') ? '📄' : '🖼️'}</span>
                  <div className="text-left overflow-hidden">
                    <p className="text-xs font-bold text-zinc-900 truncate">{mediaData.name}</p>
                    <p className="text-[10px] text-zinc-500">已就绪 · 点击可更换</p>
                  </div>
                  <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="application/pdf,image/*" />
                </div>
              ) : (
                <>
                  <span className="text-2xl mb-1 opacity-30">📂</span>
                  <p className="text-[10px] text-zinc-400 text-center font-bold leading-tight">上传技术文档 PDF 或 图片</p>
                  <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="application/pdf,image/*" />
                </>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">补充说明或粘贴文本</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="可以在此处直接粘贴文本，或补充分析特定的关注点..."
              className="flex-1 bg-white border border-zinc-200 rounded-[1.5rem] p-6 text-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 outline-none transition-all resize-none shadow-sm"
            />
          </div>
        </div>

        {/* Right Analysis Result Area */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden flex flex-col relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <div className="relative mb-8">
                <div className="w-16 h-16 border-4 border-zinc-100 border-t-blue-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black text-blue-600 animate-pulse">AI</span>
                </div>
              </div>
              <p className="text-zinc-900 font-bold">Gemini 3 正在构建技术逻辑图谱</p>
              <div className="mt-4 flex gap-1">
                <div className="w-1 h-1 rounded-full bg-zinc-200 animate-bounce" />
                <div className="w-1 h-1 rounded-full bg-zinc-200 animate-bounce [animation-delay:-.3s]" />
                <div className="w-1 h-1 rounded-full bg-zinc-200 animate-bounce [animation-delay:-.5s]" />
              </div>
            </div>
          ) : analysis ? (
            <div className="flex-1 overflow-y-auto p-12 prose prose-zinc prose-blue max-w-none relative z-10">
              <header className="flex justify-between items-center mb-10 pb-6 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                  <h3 className="text-2xl font-black text-zinc-900 m-0">技术深度透视报告</h3>
                </div>
                <button className="text-xs font-bold text-blue-600 hover:underline">导出报告</button>
              </header>
              <div className="whitespace-pre-wrap leading-relaxed text-zinc-800 text-sm">
                {analysis}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-300 text-center p-12 relative z-10">
              <div className="max-w-xs">
                <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                  <span className="text-5xl">🧠</span>
                </div>
                <h4 className="text-zinc-900 font-black mb-2">上帝视角拆解技术</h4>
                <p className="text-sm font-medium text-zinc-400 leading-relaxed">
                  提供 PDF 卷宗或技术文本，AI 将在数秒内为您提炼最核心的价值点与风险预判。
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {['核心提炼', '创新链路', '规避设计', '风险挖掘'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-zinc-50 border border-zinc-100 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Understander;
