import { useRef } from 'react';
import { exportElementAsPng, exportElementsAsPdf, exportElementsAsZip } from '../lib/exportImage';

const FONT_MAP = {
  modern: "'Inter', system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  minimal: "'DM Sans', 'Helvetica Neue', sans-serif",
};

function SlideCanvas({ slide, index, total, brand, isFirst, isLast }) {
  const fontFamily = FONT_MAP[brand.fontStyle] || FONT_MAP.modern;

  return (
    <div
      style={{
        width: '400px',
        height: '400px',
        background: brand.background,
        fontFamily,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* BG gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isFirst
            ? `linear-gradient(135deg, ${brand.primary}22 0%, ${brand.secondary}15 100%)`
            : `linear-gradient(160deg, ${brand.primary}08 0%, transparent 60%)`,
        }}
      />

      {/* Decorative line on left */}
      <div
        style={{
          position: 'absolute',
          left: '28px',
          top: '60px',
          bottom: '60px',
          width: '2px',
          background: `linear-gradient(to bottom, ${brand.primary}00, ${brand.primary}66, ${brand.primary}00)`,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          padding: '30px 34px 30px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        {/* Top: Slide number & logo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              fontSize: '11px',
              color: brand.primary + '99',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </div>
          {brand.logo ? (
            <img src={brand.logo} alt="" style={{ height: '20px', objectFit: 'contain' }} />
          ) : (
            <span style={{ fontSize: '11px', color: brand.primary + '88', fontWeight: 700, letterSpacing: '0.1em' }}>
              GLOW
            </span>
          )}
        </div>

        {/* Headline */}
        {slide.headline && (
          <div>
            {!isFirst && (
              <div
                style={{
                  display: 'inline-block',
                  background: brand.primary + '22',
                  border: `1px solid ${brand.primary}33`,
                  borderRadius: '6px',
                  padding: '3px 10px',
                  fontSize: '10px',
                  color: brand.primary,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                Key Insight
              </div>
            )}
            <h2
              style={{
                fontSize: slide.headline.length > 60 ? '19px' : '22px',
                fontWeight: 700,
                color: brand.text,
                lineHeight: 1.3,
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {slide.headline}
            </h2>
          </div>
        )}

        {/* Body */}
        {slide.body && (
          <p
            style={{
              fontSize: '14px',
              color: brand.text + 'cc',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {slide.body}
          </p>
        )}

        {/* CTA on last slide */}
        {isLast && slide.cta && (
          <div
            style={{
              background: `linear-gradient(90deg, ${brand.primary}22, ${brand.secondary}22)`,
              border: `1px solid ${brand.primary}44`,
              borderRadius: '12px',
              padding: '14px 18px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '14px', fontWeight: 600, color: brand.primary, margin: 0 }}>
              {slide.cta}
            </p>
          </div>
        )}

        {/* Swipe indicator (not last) */}
        {!isLast && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: brand.primary + '66' }}>swipe</span>
            <span style={{ fontSize: '12px', color: brand.primary + '88' }}>→</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CarouselSlides({ slides, brand }) {
  const slideRefs = useRef([]);

  if (!slides?.length) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white">LinkedIn Carousel</h3>
        <span className="text-xs text-[#6b7280]">{slides.length} slides</span>
      </div>

      {/* Slides preview */}
      <div className="space-y-3 mb-4">
        {slides.map((slide, i) => (
          <div key={i} className="group relative">
            <div className="rounded-2xl overflow-hidden border border-[#1e1e2e]">
              <div ref={el => slideRefs.current[i] = el}>
                <SlideCanvas
                  slide={slide}
                  index={i}
                  total={slides.length}
                  brand={brand}
                  isFirst={i === 0}
                  isLast={i === slides.length - 1}
                />
              </div>
            </div>
            <button
              onClick={() => exportElementAsPng(slideRefs.current[i], `slide-${i + 1}.png`)}
              className="mt-1.5 w-full py-1.5 text-xs font-medium text-[#6b7280] hover:text-[#c084fc] hover:bg-[#c084fc11] border border-[#1e1e2e] hover:border-[#c084fc22] rounded-xl transition-all cursor-pointer"
            >
              ↓ Slide {i + 1}
            </button>
          </div>
        ))}
      </div>

      {/* Bulk export */}
      <div className="flex gap-2">
        <button
          onClick={() => exportElementsAsPdf(slideRefs.current.filter(Boolean), 'carousel.pdf')}
          className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#a855f7] to-[#c084fc] rounded-xl hover:from-[#9333ea] hover:to-[#a855f7] transition-all cursor-pointer shadow-lg shadow-purple-900/30"
        >
          ↓ Export PDF
        </button>
        <button
          onClick={() => exportElementsAsZip(slideRefs.current.filter(Boolean), 'slide')}
          className="flex-1 py-2.5 text-sm font-medium text-[#c084fc] bg-[#c084fc11] hover:bg-[#c084fc22] border border-[#c084fc22] hover:border-[#c084fc44] rounded-xl transition-all cursor-pointer"
        >
          ↓ All PNGs
        </button>
      </div>
    </div>
  );
}
