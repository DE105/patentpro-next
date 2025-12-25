
import React, { useState } from 'react';
import { analyzePatentTask } from '../services/gemini';

interface MediaFile {
  data: string;
  mimeType: string;
  name: string;
}

const DiffExpert: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [doc1Text, setDoc1Text] = useState('');
  const [doc2Text, setDoc2Text] = useState('');
  const [doc1File, setDoc1File] = useState<MediaFile | null>(null);
  const [doc2File, setDoc2File] = useState<MediaFile | null>(null);
  const [diffResult, setDiffResult] = useState('');

  const handleFileUpload = (side: 'A' | 'B', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        const media = {
          data: base64String,
          mimeType: file.type || 'application/pdf',
          name: file.name
        };
        if (side === 'A') setDoc1File(media);
        else setDoc2File(media);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompare = async () => {
    if ((!doc1Text && !doc1File) || (!doc2Text && !doc2File)) return;
    setLoading(true);

    const systemInstruction = `你是一个极致精细的专利对比分析专家和侵权判定专家。
    任务：对比“文档 A”与“文档 B”的实质技术特征差异。
    要求：
    1. 语义 Diff：识别两份文档在技术特征、实施方式、零件结构上的具体差异。
    2. 实质性改动分析：是否存在特征的增加、减少、置换？是否属于本领域的惯用手段替换？
    3. 覆盖关系预判：分析文档 B 是否落入文档 A 的保护范围（如果是对比权利要求），或两者的等同性。
    4. 如果提供了文件（PDF/图表），请重点比对附图中的结构差异。
    5. 采用结构清晰的对比表格或分条目 Markdown 输出，确保逻辑具有极强的法律对抗性。`;

    const prompt = `
    【文档 A】
    文本内容：${doc1Text || '见附件'}
    
    【文档 B】
    文本内容：${doc2Text || '见附件'}

    请执行深度语义对比并输出分析报告。`;

    try {
      const mediaItems = [];
      if (doc1File) mediaItems.push({ data: doc1File.data, mimeType: doc1File.mimeType });
      if (doc2File) mediaItems.push({ data: doc2File.data, mimeType: doc2File.mimeType });

      const res = await analyzePatentTask(
        prompt, 
        systemInstruction, 
        true, 
        true, 
        mediaItems.length > 0 ? mediaItems : undefined
      );
      setDiffResult(res.response);
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
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Comparison Engine</p>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900">Diff Expert <span className="text-zinc-400 font-light">| 语义差异对比</span></h2>
        </div>
        <button
          onClick={handleCompare}
          disabled={loading || ((!doc1Text && !doc1File) || (!doc2Text && !doc2File))}
          className={`px-10 py-3.5 rounded-2xl font-bold shadow-xl transition-all ${
            loading ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' : 'bg-zinc-900 text-white hover:scale-[1.02] active:scale-95 shadow-zinc-200'
          }`}
        >
          {loading ? 'AI 正在执行高维比对...' : '开始深度语义对比'}
        </button>
      </header>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Input Columns */}
        <div className="w-1/2 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          {/* Doc A */}
          <div className="space-y-3 p-5 bg-white border border-zinc-200 rounded-[2rem] shadow-sm relative">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">文档 A (基准文本/文件)</label>
              {doc1File && <button onClick={() => setDoc1File(null)} className="text-[10px] text-red-500 font-bold">移除</button>}
            </div>
            
            <div className={`relative w-full h-24 border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center p-3 ${doc1File ? 'border-blue-200 bg-blue-50/20' : 'border-zinc-100 hover:border-blue-200'}`}>
              {doc1File ? (
                <div className="flex items-center gap-2 px-4 w-full">
                  <span className="text-xl">📄</span>
                  <p className="text-[10px] font-bold text-blue-600 truncate flex-1">{doc1File.name}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-xl opacity-30 mb-1">📤</span>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">上传 PDF / 图片</p>
                  <input type="file" onChange={(e) => handleFileUpload('A', e)} className="absolute inset-0 opacity-0 cursor-pointer" accept="application/pdf,image/*" />
                </div>
              )}
            </div>

            <textarea
              value={doc1Text}
              onChange={(e) => setDoc1Text(e.target.value)}
              placeholder="或者粘贴基准文本内容..."
              className="w-full h-32 bg-zinc-50 border-none rounded-xl p-4 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-100 transition-all resize-none"
            />
          </div>

          {/* Doc B */}
          <div className="space-y-3 p-5 bg-white border border-zinc-200 rounded-[2rem] shadow-sm relative">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">文档 B (对比文本/文件)</label>
              {doc2File && <button onClick={() => setDoc2File(null)} className="text-[10px] text-red-500 font-bold">移除</button>}
            </div>

            <div className={`relative w-full h-24 border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center p-3 ${doc2File ? 'border-indigo-200 bg-indigo-50/20' : 'border-zinc-100 hover:border-indigo-200'}`}>
              {doc2File ? (
                <div className="flex items-center gap-2 px-4 w-full">
                  <span className="text-xl">📄</span>
                  <p className="text-[10px] font-bold text-indigo-600 truncate flex-1">{doc2File.name}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-xl opacity-30 mb-1">📥</span>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">上传 PDF / 图片</p>
                  <input type="file" onChange={(e) => handleFileUpload('B', e)} className="absolute inset-0 opacity-0 cursor-pointer" accept="application/pdf,image/*" />
                </div>
              )}
            </div>

            <textarea
              value={doc2Text}
              onChange={(e) => setDoc2Text(e.target.value)}
              placeholder="或者粘贴对比文本内容..."
              className="w-full h-32 bg-zinc-50 border-none rounded-xl p-4 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100 transition-all resize-none"
            />
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <div className="relative mb-8">
                <div className="w-16 h-16 border-2 border-zinc-100 border-t-blue-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-black text-blue-600">DIFF</span>
                </div>
              </div>
              <p className="text-sm font-black text-zinc-900">Gemini 3 正在构建多维差异矩阵</p>
              <div className="mt-4 space-y-2 w-48">
                <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 animate-progress origin-left" />
                </div>
              </div>
            </div>
          ) : diffResult ? (
            <div className="flex-1 overflow-y-auto p-12 prose prose-zinc prose-blue max-w-none">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black m-0">语义差异报告</h3>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded">精准对齐</span>
                </div>
                <button className="px-5 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold shadow-lg">导出对比表</button>
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
                {diffResult}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-300 p-12 text-center">
              <div className="w-24 h-24 bg-zinc-50 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-3 shadow-inner">
                <span className="text-5xl">↔️</span>
              </div>
              <h3 className="text-xl font-black text-zinc-900 mb-2">智能语义对比</h3>
              <p className="max-w-sm text-sm text-zinc-400 leading-relaxed font-medium">
                上传两份需要对比的技术文档或权利要求书，AI 将为您深度挖掘“实质性技术特征”的差异点与潜在侵权风险。
              </p>
              <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="p-4 border border-zinc-100 rounded-2xl flex items-center gap-3">
                  <span className="text-blue-500 font-bold text-lg">01</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase text-left">结构级<br/>Diff</span>
                </div>
                <div className="p-4 border border-zinc-100 rounded-2xl flex items-center gap-3">
                  <span className="text-indigo-500 font-bold text-lg">02</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase text-left">侵权风险<br/>预警</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        .animate-progress {
          animation: progress 20s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default DiffExpert;
