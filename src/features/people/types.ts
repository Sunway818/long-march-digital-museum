export interface PersonSource {
  id: string
  title: string
  institution: string
  url: string
  locator: string
}
export interface Portrait {
  id: string
  url: string
  width: number
  height: number
  caption: string
  date: string
  sourceId: string
  longMarchPhoto: boolean
  rights: string
  verificationStatus: 'pending' | 'verified'
  place?: string
}
export interface PersonChapter {
  id: string
  title: string
  paragraphs: string[]
  sourceIds: string[]
  kind?: 'interpretation'
}
export interface PersonMoment {
  id: string
  title: string
  date: string
  place: string
  context: string
  action: string
  result: string
  sourceIds: string[]
  mapEventId?: string
}
export interface PersonResearch {
  lifespan: string
  origin: string
  organization: string
  basicSourceIds: string[]
  appointments: { period: string; title: string; sourceIds: string[] }[]
  chapters: PersonChapter[]
  moments: PersonMoment[]
  reviewNote?: string
}
export interface MemorialPerson {
  id: string
  name: string
  alias?: string
  role: string
  introduction: string
  biography: string
  biographySourceIds: string[]
  portrait: Portrait
  chapters: PersonChapter[]
  milestones: { date: string; text: string; sourceId: string }[]
  events: { id: string; title: string; relation: string; sourceId: string }[]
  publicationStatus: 'draft' | 'ready'
  research?: PersonResearch
}
