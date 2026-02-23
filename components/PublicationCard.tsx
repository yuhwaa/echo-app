import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; 

export default function PublicationCard ({ pub }: { pub: Publication}) {
    return (
        <Card className="hover:shadow-lg transition-shadow border-gray-300">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold">
                    {pub.title}
                </CardTitle>
                {/* Feature #7 Logic: Pulsing badge if Live */}
                <Badge variant={pub.status === 'Live' ? 'default' : 'secondary'}>
                    {pub.status}
                </Badge>
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