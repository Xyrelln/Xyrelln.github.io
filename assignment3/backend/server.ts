import express, { Request, Response } from 'express';
import cors from 'cors';
import ClimaCellAPI from 'js-climacell-api/node'; 
import { TOMORROW_IO_API_KEY, IPINFO_API_KEY, GOOGLE_API_KEY } from './config';
import { connectToDatabase } from './services/database.service';
import { favoritesRouter } from './routes/favorites.router';

const app = express();
app.use(express.json());
app.use(cors()); 
app.use((req: Request, res: Response, next) => {
    const { method, url, body, params, query } = req;

    console.log(`[${new Date().toISOString()}] ${method} ${url}`);
    console.log('Query Params:', query);
    console.log('Route Params:', params);
    console.log('Request Body:', body);

    // Call the next middleware or route handler
    next();
});

const port = process.env.PORT || 6969;

connectToDatabase()
    .then(() => {
        // send all calls to /games to our gamesRouter
        app.use("/favorites", favoritesRouter);

        // start the Express server
        app.listen(port, () => {
            console.log(`Server started at http://localhost:${port}`);
        });
    })
    .catch((error: Error) => {
        console.error("Database connection failed", error);
        process.exit();
    });

// get client ip addr and return {
// ip: '76.87.51.231',
// hostname: 'syn-076-087-051-231.res.spectrum.com',
// city: 'Los Angeles',
// region: 'California',
// country: 'US',
// loc: '34.0030,-118.2863',
// org: 'AS20001 Charter Communications Inc',
// postal: '90037',
// timezone: 'America/Los_Angeles'
// }
app.get('/ipinfo', (request: Request, response: Response) => {
    const clientIpAddr = String(request.headers['x-forwarded-for']).split(',')[0] || request.socket.remoteAddress;    
    console.log(`--> ipinfo query: ${clientIpAddr}`);

    fetch(`https://ipinfo.io/${clientIpAddr}?token=${IPINFO_API_KEY}`)
        .then((fetchRes) => fetchRes.json())
        .then((data) => {
            response.status(200).json(data);
        })
        .catch((err) => {
            console.error("Fetch error when fetching ipinfo:", err);
            response.status(500).send("Internal Server Error: ipinfo");
        });
});

// Get timeline based on location: req { location: "lat, lng" }
app.post('/weather-timeline', (request: Request, response: Response) => {
    const { location } = request.body;

    ClimaCellAPI.requestData({
        apikey: TOMORROW_IO_API_KEY,
        location,
        units: 'metric',
        fields: [
            'weatherCode', 
            'temperatureMax', 
            'temperatureMin', 
            'windSpeed'
        ],
        timesteps: '1d',
        startTime: 'now',
        endTime: 'nowPlus5d'
    })
    .then(data => {
        if (data.message) {
            response.status(503).json({
            "error": "Upstream service unavailable",
            "message": "Please try again later."
            }) 
        } else {
            response.status(200).json(data);
        }
    })
    .catch(err => {
        console.error("Fetch error when fetching weather timeline:", err);
        response.status(500).send("Internal Server Error: timeline");
    });
});

app.post('/forecast-solartime', (request: Request, response: Response) => {
    const { location } = request.body;

    ClimaCellAPI.requestData({
        apikey: TOMORROW_IO_API_KEY,
        location,
        units: 'metric',
        fields: [
            'weatherCode', 
            'sunriseTime', 
            'sunsetTime',
            'temperatureMax',
            'temperatureMin'
        ],
        timesteps: '1d',
        startTime: 'now',
        endTime: 'nowPlus5d'
    })
    .then(data => {
        console.log("forcast-solartime res:")
        console.log(JSON.stringify(data));
        if (data.message) {
            response.status(503).json({
            "error": "Upstream service unavailable",
            "message": "Please try again later."
            }) 
        } else {
            response.status(200).json(data);
        }
    })
    .catch(err => {
        console.error("Fetch error when fetching solartimes:", err);
        response.status(500).send("Internal Server Error: forcast-solartime");
    });
});

app.post('/mobile-today', (request: Request, response: Response) => {
    const { location } = request.body;

    ClimaCellAPI.requestData({
        apikey: TOMORROW_IO_API_KEY,
        location,
        units: 'metric',
        fields: [
            'weatherCode', 
            'temperature', 
            'humidity',
            'windSpeed',
            'visibility',
            'pressureSurfaceLevel',
            'precipitationIntensity',
            'cloudCover',
            'uvIndex'
        ],
        timesteps: '1d',
        startTime: 'now',
        endTime: 'nowPlus1d'
    })
    .then(data => {
        console.log("mobile-today res:")
        console.log(JSON.stringify(data));
        if (data.message) {
            response.status(503).json({
            "error": "Upstream service unavailable",
            "message": "Please try again later."
            }) 
        } else {
            response.status(200).json(data);
        }
    })
    .catch(err => {
        console.error("Fetch error when fetching solartimes:", err);
        response.status(500).send("Internal Server Error: forcast-solartime");
    });
});


// Meteogram data endpoint
app.post('/meteogram-data', (request: Request, response: Response) => {
    const { location } = request.body;

    ClimaCellAPI.requestData({
        apikey: TOMORROW_IO_API_KEY,
        location,
        units: 'metric',
        fields: [
            'temperature', 
            'humidity', 
            'pressureSurfaceLevel',
            'windDirection',
            'windSpeed'
        ],
        timesteps: '1h',
        startTime: 'now',
        endTime: 'nowPlus5d'
    })
    .then(data => {
        if (data.message) {
            response.status(503).json({
            "error": "Upstream service unavailable",
            "message": "Please try again later."
            }) 
        } else {
            response.status(200).json(data);
        }
    })
    .catch(err => {
        console.error("Fetch error when fetching meteogram data:", err);
        response.status(500).send("Internal Server Error: meteogram data");
    });
});

app.post('/daily-detail', (request: Request, response: Response) => {
    const { location, date } = request.body;
    const today = new Date(date);
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);

    ClimaCellAPI.requestData({
        apikey: TOMORROW_IO_API_KEY,
        location,
        units: 'metric',
        fields: [
            'weatherCode', 
            'temperatureMax',
            'temperatureMin',
            'temperatureApparent',
            'sunriseTime',
            'sunsetTime',
            'humidity',
            'windSpeed',
            'visibility',
            'cloudCover'
        ],
        timesteps: '1d',
        startTime: date,
        endTime: nextDay.toISOString()
    })
    .then(data => {
        if (data.message) {
            response.status(503).json({
            "error": "Upstream service unavailable",
            "message": "Please try again later."
            }) 
        } else {
            response.status(200).json(data);
        }
    })
    .catch(err => {
        console.error("Fetch error when fetching daily detail data:", err);
        response.status(500).send("Internal Server Error: daily detail data");
    });
});

app.get('/autocomplete/:input', (request: Request, response: Response) => {
    const input = request.params?.input;
    console.log(input)

    fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&types=(cities)&key=${GOOGLE_API_KEY}`)
    .then(fetchRes => fetchRes.json())
    .then(data => {
        console.log('Fetched data:', data);
        response.status(200).json(data)
    })
    .catch(err => {
        console.error("Fetch error when fetching autocomplete:", err);
        response.status(500).send("Internal Server Error: autocomplete");
    });
})