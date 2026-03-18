const Loader = ({ label = "Loading...", fullScreen = false }) => {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? "min-h-screen" : "min-h-[240px]"
      }`}
    >
      <div className="flex items-center gap-3 rounded-full border border-white/70 bg-white/80 px-5 py-3 shadow-panel backdrop-blur">
        <span className="h-3 w-3 animate-pulse rounded-full bg-coral" />
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
    </div>
  );
};

export default Loader;
