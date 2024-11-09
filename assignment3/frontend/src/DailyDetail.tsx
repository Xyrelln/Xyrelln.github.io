import { DailyDetailData } from "./types";
import { BACKEND_URL } from "../config";
import { useState, useEffect } from "react";
import { Button, Table } from "react-bootstrap";
import { GoogleMapsWrapper } from "./GoogleMapsWrapper";
import { GoogleMaps } from "./GoogleMaps";
import "./DailyDetail.scss";

interface DailyDetailProps {
    location: string;
    date: string;
    detailData: DailyDetailData | null;
    setDetailData: React.Dispatch<React.SetStateAction<DailyDetailData | null>>;
}

const weatherCodeMap: { [key: number]: [string, string] } = {
    1000: ["Clear", "clear_day"],
    1100: ["Mostly Clear", "mostly_clear_day"],
    1101: ["Partly Cloudy", "partly_cloudy_day"],
    1102: ["Mostly Cloudy", "mostly_cloudy"],
    1001: ["Cloudy", "cloudy"],
    2000: ["Fog", "fog"],
    2100: ["Light Fog", "fog_light"],
    4000: ["Drizzle", "drizzle"],
    4001: ["Rain", "rain"],
    4200: ["Light Rain", "rain_light"],
    4201: ["Heavy Rain", "rain_heavy"],
    5000: ["Snow", "snow"],
    5001: ["Flurries", "flurries"],
    5100: ["Light Snow", "snow_light"],
    5101: ["Heavy Snow", "snow_heavy"],
    6000: ["Freezing Drizzle", "freezing_drizzle"],
    6001: ["Freezing Rain", "freezing_rain"],
    6200: ["Light Freezing Rain", "freezing_rain_light"],
    6201: ["Heavy Freezing Rain", "freezing_rain_heavy"],
    7000: ["Ice Pellets", "ice_pellets"],
    7101: ["Heavy Ice Pellets", "ice_pellets_heavy"],
    7102: ["Light Ice Pellets", "ice_pellets_light"],
    8000: ["Thunderstorm", "tstorm"]
};

const DailyDetail: React.FC<DailyDetailProps> = ({ location, date, detailData, setDetailData }) => {
    
    useEffect(() => {
        fetch(`${BACKEND_URL}/daily-detail`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ location: location, date: date })
        })
        .then(response => response.json())
        .then(data => setDetailData(data))
        .catch(error => console.error("Error fetching daily detail data:", error));
    }, [location, date]);

    return(
        <div className="daily-detail">
            {detailData ? (
                <Table striped>
                    <tbody>
                        <tr>
                            <td><strong>Status</strong></td>
                            <td>{weatherCodeMap[detailData.data.timelines[0].intervals[0].values.weatherCode][0]}</td>
                        </tr>
                        <tr>
                            <td><strong>Max Temperature</strong></td>
                            <td>{detailData.data.timelines[0].intervals[0].values.temperatureMax}°F</td>
                        </tr>
                        <tr>
                            <td><strong>Min Temperature</strong></td>
                            <td>{detailData.data.timelines[0].intervals[0].values.temperatureMin}°F</td>
                        </tr>
                        <tr>
                            <td><strong>Apparent Temperature</strong></td>
                            <td>{detailData.data.timelines[0].intervals[0].values.temperatureApparent}°F</td>
                        </tr>
                        <tr>
                            <td><strong>Sun Rise Time</strong></td>
                            <td>{detailData.data.timelines[0].intervals[0].values.sunriseTime}</td>
                        </tr>
                        <tr>
                            <td><strong>Sun Set Time</strong></td>
                            <td>{detailData.data.timelines[0].intervals[0].values.sunsetTime}</td>
                        </tr>
                        <tr>
                            <td><strong>Humidity</strong></td>
                            <td>{detailData.data.timelines[0].intervals[0].values.humidity}%</td>
                        </tr>
                        <tr>
                            <td><strong>Wind Speed</strong></td>
                            <td>{detailData.data.timelines[0].intervals[0].values.windSpeed} mph</td>
                        </tr>
                        <tr>
                            <td><strong>Visibility</strong></td>
                            <td>{detailData.data.timelines[0].intervals[0].values.visibility} mi</td>
                        </tr>
                        <tr>
                            <td><strong>Cloud Cover</strong></td>
                            <td>{detailData.data.timelines[0].intervals[0].values.cloudCover}%</td>
                        </tr>
                    </tbody>
                </Table>
            ) : (
                <p>Loading Daily Detail...</p>
            )}

            <GoogleMapsWrapper>
                <GoogleMaps center={{ lat: +location.split(',')[0], lng: +location.split(',')[1] }} />
            </GoogleMapsWrapper>
        </div>
        )
};

export default DailyDetail;