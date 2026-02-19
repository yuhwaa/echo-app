export type Publication = {
    id: string;
    title: string;
    type: 'Insights Commentary' | 'Insights Podcast' | 'Insights Video' | 'Memo';
    status: 'In Queue' | 'In Progress' | 'Live';
    production_url?: string;
};