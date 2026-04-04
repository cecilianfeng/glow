import { useRef } from 'react';
import { exportElementAsPng } from '../lib/exportImage';

const FONT_MAP = {
  modern: "'Inter', system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  minimal: "'DM Sans', 'Helvetica Neue', sans-serif",
};

function CardCanvas({ takeaway, index, brand, sourceTitle }) {
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
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '240px',
          height: '240px',
          background: brand.primary,
          borderRadius: '50%',
          opacity: 0.08,
          filter: 'blur(60px)',
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
          opacity: 0.06,
          filter: 'blur(50px)',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          padding: '36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {brand.logo ? (
            <img src={brand.logo} alt="logo" style={{ height: '28px', objectFit: 'contain' }} />
          ) : (
            <span style={{ fontSize: '13px', fontWeight: 700, color: brand.primary, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Glow
            </span>
          )}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${brand.primary}33, ${brand.secondary}44)`,
              border: `1.5px solid ${brand.primary}55`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 700,
              color: brand.primary,
            }}
          >
            {index + 1}
          </div>
        </div>

        {/* Main text */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '24px 0' }}>
          <div>
            <div
              style={{
                width: '40px',
                height: '3px',
                background: `linear-gradient(90deg, ${brand.primary}, ${brand.accent})`,
                borderRadius: '2px',
                marginBottom: '18px',
              }}
            />
            <p
              style={{
                fontSize: takeaway.point.length > 120 ? '18px' : takeaway.point.length > 80 ? '20px' : '22px',
                fontWeight: 600,
                color: brand.text,
                lineHeight: 1.45,
                margin: 0,
              }}
            >
              {takeaway.point}
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <p style={{ fontSize: '11px', color: brand.primary + '99', margin: 0, maxWidth: '70%' }}>
            {sourceTitle?.slice(0, 50)}{sourceTitle?.length > 50 ? '...' : ''}
          </p>
          <div style={{ display: 'flex', gap: '3px' }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: i === 0 ? brand.primary : brand.primary + '44',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TakeawayCards({ takeaways, brand, sourceTitle }) {
  const cardRefs = useRef([]);

  const handleExport = async (index) => {
    const el = cardRefs.current[index];
    if (!el) return;
    await exportElementAsPng(el, `takeaway-${index + 1}.png`);
  };

  if (!takeaways?.length) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white">Takeaway Cards</h3>
        <span className="text-xs text-[#6b7280]">{takeaways.length} cards</span>
      </div>
      <div className="space-y-4">
        {takeaways.map((takeaway, i) => (
          <div key={i} className="group relative">
            <div className="rounded-2xl overflow-hidden border border-[#1e1e2e]">
              <div ref={el => cardRefs.current[i] = el} className="rounded-2xl overflow-hidden">
                <CardCanvas takeaway={takeaway} index={i} brand={brand} sourceTitle={sourceTitle} />
              </div>
            </div>
            <button
              onClick={() => handleExport(i)}
              className="mt-2 w-full py-2 text-xs font-medium text-[#c084fc] bg-[#c084fc11] hover:bg-[#c084fc22] border border-[#c084fc22] hover:border-[#c084fc44] rounded-xl transition-all cursor-pointer"
            >
              ↓ Download PNG
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
