
import React, { useState, useRef, useEffect } from 'react';
import { analyzePatentTask } from '../services/gemini';
import { AnalysisResult } from '../types';

interface DocItem {
  id: string;
  category: 'OA' | 'APP' | 'PRIOR';
  label: string;
  text: string;
  file?: { data: string; mimeType: string; name: string };
}

const OAAgent: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<DocItem[]>([
    { id: 'oa-1', category: 'OA', label: '审查意见通知书', text: '' },
    { id: 'app-1', category: 'APP', label: '本申请权利要求', text: '' },
    { id: 'prior-1', category: 'PRIOR', label: '对比文件 D1', text: '' },
  ]);
  
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addPriorArt = () => {
    const count = docs.filter(d => d.category === 'PRIOR').length + 1;
    setDocs([...docs, { 
      id: `prior-${Date.now()}`, 
      category: 'PRIOR', 
      label: `对比文件 D${count}`, 
      text: '' 
    }]);
  };

  const removeDoc = (id: string) => {
    if (docs.find(d => d.id === id)?.category === 'PRIOR') {
      setDocs(docs.filter(d => d.id !== id));
    }
  };

  const updateDoc = (id: string, updates: Partial<DocItem>) => {
    setDocs(docs.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        updateDoc(id, {
          file: { data: base64String, mimeType: file.type || 'application/pdf', name: file.name }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    const hasOA = docs.some(d => d.category === 'OA' && (d.text || d.file));
    if (!hasOA) return;

    setLoading(true);
    setResult(null);
    setThinkingSteps(['加载 Gemini 3 多模态逻辑引擎...', '构建跨文档语义关联矩阵...', '对齐 [审查意见] 与 [本申请] 特征点...']);

    const interval = setInterval(() => {
      setThinkingSteps(prev => {
        const steps = [
          '识别对比文件 D1 的关键公开特征...',
          '识别对比文件 D2 的结合启示 (如果有)...',
          '根据《专利审查指南》进行创造性“三步法”逻辑闭环测试...',
          '正在撰写高说服力抗辩意见稿...'
        ];
        if (prev.length < 7) {
          return [...prev, steps[prev.length - 3] || '正在优化法律措辞...'];
        }
        return prev;
      });
    }, 2500);

    try {
      const systemInstruction = `你是一个拥有20年经验的资深专利代理人，精通中美欧专利法。
      任务：基于用户提供的完整案件卷宗（包含通知书、本申请、及多份对比文件），进行深度创造性分析。
      
      工作逻辑：
      1. 必须准确区分 [OA通知书]、[本申请] 和 [对比文件 D1, D2...]。
      2. 严格执行创造性分析“三步法”：
         - 确定最接近的现有技术（通常是 D1）。
         - 确定本申请与 D1 的区别特征及其实际解决的技术问题。
         - 判断现有技术（D1, D2...）是否给出了将该区别特征应用到最接近现有技术以解决该技术问题的启示。
      3. 重点寻找审查员在结合 D1 和 D2 时是否存在“事后诸葛亮”的逻辑缺陷。
      4. 输出：一份专业的分析报告 + 三套抗辩策略。使用 Markdown。`;

      const contextText = docs.map(d => `[${d.label}]:\n${d.text || '见附件'}`).join('\n\n');
      const mediaItems = docs.filter(d => d.file).map(d => ({ 
        data: d.file!.data, 
        mimeType: d.file!.mimeType 
      }));

      const res = await analyzePatentTask(contextText, systemInstruction, true, true, mediaItems);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Case Workspace</p>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900">OA Assistant 2.0 <span className="text-zinc-400 font-light">| 卷宗协同分析</span></h2>
        </div>
        <button 
          disabled={loading || !docs.some(d => d.category === 'OA' && (d.text || d.file))}
          onClick={handleAnalyze}
          className={`px-10 py-3.5 rounded-2xl font-bold shadow-xl transition-all ${
            loading ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' : 'bg-zinc-900 text-white hover:scale-[1.02] active:scale-95'
          }`}
        >
          {loading ? 'AI 正在深度博弈...' : '开始跨文档三步法分析'}
        </button>
      </header>

      <div className="flex-1 min-h-0 flex gap-8">
        {/* Left: Document Library */}
        <div className="w-2/5 flex flex-col gap-4 overflow-y-auto pr-3 custom-scrollbar pb-8">
          <div className="flex items-center justify-between px-1 mb-2">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">案件参考卷宗 (Context)</h3>
            <button 
              onClick={addPriorArt}
              className="text-[10px] font-bold bg-zinc-100 text-zinc-600 hover:bg-zinc-200 px-3 py-1 rounded-full transition-colors"
            >
              + 添加对比文件
            </button>
          </div>

          <div className="space-y-4">
            {docs.map((doc) => (
              <div key={doc.id} className={`group relative bg-white border rounded-[1.5rem] p-5 transition-all shadow-sm ${doc.file ? 'border-blue-200 ring-2 ring-blue-500/5' : 'border-zinc-200 hover:border-zinc-300'}`}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${doc.category === 'OA' ? 'bg-red-400' : doc.category === 'APP' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                    <span className="text-xs font-bold text-zinc-900">{doc.label}</span>
                  </div>
                  {doc.category === 'PRIOR' && (
                    <button onClick={() => removeDoc(doc.id)} className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity">
                      ✕
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="relative group/file">
                    <div className={`h-16 border-2 border-dashed rounded-xl flex items-center justify-center transition-all ${doc.file ? 'border-blue-100 bg-blue-50/30' : 'border-zinc-100 hover:border-zinc-200'}`}>
                      {doc.file ? (
                        <div className="flex items-center gap-2 px-4 w-full">
                          <span className="text-lg">📄</span>
                          <span className="text-[10px] font-medium text-blue-600 truncate flex-1">{doc.file.name}</span>
                          <button onClick={() => updateDoc(doc.id, { file: undefined })} className="text-zinc-400 hover:text-red-500 text-xs">✕</button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">上传 PDF / 图片</span>
                          <input 
                            type="file" 
                            onChange={(e) => handleFileUpload(doc.id, e)}
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            accept="application/pdf,image/*"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <textarea
                    value={doc.text}
                    onChange={(e) => updateDoc(doc.id, { text: e.target.value })}
                    placeholder={`粘贴${doc.label}的关键文本内容...`}
                    className="w-full h-24 bg-zinc-50/50 border-none rounded-xl p-3 text-[11px] text-zinc-600 outline-none focus:bg-white focus:ring-1 focus:ring-blue-100 transition-all resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Analysis Result */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <div className="w-full max-w-sm space-y-6">
                <div className="flex flex-col items-center mb-8">
                  <div className="w-16 h-16 rounded-full thinking-gradient blur-2xl opacity-20 absolute" />
                  <div className="w-16 h-16 border-2 border-zinc-100 border-t-blue-600 rounded-full animate-spin relative z-10" />
                  <p className="mt-6 text-sm font-bold text-zinc-900">Gemini 3 正在博弈抗辩策略</p>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">PhD Level Logic Engaged</p>
                </div>
                
                <div className="space-y-3">
                  {thinkingSteps.map((step, i) => (
                    <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-700" style={{ animationDelay: `${i * 300}ms` }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <p className="text-[11px] text-zinc-600 font-medium leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : result ? (
            <div className="flex-1 overflow-y-auto p-12 prose prose-zinc prose-blue max-w-none">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black m-0">跨文档分析报告</h3>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">Final Strategy</span>
                </div>
                <div className="flex gap-2">
                  <button className="px-5 py-2 bg-zinc-50 hover:bg-zinc-100 rounded-xl text-xs font-bold transition-colors border border-zinc-100">复制报告</button>
                  <button className="px-5 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-zinc-200">下载答复建议书</button>
                </div>
              </div>
              
              <div className="whitespace-pre-wrap leading-relaxed text-zinc-800 font-normal">
                {result.response}
              </div>

              {result.groundingSources && result.groundingSources.length > 0 && (
                <div className="mt-16 pt-8 border-t border-zinc-100">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> 法律检索验证 (Search Grounding)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {result.groundingSources.map((source: any, idx: number) => (
                      <a key={idx} href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all block group">
                        <p className="text-xs font-bold text-zinc-700 group-hover:text-blue-600 truncate mb-1">{source.web?.title}</p>
                        <p className="text-[10px] text-zinc-400 truncate font-mono">{source.web?.uri}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-zinc-400">
              <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl opacity-40">💼</span>
              </div>
              <h3 className="text-xl font-black text-zinc-900 mb-2">准备好您的答复卷宗</h3>
              <p className="max-w-xs text-sm leading-relaxed">
                在左侧上传本案的所有关键文档。AI 将自动在多文档间建立逻辑关联，为您生成专业的答复方案。
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-xs">
                <div className="p-3 border border-zinc-100 rounded-xl text-[10px] font-bold">逻辑对齐</div>
                <div className="p-3 border border-zinc-100 rounded-xl text-[10px] font-bold">三步法验证</div>
                <div className="p-3 border border-zinc-100 rounded-xl text-[10px] font-bold">抗辩策略</div>
                <div className="p-3 border border-zinc-100 rounded-xl text-[10px] font-bold">判例检索</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAAgent;
