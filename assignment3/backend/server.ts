import express, { Request, Response } from 'express';
import cors from 'cors';
import ClimaCellAPI from 'js-climacell-api/node'; 
import { TOMORROW_IO_API_KEY, IPINFO_API_KEY } from './config';

const app = express();
app.use(express.json());
app.use(cors());    

const port = process.env.PORT || 6969;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
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
        if (data.message != null) response.status(200).json();
        response.status(200).json(data);
    })
    .catch(err => {
        console.error("Fetch error when fetching weather timeline:", err);
        response.status(500).send("Internal Server Error: timeline");
    });
});

// Meteogram data endpoint
app.post('/meteogram-data', (request: Request, response: Response) => {
    const { location } = request.body;

    ClimaCellAPI.requestData({
        apikey: TOMORROW_IO_API_KEY,
        location,
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
        if (data.message != null) response.status(200).json({"data":{"timelines":[{"timestep":"1h","endTime":"2024-11-09T23:00:00Z","startTime":"2024-11-04T23:00:00Z","intervals":[{"startTime":"2024-11-04T23:00:00Z","values":{"humidity":34,"pressureSurfaceLevel":1009.13,"temperature":21.69,"windDirection":236.63,"windSpeed":3.69}},{"startTime":"2024-11-05T00:00:00Z","values":{"humidity":39.87,"pressureSurfaceLevel":1008.2,"temperature":20,"windDirection":242.06,"windSpeed":3.47}},{"startTime":"2024-11-05T01:00:00Z","values":{"humidity":43.63,"pressureSurfaceLevel":1008.03,"temperature":18.52,"windDirection":240,"windSpeed":2.98}},{"startTime":"2024-11-05T02:00:00Z","values":{"humidity":51.16,"pressureSurfaceLevel":1008.94,"temperature":16.89,"windDirection":248.27,"windSpeed":2.5}},{"startTime":"2024-11-05T03:00:00Z","values":{"humidity":59.14,"pressureSurfaceLevel":1009.42,"temperature":15.76,"windDirection":284.42,"windSpeed":2.22}},{"startTime":"2024-11-05T04:00:00Z","values":{"humidity":65.96,"pressureSurfaceLevel":1008.94,"temperature":14.89,"windDirection":91.2,"windSpeed":1.88}},{"startTime":"2024-11-05T05:00:00Z","values":{"humidity":68.71,"pressureSurfaceLevel":1009.42,"temperature":14.06,"windDirection":106.44,"windSpeed":2.15}},{"startTime":"2024-11-05T06:00:00Z","values":{"humidity":68.8,"pressureSurfaceLevel":1009.42,"temperature":13.39,"windDirection":99.22,"windSpeed":2.58}},{"startTime":"2024-11-05T07:00:00Z","values":{"humidity":68.16,"pressureSurfaceLevel":1009.42,"temperature":12.89,"windDirection":91.22,"windSpeed":2.67}},{"startTime":"2024-11-05T08:00:00Z","values":{"humidity":67.19,"pressureSurfaceLevel":1009.42,"temperature":12.6,"windDirection":80,"windSpeed":2.83}},{"startTime":"2024-11-05T09:00:00Z","values":{"humidity":66.39,"pressureSurfaceLevel":1009.42,"temperature":12.15,"windDirection":81.43,"windSpeed":2.92}},{"startTime":"2024-11-05T10:00:00Z","values":{"humidity":68.65,"pressureSurfaceLevel":1009.42,"temperature":11.65,"windDirection":86.46,"windSpeed":3.03}},{"startTime":"2024-11-05T11:00:00Z","values":{"humidity":70.07,"pressureSurfaceLevel":1009.2,"temperature":11.35,"windDirection":82.46,"windSpeed":3.08}},{"startTime":"2024-11-05T12:00:00Z","values":{"humidity":68.23,"pressureSurfaceLevel":1008.78,"temperature":11.04,"windDirection":79.35,"windSpeed":3.08}},{"startTime":"2024-11-05T13:00:00Z","values":{"humidity":66.23,"pressureSurfaceLevel":1008.78,"temperature":10.73,"windDirection":78.32,"windSpeed":3}},{"startTime":"2024-11-05T14:00:00Z","values":{"humidity":65.97,"pressureSurfaceLevel":1008.94,"temperature":10.58,"windDirection":73.67,"windSpeed":3.03}},{"startTime":"2024-11-05T15:00:00Z","values":{"humidity":62.19,"pressureSurfaceLevel":1009.2,"temperature":11.08,"windDirection":65.67,"windSpeed":3.03}},{"startTime":"2024-11-05T16:00:00Z","values":{"humidity":51.39,"pressureSurfaceLevel":1009.2,"temperature":14.04,"windDirection":85.67,"windSpeed":2.78}},{"startTime":"2024-11-05T17:00:00Z","values":{"humidity":47.39,"pressureSurfaceLevel":1008.94,"temperature":17,"windDirection":107.35,"windSpeed":2.57}},{"startTime":"2024-11-05T18:00:00Z","values":{"humidity":44.17,"pressureSurfaceLevel":1008.78,"temperature":19,"windDirection":128,"windSpeed":2.5}},{"startTime":"2024-11-05T19:00:00Z","values":{"humidity":42.39,"pressureSurfaceLevel":1007.78,"temperature":21,"windDirection":169.29,"windSpeed":2.75}},{"startTime":"2024-11-05T20:00:00Z","values":{"humidity":40.39,"pressureSurfaceLevel":1006.2,"temperature":22,"windDirection":208,"windSpeed":3.04}},{"startTime":"2024-11-05T21:00:00Z","values":{"humidity":42.52,"pressureSurfaceLevel":1006.03,"temperature":22,"windDirection":248,"windSpeed":3.25}},{"startTime":"2024-11-05T22:00:00Z","values":{"humidity":43.76,"pressureSurfaceLevel":1005.2,"temperature":21.71,"windDirection":256,"windSpeed":3.75}},{"startTime":"2024-11-05T23:00:00Z","values":{"humidity":48.61,"pressureSurfaceLevel":1004.78,"temperature":20.6,"windDirection":256,"windSpeed":4.25}},{"startTime":"2024-11-06T00:00:00Z","values":{"humidity":56.74,"pressureSurfaceLevel":1004.2,"temperature":19,"windDirection":256,"windSpeed":4}},{"startTime":"2024-11-06T01:00:00Z","values":{"humidity":64.74,"pressureSurfaceLevel":1004.2,"temperature":17.13,"windDirection":260.13,"windSpeed":3.4}},{"startTime":"2024-11-06T02:00:00Z","values":{"humidity":74.13,"pressureSurfaceLevel":1004.2,"temperature":15.67,"windDirection":256,"windSpeed":2.81}},{"startTime":"2024-11-06T03:00:00Z","values":{"humidity":79.61,"pressureSurfaceLevel":1004.03,"temperature":14.67,"windDirection":243.36,"windSpeed":2.6}},{"startTime":"2024-11-06T04:00:00Z","values":{"humidity":83.77,"pressureSurfaceLevel":1003.78,"temperature":14.15,"windDirection":256,"windSpeed":2.78}},{"startTime":"2024-11-06T05:00:00Z","values":{"humidity":81.78,"pressureSurfaceLevel":1003.2,"temperature":14.5,"windDirection":254.16,"windSpeed":2.81}},{"startTime":"2024-11-06T06:00:00Z","values":{"humidity":81.65,"pressureSurfaceLevel":1003.2,"temperature":13.79,"windDirection":215.87,"windSpeed":2.36}},{"startTime":"2024-11-06T07:00:00Z","values":{"humidity":81.01,"pressureSurfaceLevel":1003.42,"temperature":13.06,"windDirection":87.22,"windSpeed":2.32}},{"startTime":"2024-11-06T08:00:00Z","values":{"humidity":85.55,"pressureSurfaceLevel":1003.2,"temperature":12.5,"windDirection":78.07,"windSpeed":2.67}},{"startTime":"2024-11-06T09:00:00Z","values":{"humidity":86.55,"pressureSurfaceLevel":1003.42,"temperature":12.5,"windDirection":83.75,"windSpeed":3.41}},{"startTime":"2024-11-06T10:00:00Z","values":{"humidity":84.55,"pressureSurfaceLevel":1003.42,"temperature":12.3,"windDirection":83.11,"windSpeed":3.27}},{"startTime":"2024-11-06T11:00:00Z","values":{"humidity":82.61,"pressureSurfaceLevel":1003.2,"temperature":11.71,"windDirection":63.55,"windSpeed":3.25}},{"startTime":"2024-11-06T12:00:00Z","values":{"humidity":80.61,"pressureSurfaceLevel":1003.2,"temperature":11.54,"windDirection":52.07,"windSpeed":2.8}},{"startTime":"2024-11-06T13:00:00Z","values":{"humidity":78.39,"pressureSurfaceLevel":1003.2,"temperature":11.69,"windDirection":32.26,"windSpeed":2.88}},{"startTime":"2024-11-06T14:00:00Z","values":{"humidity":76.39,"pressureSurfaceLevel":1003.78,"temperature":11.65,"windDirection":42.77,"windSpeed":2.68}},{"startTime":"2024-11-06T15:00:00Z","values":{"humidity":74.39,"pressureSurfaceLevel":1004.03,"temperature":12.04,"windDirection":64.11,"windSpeed":2.55}},{"startTime":"2024-11-06T16:00:00Z","values":{"humidity":44.67,"pressureSurfaceLevel":1004.12,"temperature":13.75,"windDirection":244.82,"windSpeed":0.39}},{"startTime":"2024-11-06T17:00:00Z","values":{"humidity":33.1,"pressureSurfaceLevel":1004.6,"temperature":17.76,"windDirection":223.45,"windSpeed":1.52}},{"startTime":"2024-11-06T18:00:00Z","values":{"humidity":19.25,"pressureSurfaceLevel":1004.73,"temperature":21.21,"windDirection":210.97,"windSpeed":1.6}},{"startTime":"2024-11-06T19:00:00Z","values":{"humidity":11.78,"pressureSurfaceLevel":1004.77,"temperature":23.51,"windDirection":147.29,"windSpeed":1}},{"startTime":"2024-11-06T20:00:00Z","values":{"humidity":7.21,"pressureSurfaceLevel":1004.06,"temperature":25.11,"windDirection":91.47,"windSpeed":1.18}},{"startTime":"2024-11-06T21:00:00Z","values":{"humidity":4.87,"pressureSurfaceLevel":1003.51,"temperature":25.85,"windDirection":55.82,"windSpeed":2.14}},{"startTime":"2024-11-06T22:00:00Z","values":{"humidity":4.41,"pressureSurfaceLevel":1003.35,"temperature":25.85,"windDirection":48.26,"windSpeed":2.53}},{"startTime":"2024-11-06T23:00:00Z","values":{"humidity":4.75,"pressureSurfaceLevel":1003.55,"temperature":25.18,"windDirection":38.28,"windSpeed":1.84}},{"startTime":"2024-11-07T00:00:00Z","values":{"humidity":5.41,"pressureSurfaceLevel":1003.95,"temperature":24.31,"windDirection":56.94,"windSpeed":1.09}},{"startTime":"2024-11-07T01:00:00Z","values":{"humidity":9.5,"pressureSurfaceLevel":1004.51,"temperature":21.91,"windDirection":16.33,"windSpeed":1.34}},{"startTime":"2024-11-07T02:00:00Z","values":{"humidity":11.87,"pressureSurfaceLevel":1005.42,"temperature":19.22,"windDirection":326.9,"windSpeed":2.12}},{"startTime":"2024-11-07T03:00:00Z","values":{"humidity":9.94,"pressureSurfaceLevel":1006.3,"temperature":19.2,"windDirection":23.79,"windSpeed":1.13}},{"startTime":"2024-11-07T04:00:00Z","values":{"humidity":17.26,"pressureSurfaceLevel":1007.24,"temperature":15.16,"windDirection":74.64,"windSpeed":2.03}},{"startTime":"2024-11-07T05:00:00Z","values":{"humidity":18.56,"pressureSurfaceLevel":1007.88,"temperature":13.94,"windDirection":54.32,"windSpeed":1.93}},{"startTime":"2024-11-07T06:00:00Z","values":{"humidity":20.38,"pressureSurfaceLevel":1008.34,"temperature":12.56,"windDirection":54.72,"windSpeed":1.67}},{"startTime":"2024-11-07T07:00:00Z","values":{"humidity":22.05,"pressureSurfaceLevel":1008.51,"temperature":11.64,"windDirection":66.94,"windSpeed":1.54}},{"startTime":"2024-11-07T08:00:00Z","values":{"humidity":24.31,"pressureSurfaceLevel":1008.68,"temperature":10.22,"windDirection":73.5,"windSpeed":2.12}},{"startTime":"2024-11-07T09:00:00Z","values":{"humidity":25.89,"pressureSurfaceLevel":1008.91,"temperature":9.68,"windDirection":83.79,"windSpeed":1.63}},{"startTime":"2024-11-07T10:00:00Z","values":{"humidity":19.84,"pressureSurfaceLevel":1009.18,"temperature":11.54,"windDirection":27.78,"windSpeed":0.76}},{"startTime":"2024-11-07T11:00:00Z","values":{"humidity":19.3,"pressureSurfaceLevel":1008.96,"temperature":11.56,"windDirection":330.58,"windSpeed":0.79}},{"startTime":"2024-11-07T12:00:00Z","values":{"humidity":24.25,"pressureSurfaceLevel":1009.18,"temperature":9.48,"windDirection":276.64,"windSpeed":1.69}},{"startTime":"2024-11-07T13:00:00Z","values":{"humidity":25.62,"pressureSurfaceLevel":1009.68,"temperature":9.05,"windDirection":284.51,"windSpeed":1.73}},{"startTime":"2024-11-07T14:00:00Z","values":{"humidity":22.68,"pressureSurfaceLevel":1010.39,"temperature":10.69,"windDirection":339.27,"windSpeed":1.09}},{"startTime":"2024-11-07T15:00:00Z","values":{"humidity":27.79,"pressureSurfaceLevel":1011.03,"temperature":8.68,"windDirection":51.37,"windSpeed":1.89}},{"startTime":"2024-11-07T16:00:00Z","values":{"humidity":20.56,"pressureSurfaceLevel":1012,"temperature":11.6,"windDirection":64.35,"windSpeed":1.03}},{"startTime":"2024-11-07T17:00:00Z","values":{"humidity":15.19,"pressureSurfaceLevel":1012.41,"temperature":14.82,"windDirection":118.62,"windSpeed":0.77}},{"startTime":"2024-11-07T18:00:00Z","values":{"humidity":11.84,"pressureSurfaceLevel":1012.48,"temperature":17.71,"windDirection":160.19,"windSpeed":0.6}},{"startTime":"2024-11-07T19:00:00Z","values":{"humidity":9.48,"pressureSurfaceLevel":1012.23,"temperature":19.92,"windDirection":155.48,"windSpeed":1.53}},{"startTime":"2024-11-07T20:00:00Z","values":{"humidity":8.26,"pressureSurfaceLevel":1011.14,"temperature":21.54,"windDirection":159.54,"windSpeed":2.34}},{"startTime":"2024-11-07T21:00:00Z","values":{"humidity":7.65,"pressureSurfaceLevel":1010.42,"temperature":22.56,"windDirection":188.63,"windSpeed":2.22}},{"startTime":"2024-11-07T22:00:00Z","values":{"humidity":8.29,"pressureSurfaceLevel":1009.83,"temperature":22.78,"windDirection":222.72,"windSpeed":2.97}},{"startTime":"2024-11-07T23:00:00Z","values":{"humidity":11.71,"pressureSurfaceLevel":1009.57,"temperature":21.8,"windDirection":238.65,"windSpeed":4.19}},{"startTime":"2024-11-08T00:00:00Z","values":{"humidity":16.58,"pressureSurfaceLevel":1009.48,"temperature":20.11,"windDirection":246.18,"windSpeed":4.15}},{"startTime":"2024-11-08T01:00:00Z","values":{"humidity":24.49,"pressureSurfaceLevel":1009.55,"temperature":18.51,"windDirection":253.23,"windSpeed":3.01}},{"startTime":"2024-11-08T02:00:00Z","values":{"humidity":28.59,"pressureSurfaceLevel":1009.78,"temperature":18.15,"windDirection":271.42,"windSpeed":1.73}},{"startTime":"2024-11-08T03:00:00Z","values":{"humidity":26.28,"pressureSurfaceLevel":1010.09,"temperature":18.09,"windDirection":236.42,"windSpeed":1.11}},{"startTime":"2024-11-08T04:00:00Z","values":{"humidity":22.6,"pressureSurfaceLevel":1010.33,"temperature":17.66,"windDirection":162.27,"windSpeed":1.38}},{"startTime":"2024-11-08T05:00:00Z","values":{"humidity":15.96,"pressureSurfaceLevel":1010.24,"temperature":17.89,"windDirection":21.51,"windSpeed":1.82}},{"startTime":"2024-11-08T06:00:00Z","values":{"humidity":11.66,"pressureSurfaceLevel":1010.2,"temperature":18.13,"windDirection":20.33,"windSpeed":1.76}},{"startTime":"2024-11-08T07:00:00Z","values":{"humidity":10.3,"pressureSurfaceLevel":1009.91,"temperature":18.39,"windDirection":26.6,"windSpeed":1.76}},{"startTime":"2024-11-08T08:00:00Z","values":{"humidity":10.12,"pressureSurfaceLevel":1009.95,"temperature":18.04,"windDirection":30.85,"windSpeed":1.7}},{"startTime":"2024-11-08T09:00:00Z","values":{"humidity":10.12,"pressureSurfaceLevel":1009.91,"temperature":17.73,"windDirection":18.33,"windSpeed":1.78}},{"startTime":"2024-11-08T10:00:00Z","values":{"humidity":10.17,"pressureSurfaceLevel":1009.85,"temperature":17.43,"windDirection":11.71,"windSpeed":2.05}},{"startTime":"2024-11-08T11:00:00Z","values":{"humidity":10.31,"pressureSurfaceLevel":1009.6,"temperature":17.15,"windDirection":12.24,"windSpeed":2.02}},{"startTime":"2024-11-08T12:00:00Z","values":{"humidity":10.43,"pressureSurfaceLevel":1009.58,"temperature":16.92,"windDirection":14.41,"windSpeed":1.84}},{"startTime":"2024-11-08T13:00:00Z","values":{"humidity":10.54,"pressureSurfaceLevel":1009.75,"temperature":16.71,"windDirection":11.46,"windSpeed":1.74}},{"startTime":"2024-11-08T14:00:00Z","values":{"humidity":10.64,"pressureSurfaceLevel":1009.88,"temperature":16.53,"windDirection":13.73,"windSpeed":1.68}},{"startTime":"2024-11-08T15:00:00Z","values":{"humidity":10.98,"pressureSurfaceLevel":1010.34,"temperature":17.09,"windDirection":23.21,"windSpeed":1.25}},{"startTime":"2024-11-08T16:00:00Z","values":{"humidity":10.29,"pressureSurfaceLevel":1010.69,"temperature":18.34,"windDirection":277.98,"windSpeed":0.93}},{"startTime":"2024-11-08T17:00:00Z","values":{"humidity":9.49,"pressureSurfaceLevel":1010.69,"temperature":19.7,"windDirection":232.85,"windSpeed":1}},{"startTime":"2024-11-08T18:00:00Z","values":{"humidity":8.82,"pressureSurfaceLevel":1010.42,"temperature":21.03,"windDirection":255.93,"windSpeed":0.77}},{"startTime":"2024-11-08T19:00:00Z","values":{"humidity":8.16,"pressureSurfaceLevel":1009.95,"temperature":22.25,"windDirection":255.8,"windSpeed":1.1}},{"startTime":"2024-11-08T20:00:00Z","values":{"humidity":7.24,"pressureSurfaceLevel":1009.41,"temperature":23.11,"windDirection":255.36,"windSpeed":2.11}},{"startTime":"2024-11-08T21:00:00Z","values":{"humidity":7.52,"pressureSurfaceLevel":1008.57,"temperature":23.74,"windDirection":246.65,"windSpeed":3.19}},{"startTime":"2024-11-08T22:00:00Z","values":{"humidity":9.07,"pressureSurfaceLevel":1008.18,"temperature":23.12,"windDirection":245.68,"windSpeed":4.29}},{"startTime":"2024-11-08T23:00:00Z","values":{"humidity":11.1,"pressureSurfaceLevel":1007.85,"temperature":21.76,"windDirection":244.5,"windSpeed":4.36}},{"startTime":"2024-11-09T00:00:00Z","values":{"humidity":13.74,"pressureSurfaceLevel":1007.79,"temperature":20.73,"windDirection":242.8,"windSpeed":4.39}},{"startTime":"2024-11-09T01:00:00Z","values":{"humidity":17.27,"pressureSurfaceLevel":1007.75,"temperature":19.68,"windDirection":242.79,"windSpeed":3.53}},{"startTime":"2024-11-09T02:00:00Z","values":{"humidity":19.57,"pressureSurfaceLevel":1008.02,"temperature":19.36,"windDirection":246.37,"windSpeed":2.49}},{"startTime":"2024-11-09T03:00:00Z","values":{"humidity":19.67,"pressureSurfaceLevel":1007.38,"temperature":19.39,"windDirection":230.58,"windSpeed":1.65}},{"startTime":"2024-11-09T04:00:00Z","values":{"humidity":20.84,"pressureSurfaceLevel":1007.5,"temperature":19.08,"windDirection":195.91,"windSpeed":1.08}},{"startTime":"2024-11-09T05:00:00Z","values":{"humidity":21.97,"pressureSurfaceLevel":1007.65,"temperature":18.78,"windDirection":155.55,"windSpeed":0.89}},{"startTime":"2024-11-09T06:00:00Z","values":{"humidity":20.37,"pressureSurfaceLevel":1008.09,"temperature":18.51,"windDirection":129.23,"windSpeed":0.79}},{"startTime":"2024-11-09T07:00:00Z","values":{"humidity":20.78,"pressureSurfaceLevel":1007.22,"temperature":18.33,"windDirection":103.39,"windSpeed":1.34}},{"startTime":"2024-11-09T08:00:00Z","values":{"humidity":18.91,"pressureSurfaceLevel":1006.78,"temperature":18.22,"windDirection":95.8,"windSpeed":0.98}},{"startTime":"2024-11-09T09:00:00Z","values":{"humidity":17.34,"pressureSurfaceLevel":1006.56,"temperature":18.12,"windDirection":83.36,"windSpeed":0.84}},{"startTime":"2024-11-09T10:00:00Z","values":{"humidity":16.05,"pressureSurfaceLevel":1007.11,"temperature":17.85,"windDirection":35.62,"windSpeed":0.74}},{"startTime":"2024-11-09T11:00:00Z","values":{"humidity":15.04,"pressureSurfaceLevel":1005.69,"temperature":17.9,"windDirection":38.4,"windSpeed":0.97}},{"startTime":"2024-11-09T12:00:00Z","values":{"humidity":14.71,"pressureSurfaceLevel":1006.51,"temperature":17.59,"windDirection":38.98,"windSpeed":1}},{"startTime":"2024-11-09T13:00:00Z","values":{"humidity":14.46,"pressureSurfaceLevel":1005.43,"temperature":17.61,"windDirection":150.24,"windSpeed":0.57}},{"startTime":"2024-11-09T14:00:00Z","values":{"humidity":14.25,"pressureSurfaceLevel":1006.23,"temperature":17.54,"windDirection":17.47,"windSpeed":0.72}},{"startTime":"2024-11-09T15:00:00Z","values":{"humidity":14.04,"pressureSurfaceLevel":1007.03,"temperature":17.46,"windDirection":17.47,"windSpeed":0.87}},{"startTime":"2024-11-09T16:00:00Z","values":{"humidity":12.95,"pressureSurfaceLevel":1006.57,"temperature":18.81,"windDirection":143.11,"windSpeed":0.7}},{"startTime":"2024-11-09T17:00:00Z","values":{"humidity":11.86,"pressureSurfaceLevel":1006.1,"temperature":20.15,"windDirection":143.11,"windSpeed":0.53}},{"startTime":"2024-11-09T18:00:00Z","values":{"humidity":10.9,"pressureSurfaceLevel":1005.82,"temperature":21.37,"windDirection":155.41,"windSpeed":0.8}},{"startTime":"2024-11-09T19:00:00Z","values":{"humidity":10.23,"pressureSurfaceLevel":1004.92,"temperature":22.27,"windDirection":155.41,"windSpeed":1.16}},{"startTime":"2024-11-09T20:00:00Z","values":{"humidity":9.56,"pressureSurfaceLevel":1004.02,"temperature":23.17,"windDirection":215.94,"windSpeed":1.52}},{"startTime":"2024-11-09T21:00:00Z","values":{"humidity":8.89,"pressureSurfaceLevel":1003.12,"temperature":24.06,"windDirection":215.94,"windSpeed":1.88}},{"startTime":"2024-11-09T22:00:00Z","values":{"humidity":10.69,"pressureSurfaceLevel":1003.37,"temperature":23.09,"windDirection":215.94,"windSpeed":2.31}},{"startTime":"2024-11-09T23:00:00Z","values":{"humidity":12.49,"pressureSurfaceLevel":1003.61,"temperature":22.11,"windDirection":247.32,"windSpeed":2.75}}]}]}})
        response.status(200).json(data);
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
        response.status(200).json(data);
    })
    .catch(err => {
        console.error("Fetch error when fetching daily detail data:", err);
        response.status(500).send("Internal Server Error: daily detail data");
    });
});

