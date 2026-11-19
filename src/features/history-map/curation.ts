import { events, placeById, sourceById } from './data'
import { featuredNotes } from './featuredEvents'
import { eventDay, hasCoordinate, toDay } from './model'
import type { HistoricalEvent } from './types'

export function isFeaturedEvent(event: HistoricalEvent): boolean {
  const note = featuredNotes[event.id]
  return Boolean(note && event.start_date && event.date_text && event.place_ids.some(id => {
    const place = placeById.get(id)
    return place && hasCoordinate(place)
  }) && (note.summary || event.summary).length >= 40 && note.sourceIds.every(id => sourceById.has(id)))
}
export const featuredEvents = events.filter(isFeaturedEvent).sort((a, b) => toDay(eventDay(a)!) - toDay(eventDay(b)!))
