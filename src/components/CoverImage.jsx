import { useRef } from 'react';
import { exportElementAsPng } from '../lib/exportImage';

const FONT_MAP = {
  modern: "'Inter', system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  minimal: "'DM Sans', 'Helvetica Neue', sans-serif",
};

function CoverCanvas({ title, subtitle, brand, thumbnail }) {
  const fontFamily = FONT_MAP[brand.fontStyle] || FONT_MAP.modern;

  return (
    <div
      style={{
        width: '600px',
        height: '314px',
        background: brand.background,
        fontFamily,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background layers */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, ${brand.primary}18 0%, transparent 50%, ${brand.secondary}12 100%)`,
        }}
      />
      {/* Grid dots */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(${brand.primary}20 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
      {/* Glow orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-80px',
          left: '-80px',
          width: '300px',
          height: '300px',
          background: brand.primary,
          borderRadius: '50%',
          opacity: 0.1,
          filter: 'blur(80px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-60px',
          right: '-60px',
          width: '250px',
          height: '250px',
          background: brand.accent,
          borderRadius: '50%',
          opacity: 0.08,
          filter: 'blur(70px)',
        }}
      />

      {/* Thumbnail if available */}
      {thumbnail && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '220px',
            overflow: 'hidden',
          }}
        >
          <img
            src={thumbnail}
            alt=""
            crossOrigin="anonymous"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(to right, ${brand.background}, transparent)`,
            }}
          />
        </div>
      )}

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          padding: '36px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          maxWidth: thumbnail ? '75%' : '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Brand tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {brand.logo ? (
            <img src={brand.logo} alt="logo" style={{ height: '22px', objectFit: 'contain' }} />
          ) : (
            <div
              style={{
                background: `linear-gradient(90deg, ${brand.primary}, ${brand.accent})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '14px',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Glow
            </div>
          )}
          <div style={{ width: '1px', height: '16px', background: brand.primary + '44' }} />
          <span style={{ fontSize: '11px', color: brand.primary + 'aa', fontWeight: 500 }}>
            Key Insights
          </span>
        </div>

        {/* Title */}
        <div>
          <div
            style={{
              width: '50px',
              height: '3px',
              background: `linear-gradient(90deg, ${brand.primary}, ${brand.accent})`,
              borderRadius: '2px',
              marginBottom: '16px',
            }}
          />
          <h1
            style={{
              fontSize: title.length > 60 ? '22px' : title.length > 40 ? '26px' : '30px',
              fontWeight: 700,
              color: brand.text,
              lineHeight: 1.25,
              margin: '0 0 10px',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: '13px',
                color: brand.text + '88',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {subtitle.slice(0, 100)}{subtitle.length > 100 ? '...' : ''}
            </p>
          )}
        </div>

        {/* Bottom tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: brand.primary + '18',
            border: `1px solid ${brand.primary}33`,
            borderRadius: '20px',
            padding: '4px 12px',
            width: 'fit-content',
          }}
        >
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: brand.primary }} />
          <span style={{ fontSize: '11px', color: brand.primary, fontWeight: 500 }}>
            LinkedIn Carousel
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CoverImage({ title, subtitle, brand, thumbnail }) {
  const canvasRef = useRef(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white">Cover Image</h3>
        <span className="text-xs text-[#6b7280]">1200×628 px</span>
      </div>
      <div className="rounded-2xl overflow-hidden border border-[#1e1e2e]">
        <div ref={canvasRef} className="overflow-hidden">
          <CoverCanvas title={title} subtitle={subtitle} brand={brand} thumbnail={thumbnail} />
        </div>
      </div>
      <button
        onClick={() => exportElementAsPng(canvasRef.current, 'cover-image.png')}
        className="mt-2 w-full py-2 text-xs font-medium text-[#c084fc] bg-[#c084fc11] hover:bg-[#c084fc22] border border-[#c084fc22] hover:border-[#c084fc44] rounded-xl transition-all cursor-pointer"
      >
        ↓ Download Cover PNG
      </button>
    </div>
  );
}
