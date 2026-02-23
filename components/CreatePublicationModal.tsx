"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Publication } from "@/types";
import { supabase } from "@/utils/supabase"; 
import { TASK_TEMPLATES } from "@/lib/templates";

export default function CreatePublicationModal({ onAdd }: { onAdd: (pub: Publication) => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Publication['type']>("Insights Commentary");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [publicationDate, setPublicationDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  // 1. Insert the Publication
  const { data: pubData, error: pubError } = await supabase
    .from('publications')
    .insert([
      { title, type, status: 'In Queue', publication_date: publicationDate || null }
    ])
    .select()
    .single();

  if (pubError) {
    console.error("Error saving publication:", pubError);
    return;
  }

  // 2. Prepare Subtasks using the ID we just got back
  const templateTitles = TASK_TEMPLATES[type] || [];
  const subtasksToInsert = templateTitles.map(taskTitle => ({
    publication_id: pubData.id,
    title: taskTitle,
    is_completed: false
  }));

  // 3. Insert Subtasks in bulk
  const { error: tasksError } = await supabase
    .from('subtasks')
    .insert(subtasksToInsert);

  if (tasksError) {
    console.error("Error saving tasks:", tasksError);
  } else {
    onAdd({ ...pubData, subtasks: subtasksToInsert }); // Update the UI
    setOpen(false);
    setTitle("");
  }
  setLoading(false);
};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-700 text-white rounded-full px-6 hover:bg-emerald-500 transition-colors shadow-md border-none">+ Create New</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-gray-500 shadow-lg">
        <DialogHeader>
          <DialogTitle>New Publication</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input 
              placeholder="e.g. 2026 Marketing Strategy" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Target Publication Date</label>
            <Input 
              type="date" 
              className="border-gray-300"
              value={publicationDate}
              onChange={(e) => setPublicationDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select onValueChange={(value: Publication['type']) => setType(value)} defaultValue={type}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Insights Commentary">Insights Commentary</SelectItem>
                <SelectItem value="Insights Podcast">Insights Podcast</SelectItem>
                <SelectItem value="Insights Video">Insights Video</SelectItem>
                <SelectItem value="Memo">Memo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-600 text-white">Add</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}