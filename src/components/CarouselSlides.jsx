import { useRef, useState } from 'react';
import { exportElementAsPng, exportElementsAsPdf, exportElementsAsZip } from '../lib/exportImage';

const FONT_MAP = {
  modern: "'Inter', system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  minimal: "'DM Sans', 'Helvetica Neue', sans-serif",
};

// ─────────────────────────────────────────────────────────────────
// ImageTextSlide — hero image with text overlay at bottom
// ─────────────────────────────────────────────────────────────────
function ImageTextSlide({ slide, index, total, brand, imageUrl, isFirst, isLast }) {
  const fontFamily = FONT_MAP[brand.fontStyle] || FONT_MAP.modern;

  return (
    <div
      style={{
        width: '400px',
        height: '400px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily,
        background: brand.background,
        flexShrink: 0,
      }}
    >
      {/* Hero image — full bleed */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          crossOrigin="anonymous"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}

      {/* Gradient overlay — dark at bottom, lighter at top */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: imageUrl
            ? `linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.72) 65%, rgba(0,0,0,0.92) 100%)`
            : `linear-gradient(135deg, ${brand.primary}22 0%, ${brand.secondary}18 100%)`,
        }}
      />

      {/* Slide counter — top right */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '18px',
          zIndex: 2,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(8px)',
          borderRadius: '20px',
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff', opacity: 0.9 }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span style={{ fontSize: '11px', color: '#ffffff66' }}>/</span>
        <span style={{ fontSize: '11px', color: '#ffffff55' }}>{String(total).padStart(2, '0')}</span>
      </div>

      {/* Brand logo — top left */}
      <div style={{ position: 'absolute', top: '16px', left: '18px', zIndex: 2 }}>
        {brand.logo ? (
          <img
            src={brand.logo}
            alt=""
            style={{ height: '22px', objectFit: 'contain', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.6))' }}
          />
        ) : (
          <span style={{
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: brand.primary,
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
          }}>
            GLOW
          </span>
        )}
      </div>

      {/* Bottom text panel */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          padding: '24px 24px 20px',
        }}
      >
        {/* Accent line */}
        <div
          style={{
            width: '32px',
            height: '2.5px',
            background: `linear-gradient(90deg, ${brand.primary}, ${brand.accent})`,
            borderRadius: '2px',
            marginBottom: '12px',
          }}
        />

        {/* Headline */}
        <h2
          style={{
            fontSize: slide.headline.length > 70 ? '17px' : '20px',
            fontWeight: 700,
            color: '#ffffff',
            margin: '0 0 8px',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        >
          {slide.headline}
        </h2>

        {/* Body */}
        {slide.body && (
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.82)',
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            {slide.body}
          </p>
        )}

        {/* CTA on last slide */}
        {isLast && slide.cta && (
          <div
            style={{
              marginTop: '12px',
              background: brand.primary,
              borderRadius: '8px',
              padding: '10px 16px',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{slide.cta}</span>
          </div>
        )}

        {/* Swipe hint */}
        {!isLast && (
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>swipe</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>→</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TextOnlySlide — smart typography variants
// ─────────────────────────────────────────────────────────────────
function TextOnlySlide({ slide, index, total, brand, isFirst, isLast }) {
  const fontFamily = FONT_MAP[brand.fontStyle] || FONT_MAP.modern;
  const layout = slide.layout || 'headline';

  const base = {
    width: '400px',
    height: '400px',
    background: brand.background,
    fontFamily,
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
  };

  return (
    <div style={base}>
      {/* Subtle bg texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(${brand.primary}14 1px, transparent 1px)`,
          backgroundSize: '22px 22px',
        }}
      />
      {/* Glow orb */}
      <div
        style={{
          position: 'absolute',
          top: layout === 'number' ? '-30px' : '-60px',
          right: '-60px',
          width: '220px',
          height: '220px',
          background: brand.primary,
          borderRadius: '50%',
          opacity: 0.07,
          filter: 'blur(70px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-40px',
          left: '-40px',
          width: '180px',
          height: '180px',
          background: brand.secondary,
          borderRadius: '50%',
          opacity: 0.05,
          filter: 'blur(55px)',
        }}
      />

      {/* Header row */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '24px',
          right: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1,
        }}
      >
        {brand.logo ? (
          <img src={brand.logo} alt="" style={{ height: '20px', objectFit: 'contain' }} />
        ) : (
          <span style={{ fontSize: '11px', fontWeight: 800, color: brand.primary + 'cc', letterSpacing: '0.14em' }}>
            GLOW
          </span>
        )}
        <span style={{ fontSize: '10px', color: brand.primary + '88', fontWeight: 600, letterSpacing: '0.06em' }}>
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>

      {/* ── LAYOUT: NUMBER ── big stat highlight */}
      {layout === 'number' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '24px 32px',
            zIndex: 1,
          }}
        >
          {/* Big stat */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              marginBottom: '16px',
              background: `linear-gradient(135deg, ${brand.primary}, ${brand.accent})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {slide.stat || String(index)}
          </div>
          <div
            style={{
              width: '40px',
              height: '2.5px',
              background: `linear-gradient(90deg, ${brand.primary}, ${brand.accent})`,
              borderRadius: '2px',
              marginBottom: '14px',
            }}
          />
          <h2
            style={{
              fontSize: slide.headline.length > 60 ? '18px' : '21px',
              fontWeight: 700,
              color: brand.text,
              margin: '0 0 10px',
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
            }}
          >
            {slide.headline}
          </h2>
          {slide.body && (
            <p style={{ fontSize: '13px', color: brand.text + 'bb', margin: 0, lineHeight: 1.6 }}>
              {slide.body}
            </p>
          )}
        </div>
      )}

      {/* ── LAYOUT: QUOTE ── pull quote */}
      {layout === 'quote' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '24px 32px',
            zIndex: 1,
          }}
        >
          {/* Opening quote mark */}
          <div
            style={{
              fontSize: '80px',
              lineHeight: 0.75,
              fontWeight: 900,
              color: brand.primary,
              opacity: 0.4,
              marginBottom: '8px',
              fontFamily: 'Georgia, serif',
            }}
          >
            "
          </div>
          <p
            style={{
              fontSize: slide.quote?.length > 100 ? '18px' : '22px',
              fontWeight: 600,
              color: brand.text,
              margin: '0 0 20px',
              lineHeight: 1.4,
              letterSpacing: '-0.01em',
              fontStyle: 'italic',
            }}
          >
            {slide.quote || slide.headline}
          </p>
          {/* Attribution line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '28px',
                height: '2px',
                background: `linear-gradient(90deg, ${brand.primary}, ${brand.accent})`,
                borderRadius: '1px',
              }}
            />
            <span style={{ fontSize: '12px', color: brand.primary + 'cc', fontWeight: 500 }}>
              {slide.headline !== slide.quote ? slide.headline.slice(0, 40) : 'Key Insight'}
            </span>
          </div>
        </div>
      )}

      {/* ── LAYOUT: HEADLINE (default) ── clean hierarchical text */}
      {(layout === 'headline' || !['number', 'quote', 'image'].includes(layout)) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '60px 28px 26px',
            zIndex: 1,
          }}
        >
          <div>
            {/* Tag label */}
            {!isFirst && !isLast && (
              <div
                style={{
                  display: 'inline-block',
                  background: brand.primary + '1e',
                  border: `1px solid ${brand.primary}33`,
                  borderRadius: '6px',
                  padding: '3px 10px',
                  fontSize: '10px',
                  color: brand.primary,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}
              >
                Insight
              </div>
            )}

            <div
              style={{
                width: '36px',
                height: '2.5px',
                background: `linear-gradient(90deg, ${brand.primary}, ${brand.accent})`,
                borderRadius: '2px',
                marginBottom: '16px',
              }}
            />

            <h2
              style={{
                fontSize: slide.headline.length > 70 ? '19px' : slide.headline.length > 50 ? '22px' : '25px',
                fontWeight: 700,
                color: brand.text,
                margin: 0,
                lineHeight: 1.3,
                letterSpacing: '-0.02em',
              }}
            >
              {slide.headline}
            </h2>
          </div>

          <div>
            {slide.body && (
              <p
                style={{
                  fontSize: '13.5px',
                  color: brand.text + 'cc',
                  margin: '0 0 14px',
                  lineHeight: 1.65,
                }}
              >
                {slide.body}
              </p>
            )}

            {/* CTA */}
            {isLast && slide.cta && (
              <div
                style={{
                  background: `linear-gradient(90deg, ${brand.primary}28, ${brand.secondary}28)`,
                  border: `1px solid ${brand.primary}44`,
                  borderRadius: '10px',
                  padding: '12px 16px',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '14px', fontWeight: 600, color: brand.primary, margin: 0 }}>
                  {slide.cta}
                </p>
              </div>
            )}

            {/* Swipe hint */}
            {!isLast && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: brand.primary + '55' }}>swipe</span>
                <span style={{ fontSize: '12px', color: brand.primary + '77' }}>→</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Smart slide router
// ─────────────────────────────────────────────────────────────────
function SlideCanvas({ slide, index, total, brand, images }) {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  // Resolve image if slide wants one
  const resolvedImage =
    slide.layout === 'image' && slide.imageIndex != null && images?.[slide.imageIndex]
      ? images[slide.imageIndex].url
      : null;

  if (resolvedImage) {
    return (
      <ImageTextSlide
        slide={slide}
        index={index}
        total={total}
        brand={brand}
        imageUrl={resolvedImage}
        isFirst={isFirst}
        isLast={isLast}
      />
    );
  }

  return (
    <TextOnlySlide
      slide={slide}
      index={index}
      total={total}
      brand={brand}
      isFirst={isFirst}
      isLast={isLast}
    />
  );
}

// ─────────────────────────────────────────────────────────────────
// Main export component
// ─────────────────────────────────────────────────────────────────
export default function CarouselSlides({ slides, brand, images = [], onReassignImage }) {
  const slideRefs = useRef([]);
  const [reassigning, setReassigning] = useState(null); // slideIndex being reassigned

  if (!slides?.length) return null;

  const hasImages = images.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white">LinkedIn Carousel</h3>
        <span className="text-xs text-[#6b7280]">{slides.length} slides</span>
      </div>

      {/* Image source indicator */}
      {hasImages && (
        <div className="mb-4 flex items-center gap-2 text-xs text-[#9ca3af] bg-[#c084fc0d] border border-[#c084fc22] rounded-xl px-3 py-2">
          <span className="text-[#c084fc]">🖼️</span>
          <span>{images.length} images extracted — used on image-layout slides</span>
        </div>
      )}

      {/* Slides */}
      <div className="space-y-4 mb-5">
        {slides.map((slide, i) => {
          const hasImageAssigned = slide.layout === 'image' && slide.imageIndex != null && images?.[slide.imageIndex];
          return (
            <div key={i} className="group relative">
              {/* Slide preview */}
              <div className="rounded-2xl overflow-hidden border border-[#1e1e2e]">
                <div ref={el => slideRefs.current[i] = el}>
                  <SlideCanvas slide={slide} index={i} total={slides.length} brand={brand} images={images} />
                </div>
              </div>

              {/* Slide controls row */}
              <div className="mt-1.5 flex gap-2">
                <button
                  onClick={() => exportElementAsPng(slideRefs.current[i], `slide-${i + 1}.png`)}
                  className="flex-1 py-1.5 text-xs font-medium text-[#6b7280] hover:text-[#c084fc] hover:bg-[#c084fc0d] border border-[#1e1e2e] hover:border-[#c084fc22] rounded-xl transition-all cursor-pointer"
                >
                  ↓ Slide {i + 1}
                </button>

                {/* Reassign image button */}
                {hasImages && onReassignImage && (
                  <button
                    onClick={() => setReassigning(reassigning === i ? null : i)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                      hasImageAssigned
                        ? 'text-[#c084fc] bg-[#c084fc0d] border-[#c084fc22] hover:bg-[#c084fc1a]'
                        : 'text-[#4b5563] border-[#1e1e2e] hover:text-[#9ca3af] hover:border-[#c084fc22]'
                    }`}
                    title={hasImageAssigned ? 'Change image' : 'Add image'}
                  >
                    {hasImageAssigned ? '🖼 Change' : '＋ Image'}
                  </button>
                )}
              </div>

              {/* Image picker dropdown */}
              {reassigning === i && hasImages && (
                <div className="mt-2 rounded-xl border border-[#c084fc22] bg-[#0e0e18] p-3">
                  <p className="text-xs text-[#6b7280] mb-2">Pick an image for this slide:</p>
                  <div className="flex flex-wrap gap-2">
                    {/* "No image" option */}
                    <button
                      onClick={() => {
                        onReassignImage(i, null);
                        setReassigning(null);
                      }}
                      className="w-14 h-14 rounded-lg border border-[#1e1e2e] hover:border-[#c084fc44] bg-[#12121c] flex items-center justify-center text-xs text-[#6b7280] cursor-pointer transition-all"
                    >
                      None
                    </button>
                    {images.map((img, imgIdx) => (
                      <button
                        key={imgIdx}
                        onClick={() => {
                          onReassignImage(i, imgIdx);
                          setReassigning(null);
                        }}
                        className="w-14 h-14 rounded-lg overflow-hidden border border-[#1e1e2e] hover:border-[#c084fc] transition-all cursor-pointer"
                      >
                        <img
                          src={img.url}
                          alt={img.alt || `Image ${imgIdx + 1}`}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bulk export */}
      <div className="flex gap-2">
        <button
          onClick={() => exportElementsAsPdf(slideRefs.current.filter(Boolean), 'carousel.pdf')}
          className="flex-1 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#a855f7] to-[#c084fc] rounded-xl hover:from-[#9333ea] hover:to-[#a855f7] transition-all cursor-pointer shadow-lg shadow-purple-900/30"
        >
          ↓ Export PDF
        </button>
        <button
          onClick={() => exportElementsAsZip(slideRefs.current.filter(Boolean), 'slide')}
          className="flex-1 py-2.5 text-sm font-semibold text-[#c084fc] bg-[#c084fc11] hover:bg-[#c084fc1a] border border-[#c084fc22] hover:border-[#c084fc44] rounded-xl transition-all cursor-pointer"
        >
          ↓ All PNGs
        </button>
      </div>
    </div>
  );
}
