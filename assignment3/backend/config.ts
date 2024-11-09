// config.ts

// const TOMORROW_IO_API_KEY: string = 'mE0ISl6lKIEumOrrkCnxwq4aDsaNtx1B';
const TOMORROW_IO_API_KEY: string = 'l7aDY42v0zgyzC0C4wq1GV8KNQcYclf0';
// const TOMORROW_IO_API_KEY: string = 'j6RrAyeZiuVc0Ofe78V6dF86lc0nC74N';
// const TOMORROW_IO_API_KEY: string = 'Kuw5MwrAVG4XsA7MxXAJHhFhZ83LZIft';

const IPINFO_API_KEY: string = '3f20eb330800fe';


export {
    TOMORROW_IO_API_KEY,
    IPINFO_API_KEY,
};

type ApiConfig = {
    TOMORROW_IO_API_KEY: string;
    IPINFO_API_KEY: string;
};

export const apiConfig: ApiConfig = {
    TOMORROW_IO_API_KEY,
    IPINFO_API_KEY,
};
