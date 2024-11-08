// config.ts

const BACKEND_URL: string = 'https://csci-571-python-435619.wl.r.appspot.com';
const GOOGLE_API_KEY: string = 'AIzaSyAM_i1-lFFuuQZkbXt-T0kLXGGOqz3_pZk';

export {
    BACKEND_URL,
    GOOGLE_API_KEY,
};

type ApiConfig = {
    BACKEND_URL: string;
    GOOGLE_API_KEY: string;
};

export const apiConfig: ApiConfig = {
    BACKEND_URL,
    GOOGLE_API_KEY,
};
