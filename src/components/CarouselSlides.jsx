import { useRef, useState } from 'react';
import { exportElementAsPng, exportElementsAsPdf, exportElementsAsZip } from '../lib/exportImage';

const FONT_MAP = {
  modern: "'Inter', system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  minimal: "'DM Sans', 'Helvetica Neue', sans-serif",
};

const SLIDE_SIZE = 400;

// ─────────────────────────────────────────────────────────────────────────────
// Shared Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function DotGrid({ brand }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `radial-gradient(${brand.primary}11 1px, transparent 1px)`,
      backgroundSize: '22px 22px',
      pointerEvents: 'none',
    }} />
  );
}

function GlowOrb({ brand, position = 'tr', opacity = 0.06 }) {
  const positions = {
    tl: { top: '-60px', left: '-60px' },
    tr: { top: '-60px', right: '-60px' },
    bl: { bottom: '-60px', left: '-60px' },
    br: { bottom: '-60px', right: '-60px' },
  };
  return (
    <div style={{
      position: 'absolute',
      ...positions[position],
      width: '240px', height: '240px',
      background: position.startsWith('t') ? brand.primary : brand.secondary,
      borderRadius: '50%',
      opacity,
      filter: 'blur(80px)',
      pointerEvents: 'none',
    }} />
  );
}

function AccentLine({ brand, width = 36 }) {
  return (
    <div style={{
      width: `${width}px`, height: '2.5px',
      background: `linear-gradient(90deg, ${brand.primary}, ${brand.accent})`,
      borderRadius: '2px',
    }} />
  );
}

function TagChip({ brand, tag, fontFamily }) {
  if (!tag) return null;
  return (
    <div style={{
      display: 'inline-block',
      background: brand.primary + '1c',
      border: `1px solid ${brand.primary}33`,
      borderRadius: '6px', padding: '3px 10px',
      fontSize: '10px', color: brand.primary, fontWeight: 600,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      fontFamily,
    }}>
      {tag}
    </div>
  );
}

function BrandBar({ brand, index, total, fontFamily, light = false }) {
  const nameColor = light ? 'rgba(255,255,255,0.9)' : (brand.primary + 'cc');
  const counterColor = light ? 'rgba(255,255,255,0.55)' : (brand.primary + '66');
  return (
    <div style={{
      position: 'absolute', top: '20px', left: '24px', right: '24px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2,
    }}>
      {brand.logo ? (
        <img
          src={brand.logo} alt=""
          style={{ height: '18px', objectFit: 'contain', ...(light ? { filter: 'brightness(0) invert(1)' } : {}) }}
        />
      ) : (
        <span style={{
          fontSize: '10px', fontWeight: 800,
          color: nameColor,
          letterSpacing: '0.14em', fontFamily,
        }}>
          {brand.name ? brand.name.toUpperCase().slice(0, 10) : 'GLOW'}
        </span>
      )}
      <span style={{
        fontSize: '10px', color: counterColor, fontWeight: 600,
        letterSpacing: '0.06em', fontFamily,
      }}>
        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
    </div>
  );
}

