"use client";
import { useState } from "react";

import PublicationCard from "@/components/PublicationCard";
import CreatePublicationModal from "@/components/CreatePublicationModal";
import { Publication } from "@/types";

export default function Home() {
  const [publications, setPublications] = useState<Publication[]>([
    { id: "1", title: "2026 AI Trends Report", type: "Insights Commentary", status: "Live", production_url: "https://google.com" },
  ]);

  const addPublication = (newPub: Publication) => {
    setPublications([newPub, ...publications]);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Echo</h1>
            <p className="text-slate-500 font-medium">Content Operations Command</p>
          </div>
          {/* New Modal Component here */}
          <CreatePublicationModal onAdd={addPublication} />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publications.map((pub) => (
            <PublicationCard key={pub.id} pub={pub} />
          ))}
        </div>
      </div>
    </div>
  );
}