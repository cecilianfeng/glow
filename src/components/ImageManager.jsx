import { useState } from 'react';

/**
 * Shows all extracted images from the input source.
 * Lets the user remove images they don't want included in the carousel.
 */
export default function ImageManager({ images, onRemove, onAdd }) {
  const [expanded, setExpanded] = useState(false);

  if (!images?.length) return null;

  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#0e0e18] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#ffffff04] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#c084fc1a] border border-[#c084fc22] flex items-center justify-center text-sm">
            🖼️
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">Extracted Images</p>
            <p className="text-xs text-[#6b7280]">{images.length} found from source</p>
          </div>
        </div>
        <span className={`text-[#6b7280] text-xs transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#1e1e2e]">
          <p className="text-xs text-[#6b7280] mt-3 mb-3">
            These images will be used in carousel slides. Remove any you don't want.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border border-[#1e1e2e] aspect-square">
                <img
                  src={img.url}
                  alt={img.alt || `Image ${i + 1}`}
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.currentTarget.parentElement.style.opacity = '0.3';
                  }}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <span className="text-xs text-white/80 text-center px-2 leading-tight">
                    {img.isHero ? 'Hero' : img.isPageRender ? `Page ${img.pageNum}` : img.alt?.slice(0, 20) || `#${i + 1}`}
                  </span>
                  {onRemove && (
                    <button
                      onClick={() => onRemove(i)}
                      className="px-2 py-1 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-xs cursor-pointer transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {/* Hero badge */}
                {img.isHero && (
                  <div className="absolute top-1.5 left-1.5 bg-[#c084fc] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    HERO
                  </div>
                )}
              </div>
            ))}
          </div>

          {onAdd && (
            <label className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-[#1e1e2e] hover:border-[#c084fc44] text-xs text-[#6b7280] hover:text-[#9ca3af] cursor-pointer transition-all">
              <span>＋ Upload additional images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => {
                  Array.from(e.target.files).forEach(file => {
                    const reader = new FileReader();
                    reader.onload = ev => {
                      onAdd({ url: ev.target.result, alt: file.name, isUserUploaded: true });
                    };
                    reader.readAsDataURL(file);
                  });
                }}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
