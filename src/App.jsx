import { useGlowStore } from './hooks/useGlowStore';
import { generateContent } from './lib/api';
import InputPanel from './components/InputPanel';
import BrandKit from './components/BrandKit';
import LinkedInPost from './components/LinkedInPost';
import CoverImage from './components/CoverImage';
import CarouselSlides from './components/CarouselSlides';
import ImageManager from './components/ImageManager';

const OUTPUT_TABS = [
  { id: 'post', label: 'Post Copy' },
  { id: 'cover', label: 'Cover Image' },
  { id: 'carousel', label: 'Carousel' },
];

const CONTENT_TYPE_LABELS = {
  opinion: 'Opinion',
  tutorial: 'Tutorial',
  story: 'Story',
  data: 'Data / Stats',
  comparison: 'Comparison',
};

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center px-8 py-12">
      <div className="relative mb-8">
        {/* Logo mark */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#c084fc] flex items-center justify-center shadow-xl shadow-purple-900/40">
          <span className="text-white font-black text-2xl" style={{ fontFamily: 'Inter, system-ui' }}>G</span>
        </div>
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#c084fc] opacity-70 animate-pulse" />
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">
        Your LinkedIn assets will appear here
      </h3>
      <p className="text-sm text-[#6b7280] max-w-sm leading-relaxed mb-8">
        Input your content on the left — Glow's three agents work together to generate everything you need to post on LinkedIn.
      </p>

      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        {[
          { icon: '✦', label: 'Copy Agent', desc: 'LinkedIn post copy' },
          { icon: '◻', label: 'Cover Agent', desc: '1200×628 cover' },
          { icon: '⧖', label: 'Carousel Agent', desc: '8-slide carousel' },
        ].map(({ icon, label, desc }) => (
          <div key={label} className="bg-[#0e0e18] border border-[#1e1e2e] rounded-2xl p-3 text-center">
            <div className="text-[#c084fc] text-base mb-1">{icon}</div>
            <div className="text-xs font-semibold text-white mb-0.5">{label}</div>
            <div className="text-xs text-[#4b5563]">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GeneratingState() {
  const steps = [
    'Copy Agent: analyzing content and extracting key insights',
    'Copy Agent: drafting LinkedIn post copy',
    'Cover Agent: designing cover image layout',
    'Carousel Agent: building atomic slide components',
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center px-8 py-12">
      <div className="relative mb-8">
        <div className="w-14 h-14 rounded-full border-2 border-[#c084fc]/25 border-t-[#c084fc] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#a855f7]/20 border-t-[#a855f7] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
      </div>

      <h3 className="text-base font-semibold text-white mb-1">Agents are working...</h3>
      <p className="text-xs text-[#6b7280] mb-8">Claude is analyzing your content</p>

      <div className="space-y-3 w-full max-w-xs text-left">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3 text-xs">
            <div className="w-4 h-4 rounded-full border border-[#c084fc]/30 animate-pulse mt-0.5 flex-shrink-0" />
            <span className="text-[#4b5563] leading-relaxed">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const {
    brand, updateBrand,
    identityMode, setIdentityMode,
    inputData, setInputData,
    output, setOutput,
    getMergedSlides,
    reassignSlideImage,
    removeExtractedImage,
    addExtractedImage,
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

  const images = inputData?.images || [];
  const mergedSlides = getMergedSlides();
  const thumbnail = inputData?.thumbnail || images[0]?.url;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-[#1e1e2e] bg-[#0a0a0f]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#a855f7] to-[#c084fc] flex items-center justify-center shadow-lg shadow-purple-900/40">
              <span className="text-white font-black text-sm" style={{ fontFamily: 'Inter, system-ui' }}>G</span>
            </div>
            <span className="text-white font-bold text-base tracking-tight">Glow</span>
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-[#6b7280] bg-[#c084fc0e] border border-[#c084fc1e] rounded-full px-2.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c084fc] animate-pulse" />
              Content Repurpose Agent
            </span>

            {/* Content type badge — shown after generation */}
            {output?.contentType && (
              <span className="text-xs text-[#a855f7] bg-[#a855f7]/10 border border-[#a855f7]/20 rounded-full px-2.5 py-0.5">
                {CONTENT_TYPE_LABELS[output.contentType] || output.contentType}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Identity mode pill */}
            {output && (
              <span className="text-xs text-[#6b7280]">
                {identityMode === 'author' ? '✍️ Author mode' : '🔖 Recommender mode'}
              </span>
            )}
            {output && (
              <button
                onClick={reset}
                className="text-xs text-[#6b7280] hover:text-[#9ca3af] cursor-pointer transition-colors px-3 py-1.5 rounded-lg hover:bg-[#ffffff08] border border-transparent hover:border-[#1e1e2e]"
              >
                ← New Content
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_260px] gap-5 items-start">

          {/* Left: Input + Image Manager */}
          <div className="space-y-4">
            <InputPanel
              onInputReady={handleInputReady}
              isGenerating={isGenerating}
              identityMode={identityMode}
              setIdentityMode={setIdentityMode}
            />

            {output && images.length > 0 && (
              <ImageManager
                images={images}
                onRemove={removeExtractedImage}
                onAdd={addExtractedImage}
              />
            )}

            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-sm text-red-400 font-medium mb-1">Generation failed</p>
                <p className="text-xs text-red-400/80 leading-relaxed">{error}</p>
                <button onClick={() => setError(null)} className="mt-2 text-xs text-red-400 hover:underline cursor-pointer">
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
                {/* Tabs */}
                <div className="flex border-b border-[#1e1e2e] bg-[#0a0a0f]">
                  {OUTPUT_TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-3.5 text-xs font-medium transition-all cursor-pointer border-b-2 ${
                        activeTab === tab.id
                          ? 'text-[#c084fc] border-[#c084fc]'
                          : 'text-[#6b7280] border-transparent hover:text-[#9ca3af]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(100vh-180px)]">
                  {activeTab === 'post' && (
                    <LinkedInPost post={output?.linkedinPost} />
                  )}
                  {activeTab === 'cover' && (
                    <CoverImage
                      coverData={output?.coverData}
                      brand={brand}
                      thumbnail={thumbnail}
                    />
                  )}
                  {activeTab === 'carousel' && (
                    <CarouselSlides
                      slides={mergedSlides}
                      brand={brand}
                      images={images}
                      onReassignImage={reassignSlideImage}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Brand Kit */}
          <div className="sticky top-20">
            <BrandKit brand={brand} updateBrand={updateBrand} />
          </div>
        </div>
      </main>
    </div>
  );
}
