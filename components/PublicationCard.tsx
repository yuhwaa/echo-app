import { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarDays, ChevronRight, MessageSquare, Paperclip, Pencil, Trash2, X, MoreHorizontal } from "lucide-react";
import { Publication, Subtask, Comment } from "@/types";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

const MotionCard = motion.create(Card);
const MotionSelectTrigger = motion(SelectTrigger);
const skeletonContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.12 },
  },
};
const skeletonItem = {
  initial: { opacity: 0.3 },
  animate: {
    opacity: [0.3, 0.7, 0.3],
    transition: {duration: 1.2, repeat: Infinity, ease: "easeInOut"},
  },
};
const statusStyles: Record<Publication['status'], { bg: string; text: string; hoverBg: string; glow: string }> = {
  'In Queue': { bg: 'bg-slate-100', text: 'text-slate-600', hoverBg: 'hover:bg-slate-200', glow: 'rgba(100, 116, 139, 1)' },
  'In Progress': { bg: 'bg-amber-50', text: 'text-amber-700', hoverBg: 'hover:bg-amber-100', glow: 'rgba(217, 119, 6, 1)' },
  'Live': { bg: 'bg-emerald-50', text: 'text-emerald-700', hoverBg: 'hover:bg-emerald-100', glow: 'rgba(16, 185, 129, 1)' },
  'Canceled': { bg: 'bg-red-50', text: 'text-red-700', hoverBg: 'hover:bg-red-100', glow: 'rgba(220, 38, 38, 1)' },
};

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
    const { isAuthenticated } = useAuth();
    const [authModalAction, setAuthModalAction] = useState<string | null>(null);

    const requireAuth = (action: string, callback:() => void) => {
      if (!isAuthenticated) {
        setAuthModalAction(action);
        return;
      }
      callback();
    }
    const [sheetOpen, setSheetOpen] = useState(false);

    const dateInputRef = useRef<HTMLInputElement>(null);

    const [ showEmptyState, setShowEmptyState ] = useState(comments.length === 0);

    useEffect(() => {
      if (comments.length > 0) {
        setShowEmptyState(false);
      }
    }, [comments.length]);

    const [status, setStatus] = useState(pub.status);
    const [hasChangedStatus, setHasChangedStatus] = useState(false);

    const handleStatusChange = (value: string) => {
      requireAuth("update the status", () => {
        setStatus(value as Publication['status']);
        setHasChangedStatus(true);
        updatePublication({ status: value as Publication['status'] });
      });
    }
    return (
      <>
        <Sheet 
        open={sheetOpen} 
        onOpenChange={(open) => {
            if (!open && authModalAction) {
              setSheetOpen(true);
              return;
            }
            setSheetOpen(open);
            if (!open) setSelectedSubtask(null);
          }}
        >
        <SheetTrigger asChild onClick={() => setSheetOpen(true)}>
        <MotionCard 
          whileHover={{ scale: 1.015, boxShadow: "0 0 24px rgba(0, 130, 101, 0.5)" }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="cursor-pointer group relative hover:border-emerald-500 transition-colors border-gray-300 shadow-sm overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }}
                />
            </div>
            <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => requireAuth("edit the title", () => setIsEditingTitle(true))}>
                    <Pencil size={14} className="mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => { requireAuth("delete this publication", () => handleDelete(e)); }}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Trash2 size={14} className="mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardHeader className="pt-7 pb-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-slate-500">
              {pub.type}
            </Badge>

            {/* INLINE STATUS SELECT */}
            <div onClick={(e) => e.stopPropagation()}> 
              <Select 
                value={status} 
                onValueChange={handleStatusChange}
              >
              <MotionSelectTrigger
                key={status}
                initial={hasChangedStatus ? { boxShadow: `inset 0 0 14px 4px ${statusStyles[status].glow}` } : false}
                animate={hasChangedStatus ? { boxShadow: `inset 0 0 0px 0px ${statusStyles[status].glow}` } : undefined}
                transition={{ duration: 0.05, ease: "easeOut" }}
                className={`h-6 w-auto text-[10px] uppercase font-bold border-none transition-colors ${statusStyles[status].bg} ${statusStyles[status].text} ${statusStyles[status].hoverBg}`}
              >
                  <SelectValue />
                </MotionSelectTrigger>
                <SelectContent>
                  <SelectItem value="In Queue">In Queue</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Live">Live</SelectItem>
                  <SelectItem value="Canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
            <CardTitle className="group/title flex items-center justify-between gap-2 pt-2">
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
              <button
                type="button"
                onClick={() => dateInputRef.current?.showPicker()}
                className="hover:text-emerald-600 transition-colors"
              >
                <CalendarDays size={14} />
              </button>
              <input 
                ref={dateInputRef}
                type="date"
                defaultValue={pub.publication_date || ""}
                onChange={(e) => requireAuth("edit the date", () => updatePublication({ publication_date: e.target.value }))}
                className="text-xs font-medium bg-transparent border-none cursor-pointer hover:text-emerald-600 focus:ring-0 p-0 [&::-webkit-calendar-picker-indicator]:hidden"
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
        </MotionCard>
        </SheetTrigger>
        <SheetContent 
        style={{ pointerEvents: authModalAction ? 'none' : 'auto' }}
      showCloseButton={false}
      className={`transition-all duration-300 p-0 border-l border-gray-300 flex flex-col w-screen ${selectedSubtask ? "sm:max-w-full" : "sm:max-w-[66vw]"
      }`}
    >
      <SheetHeader className="sr-only">   
        <SheetTitle>{pub.title}</SheetTitle>     
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
        className="opacity-100 sm:opacity-0 sm:group-hover/master:opacity-100 p-2 hover:bg-slate-100 rounded-full transition-all"
      >
        <Pencil size={18} className="text-slate-400" />
      </button>
    </>
  )}
