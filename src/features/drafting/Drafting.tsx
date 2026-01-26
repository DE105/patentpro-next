
import React, { useState } from 'react';
import { analyzePatentTask, readFileAsDataUrl } from '@/shared';

const Drafting: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await readFileAsDataUrl(file);
        setImageData(dataUrl);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleGenerate = async () => {
    if (!claims) return;
    setLoading(true);
    setResult('');

    const systemInstruction = `你是一个资深的专利撰写专家。
    任务：根据用户提供的“权利要求书”和“附图”，撰写完整的“说明书”。
    要求：
    1. 包含：技术领域、背景技术、发明内容、具体实施方式。
    2. 如果用户提供了附图，必须在“具体实施方式”中详细进行图文对照说明（AI 需识别图中零件并赋予逻辑编号）。
    3. 语言严谨，符合专利法实施细则的要求。
    4. 采用 Markdown 格式输出。`;

    const prompt = `
    权利要求书内容：
    ${claims}

    请结合附图内容生成完整的专利说明书。`;

    try {
      const base64Image = imageData?.split(',')[1];
      // FIX: Wrap the image part in an array to match the expected { data: string; mimeType: string }[] type
      const res = await analyzePatentTask(prompt, systemInstruction, true, false, base64Image ? [{ data: base64Image, mimeType: 'image/jpeg' }] : undefined);
      setResult(res.response);
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
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Module</p>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900">Drafting 2.0 <span className="text-zinc-400 font-light">| 说明书撰写</span></h2>
        </div>
        <button
          disabled={loading || !claims}
          onClick={handleGenerate}
          className={`px-8 py-3 rounded-2xl font-bold transition-all shadow-lg ${
            loading ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : 'bg-zinc-900 text-white hover:scale-[1.02] shadow-zinc-200'
          }`}
        >
          {loading ? 'AI 正在解析与撰写...' : '生成完整说明书'}
        </button>
      </header>

      <div className="flex-1 flex gap-8 min-h-0">
        <div className="w-1/3 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">权利要求书 (Claims)</label>
            <textarea
              value={claims}
              onChange={(e) => setClaims(e.target.value)}
              placeholder="请粘贴权利要求书文本..."
              className="w-full h-64 bg-white border border-zinc-200 rounded-[2rem] p-6 text-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 outline-none transition-all resize-none shadow-sm"
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">附图上传 (Multimodal Drawing)</label>
            <div className={`relative w-full aspect-video border-2 border-dashed rounded-[2rem] transition-all flex flex-col items-center justify-center p-4 ${imageData ? 'border-blue-200 bg-blue-50/20' : 'border-zinc-200 hover:border-blue-300'}`}>
              {imageData ? (
                <div className="relative w-full h-full">
                  <img src={imageData} alt="Draft drawing" className="w-full h-full object-contain rounded-xl" />
                  <button onClick={() => setImageData(null)} className="absolute top-2 right-2 bg-white/80 backdrop-blur shadow-sm w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-white transition-colors">✕</button>
                </div>
              ) : (
                <>
                  <span className="text-3xl mb-2 opacity-30">🖼️</span>
                  <p className="text-xs text-zinc-500 text-center font-medium">点击或拖拽上传专利附图<br/><span className="text-[10px] font-normal">支持 JPG/PNG/PDF</span></p>
                  <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm flex flex-col overflow-hidden">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6" />
              <p className="text-zinc-900 font-bold">Gemini 3 正在构建图文对应逻辑</p>
              <p className="text-zinc-500 text-xs mt-2">预计耗时 15-30 秒</p>
            </div>
          ) : result ? (
            <div className="flex-1 overflow-y-auto p-12 prose prose-zinc max-w-none">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-zinc-100">
                <h3 className="text-2xl font-black text-zinc-900 m-0">说明书草案</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-zinc-50 hover:bg-zinc-100 rounded-xl text-xs font-bold transition-colors">复制全文</button>
                  <button className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-zinc-200">下载 .docx</button>
                </div>
              </div>
              <div className="whitespace-pre-wrap leading-loose text-zinc-700 font-normal">
                {result}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-300">
              <span className="text-6xl mb-6 opacity-30">📄</span>
              <p className="font-bold">生成内容将在此处显示</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Drafting;
