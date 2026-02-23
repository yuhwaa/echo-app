"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import PublicationCard from "@/components/PublicationCard";
import CreatePublicationModal from "@/components/CreatePublicationModal";
import { Publication } from "@/types";

export default function Home() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. The "Motion Sensor": Run this once when the page loads
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('publications')
        .select('*, subtasks (*)') // Get pubs and their tasks
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching:", error);
      } else {
        setPublications(data || []);
      }
      setLoading(false);
    };

    fetchData();
  }, []); // The empty [] means "only run once on load"

  // 2. The "Camera Update": Add new item to the state without refreshing
  const handleAdd = (newPub: Publication) => {
    setPublications((prev) => [newPub, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Echo</h1>
            <p className="text-slate-500 font-medium">Content Operations Command</p>
          </div>
          <CreatePublicationModal onAdd={handleAdd} />
        </header>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading your command center...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publications.map((pub) => (
              <PublicationCard key={pub.id} pub={pub} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}