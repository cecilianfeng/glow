import { useRef } from 'react';
import { exportElementAsPng } from '../lib/exportImage';

const FONT_MAP = {
  modern: "'Inter', system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  minimal: "'DM Sans', 'Helvetica Neue', sans-serif",
};

// Canvas renders at 600x314 (half of 1200x628) — html2canvas exports at 2x = 1200x628
function CoverCanvas({ coverData, brand, thumbnail }) {
  const fontFamily = FONT_MAP[brand.fontStyle] || FONT_MAP.modern;
  const { headline, subline, tag } = coverData || {};

  return (
    <div style={{
      width: '600px', height: '314px',
      background: brand.background, fontFamily,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Base gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, ${brand.primary}18 0%, transparent 55%, ${brand.secondary}12 100%)`,
      }} />

      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(${brand.primary}18 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }} />

      {/* Glow orbs */}
      <div style={{
        position: 'absolute', top: '-80px', left: '-60px',
        width: '280px', height: '280px',
        background: brand.primary, borderRadius: '50%',
        opacity: 0.08, filter: 'blur(80px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-60px', right: '-60px',
        width: '240px', height: '240px',
        background: brand.accent, borderRadius: '50%',
        opacity: 0.06, filter: 'blur(70px)',
      }} />

      {/* Right-side thumbnail (faded) */}
      {thumbnail && (
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '220px',
          overflow: 'hidden',
        }}>
          <img src={thumbnail} alt="" crossOrigin="anonymous" style={{
            width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2,
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(to right, ${brand.background} 0%, ${brand.background}cc 30%, transparent 100%)`,
          }} />
        </div>
      )}

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        height: '100%',
        padding: '28px 36px',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        maxWidth: thumbnail ? '76%' : '100%',
        boxSizing: 'border-box',
      }}>
        {/* Top: brand + tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {brand.logo ? (
            <img src={brand.logo} alt="logo" style={{ height: '20px', objectFit: 'contain' }} />
          ) : (
            <div style={{
              background: `linear-gradient(90deg, ${brand.primary}, ${brand.accent})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontSize: '13px', fontWeight: 800, letterSpacing: '0.1em',
            }}>
              {brand.name ? brand.name.toUpperCase() : 'GLOW'}
            </div>
          )}
          {tag && (
            <>
              <div style={{ width: '1px', height: '14px', background: brand.primary + '33' }} />
              <span style={{ fontSize: '11px', color: brand.primary + 'bb', fontWeight: 500 }}>
                {tag}
              </span>
            </>
          )}
        </div>

        {/* Middle: title */}
        <div>
          <div style={{
            width: '44px', height: '3px',
            background: `linear-gradient(90deg, ${brand.primary}, ${brand.accent})`,
            borderRadius: '2px', marginBottom: '14px',
          }} />
          <h1 style={{
            fontSize: headline?.length > 55 ? '22px' : headline?.length > 40 ? '26px' : '30px',
            fontWeight: 700, color: brand.text,
            lineHeight: 1.2, margin: '0 0 10px',
            letterSpacing: '-0.025em',
          }}>
            {headline || 'Key Insights'}
          </h1>
          {subline && (
            <p style={{
              fontSize: '12px', color: brand.text + '77',
              margin: 0, lineHeight: 1.5,
            }}>
              {subline.slice(0, 85)}{subline.length > 85 ? '...' : ''}
            </p>
          )}
        </div>

        {/* Bottom: creator handle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '22px', height: '22px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${brand.primary}44, ${brand.accent}44)`,
            border: `1px solid ${brand.primary}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
          }}>
            {brand.logo ? (
              <img src={brand.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '9px', fontWeight: 700, color: brand.primary }}>
                {(brand.name || 'G').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span style={{ fontSize: '11px', color: brand.primary + 'bb', fontWeight: 500 }}>
            {brand.handle || brand.name || 'LinkedIn'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CoverImage({ coverData, brand, thumbnail }) {
  const canvasRef = useRef(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">Cover Image</h3>
          <p className="text-xs text-[#6b7280] mt-0.5">1200 × 628 px · LinkedIn recommended</p>
        </div>
        <button
          onClick={() => exportElementAsPng(canvasRef.current, 'glow-cover.png')}
          className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#a855f7] to-[#c084fc] rounded-xl hover:from-[#9333ea] hover:to-[#a855f7] transition-all cursor-pointer shadow-md shadow-purple-900/30"
        >
          ↓ Download PNG
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden border border-[#1e1e2e] shadow-lg shadow-black/40">
        <div ref={canvasRef}>
          <CoverCanvas coverData={coverData} brand={brand} thumbnail={thumbnail} />
        </div>
      </div>

      <p className="mt-2 text-xs text-[#3a3a4a] text-center">
        Exports at 1200 × 628 px (2× retina) · use as LinkedIn post thumbnail
      </p>
    </div>
  );
}
