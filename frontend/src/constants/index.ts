import type {
  RoadMapItem,
  RoadMapStatusLabels,
  AvailabilityOption,
} from '../types';

export const ROADMAP_ITEMS: RoadMapItem[] = [
  { id: 1, label: 'Auth utilisateur', status: 'done' },
  { id: 2, label: 'Creation du profil (offres / besoins)', status: 'done' },
  { id: 3, label: 'Persistance PostgreSQL + Prisma', status: 'done' },
  { id: 4, label: 'Matching reel base sur offres / besoins', status: 'done' },
  { id: 5, label: 'Messagerie basique entre utilisateurs', status: 'done' },
  { id: 6, label: 'Deploiement cloud (front + API + DB)', status: 'done' },
];

export const ROADMAP_STATUS_LABELS: RoadMapStatusLabels = {
  done: 'Fait',
  'in-progress': 'En cours',
  todo: 'A faire',
};

export const AVAILABILITY_OPTIONS: AvailabilityOption[] = [
  { value: 'matin', label: 'Matin' },
  { value: 'apres-midi', label: 'Apres-midi' },
  { value: 'soir', label: 'Soir' },
  { value: 'week-end', label: 'Week-end' },
  { value: 'flexible', label: 'Flexible' },
];

export const API_STATUS = {
  CHECKING: 'checking',
  OK: 'ok',
  DOWN: 'down',
} as const;
