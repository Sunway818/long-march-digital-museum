export type ArmyId = 'central' | 'twentyfive' | 'fourth' | 'second'
export type Precision = 'precise' | 'approximate' | 'regional' | 'unverified'
export interface HistoricalPlace {
  id: string; name: string; historical_name: string; modern_location: string
  longitude: number | null; latitude: number | null; coordinate_precision: Precision
  coordinate_source_ids: string[]; coordinate_note: string; coordinate_record_url: string; coordinate_record_name: string
  army_ids: ArmyId[]; related_event_ids: string[]; image_ids: string[]; document_ids: string[]; source_ids: string[]
  verification_status: string; publication_status: string
}
export interface HistoricalEvent {
  id: string; title: string; start_date: string | null; end_date: string | null
  display_date?: string
  date_precision: 'day' | 'month' | 'range' | 'unknown'; date_text: string; anchor_note: string
  place_ids: string[]; army_ids: ArmyId[]; army_text: string; summary: string; background: string; significance: string
  image_ids: string[]; document_ids: string[]; source_ids: string[]; verification_status: string; publication_status: string
  kind: 'meeting' | 'reunion' | 'battle' | 'march'; important: boolean; batch: number; relation: string; disputes: string; gaps: string
}
export interface RouteNode { route_id: string; army_id: ArmyId; sequence: number; place_id: string; date: string; start_date: string | null; end_date: string | null; date_precision: string; action: string; related_event_ids: string[]; source_ids: string[] }
export type RoutePhase = 'march' | 'first-north' | 'south' | 'west' | 'north' | 'reception' | 'preparation'
export interface RouteSegment { phase?: RoutePhase; id: string; army_id: ArmyId; from_place_id: string; to_place_id: string; from_visit_id?: string; to_visit_id?: string; reveal_policy?: 'interpolate' | 'hold'; geometry: { type: 'LineString'; coordinates: [number, number][] }; geometry_confidence: string; source_ids: string[]; evidence_locator: string; display_style: string; start_date: string | null; reveal_date: string | null; verification_status: string; note: string }
export interface HistoryImage { id: string; title: string; event_ids: string[]; type: string; date_text: string; caption: string; source_ids: string[]; source_url: string; rights: string; user_decision: string; local_preview_url: string | null; saved: boolean; rejected: boolean; publication_status: string; verification_status: string }
export interface HistoryDocument { id: string; title: string; creator: string; date_text: string; source_ids: string[]; event_ids: string[]; url: string; nature: string; scope: string; summary: string }
export interface HistorySource { id: string; title: string; institution: string; url: string; author: string; date_text: string; status: string }
export interface Army { id: ArmyId; name: string; color: string }
export interface Stage { id: string; label: string; army: ArmyId; eventIds: string[]; firstDay: number }
export interface HistoryState { currentDay: number; visibleArmies: ArmyId[]; selectedArmy: ArmyId | null; selectedEventId: string | null; playing: boolean; speed: 1 | 2 | 4; mode: 'overview' | 'time'; followCamera: boolean; followArmyId?: ArmyId | null; stageId: string | null; showReception?: boolean; routeFocus?: boolean }
