import type { PersonChapter, PersonMoment, PersonResearch } from '../../../features/people/types'
export const chapter = (id:string,title:string,paragraphs:string[],sourceIds:string[],interpretation=false):PersonChapter => ({id,title,paragraphs,sourceIds,...(interpretation?{kind:'interpretation' as const}:{})})
export const moment = (id:string,title:string,date:string,place:string,context:string,action:string,result:string,sourceIds:string[],mapEventId?:string):PersonMoment => ({id,title,date,place,context,action,result,sourceIds,mapEventId})
export type ResearchCollection = Record<string,PersonResearch>
