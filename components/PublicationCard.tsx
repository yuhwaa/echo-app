import { useState } from 'react';
import { supabase } from "@/utils/supabase";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarDays, ChevronRight, MessageSquare, Paperclip, Pencil, Trash2, X } from "lucide-react";
import { Publication, Subtask, Comment } from "@/types";

export default function PublicationCard ({ pub, onDelete, onUpdate }: { pub: Publication, onDelete: (id: string) => void, onUpdate: (updatedPub: Partial<Publication> & { id: string }) => void }) {
    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (confirm("Are you sure you want to delete this publication?")) {
            const { error } = await supabase
            .from('publications')
            .delete()
            .eq('id', pub.id);

            if (!error) {
                onDelete(pub.id);
            }
        }
    };
    const completedCount = pub.subtasks?.filter(t => t.is_completed).length
    const totalCount = pub.subtasks.length || 0;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    const [selectedSubtask, setSelectedSubtask] = useState<Subtask | null>(null);
    const closeSubtaskPanel = () => setSelectedSubtask(null);
    const updatePublication = async (updates: Partial<Publication>) => {
      const { error } = await supabase
        .from('publications')
        .update(updates)
        .eq('id', pub.id);
      
      if (!error) {
        onUpdate({ id: pub.id, ...updates });
      }
    }
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [localTitle, setLocalTitle] = useState(pub.title);
    const handleTitleSave = async () => {
      if (localTitle !== pub.title) {
        const { error } = await supabase
          .from('publications')
          .update({ title: localTitle })
          .eq('id', pub.id);
      }
      setIsEditingTitle(false);
    };
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [commentsLoading, setCommentsLoading] = useState(false);
    const fetchComments = async (subtaskId: string) => {
      setCommentsLoading(true);
      const { data, error } = await supabase
        .from('subtask_comments')
        .select('*')
        .eq('subtask_id', subtaskId)
        .order('created_at', { ascending: true });
      
      if (!error && data) {
        setComments(data);
      }
      setCommentsLoading(false);
    };

    const handleAddComment = async () => {
      if (!newComment.trim() || !selectedSubtask) return;
      
      const { data, error } = await supabase
        .from('subtask_comments')
        .insert({
          subtask_id: selectedSubtask.id,
          content: newComment.trim(),
          author: 'Admin'
        })
        .select()
        .single();
      
      if (!error && data) {
        setComments((prev) => [...prev, data]);
        setNewComment('');
      // Update the count on the subtask bar live
        onUpdate({
          id: pub.id,
          subtasks: pub.subtasks.map(s => 
            s.id === selectedSubtask.id 
              ? { ...s, comment_count: (s.comment_count ?? 0) + 1 }
              : s
          )
        });
      }
    };
    const handleDeleteComment = async (commentId: string) => {
      if (!confirm("Delete this comment?")) return;

      const { error } = await supabase
        .from('subtask_comments')
        .delete()
        .eq('id', commentId)

      if (!error) {
        setComments((prev) => prev.filter(c => c.id !== commentId ));

        onUpdate({
          id: pub.id,
          subtasks: pub.subtasks.map(s =>
            s.id === selectedSubtask?.id
              ? { ...s, comment_count: Math.max((s.comment_count ?? 0) - 1, 0) }
              : s
          )
        });
      }
    };
    return (
        <Sheet onOpenChange={(open) => !open && setSelectedSubtask(null)}>
        <SheetTrigger asChild>
        <Card className="cursor-pointer group relative hover:border-emeral-500 transition-all border-gray-300 shadow-sm hover:shadow-md overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
                <div className="h-full bg-emeral-500 transition-all duration-500" style={{ width: `${progress}%` }}
                />
            </div>
        <button
            onClick={handleDelete}
            className="absolute top-2 right-2 p-2 text-slate-300 hover:text-red-500 transition-colors"
        >
        <Trash2 size={16} />
        </button>
            <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-slate-500">
              {pub.type}
            </Badge>

            {/* INLINE STATUS SELECT */}
            <div onClick={(e) => e.stopPropagation()}> 
              <Select 
                defaultValue={pub.status} 
                onValueChange={(value) => updatePublication({ status: value as Publication['status'] })}
              >
                <SelectTrigger className="h-6 w-24 text-[10px] uppercase font-bold border-none bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Queue">In Queue</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Live">Live</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
            <CardTitle className="group/title flex items-center gap-2 pt-2">
  {isEditingTitle ? (
    <div className="flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
      <Input 
        value={localTitle}
        onChange={(e) => setLocalTitle(e.target.value)}
        onBlur={handleTitleSave}
        onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
        autoFocus
        className="h-8 text-xl font-bold"
      />
    </div>
  ) : (
    <>
      <span className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
        {localTitle}
      </span>
      <button 
        onClick={(e) => {
          e.stopPropagation(); // Prevent opening the sheet
          setIsEditingTitle(true);
        }}
        className="opacity-0 group-hover/title:opacity-100 p-1 hover:bg-slate-100 rounded transition-all"
      >
        <Pencil size={14} className="text-slate-400" />
      </button>
    </>
  )}
</CardTitle>
          </CardHeader>
            <CardContent>
            {/* INLINE DATE EDITING */}
          <div 
            className="flex items-center gap-2 text-slate-500 mb-4 group/date relative"
            onClick={(e) => e.stopPropagation()}
          >
            <CalendarDays size={14} />
            <input 
              type="date"
              defaultValue={pub.publication_date || ""}
              onChange={(e) => updatePublication({ publication_date: e.target.value })}
              className="text-xs font-medium bg-transparent border-none cursor-pointer hover:text-emerald-600 focus:ring-0 p-0"
            />
          </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
              <div className="flex gap-3 text-slate-400">
                <div className="flex items-center gap-1">
                  <MessageSquare size={14} />
                  <span className="text-xs">
                    {pub.subtasks.reduce((total, subtask) => total + (subtask.comment_count ?? 0), 0)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Paperclip size={14} />
                  <span className="text-xs">0</span> {/* pending attachments feature */}
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 uppercase tracking-tighter">
                View Tasks <ChevronRight size={14} />
              </span>
            </div>
          </CardContent>
        </Card>
        </SheetTrigger>
        <SheetContent 
      showCloseButton={false}
      className={`transition-all duration-300 p-0 border-l border-gray-300 flex flex-col ${
        selectedSubtask ? "sm:max-w-[100vw] w-screen" : "sm:max-w-[66vw] w-[66vw]"
      }`}
    >
      <SheetHeader className="sr-only">        
        <SheetDescription>{pub.type}</SheetDescription>
        <div className="flex items-center gap-4 group/master">
  {isEditingTitle ? (
    <Input 
      value={localTitle}
      onChange={(e) => setLocalTitle(e.target.value)}
      onBlur={handleTitleSave}
      onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
      autoFocus
      className="text-2xl font-black h-12"
    />
  ) : (
    <>
      <h2 className="text-2xl font-black text-slate-900 truncate max-w-md">
        {localTitle}
      </h2>
      <button 
        onClick={() => setIsEditingTitle(true)}
        className="opacity-0 group-hover/master:opacity-100 p-2 hover:bg-slate-100 rounded-full transition-all"
      >
        <Pencil size={18} className="text-slate-400" />
      </button>
    </>
  )}
</div>
      </SheetHeader>
      {/* 1. THE MASTER HEADER (Across both panels) */}
      <div className="h-20 border-b border-gray-200 bg-white flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          <Badge className="bg-emerald-100 text-emerald-700 uppercase text-[10px]">
            {pub.type}
          </Badge>
          <h2 className="text-2xl font-black text-slate-900 truncate max-w-md">
            {pub.title}
          </h2>
        </div>
        
        {/* SINGLE 'X' TO CLOSE EVERYTHING */}
        <SheetClose className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X className="h-6 w-6 text-slate-400" />
        </SheetClose>
      </div>

      {/* 2. THE CONTENT AREA (Split 50/50) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* PANEL A: Subtask List */}
        <div className={`h-full overflow-y-auto bg-white transition-all duration-300 ${
          selectedSubtask ? "w-1/2 border-r border-gray-100" : "w-full"
        }`}>
          <div className="p-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
              Production Checklist
            </h3>
            {/* Subtask Map */}
            {pub.subtasks?.map((task) => (
              <div 
                key={task.id} 
                onClick={() => {
                  setSelectedSubtask(task);
                  fetchComments(task.id);
                }}
                className={`p-4 mb-2 rounded-xl border cursor-pointer transition-all ${
                  selectedSubtask?.id === task.id ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-100 hover:border-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{task.title}</span>
                  <div className="flex gap-3 text-slate-400">
                    <div className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      <span className="text-xs">{task.comment_count ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Paperclip size={12} />
                      <span className="text-xs">0</span> {/* pending attachments feature */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL B: Detailed View (Comments/Files) */}
        {selectedSubtask && (
          <div className="w-1/2 h-full bg-slate-50 flex flex-col animate-in slide-in-from-right">
            {/* SUB-HEADER FOR PANEL B */}
            <div className="px-6 py-4 border-b border-gray-200 bg-slate-50 flex items-center gap-4">
              <button 
                onClick={() => setSelectedSubtask(null)}
                className="p-1 hover:text-emerald-600 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h4 className="font-bold text-slate-800 truncate">{selectedSubtask.title}</h4>
            </div>

            {/* Tabs for Comments & Files */}
        <Tabs defaultValue="comments" className="flex-1 flex flex-col">
          <TabsList className="mx-6 mt-4 bg-slate-200/50">
            <TabsTrigger value="comments" className="flex-1">Comments</TabsTrigger>
            <TabsTrigger value="files" className="flex-1">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="comments" className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
            {/* Comment list */}
            <div className="space-y-4 flex-1">
              {comments.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No comments yet</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="group bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative">
                    <p className="text-xs font-bold text-slate-900">{comment.author}</p>
                    <p className="text-sm text-slate-600 mt-1">{comment.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] text-slate-300">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* New comment input */}
            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1 text-sm"
            />
            <button
                onClick={handleAddComment}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Post
            </button>
          </div>
        </TabsContent>

          <TabsContent value="files" className="p-6">
             <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
                <p className="text-sm text-slate-500">Drop files here to attach to this task</p>
             </div>
          </TabsContent>
        </Tabs>
          </div>
        )}
      </div>
    </SheetContent>
        </Sheet>
    );
}
