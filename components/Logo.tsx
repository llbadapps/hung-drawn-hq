export default function Logo() {
  return (
    <div className="flex items-center">
      <div className="relative">
        {/* Main logo text */}
        <div className="flex items-baseline space-x-0.5">
          <span className="text-2xl font-black tracking-tighter text-white">
            HD
          </span>
          <span className="text-xl font-black tracking-tighter" style={{ color: '#510d0a' }}>
            .
          </span>
          <span className="text-2xl font-black tracking-tighter text-white">
            HQ
          </span>
        </div>
        {/* Subtle underline accent */}
        <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: '#96c5b0' }}></div>
      </div>
    </div>
  );
}
