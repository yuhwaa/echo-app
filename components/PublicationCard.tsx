import { supabase } from "@/utils/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; 
import { Trash2 } from "lucide-react";

export default function PublicationCard ({ pub, onDelete }: { pub: Publication, onDelete: (id: string) => void }) {
    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (confirm("Delete this publication?")) {
            const { error } = await supabase
            .from('publications')
            .delete()
            .eq('id', pub.id);
        
            if (!error) {
                onDelete(pub.id);
            }
        }
    };
    return (
        <Card className="relative hover:shadow-lg transition-shadow border-gray-300">
            <button 
        onClick={handleDelete}
        className="absolute top-2 right-2 p-2 text-slate-300 hover:text-red-500 transition-colors"
      >
        <Trash2 size={16} />
      </button>
            <CardHeader className="flex flex-col gap-2">
                {/* Feature #7 Logic: Pulsing badge if Live */}
                <Badge className="w-fit" variant={pub.status === 'Live' ? 'default' : 'secondary'}>
                    {pub.status}
                </Badge>
                <CardTitle className="text-lg font-bold">
                    {pub.title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground uppercase">{pub.type}</p>
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Publication Date</p>
                    <p className="text-sm text-slate-600 font-medium">
                        {pub.publication_date ? new Date(pub.publication_date).toLocaleDateString() : "Not set"}
                    </p>
                </div>
            </CardContent>
            
        </Card> 
    );
}

