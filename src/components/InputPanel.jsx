import { useState, useRef, useCallback } from 'react';
import { fetchYouTubeData, fetchUrlContent, extractImagesFromHtmlFile } from '../lib/api';
import { extractFromPdf } from '../lib/pdfExtract';

const TABS = [
  { id: 'youtube', label: 'YouTube', icon: '▶' },
  { id: 'url', label: 'Article / URL', icon: '🔗' },
  { id: 'text', label: 'Paste Text', icon: '✏️' },
  { id: 'file', label: 'File Upload', icon: '📄' },
];

export default function InputPanel({ onInputReady, isGenerating }) {
  const [activeTab, setActiveTab] = useState('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [articleUrl, setArticleUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [fileData, setFileData] = useState(null); // { name, type, text, images }
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const fileInputRef = useRef(null);

  const processFile = useCallback(async (file) => {
    if (!file) return;
    const isPdf = file.name.endsWith('.pdf') || file.type === 'application/pdf';
    const isHtml = file.name.endsWith('.html') || file.name.endsWith('.htm') || file.type === 'text/html';

    setIsLoading(true);
    setFetchError('');
    try {
      if (isPdf) {
        const data = await extractFromPdf(file);
        setFileData({ ...data, name: file.name });
      } else if (isHtml) {
        const text = await file.text();
        const data = extractImagesFromHtmlFile(text, file.name);
        setFileData({ ...data, name: file.name });
      } else {
        // Plain text / markdown
        const text = await file.text();
        setFileData({ name: file.name, type: 'file', text, images: [], title: file.name });
      }
    } catch (err) {
      setFetchError(`File processing failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleGenerate = async () => {
    setFetchError('');
    setIsLoading(true);

    try {
      let inputData = null;

      if (activeTab === 'youtube') {
        if (!youtubeUrl.trim()) throw new Error('Please enter a YouTube URL.');
        inputData = await fetchYouTubeData(youtubeUrl.trim());
      } else if (activeTab === 'url') {
        if (!articleUrl.trim()) throw new Error('Please enter a URL.');
        inputData = await fetchUrlContent(articleUrl.trim());
      } else if (activeTab === 'text') {
        if (!rawText.trim()) throw new Error('Please paste some content.');
        inputData = { type: 'text', text: rawText.trim(), title: 'Pasted Content', images: [] };
      } else if (activeTab === 'file') {
        if (!fileData) throw new Error('Please upload a file.');
        inputData = fileData;
      }

      onInputReady(inputData);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const imageCount = fileData?.images?.length ?? 0;

  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#0e0e18] p-6 shadow-xl">
      <h2 className="text-xl font-semibold text-white mb-1">Content Input</h2>
      <p className="text-sm text-[#6b7280] mb-5">Drop in your content and let Glow do the magic ✨</p>

      {/* Tab Switcher */}
      <div className="flex gap-1 mb-6 bg-[#12121c] rounded-xl p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setFetchError(''); }}
            className={`flex-1 flex items-center justify-center gap-1.5 text-sm py-2 px-3 rounded-lg transition-all font-medium cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#c084fc22] text-[#c084fc] border border-[#c084fc44]'
                : 'text-[#6b7280] hover:text-[#9ca3af]'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* YouTube */}
      {activeTab === 'youtube' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[#9ca3af]">YouTube URL</label>
          <input
            type="url"
            value={youtubeUrl}
            onChange={e => setYoutubeUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-xl px-4 py-3 text-white placeholder-[#3a3a4a] focus:outline-none focus:border-[#c084fc66] text-sm transition-colors"
          />
          <p className="text-xs text-[#4b5563]">Thumbnail will be used in image-layout carousel slides.</p>
        </div>
      )}

      {/* Article URL */}
      {activeTab === 'url' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[#9ca3af]">Article or Website URL</label>
          <input
            type="url"
            value={articleUrl}
            onChange={e => setArticleUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            placeholder="https://medium.com/..."
            className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-xl px-4 py-3 text-white placeholder-[#3a3a4a] focus:outline-none focus:border-[#c084fc66] text-sm transition-colors"
          />
          <p className="text-xs text-[#4b5563]">Images in the article will be extracted for carousel slides.</p>
        </div>
      )}

      {/* Raw Text */}
      {activeTab === 'text' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[#9ca3af]">Paste your content</label>
          <textarea
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder="Paste your article, newsletter, blog post, talk notes..."
            rows={8}
            className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-xl px-4 py-3 text-white placeholder-[#3a3a4a] focus:outline-none focus:border-[#c084fc66] text-sm transition-colors resize-none"
          />
          <p className="text-xs text-[#4b5563]">{rawText.length} chars · Carousel will use smart typography (no images)</p>
        </div>
      )}

      {/* File Upload */}
      {activeTab === 'file' && (
        <div className="space-y-3">
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#c084fc] bg-[#c084fc11]'
                : fileData
                ? 'border-[#c084fc66] bg-[#c084fc08]'
                : 'border-[#1e1e2e] hover:border-[#c084fc44] bg-[#12121c]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.pdf,.html,.htm"
              className="hidden"
              onChange={e => processFile(e.target.files[0])}
            />
            {isLoading ? (
              <div>
                <div className="inline-block w-8 h-8 border-2 border-[#c084fc]/30 border-t-[#c084fc] rounded-full animate-spin mb-2" />
                <p className="text-sm text-[#9ca3af]">Processing file...</p>
              </div>
            ) : fileData ? (
              <div>
                <div className="text-3xl mb-2">✅</div>
                <p className="text-[#c084fc] font-medium text-sm">{fileData.name}</p>
                <p className="text-[#6b7280] text-xs mt-1">
                  {fileData.text?.length?.toLocaleString()} chars
                  {imageCount > 0 && ` · ${imageCount} image${imageCount > 1 ? 's' : ''} extracted`}
                </p>
                {imageCount > 0 && (
                  <p className="text-[#4b5563] text-xs mt-1">Images will be used in carousel slides</p>
                )}
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-3">📁</div>
                <p className="text-[#9ca3af] text-sm font-medium">Drop file here or click to browse</p>
                <p className="text-[#4b5563] text-xs mt-1">.txt, .md, .html — images extracted · .pdf — pages rendered as images</p>
              </div>
            )}
          </div>
        </div>
      )}

      {fetchError && (
        <p className="mt-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
          {fetchError}
        </p>
      )}

      <button
        onClick={handleGenerate}
        disabled={isLoading || isGenerating}
        className="mt-5 w-full py-3.5 rounded-xl font-semibold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
          bg-gradient-to-r from-[#a855f7] to-[#c084fc] text-white shadow-lg shadow-purple-900/30
          hover:shadow-purple-900/50 hover:from-[#9333ea] hover:to-[#a855f7] active:scale-[0.98]"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Fetching content...
          </span>
        ) : isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating with AI...
          </span>
        ) : (
          '✨ Generate with Glow'
        )}
      </button>
    </div>
  );
}
