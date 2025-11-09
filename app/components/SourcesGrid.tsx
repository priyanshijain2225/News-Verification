const sources = ["BBC", "Reuters", "NDTV", "PIB", "ANI", "The Guardian"];

export default function SourcesGrid() {
  return (
    <div id="sources" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 max-w-4xl mx-auto px-6">
      {sources.map((src) => (
        <div
          key={src}
          className="flex flex-col items-center justify-center bg-white rounded-lg border border-orange/10 p-4 hover:scale-105 transition"
        >
          <div className="w-14 h-14 flex items-center justify-center bg-orange/10 rounded-md font-bold text-orange">
            {src[0]}
          </div>
          <span className="mt-2 font-semibold text-text text-sm">{src}</span>
        </div>
      ))}
    </div>
  );
}
