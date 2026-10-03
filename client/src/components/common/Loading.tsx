const Loading = () => (
  <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-[var(--line)] border-t-[var(--royal)] animate-spin" />
      <p className="text-[13px] text-[var(--ink-soft)] font-medium">Loading Future IT College...</p>
    </div>
  </div>
);

export default Loading;

