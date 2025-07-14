export interface EventsData{
    id?:string;
    title:string;
    startDate:number;
    endDate?:number;
    completionDate:number,
    location?:string;
    description?:string;
    isCompleted?: boolean;
    priority?: number;
    listId?: string;
}
export interface RemindersData{
    title:string;
    startDate:number;
    completionDate:number,
    location?:string;
    isCompleted?: boolean;
    priority?: number;
    listId?: string;
    description?:string;
}
export interface RemindersWebData{
    title:string;
    startDate:Date;
    completionDate:Date,
    location?:string;
    isCompleted?: boolean;
    priority?: number;
    listId?: string;
    description?:string;
}