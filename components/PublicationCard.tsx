import { useState } from 'react';
import { supabase } from "@/utils/supabase";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ChevronRight, MessageSquare, Paperclip, Trash2, X } from "lucide-react";
import { Publication, Subtask } from "@/types";

export default function PublicationCard ({ pub, onDelete }: { pub: Publication, onDelete: (id: string) => void }) {
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
    return (
        <Sheet>
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
              <Badge className="bg-emerald-50 text-emerald-700 border-none text-[10px] uppercase">
                {pub.status}
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors pt-2">
              {pub.title}
            </CardTitle>
          </CardHeader>
            <CardContent>
            <div className="flex items-center gap-2 text-slate-500 mb-4">
              <CalendarDays size={14} />
              <span className="text-xs font-medium">
                {pub.publication_date ? new Date(pub.publication_date).toLocaleDateString() : "No date set"}
              </span>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
              <div className="flex gap-3 text-slate-400">
                <div className="flex items-center gap-1">
                  <MessageSquare size={14} />
                  <span className="text-xs">0</span>
                </div>
                <div className="flex items-center gap-1">
                  <Paperclip size={14} />
                  <span className="text-xs">0</span>
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
          className={`transition-all duration-300 p-0 border-l border-gray-300 ${
            selectedSubtask ? "sm:max-w-[100vw] w-screen" : "sm:max-w-[66vw] w-[66vw]"
          }`}
        >
          <div className="flex h-full w-full overflow-hidden">

            {/* PANEL 1: Publication & Task List */}
            <div className={`h-full overflow-y-auto transition-all duration-300 bg-white ${
              selectedSubtask ? "w-1/2 border-r border-gray-200" : "w-full"
            }`}>
              <SheetHeader className="bg-white p-8 border-b border-gray-200">
                <div className="flex items-center gap-4 mb-2">
                  <Badge className="bg-slate-900 text-white uppercase text-[10px]">{pub.type}</Badge>
                </div>
                <SheetTitle className="text-4xl font-black text-slate-900 tracking-tight">
                  {pub.title}
                </SheetTitle>
                <SheetDescription className="text-base text-slate-500 pt-2">
                  Global content status and subtask management.
                </SheetDescription>
              </SheetHeader>

              <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT 2/3: Subtasks */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Production Checklist</h3>
                    <div className="space-y-4">
                      {pub.subtasks?.map((task) => (
                        <div key={task.id} className="flex flex-col p-4 border border-gray-100 rounded-xl hover:border-emerald-200 transition-all bg-slate-50/50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Checkbox id={task.id} checked={task.is_completed} />
                              <label htmlFor={task.id} className={`font-semibold text-sm ${task.is_completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                {task.title}
                              </label>
                            </div>
                            <Select defaultValue="In Queue">
                              <SelectTrigger className="w-[120px] h-8 text-[10px] font-bold uppercase bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="In Queue">In Queue</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Canceled">Canceled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-4 px-1">
                            <button
                              onClick={() => setSelectedSubtask(task)}
                              className="text-[10px] font-bold text-emerald-700 uppercase"
                            >
                              Manage Details →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT 1/3: Metadata & Actions */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Project Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Publication Status</label>
                        <Select defaultValue={pub.status}>
                          <SelectTrigger className="mt-1 border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="In Queue">In Queue</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Live">Live</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Target Date</label>
                        <input
                          type="date"
                          defaultValue={pub.publication_date || ""}
                          className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 2: Subtask Details (Comments & Files) */}
            {selectedSubtask && (
              <div className="w-1/2 h-full bg-slate-50 flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b border-gray-200 bg-white flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900">{selectedSubtask.title}</h3>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Subtask Details</p>
                  </div>
                  <button
                    onClick={closeSubtaskPanel}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
                  >
                    <X size={20} />
                  </button>
                </div>

                <Tabs defaultValue="comments" className="flex-1 flex flex-col">
                  <TabsList className="mx-6 mt-4 bg-slate-200/50">
                    <TabsTrigger value="comments" className="flex-1">Comments</TabsTrigger>
                    <TabsTrigger value="files" className="flex-1">Files</TabsTrigger>
                  </TabsList>

                  <TabsContent value="comments" className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs font-bold text-slate-900">Admin</p>
                        <p className="text-sm text-slate-600 mt-1">Is the transcript ready for this yet?</p>
                        <div className="flex gap-4 mt-3">
                          <button className="text-[10px] font-bold text-emerald-600">LIKE</button>
                          <button className="text-[10px] font-bold text-slate-400">REPLY</button>
                        </div>
                      </div>
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