function SwipeHint({ brand, fontFamily }) {
  return (
    <div style={{
      position: 'absolute', bottom: '20px', right: '24px', zIndex: 2,
      display: 'flex', alignItems: 'center', gap: '4px',
    }}>
      <span style={{ fontSize: '10px', color: brand.primary + '44', fontFamily }}>swipe</span>
      <span style={{ fontSize: '12px', color: brand.primary + '66' }}>→</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Cover Slide — centered, big title, brand mark at top
// ─────────────────────────────────────────────────────────────────────────────

function CoverSlide({ slide, index, total, brand, images }) {
  const fontFamily = FONT_MAP[brand.fontStyle] || FONT_MAP.modern;
  const imageUrl = slide.imageIndex != null && images?.[slide.imageIndex]?.url;

  return (
    <div style={{
      width: `${SLIDE_SIZE}px`, height: `${SLIDE_SIZE}px`,
      background: brand.background, fontFamily,
      position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      <DotGrid brand={brand} />
      <GlowOrb brand={brand} position="tl" opacity={0.08} />
      <GlowOrb brand={brand} position="br" opacity={0.05} />

      {imageUrl && (
        <img src={imageUrl} alt="" crossOrigin="anonymous" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.1,
        }} />
      )}

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: '20px', left: '24px', right: '24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2,
      }}>
        {brand.logo ? (
          <img src={brand.logo} alt="" style={{ height: '20px', objectFit: 'contain' }} />
        ) : (
          <div style={{
            background: `linear-gradient(90deg, ${brand.primary}, ${brand.accent})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em',
          }}>
            {brand.name ? brand.name.toUpperCase().slice(0, 10) : 'GLOW'}
          </div>
        )}
        {slide.tag && (
          <div style={{
            background: brand.primary + '22',
            border: `1px solid ${brand.primary}44`,
            borderRadius: '20px', padding: '3px 11px',
            fontSize: '10px', color: brand.primary, fontWeight: 600, letterSpacing: '0.04em',
          }}>
            {slide.tag}
          </div>
        )}
      </div>

      {/* Center content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '68px 36px 52px', textAlign: 'center', zIndex: 1,
      }}>
        <AccentLine brand={brand} width={44} />
        <div style={{ height: '24px' }} />
        <h1 style={{
          fontSize: slide.headline?.length > 50 ? '26px' : slide.headline?.length > 35 ? '30px' : '36px',
          fontWeight: 800, color: brand.text,
          lineHeight: 1.18, letterSpacing: '-0.03em', margin: 0,
        }}>
          {slide.headline}
        </h1>
      </div>

      {/* Bottom */}
      <div style={{
        position: 'absolute', bottom: '20px', left: '24px', right: '24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2,
      }}>
        <span style={{ fontSize: '11px', color: brand.primary + 'aa', fontWeight: 500 }}>
          {brand.handle || brand.name || ''}
        </span>
        <span style={{ fontSize: '10px', color: brand.primary + '44', fontWeight: 500 }}>
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Insight Slide — tag chip + accent line + headline + body
// ─────────────────────────────────────────────────────────────────────────────

function InsightSlide({ slide, index, total, brand }) {
  const fontFamily = FONT_MAP[brand.fontStyle] || FONT_MAP.modern;
  const isCenter = slide.alignment === 'center';
  const orbPos = index % 2 === 0 ? 'tr' : 'bl';

  return (
    <div style={{
      width: `${SLIDE_SIZE}px`, height: `${SLIDE_SIZE}px`,
      background: brand.background, fontFamily,
      position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      <DotGrid brand={brand} />
      <GlowOrb brand={brand} position={orbPos} opacity={0.07} />

      <BrandBar brand={brand} index={index} total={total} fontFamily={fontFamily} />

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        padding: '56px 28px 40px',
        textAlign: isCenter ? 'center' : 'left',
        alignItems: isCenter ? 'center' : 'flex-start',
        zIndex: 1, gap: '0',
      }}>
        {slide.tag && (
          <>
            <TagChip brand={brand} tag={slide.tag} fontFamily={fontFamily} />
            <div style={{ height: '14px' }} />
          </>
        )}

        <AccentLine brand={brand} />
        <div style={{ height: '18px' }} />

        <h2 style={{
          fontSize: slide.headline?.length > 65 ? '19px' : slide.headline?.length > 48 ? '22px' : '26px',
          fontWeight: 700, color: brand.text,
          lineHeight: 1.28, letterSpacing: '-0.02em', margin: 0,
        }}>
          {slide.headline}
        </h2>

        {slide.body && (
          <>
            <div style={{ height: '14px' }} />
            <p style={{
              fontSize: '13.5px', color: brand.text + 'bb',
              lineHeight: 1.65, margin: 0,
            }}>
              {slide.body}
            </p>
          </>
        )}
      </div>

      <SwipeHint brand={brand} fontFamily={fontFamily} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Stat Slide — giant gradient number + divider + headline
// ─────────────────────────────────────────────────────────────────────────────

function StatSlide({ slide, index, total, brand }) {
  const fontFamily = FONT_MAP[brand.fontStyle] || FONT_MAP.modern;

  return (
    <div style={{
      width: `${SLIDE_SIZE}px`, height: `${SLIDE_SIZE}px`,
      background: brand.background, fontFamily,
      position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      <DotGrid brand={brand} />
      <GlowOrb brand={brand} position="tl" opacity={0.09} />

      {/* Large decorative stat echo */}
      <div style={{
        position: 'absolute', top: '-10px', right: '-20px',
        fontSize: '160px', fontWeight: 900, lineHeight: 1,
        color: brand.primary, opacity: 0.04,
        fontFamily: "'Inter', system-ui, sans-serif",
        letterSpacing: '-0.06em',
        userSelect: 'none', pointerEvents: 'none',
      }}>
        {slide.stat || ''}
      </div>

      <BrandBar brand={brand} index={index} total={total} fontFamily={fontFamily} />

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        padding: '56px 32px 40px',
        zIndex: 1,
      }}>
        {/* Giant number */}
        <div style={{
          fontSize: slide.stat?.length > 5 ? '64px' : '80px',
          fontWeight: 900, lineHeight: 1,
          letterSpacing: '-0.05em', marginBottom: '6px',
          background: `linear-gradient(135deg, ${brand.primary}, ${brand.accent})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          {slide.stat || '—'}
        </div>

        {slide.statLabel && (
          <p style={{
            fontSize: '11px', color: brand.primary + '88',
            margin: '0 0 20px', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            {slide.statLabel}
          </p>
        )}

        <AccentLine brand={brand} width={40} />
        <div style={{ height: '20px' }} />

        <h2 style={{
          fontSize: slide.headline?.length > 58 ? '17px' : '20px',
          fontWeight: 700, color: brand.text,
          lineHeight: 1.32, letterSpacing: '-0.01em', margin: 0,
        }}>
          {slide.headline}
        </h2>
      </div>

      <SwipeHint brand={brand} fontFamily={fontFamily} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Quote Slide — pull quote with decorative quotation mark
// ─────────────────────────────────────────────────────────────────────────────

function QuoteSlide({ slide, index, total, brand }) {
  const fontFamily = FONT_MAP[brand.fontStyle] || FONT_MAP.modern;
  const quoteText = slide.quote || slide.headline;

  return (
    <div style={{
      width: `${SLIDE_SIZE}px`, height: `${SLIDE_SIZE}px`,
      background: brand.background, fontFamily,
      position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      <DotGrid brand={brand} />
      <GlowOrb brand={brand} position="br" opacity={0.07} />

      {/* Big decorative quote mark */}
      <div style={{
        position: 'absolute', top: '30px', right: '20px',
        fontSize: '180px', lineHeight: 1, fontWeight: 900,
        color: brand.primary, opacity: 0.06,
        fontFamily: 'Georgia, serif', zIndex: 0,
        userSelect: 'none', pointerEvents: 'none',
      }}>
        "
      </div>

      <BrandBar brand={brand} index={index} total={total} fontFamily={fontFamily} />

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        padding: '56px 32px 40px',
        zIndex: 1,
      }}>
        {/* Opening curly quote */}
        <div style={{
          fontSize: '52px', lineHeight: 0.75, fontWeight: 900,
          color: brand.primary, opacity: 0.55,
          fontFamily: 'Georgia, serif',
          marginBottom: '14px',
        }}>
          "
        </div>

        <p style={{
          fontSize: quoteText?.length > 90 ? '17px' : quoteText?.length > 65 ? '20px' : '23px',
          fontWeight: 600, color: brand.text,
          lineHeight: 1.45, letterSpacing: '-0.01em',
          fontStyle: 'italic',
          margin: '0 0 24px',
        }}>
          {quoteText}
        </p>

        {/* Attribution */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AccentLine brand={brand} width={24} />
          <span style={{ fontSize: '11px', color: brand.primary + 'cc', fontWeight: 500 }}>
            {slide.tag || 'Key Insight'}
          </span>
        </div>
      </div>

      <SwipeHint brand={brand} fontFamily={fontFamily} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. List Slide — numbered bullet list
// ─────────────────────────────────────────────────────────────────────────────

function ListSlide({ slide, index, total, brand }) {
  const fontFamily = FONT_MAP[brand.fontStyle] || FONT_MAP.modern;
  const items = Array.isArray(slide.items) ? slide.items.slice(0, 4) : [];

  return (
    <div style={{
      width: `${SLIDE_SIZE}px`, height: `${SLIDE_SIZE}px`,
      background: brand.background, fontFamily,
      position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      <DotGrid brand={brand} />
      <GlowOrb brand={brand} position="tr" opacity={0.06} />

      <BrandBar brand={brand} index={index} total={total} fontFamily={fontFamily} />

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        padding: '56px 28px 40px',
        zIndex: 1,
      }}>
        {slide.tag && (
          <>
            <TagChip brand={brand} tag={slide.tag} fontFamily={fontFamily} />
            <div style={{ height: '12px' }} />
          </>
        )}

        <AccentLine brand={brand} />
        <div style={{ height: '14px' }} />

        <h2 style={{
          fontSize: slide.headline?.length > 50 ? '19px' : '22px',
          fontWeight: 700, color: brand.text,
          lineHeight: 1.3, letterSpacing: '-0.015em',
          margin: '0 0 20px',
        }}>
          {slide.headline}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '24px', height: '24px', flexShrink: 0,
                background: brand.primary + '1e',
                border: `1px solid ${brand.primary}33`,
                borderRadius: '7px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: '1px',
              }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: brand.primary }}>
                  {i + 1}
                </span>
              </div>
              <span style={{
                fontSize: '13.5px', color: brand.text + 'cc',
                lineHeight: 1.5, flex: 1,
              }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      <SwipeHint brand={brand} fontFamily={fontFamily} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Image Slide — full-bleed image with gradient overlay + text
// ─────────────────────────────────────────────────────────────────────────────

function ImageSlide({ slide, index, total, brand, imageUrl }) {
  const fontFamily = FONT_MAP[brand.fontStyle] || FONT_MAP.modern;

  return (
    <div style={{
      width: `${SLIDE_SIZE}px`, height: `${SLIDE_SIZE}px`,
      position: 'relative', overflow: 'hidden',
      fontFamily, flexShrink: 0,
      background: brand.background,
    }}>
      {imageUrl && (
        <img src={imageUrl} alt="" crossOrigin="anonymous" style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
        }} />
      )}

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: imageUrl
          ? 'linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.04) 35%, rgba(0,0,0,0.72) 65%, rgba(0,0,0,0.92) 100%)'
          : `linear-gradient(135deg, ${brand.primary}22, ${brand.secondary}18)`,
      }} />

      {/* Brand + counter (light version for image) */}
      <div style={{
        position: 'absolute', top: '18px', left: '20px', right: '20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2,
      }}>
        {brand.logo ? (
          <img src={brand.logo} alt="" style={{
            height: '18px', objectFit: 'contain',
            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))',
          }} />
        ) : (
          <span style={{
            fontSize: '10px', fontWeight: 800, color: '#fff',
            opacity: 0.9, letterSpacing: '0.12em',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          }}>
            {brand.name ? brand.name.toUpperCase().slice(0, 8) : 'GLOW'}
          </span>
        )}
        <div style={{
          background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(8px)',
          borderRadius: '20px', padding: '3px 10px',
          fontSize: '10px', fontWeight: 600, color: '#fff', opacity: 0.9,
        }}>
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
      </div>

      {/* Bottom text panel */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '18px 22px 22px', zIndex: 2,
      }}>
        <AccentLine brand={brand} width={26} />
        <div style={{ height: '10px' }} />
        <h2 style={{
          fontSize: slide.headline?.length > 60 ? '17px' : '20px',
          fontWeight: 700, color: '#fff',
          lineHeight: 1.3, margin: '0 0 6px',
          textShadow: '0 1px 4px rgba(0,0,0,0.4)',
        }}>
          {slide.headline}
        </h2>
        {slide.body && (
          <p style={{
            fontSize: '12.5px', color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.5, margin: 0,
          }}>
            {slide.body}
          </p>
        )}
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.38)' }}>swipe</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>→</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. CTA Slide — avatar + name/handle + follow prompt
// ─────────────────────────────────────────────────────────────────────────────

function CtaSlide({ slide, index, total, brand }) {
  const fontFamily = FONT_MAP[brand.fontStyle] || FONT_MAP.modern;
  const displayName = brand.name || 'Creator';
  const handle = brand.handle || '@yourhandle';

  return (
    <div style={{
      width: `${SLIDE_SIZE}px`, height: `${SLIDE_SIZE}px`,
      background: brand.background, fontFamily,
      position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      <DotGrid brand={brand} />
      <GlowOrb brand={brand} position="tl" opacity={0.07} />
      <GlowOrb brand={brand} position="br" opacity={0.05} />

      {/* Counter */}
      <div style={{
        position: 'absolute', top: '20px', right: '24px',
        fontSize: '10px', color: brand.primary + '55', fontWeight: 600,
        letterSpacing: '0.06em', zIndex: 2,
      }}>
        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '48px 36px', textAlign: 'center',
        zIndex: 1,
      }}>
        {/* Avatar circle */}
        <div style={{
          width: '68px', height: '68px', borderRadius: '50%',
          background: `linear-gradient(135deg, ${brand.primary}30, ${brand.accent}30)`,
          border: `2px solid ${brand.primary}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px', overflow: 'hidden',
        }}>
          {brand.logo ? (
            <img src={brand.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{
              fontSize: '24px', fontWeight: 800,
              background: `linear-gradient(135deg, ${brand.primary}, ${brand.accent})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <p style={{ fontSize: '17px', fontWeight: 700, color: brand.text, margin: '0 0 4px' }}>
          {displayName}
        </p>
        <p style={{ fontSize: '13px', color: brand.primary, margin: '0 0 24px', fontWeight: 500 }}>
          {handle}
        </p>

        <AccentLine brand={brand} width={36} />
        <div style={{ height: '24px' }} />

        <p style={{
          fontSize: '15px', fontWeight: 600, color: brand.text,
          lineHeight: 1.4, margin: '0 0 24px', maxWidth: '280px',
        }}>
          {slide.cta || 'Follow for more insights like this →'}
        </p>

        {/* Follow pill */}
        <div style={{
          background: `linear-gradient(90deg, ${brand.primary}, ${brand.accent})`,
          borderRadius: '24px', padding: '10px 32px',
          boxShadow: `0 4px 20px ${brand.primary}44`,
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
            + Follow
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide Router
// ─────────────────────────────────────────────────────────────────────────────

function SlideCanvas({ slide, index, total, brand, images }) {
  const imageUrl =
    slide.layout === 'image' && slide.imageIndex != null
      ? images?.[slide.imageIndex]?.url
      : null;

  const props = { slide, index, total, brand, images };

  switch (slide.layout) {
    case 'cover':   return <CoverSlide {...props} />;
    case 'stat':    return <StatSlide {...props} />;
    case 'quote':   return <QuoteSlide {...props} />;
    case 'list':    return <ListSlide {...props} />;
    case 'image':   return imageUrl
      ? <ImageSlide {...props} imageUrl={imageUrl} />
      : <InsightSlide {...props} />;
    case 'cta':     return <CtaSlide {...props} />;
    case 'insight':
    default:        return <InsightSlide {...props} />;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export default function CarouselSlides({ slides, brand, images = [], onReassignImage }) {
  const slideRefs = useRef([]);
  const [reassigning, setReassigning] = useState(null);

  if (!slides?.length) return null;

  const hasImages = images.length > 0;
  const total = slides.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">LinkedIn Carousel</h3>
          <p className="text-xs text-[#6b7280] mt-0.5">{total} slides · 1:1 square</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportElementsAsZip(slideRefs.current.filter(Boolean), 'slide')}
            className="px-3 py-1.5 text-xs font-medium text-[#c084fc] bg-[#c084fc11] hover:bg-[#c084fc1a] border border-[#c084fc22] hover:border-[#c084fc44] rounded-xl transition-all cursor-pointer"
          >
            ↓ PNGs
          </button>
          <button
            onClick={() => exportElementsAsPdf(slideRefs.current.filter(Boolean), 'carousel.pdf')}
            className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#a855f7] to-[#c084fc] rounded-xl hover:from-[#9333ea] hover:to-[#a855f7] transition-all cursor-pointer shadow-md shadow-purple-900/30"
          >
            ↓ PDF
          </button>
        </div>
      </div>

      {hasImages && (
        <div className="mb-4 flex items-center gap-2 text-xs text-[#9ca3af] bg-[#c084fc09] border border-[#c084fc1e] rounded-xl px-3 py-2">
          <span className="text-[#c084fc]">🖼</span>
          <span>{images.length} images extracted — assigned to image-layout slides</span>
        </div>
      )}

      <div className="space-y-4">
        {slides.map((slide, i) => {
          const hasImageAssigned = slide.layout === 'image' && slide.imageIndex != null && images?.[slide.imageIndex];
          return (
            <div key={i}>
              {/* Slide label */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-[#4b5563] font-medium">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-xs text-[#3a3a4a] capitalize">
                  {slide.layout || 'insight'}
                </span>
              </div>

              {/* Slide preview */}
              <div className="rounded-2xl overflow-hidden border border-[#1e1e2e] shadow-lg shadow-black/40">
                <div ref={el => slideRefs.current[i] = el}>
                  <SlideCanvas slide={slide} index={i} total={total} brand={brand} images={images} />
                </div>
              </div>

              {/* Controls */}
              <div className="mt-1.5 flex gap-2">
                <button
                  onClick={() => exportElementAsPng(slideRefs.current[i], `glow-slide-${i + 1}.png`)}
                  className="flex-1 py-1.5 text-xs font-medium text-[#6b7280] hover:text-[#c084fc] hover:bg-[#c084fc0d] border border-[#1e1e2e] hover:border-[#c084fc22] rounded-xl transition-all cursor-pointer"
                >
                  ↓ Slide {i + 1}
                </button>
                {hasImages && onReassignImage && (
                  <button
                    onClick={() => setReassigning(reassigning === i ? null : i)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                      hasImageAssigned
                        ? 'text-[#c084fc] bg-[#c084fc0d] border-[#c084fc22] hover:bg-[#c084fc1a]'
                        : 'text-[#4b5563] border-[#1e1e2e] hover:text-[#9ca3af] hover:border-[#c084fc22]'
                    }`}
                  >
                    {hasImageAssigned ? '🖼 Change' : '＋ Image'}
                  </button>
                )}
              </div>

              {/* Image picker */}
              {reassigning === i && hasImages && (
                <div className="mt-2 rounded-xl border border-[#c084fc22] bg-[#0a0a0f] p-3">
                  <p className="text-xs text-[#6b7280] mb-2">Pick image for slide {i + 1}:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { onReassignImage(i, null); setReassigning(null); }}
                      className="w-12 h-12 rounded-lg border border-[#1e1e2e] hover:border-[#c084fc44] bg-[#12121c] flex items-center justify-center text-xs text-[#6b7280] cursor-pointer transition-all"
                    >
                      None
                    </button>
                    {images.map((img, imgIdx) => (
                      <button
                        key={imgIdx}
                        onClick={() => { onReassignImage(i, imgIdx); setReassigning(null); }}
                        className="w-12 h-12 rounded-lg overflow-hidden border border-[#1e1e2e] hover:border-[#c084fc] transition-all cursor-pointer"
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
