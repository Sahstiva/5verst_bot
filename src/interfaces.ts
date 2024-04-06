import * as buffer from "buffer";

export interface Position {
    position: number,
    gender: Gender
}
export enum Gender {
    Male = 'male',
    Female = 'female'
}

export interface ParseResult {
    position: number,
    nameSurname: string,
    finishes: number,
    volunteering: number,
    finishTime: string,
    positionInGenderGroup: Position,
    achievement: string
}

export interface ParseVolunteers {
    name: string,
    volunteeringCount: number,
    role: string
    achievement: string
}
export interface VolunteersSummary {
    totalVolunteers: number,
    jubileeVolunteering: Volunteer[],
    firstVolunteering: Volunteer[],
    volunteeringList: string[]
}
export interface Volunteer {
    name: string,
    volunteeringCount: number
}
export interface ResultsSummary {
    date: string,
    totalFinishers: number,
    firstThreeOverall: Finisher[],
    firstThreeMen: Finisher[],
    firstThreeWomen: Finisher[],
    jubileeFinishes: FinishCount[],
    achievementsCount: {
        personalBest: number,
        firstParkFinish: number,
        first5kFinish: number
    },
    newcomersPark: string[],
    newcomers5k: string[],
    personalRecordBreakers: string[]
}
export interface Finisher {
    name: string,
    time: string
}
export interface FinishCount {
    name: string,
    finishes: number
}
export interface Summary {
    summary: ResultsSummary,
    volunteers: VolunteersSummary
}
export interface BotMessage {
    update_id: number,
    message: {
        message_id: number,
        from: {
            id: number,
            is_bot: boolean,
            first_name: string,
            last_name: string,
            username: string,
            language_code: string,
            is_premium: boolean
        },
        chat: {
            id: number,
            first_name: string,
            last_name: string,
            username: string,
            type: string
        },
        date: number,
        text: string
    }
}
export interface handlerResponse {
    statusCode: number,
    body: string
}
