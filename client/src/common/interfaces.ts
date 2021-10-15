export interface Accolade {
_id: string,
challengeId: string,
description: string,
emoji: string,
eventId: string,
name: string
}

export interface AccoladeResp {
result: Accolade
}

export interface Challenge {
_id: string,
accoladeIds: Array<string>
name: string,
question1: string,
question2: string,
question3: string,
question4: string,
question5: string,
places: number
}

export interface ChallengesResponse {
result: Challenge[]
}

export interface ChallengeResp {
result: Challenge
}

export interface Event {
name: string;
_id: string;
show: boolean;
description: string;
start_time: string;
end_time: string;
challengeIds: string[];
accoladeIds: string[];
submissionIds: string[];
image: string;
imageKey: string;
accolades: Accolade[];
challenges: Challenge[];
submissions: Submission[];
}

export interface EventResponse {
result: Event;
}

export interface EventsResponse {
result: Event[];
}

export enum FileType {
sourceCode = 'sourceCode',
icon = 'icon',
}

export interface Submission {
_id: string,
name: string,
tags: Array<string>,
links: Array<string>,
discordTags: Array<string>,
challengeId: string,
videoLink: string,
answer1: string,
answer2: string,
answer3: string,
answer4: string,
answer5: string,
sourceCode: string[],
photos: SubmissionPhoto,
icon: string[],
markdown: string[],
accoladeIds: string[]
}

export interface SubmissionResponse {
    result: Submission;
}

export interface SubmissionsResponse {
result: Submission[];
}

export interface SubmissionPhoto {
[key: string]: Array<string>;  
}

export interface HarmoniaResponse {
result: string[];    
}