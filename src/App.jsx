import { useGlowStore } from './hooks/useGlowStore';
import { generateContent } from './lib/api';
import InputPanel from './components/InputPanel';
import BrandKit from './components/BrandKit';
import LinkedInPost from './components/LinkedInPost';
import TakeawayCards from './components/TakeawayCard';
import CoverImage from './components/CoverImage';
import CarouselSlides from './components/CarouselSlides';

const OUTPUT_TABS = [
  { id: 'post', label: '📝 LinkedIn Post' },
  { id: 'cards', label: '💡 Takeaway Cards' },
  { id: 'cover', label: '🖼️ Cover Image' },
  { id: 'carousel', label: '📑 Carousel' },
];

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-8">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#a855f7]/20 to-[#c084fc]/20 border border-[#c084fc]/20 flex items-center justify-center text-4xl">
          ✨
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#c084fc] opacity-60 animate-pulse" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Your content assets will appear here</h3>
      <p className="text-sm text-[#6b7280] max-w-sm leading-relaxed">
        Paste a YouTube link, URL, or text on the left — Glow will generate a LinkedIn post, visual cards, and a full carousel.
      </p>
    </div>
  );
}

function GeneratingState() {
  const steps = [
    { label: 'Reading your content', done: true },
    { label: 'Extracting key insights', done: true },
    { label: 'Crafting LinkedIn copy', done: false },
    { label: 'Designing carousel structure', done: false },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-8">
      <div className="relative mb-8">
        <div className="w-16 h-16 rounded-full border-2 border-[#c084fc]/30 border-t-[#c084fc] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">✨</div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Glow is working its magic...</h3>
      <p className="text-sm text-[#6b7280] mb-8">Claude is analyzing your content</p>
      <div className="space-y-3 w-full max-w-xs">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              step.done ? 'bg-[#c084fc]' : 'border border-[#c084fc]/30 animate-pulse'
            }`}>
              {step.done ? <span className="text-white text-xs">✓</span> : null}
            </div>
            <span className={step.done ? 'text-[#9ca3af]' : 'text-[#6b7280]'}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const {
    brand, updateBrand,
    inputData, setInputData,
    output, setOutput,
    isGenerating, setIsGenerating,
    error, setError,
    activeTab, setActiveTab,
    reset,
  } = useGlowStore();

  const handleInputReady = async (data) => {
    setInputData(data);
    setError(null);
    setIsGenerating(true);

    try {
      const result = await generateContent(data);
      setOutput(result);
      setActiveTab('post');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-[#1e1e2e] bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a855f7] to-[#c084fc] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-900/40">
              G
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Glow</span>
            <span className="hidden sm:inline text-xs text-[#6b7280] bg-[#c084fc11] border border-[#c084fc22] rounded-full px-2 py-0.5">
              Content Repurpose Agent
            </span>
          </div>
          {output && (
            <button
              onClick={reset}
              className="text-xs text-[#6b7280] hover:text-[#9ca3af] cursor-pointer transition-colors px-3 py-1.5 rounded-lg hover:bg-[#ffffff08]"
            >
              ← New Content
            </button>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr_280px] gap-6 items-start">
          {/* Left: Input + Error */}
          <div className="space-y-4">
            <InputPanel onInputReady={handleInputReady} isGenerating={isGenerating} />
            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-sm text-red-400 font-medium mb-1">Generation failed</p>
                <p className="text-xs text-red-400/80">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-xs text-red-400 hover:underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          {/* Center: Output */}
          <div className="rounded-2xl border border-[#1e1e2e] bg-[#0e0e18] overflow-hidden">
            {!output && !isGenerating ? (
              <EmptyState />
            ) : isGenerating ? (
              <GeneratingState />
            ) : (
              <div>
                {/* Output Tabs */}
                <div className="flex border-b border-[#1e1e2e] bg-[#0a0a0f] overflow-x-auto">
                  {OUTPUT_TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 flex-1 py-3.5 text-xs font-medium transition-all cursor-pointer border-b-2 whitespace-nowrap px-2 ${
                        activeTab === tab.id
                          ? 'text-[#c084fc] border-[#c084fc]'
                          : 'text-[#6b7280] border-transparent hover:text-[#9ca3af]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                  {activeTab === 'post' && (
                    <LinkedInPost post={output?.linkedinPost} />
                  )}
                  {activeTab === 'cards' && (
                    <TakeawayCards
                      takeaways={output?.takeaways}
                      brand={brand}
                      sourceTitle={output?.sourceTitle || inputData?.title}
                    />
                  )}
                  {activeTab === 'cover' && (
                    <CoverImage
                      title={output?.sourceTitle || inputData?.title || 'Key Insights'}
                      subtitle={output?.summary}
                      brand={brand}
                      thumbnail={inputData?.thumbnail}
                    />
                  )}
                  {activeTab === 'carousel' && (
                    <CarouselSlides slides={output?.carousel} brand={brand} />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Brand Kit */}
          <div className="sticky top-24">
            <BrandKit brand={brand} updateBrand={updateBrand} />
          </div>
        </div>
      </main>
    </div>
  );
}
