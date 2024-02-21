import { Schema, model as createModel } from 'mongoose';

export interface IPunishment {
    caseID: number;
    actionAgainst: number;
    actionBy: number;
    reason: string;
    action: string;
    duration: string | null;
    when: Date;
    points: number;
    guild_id: number;
}

const schema = new Schema<IPunishment>({
    caseID: {
        type: Number,
        required: true,
        unique: false,
    },
    actionAgainst: {
        type: Number,
        required: true,
        unique: false,
    },
    actionBy: {
        type: Number,
        required: true,
        unique: false,
    },
    reason: {
        type: String,
        required: true,
        unique: false,
    },
    action: {
        type: String,
        required: true,
        unique: false,
    },
    duration: {
        type: String,
        required: false,
        unique: false,
    },
    when: {
        type: Date,
        required: true,
        unique: false,
    },
    points: {
        type: Number,
        required: false,
        unique: false,
    },
    guild_id: {
        type: Number,
        required: true,
        unique: false,
    },
});

export const Punishment = createModel<IPunishment>('Punishment', schema);
