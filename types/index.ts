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
    status: 'In Queue' | 'In Progress' | 'Canceled';
    is_completed: boolean;
    comments?: Comment[];
    comment_count?: number;
};

export type Comment = {
    id: string;
    subtask_id: string;
    content: string;
    author: string;
    created_at: string;
}