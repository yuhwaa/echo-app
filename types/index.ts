export type Publication = {
    id: string;
    title: string;
    type: 'Insights Commentary' | 'Insights Podcast' | 'Insights Video' | 'Memo';
    status: 'In Queue' | 'In Progress' | 'Live' | 'Canceled';
    production_url?: string;
    publication_date?: string;
    subtasks: Subtask[];
};

export type Subtask = {
    id: string;
    title: string;
    isCompleted: boolean;
};