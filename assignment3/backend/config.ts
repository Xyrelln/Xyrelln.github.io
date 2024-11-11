// config.ts

const TOMORROW_IO_API_KEY: string = 'mE0ISl6lKIEumOrrkCnxwq4aDsaNtx1B';
// const TOMORROW_IO_API_KEY: string = 'l7aDY42v0zgyzC0C4wq1GV8KNQcYclf0';
// const TOMORROW_IO_API_KEY: string = 'j6RrAyeZiuVc0Ofe78V6dF86lc0nC74N';
// const TOMORROW_IO_API_KEY: string = 'Kuw5MwrAVG4XsA7MxXAJHhFhZ83LZIft';

const IPINFO_API_KEY: string = '3f20eb330800fe';
const MONGODB_URI: string = "mongodb+srv://yiyangdu:vakfa8-sukxId-xamveg@weatherapp.e3r0z.mongodb.net/?retryWrites=true&w=majority&appName=weatherApp";
const GOOGLE_API_KEY: string = 'AIzaSyAM_i1-lFFuuQZkbXt-T0kLXGGOqz3_pZk';



export {
    TOMORROW_IO_API_KEY,
    IPINFO_API_KEY,
    MONGODB_URI,
    GOOGLE_API_KEY,
};

type ApiConfig = {
    TOMORROW_IO_API_KEY: string;
    IPINFO_API_KEY: string;
    MONGODB_URI: string;
    GOOGLE_API_KEY: string;
};

export const apiConfig: ApiConfig = {
    TOMORROW_IO_API_KEY,
    IPINFO_API_KEY,
    MONGODB_URI,
    GOOGLE_API_KEY,
};
