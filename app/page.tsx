"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import PublicationCard from "@/components/PublicationCard";
import CreatePublicationModal from "@/components/CreatePublicationModal";
import { Publication, Subtask } from "@/types";
import AuthModal from "@/components/AuthModal";
import AvatarMenu from "@/components/AvatarMenu";

export default function Home() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch publications with subtasks
      const { data, error } = await supabase
        .from('publications')
        .select('*, subtasks(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching:", error);
        setLoading(false);
        return;
      }

      // Fetch comment counts per subtask
      const { data: commentCounts, error: countError } = await supabase
        .from('subtask_comments')
        .select('subtask_id');

      if (!countError && commentCounts && data) {
        const publicationsWithCounts = data.map(pub => ({
          ...pub,
          subtasks: pub.subtasks.map((subtask: Subtask) => ({
            ...subtask,
            comment_count: commentCounts.filter(c => c.subtask_id === subtask.id).length
          }))
        }));
        setPublications(publicationsWithCounts);
      } else {
        setPublications(data || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleAdd = (newPub: Publication) => {
    setPublications((prev) => [newPub, ...prev]);
  };

  const handleDelete = (id: string) => {
    setPublications((prev) => prev.filter(p => p.id !== id));
  };

  const handleUpdate = (updatedPub: Partial<Publication> & { id: string }) => {
  setPublications((prev) =>
    prev.map(p => p.id === updatedPub.id ? {
      ...p,
      ...updatedPub,
      subtasks: updatedPub.subtasks ?? p.subtasks  // use incoming subtasks if provided, otherwise keep existing
    } : p)
  );
};

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 md:mb-12">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter">Echo</h1>
            {/* <p className="text-slate-500 font-medium">Content Operations Command</p> */}
          </div>
          <div className="flex items-center gap-4">
            <CreatePublicationModal onAdd={handleAdd} />
            <AvatarMenu />
          </div>
        </header>
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading your command center...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {publications.map((pub) => (
              <PublicationCard key={pub.id} pub={pub} onDelete={handleDelete} onUpdate={handleUpdate}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}