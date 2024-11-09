import { TimelineData, MeteogramData, DailyDetailData } from "./types";
import './ResultsPanel.scss';
import Table from 'react-bootstrap/Table';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Image from 'react-bootstrap/Image';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMore from 'highcharts/highcharts-more';
import WindbarbModule from 'highcharts/modules/windbarb';
import Vector from 'highcharts/modules/vector';
import { BACKEND_URL } from "../config";
import { useEffect, useState } from 'react';
import Meteogram from "./Meteogram";
import DailyDetail from "./DailyDetail";
import { Button } from "react-bootstrap";
import { BsTwitterX } from "react-icons/bs";

HighchartsMore(Highcharts);
WindbarbModule(Highcharts);
Vector(Highcharts);

const SVG_PATH = 'src/assets/weather_codes_svg';

interface ResultsPanelProps {
    timelineData: TimelineData | null;
    meteogramData: MeteogramData | null;
    setMeteogramData: React.Dispatch<React.SetStateAction<MeteogramData | null>>;
    forcastCityAndState: string;
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

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);

    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    };

    return date.toLocaleDateString('en-US', options);
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ timelineData, meteogramData, setMeteogramData, forcastCityAndState }) => {
    if (timelineData == null) return;
    const [showingDetails, setShowingDetails] = useState<boolean>(false);
    const [detailData, setDetailData] = useState<DailyDetailData | null>(null);
    const [detailDate, setDetailDate] = useState<string>(timelineData.data.timelines[0].startTime);

    useEffect(() => {
        if (timelineData) {
            fetch(`${BACKEND_URL}/meteogram-data`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ location: timelineData.location })
            })
            .then(response => response.json())
            .then(data => setMeteogramData(data))
            .catch(error => console.error("Error fetching meteogram data:", error));
        }
    }, [timelineData]);

    // daily temp chart
    let xaxis: string[] = [];
    let temperatureRange: [number, number][] = [];
    timelineData.data.timelines[0].intervals.forEach((interval) => {
        xaxis.push(formatDate(interval.startTime).split(', ')[1]);
        temperatureRange.push([interval.values.temperatureMax, interval.values.temperatureMin]);
    });

    const dailyTempChartOptions = {
        chart: {
            type: 'arearange',
            zoomType: 'x'
        },
        title: {
            text: 'Temperature Range (Min, Max)'
        },
        xAxis: {
            type: 'datetime',
            title: {
                enabled: false
            },
            categories: xaxis
        },
        yAxis: {
            title: {
                enabled: false
            }
        },
        tooltip: {
            crosshairs: true,
            shared: true,
            valueSuffix: '°F'
        },
        legend:{ enabled:false },
        series: [{
            name: 'Temperature Range',
            data: temperatureRange,
            zIndex: 0,
            fillColor: {
                linearGradient: [0, 0, 0, 300],
                stops: [
                    [0, "#f7ab24"],
                    [1, "#ffffff"]
                ]
            },
            fillOpacity: 0.3,
            marker: {
                enabled: false
            }
        }]
    };

    const handleDetailPanelToggle = () => {
        setShowingDetails(!showingDetails);
    };

    const handleListButton = () => {
        handleDetailPanelToggle();
    };

    const postToTwitter = () => {
        if (!detailData) return;
        const text = `Today's weather in ${forcastCityAndState} on ${formatDate(detailDate)} is ${detailData.data.timelines[0].intervals[0].values.temperatureApparent}°F and the conditions are ${weatherCodeMap[detailData.data.timelines[0].intervals[0].values.weatherCode]?.[0]} #CSCI571WeatherForcast`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(twitterUrl, "_blank");
    };

    const handleDateClick = (date: string) => {
        if (detailDate == '' || date !== detailDate) {
            fetch(`${BACKEND_URL}/daily-detail`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ location: timelineData.location, date: date })
            })
            .then(response => response.json())
            .then(data => {
                setDetailData(data);
                setDetailDate(date);
                setShowingDetails(true);
            })
            .catch(error => console.error("Error fetching daily detail data:", error));
        }
    };

    return (
        <div className="result">
        {!showingDetails 
            ? 
            <div className={`slide-window ${showingDetails ? "slide-left" : "slide-in-right"}`}>
                <h5>Forecast at {forcastCityAndState}</h5>
                <div className="main-results-buttons d-flex">
                    <Button variant="link" onClick={handleDetailPanelToggle}>Details {'>'}</Button>  
                </div>
                <Tabs defaultActiveKey="day-view" id="forecast-tabs">
                    <Tab eventKey="day-view" title="Day View">
                        <Table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Temp. High(°F)</th>
                                    <th>Temp. Low(°F)</th>
                                    <th>Wind Speed(mph)</th>
                                </tr>
                            </thead>
                            <tbody>
                            {timelineData.data.timelines[0].intervals.map((interval, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td><a href="#detail-date" onClick={() => handleDateClick(interval.startTime)}>{formatDate(interval.startTime)}</a></td>
                                    <td>
                                        <div className="icon-text-div">
                                            <Image src={`${SVG_PATH}/${weatherCodeMap[interval.values.weatherCode]?.[1]}.svg`} alt={String(interval.values.weatherCode)} />
                                            <p>{weatherCodeMap[interval.values.weatherCode]?.[0]}</p>
                                        </div>
                                    </td>
                                    <td>{interval.values.temperatureMax}</td>
                                    <td>{interval.values.temperatureMin}</td>
                                    <td>{interval.values.windSpeed}</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </Tab>
                    <Tab eventKey="daily-temp-chart" title="Daily Temp Chart">
                        <div>
                            <HighchartsReact highcharts={Highcharts} options={dailyTempChartOptions} />
                        </div>
                    </Tab>
                    <Tab eventKey="meteogram" title="Meteogram">
                        <Meteogram meteogramData={meteogramData} />
                    </Tab>
                </Tabs>
            </div>
            :
            <div className={`slide-window ${showingDetails ? "slide-in-left" : "slide-right"}`}>
                <div className="detail-buttons d-flex">
                    <Button variant="outline-secondary" onClick={handleListButton}>{'<'} List</Button>
                    <h4 id="detail-date">{formatDate(detailDate)}</h4>
                    <Button variant="outline-dark" onClick={postToTwitter} >
                        <BsTwitterX />
                    </Button>
                </div>
                <DailyDetail location={timelineData.location} date={detailDate} detailData={detailData} setDetailData={setDetailData} />
            </div>
        }
        </div>

    );
}

export default ResultsPanel;
