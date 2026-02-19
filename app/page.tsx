import PublicationCard from "@/components/PublicationCard";
import { Publication } from "@/types";

const mockPublications: Publication[] = [
  { id: "1", title: "2026 AI Trends Report", type: "Insights Commentary", status: "Live", production_url: "https://example.com" },
  { id: "2", title: "The Future of GEO", type: "Memo", status: "In Progress" },
  { id: "3", title: "Weekly Tech Podcast Ep. 12", type: "Insights Podcast", status: "In Queue" },
];

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Echo</h1>
            <p className="text-slate-500">Editorial Command Center</p>
          </div>
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
            + New Publication
          </button>
        </header>

        {/* The Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPublications.map((pub) => (
            <PublicationCard key={pub.id} pub={pub} />
          ))}
        </div>
      </div>
    </main>
  );
}