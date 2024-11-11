// types.ts


// TimelineData
export interface IntervalValues {
    temperatureMax: number;
    temperatureMin: number;
    weatherCode: number;
    windSpeed: number;
}

export interface Interval {
    startTime: string;
    values: IntervalValues;
}

export interface Timeline {
    timestep: string;
    endTime: string;
    startTime: string;
    intervals: Interval[];
}

export interface Timelines {
    timelines: Timeline[];
}

export interface TimelineData {
    data: Timelines;
    location: string;
}

// MeteogramData
export interface MeteogramIntervalValues {
    temperature: number;
    humidity: number;
    pressureSurfaceLevel: number;
    windDirection: number;
    windSpeed: number;
}

export interface MeteogramInterval {
    startTime: string;
    values: MeteogramIntervalValues;
}

export interface MeteogramTimeline {
    timestep: string;
    endTime: string;
    startTime: string;
    intervals: MeteogramInterval[];
}

export interface MeteogramTimelines {
    timelines: MeteogramTimeline[];
}

export interface MeteogramData {
    data: MeteogramTimelines;
    location: string;
}

// Daily Detail Data
export interface DailyDetailValues {
    weatherCode: number;
    temperatureMax: number;
    temperatureMin: number;
    temperatureApparent: number;
    sunriseTime: string;
    sunsetTime: string;
    humidity: number;
    windSpeed: number;
    visibility: number;
    cloudCover: number;
}

export interface DailyDetailInterval {
    startTime: string;
    values: DailyDetailValues;
}

export interface DailyDetailTimeline {
    timestep: string;
    endTime: string;
    startTime: string;
    intervals: DailyDetailInterval[];
}

export interface DailyDetailData {
    location: string;
    data: {
        timelines: DailyDetailTimeline[];
    };
}


// auto complete response
export interface AutoCompleteSuggestions {
    predictions: {
        description: string;
        matched_substrings: { length: number; offset: number }[];
        place_id: string;
        reference: string;
        structured_formatting: {
            main_text: string;
            main_text_matched_substrings: {
                length: number;
                offset: number;
            }[];
            secondary_text: string;
        };
        terms: {
            offset: number;
            value: string;
        }[];
    }[];
}