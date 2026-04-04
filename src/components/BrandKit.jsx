import { useRef } from 'react';

const FONT_STYLES = [
  { id: 'modern', label: 'Modern', preview: 'Inter' },
  { id: 'serif', label: 'Serif', preview: 'Georgia' },
  { id: 'minimal', label: 'Minimal', preview: 'DM Sans' },
];

const COLOR_PRESETS = [
  { name: 'Purple Night', primary: '#c084fc', secondary: '#a855f7', accent: '#f0abfc', background: '#12101a', text: '#f1e8ff' },
  { name: 'Ocean Dark', primary: '#38bdf8', secondary: '#0ea5e9', accent: '#7dd3fc', background: '#0c1825', text: '#e0f2fe' },
  { name: 'Ember', primary: '#fb923c', secondary: '#f97316', accent: '#fed7aa', background: '#1a0f08', text: '#fff7ed' },
  { name: 'Mint', primary: '#34d399', secondary: '#10b981', accent: '#a7f3d0', background: '#081a12', text: '#ecfdf5' },
  { name: 'Rose Gold', primary: '#f472b6', secondary: '#ec4899', accent: '#fbcfe8', background: '#1a0812', text: '#fdf2f8' },
  { name: 'Slate', primary: '#94a3b8', secondary: '#64748b', accent: '#cbd5e1', background: '#0f1217', text: '#f1f5f9' },
];

export default function BrandKit({ brand, updateBrand }) {
  const logoInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateBrand({ logo: ev.target.result, logoName: file.name });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#0e0e18] p-6 shadow-xl">
      <h2 className="text-xl font-semibold text-white mb-1">Brand Kit</h2>
      <p className="text-sm text-[#6b7280] mb-5">Customize to match your brand</p>

      {/* Color Presets */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-3">Presets</label>
        <div className="grid grid-cols-3 gap-2">
          {COLOR_PRESETS.map(preset => (
            <button
              key={preset.name}
              onClick={() => updateBrand(preset)}
              className="group relative rounded-lg overflow-hidden h-12 border border-[#1e1e2e] hover:border-[#c084fc44] transition-all cursor-pointer"
              title={preset.name}
            >
              <div className="w-full h-full flex">
                <div className="flex-1" style={{ background: preset.background }} />
                <div className="w-3" style={{ background: preset.primary }} />
                <div className="w-2" style={{ background: preset.secondary }} />
              </div>
              <div className="absolute inset-0 flex items-end justify-start p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <span className="text-white text-[9px] font-medium leading-tight">{preset.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-3">Custom Colors</label>
        <div className="space-y-2.5">
          {[
            { key: 'primary', label: 'Primary' },
            { key: 'secondary', label: 'Secondary' },
            { key: 'accent', label: 'Accent' },
            { key: 'background', label: 'Background' },
            { key: 'text', label: 'Text' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-[#9ca3af]">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#4b5563] font-mono">{brand[key]}</span>
                <label className="cursor-pointer">
                  <div
                    className="w-7 h-7 rounded-lg border border-[#ffffff22] shadow-inner cursor-pointer hover:scale-110 transition-transform"
                    style={{ background: brand[key] }}
                  />
                  <input
                    type="color"
                    value={brand[key]}
                    onChange={e => updateBrand({ [key]: e.target.value })}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Font Style */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-3">Font Style</label>
        <div className="flex gap-2">
          {FONT_STYLES.map(f => (
            <button
              key={f.id}
              onClick={() => updateBrand({ fontStyle: f.id })}
              className={`flex-1 py-2 rounded-lg text-sm transition-all cursor-pointer border ${
                brand.fontStyle === f.id
                  ? 'bg-[#c084fc22] text-[#c084fc] border-[#c084fc44]'
                  : 'bg-[#12121c] text-[#6b7280] border-[#1e1e2e] hover:text-[#9ca3af]'
              }`}
              style={{ fontFamily: f.preview }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-3">Logo</label>
        <div
          onClick={() => logoInputRef.current?.click()}
          className="border border-dashed border-[#1e1e2e] hover:border-[#c084fc44] rounded-xl p-4 text-center cursor-pointer transition-all"
        >
          <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          {brand.logo ? (
            <div className="flex items-center gap-3">
              <img src={brand.logo} alt="logo" className="h-8 max-w-[80px] object-contain rounded" />
              <div className="text-left">
                <p className="text-xs text-[#c084fc]">{brand.logoName}</p>
                <p className="text-xs text-[#4b5563]">Click to change</p>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-2xl">🖼️</span>
              <p className="text-xs text-[#6b7280] mt-1">Upload logo (PNG, SVG)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
