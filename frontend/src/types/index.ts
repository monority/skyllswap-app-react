export type Availability =
  | 'matin'
  | 'apres-midi'
  | 'soir'
  | 'week-end'
  | 'flexible';

export interface Profile {
  city: string;
  availability: Availability;
  offers: string[];
  needs: string[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  profile: Profile | null;
}

export interface Skill {
  id: number;
  title: string;
  level: string;
  offers: number;
  needs: number;
}

export interface Participant {
  id: number;
  name: string;
}

export interface Message {
  id: number;
  content: string;
  sender: Participant;
  createdAt: string;
}

export interface Conversation {
  id: number;
  participants: Participant[];
  messages: Message[];
  updatedAt: string;
}

export interface Match {
  matchId: number;
  pseudo: string;
  gives: string;
  wants: string;
  city: string;
  availability: string;
  compatibility: number;
}

export interface ApiStatus {
  status: 'ok' | 'down' | 'checking';
}

export interface AuthFormData {
  name: string;
  email: string;
  password: string;
}

export interface ProfileFormData {
  city: string;
  availability: Availability;
  offersText: string;
  needsText: string;
}

export interface MatchFilters {
  city: string;
  availability: string;
}

export interface RoadMapItem {
  id: number;
  label: string;
  status: 'done' | 'in-progress' | 'todo';
}

export interface RoadMapStatusLabels {
  done: string;
  'in-progress': string;
  todo: string;
}

export interface AvailabilityOption {
  value: string;
  label: string;
}
