export interface JwtPayload {
    sub: string | number;
    email?: string;
    name?: string;
    type?: 'refresh';
    iat?: number;
    exp?: number;
}
export interface Skill {
    id: number;
    title: string;
    level: string;
    offers: number;
    needs: number;
}
export interface ProfileData {
    city: string;
    availability: string;
    offers: string[];
    needs: string[];
}
export interface UserPublic {
    id: number;
    name: string;
    profile: ProfileData | null;
}
export interface ProfileUpdateInput {
    city?: string;
    availability?: string;
    offers?: string[];
    needs?: string[];
}
export interface ValidationResult {
    next?: ProfileUpdateInput;
    error?: string;
}
export interface MatchItem {
    matchId: number;
    pseudo: string;
    gives: string;
    wants: string;
    city: string;
    availability: string;
    compatibility: number;
}
export interface ConversationWithParticipants {
    id: number;
    participants: {
        id: number;
        name: string;
    }[];
    messages: MessageData[];
    updatedAt: Date;
}
export interface MessageData {
    id: number;
    content: string;
    senderId: number;
    conversationId: number;
    createdAt: Date;
    sender?: {
        id: number;
        name: string;
    };
}
//# sourceMappingURL=index.d.ts.map