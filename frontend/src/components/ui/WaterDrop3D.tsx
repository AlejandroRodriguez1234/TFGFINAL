// CSS-animated water blob — no WebGL required
export default function WaterDrop3D({ fillPct = 0, size = 80 }: { fillPct?: number; size?: number }) {
  const fill = Math.max(0, Math.min(100, fillPct))
  const isLow    = fill < 40
  const isMedium = fill >= 40 && fill < 70
  const color    = isLow ? '#f97316' : isMedium ? '#22d3ee' : '#0ea5e9'
  const glow     = isLow ? 'rgba(249,115,22,0.4)' : isMedium ? 'rgba(34,211,238,0.4)' : 'rgba(14,165,233,0.4)'

  return (
    <div
      style={{ width: size, height: size, flexShrink: 0 }}
      className="relative flex items-center justify-center"
    >
      <style>{`
        @keyframes waterFloat {
          0%, 100% { transform: translateY(0) scale(1); border-radius: 60% 40% 55% 45% / 50% 60% 40% 50%; }
          33%       { transform: translateY(-3px) scale(1.03); border-radius: 50% 50% 45% 55% / 55% 45% 55% 45%; }
          66%       { transform: translateY(2px) scale(0.97); border-radius: 45% 55% 60% 40% / 45% 55% 45% 55%; }
        }
        @keyframes waterShimmer {
          0%, 100% { opacity: 0.6; transform: translateX(-30%) translateY(-20%) rotate(0deg); }
          50%       { opacity: 0.9; transform: translateX(-20%) translateY(-30%) rotate(180deg); }
        }
      `}</style>
      <div
        style={{
          width: size * 0.78,
          height: size * 0.78,
          background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}99 50%, ${color}66)`,
          boxShadow: `0 0 ${size * 0.3}px ${glow}, inset 0 0 ${size * 0.2}px rgba(255,255,255,0.15)`,
          animation: 'waterFloat 3s ease-in-out infinite',
          borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* shimmer highlight */}
        <div style={{
          position: 'absolute',
          width: '55%',
          height: '55%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)',
          borderRadius: '50%',
          left: '10%',
          top: '8%',
          animation: 'waterShimmer 2.5s ease-in-out infinite',
        }} />
      </div>
    </div>
  )
}