</div>
      </SheetHeader>
      {/* 1. THE MASTER HEADER (Across both panels) */}
      <div className="border-b border-gray-200 bg-white flex items-start justify-between px-4 sm:px-8 py-4 gap-4 shrink-0">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <Badge className="bg-emerald-100 text-emerald-700 uppercase text-[10px] w-fit">
            {pub.type}
          </Badge>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
            {pub.title}
          </h2>
        </div>

        {/* SINGLE 'X' TO CLOSE EVERYTHING — always top-right */}
        <SheetClose className="p-2 hover:bg-slate-100 rounded-full transition-colors shrink-0">
          <X className="h-6 w-6 text-slate-400" />
        </SheetClose>
      </div>

      {/* 2. THE CONTENT AREA (Split 50/50) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* PANEL A: Subtask List */}
        <div className={`h-full overflow-y-auto bg-white transition-all duration-300 ${
  selectedSubtask ? "hidden sm:block sm:w-1/2 sm:border-r sm:border-gray-100" : "w-full"
}`}>
          <div className="p-4 sm:p-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
              Production Checklist
            </h3>
            {/* Subtask Map */}
            {pub.subtasks?.map((task) => (
              <div 
                key={task.id} 
                onClick={() => {
                  setSelectedSubtask(task);
                  setComments([]);
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
          <div className="w-full sm:w-1/2 h-full bg-slate-50 flex flex-col animate-in slide-in-from-right">
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
              {commentsLoading ? (
                <motion.div 
                  variants={skeletonContainer} 
                  initial="initial" 
                  animate="animate"
                  className="space-y-4"
                >
                {[0, 1, 2].map((i) => (
                  <motion.div 
                    key={i} 
                    variants={skeletonItem} 
                    className="h-16 bg-white rounded-xl border border-gray-200"
                  />
                ))}
                </motion.div>
              ) : (
              <AnimatePresence
                key={selectedSubtask?.id}
                onExitComplete={() => {
                  if (comments.length === 0) setShowEmptyState(true);
                }}
              >
              {showEmptyState && (
                <motion.p
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-slate-400 text-center py-8"
                >
                No comments yet
                  </motion.p>
              )}
                {comments.map((comment) => (
                  <motion.div 
                    key={comment.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y:-8 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="group bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative"
                  >
                    <p className="text-xs font-bold text-slate-900">{comment.author}</p>
                    <p className="text-sm text-slate-600 mt-1">{comment.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] text-slate-300">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => requireAuth("delete this comment", () => handleDeleteComment(comment.id))}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              )}
            </div>

            {/* New comment input */}
            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <Input
                placeholder={isAuthenticated ? "Add a comment..." : "Sign in to comment..."}
                value={newComment}
                onChange={(e) => isAuthenticated && setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && requireAuth("post a comment", handleAddComment)}
                readOnly={!isAuthenticated}
                className={`flex-1 text-sm ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isAuthenticated && requireAuth("post a comment", () => {})}
              />
              <button
                onClick={() => requireAuth("post a comment", handleAddComment)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                  isAuthenticated 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
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
        {authModalAction && (
          <AuthModal
            action={authModalAction}
            onClose={() => setAuthModalAction(null)}
          />
        )}
      </>
    );
  }
