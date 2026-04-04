import { useState } from 'react';

export default function LinkedInPost({ post }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (!post) return null;

  const handleCopy = async () => {
    const text = [post.hook, '', post.body, '', post.cta, '', post.hashtags].filter(Boolean).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white">LinkedIn Post Copy</h3>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            copied
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-[#c084fc11] text-[#c084fc] border border-[#c084fc22] hover:bg-[#c084fc22]'
          }`}
        >
          {copied ? '✓ Copied!' : '⎘ Copy All'}
        </button>
      </div>

      <div className="rounded-2xl border border-[#1e1e2e] bg-[#0e0e18] overflow-hidden">
        {/* Hook */}
        <div className="p-4 border-b border-[#1e1e2e]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#c084fc]" />
            <span className="text-xs font-medium text-[#c084fc] uppercase tracking-wider">Hook</span>
          </div>
          <p className="text-white text-sm leading-relaxed font-medium">{post.hook}</p>
        </div>

        {/* Body */}
        <div className="p-4 border-b border-[#1e1e2e]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#a855f7]" />
            <span className="text-xs font-medium text-[#a855f7] uppercase tracking-wider">Body</span>
          </div>
          <div className="relative">
            <p
              className={`text-[#d1d5db] text-sm leading-relaxed whitespace-pre-line transition-all ${
                !expanded ? 'line-clamp-6' : ''
              }`}
            >
              {post.body}
            </p>
            {post.body?.length > 300 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1 text-xs text-[#c084fc] hover:underline cursor-pointer"
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="p-4 border-b border-[#1e1e2e]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#f0abfc]" />
            <span className="text-xs font-medium text-[#f0abfc] uppercase tracking-wider">CTA</span>
          </div>
          <p className="text-[#e9d5ff] text-sm leading-relaxed">{post.cta}</p>
        </div>

        {/* Hashtags */}
        {post.hashtags && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#6b7280]" />
              <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">Hashtags</span>
            </div>
            <p className="text-[#6b7280] text-sm break-words">{post.hashtags}</p>
          </div>
        )}
      </div>

      {/* Character count */}
      {post.hook && post.body && (
        <p className="mt-2 text-xs text-[#4b5563] text-right">
          {([post.hook, post.body, post.cta, post.hashtags].filter(Boolean).join('\n')).length} chars
          {([post.hook, post.body, post.cta, post.hashtags].filter(Boolean).join('\n')).length > 3000 && (
            <span className="text-amber-400 ml-1">(LinkedIn max: 3000)</span>
          )}
        </p>
      )}
    </div>
  );
}
