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
    isCurrentFav: boolean;
    setIsCurrentFav: React.Dispatch<React.SetStateAction<boolean>>;
    removeOneLocalFavorite: (city: string, state: string) => void;
    addOneLocalFavorite: (city: string, state: string) => void;
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

const ResultsPanel: React.FC<ResultsPanelProps> = ({ timelineData, meteogramData, setMeteogramData, forcastCityAndState, isCurrentFav, setIsCurrentFav, removeOneLocalFavorite, addOneLocalFavorite }) => {
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
        accessibility: {
            enabled: false
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

    // date href click in result list
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

    const handleFavButton = () => {
        // remove remote
        // send post to add fav or delete
        const method = isCurrentFav ? "DELETE" : "POST";
        const city = forcastCityAndState.split(', ')[0];
        const state = forcastCityAndState.split(', ')[1];
        console.log("handleFavButton: ", method);
        fetch(`${BACKEND_URL}/favorites`, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "city": city,
                "state": state
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        })
        .catch (err => {
            console.log("error in handleFavButton()", err);
        })

        // remove local
        if (isCurrentFav) {
            removeOneLocalFavorite(city, state);
        } else {
            addOneLocalFavorite(city, state);
        }

        // toggle isCurrentFav
        setIsCurrentFav(!isCurrentFav)
    };

    return (
        <div className="result">
        {!showingDetails 
            ?
            // normal list results
            <div className={`slide-window ${showingDetails ? "slide-left" : "slide-in-right"}`}>
                <h5>Forecast at {forcastCityAndState}</h5>

                {/* star and detail buttons */}
                <div className="main-results-buttons d-flex">
                    <Button variant="outline-dark" onClick={handleFavButton}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill={isCurrentFav ? "yellow" : "currentColor"} className="bi bi-star solid" viewBox="0 0 16 16">
                            <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z"/>
                        </svg>
                    </Button>
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
            // details
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
