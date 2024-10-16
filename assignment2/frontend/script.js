const backendUrl = 'https://csci-571-python-435619.wl.r.appspot.com/';
// const backendUrl = 'http://localhost:5000';

const weatherCodeMap = {
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
// [good looking name, svg name]

document.getElementById('submit').addEventListener('click', () => {
    const street = document.getElementById('street').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const queryLocation = street + ', ' + city + ', ' + state;
    let data;
    if (autoDetectLocation.checked) data = { isAutoDetect: true };
    else {
        if (!document.getElementById('street').reportValidity() || !document.getElementById('city').reportValidity() || !document.getElementById('state').reportValidity()) {
            return;
        }
        data = {
            location: queryLocation,
            isAutoDetect: false
        };
    }
    
    fetch(backendUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(mainQueryData => {
        const weatherCode = mainQueryData.realtime_info.data.values.weatherCode;
        const icon_path = weather_code_to_img_path(weatherCode);
        document.getElementById('queried-location').innerText = mainQueryData.realtime_info.full_address;
        document.getElementById('main-weather-icon').src = icon_path;
        document.getElementById('main-weather-status-name').innerText = weatherCodeMap[weatherCode][0];
        document.getElementById('main-result-temperature').innerText = celsius_to_fahrenheit(mainQueryData.realtime_info.data.values.temperature) + '\u00B0';
        
        // [htmlIdName, json value name, unit, fixed decimal]
        const attributes = [['humidity', 'humidity', '%', 0], 
                            ['pressure', 'pressureSurfaceLevel', 'inHg', 1], 
                            ['wind-speed', 'windSpeed', 'mph', 2], 
                            ['visibility', 'visibility', 'mi', 2],
                            ['cloud-cover', 'cloudCover', '%', 0], 
                            ['uv-level', 'uvIndex', '', 0]
        ];
        attributes.forEach((attribute) => {
            let value = mainQueryData.realtime_info.data.values[attribute[1]];
            value = String((parseFloat(value) / 1013.25 * 29.92).toFixed(attribute[3])) + attribute[2];
            document.getElementById(`${attribute[0]}-value`).innerText = value;
        })

        // "intervals":[
        // {
        //     "startTime":"2024-10-12T06:00:00-07:00",
        //     "values":{
        //        "temperatureMax":82.96,
        //        "temperatureMin":56.21,
        //        "weatherCode":1100,
        //        "windSpeed":7.55
        //     }
        //  }, ...]
        const timeline_data = mainQueryData.timeline_info.data.timelines[0].intervals;
        timeline_data.map((interval, index) => {
            let forcast_item = document.createElement('div');
            forcast_item.classList.add('forcast-grid');

            const gridDate = document.createElement('div');
            const dateObject = new Date(interval.startTime.split('T')[0]).toLocaleDateString('en-US', { 
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });  // Friday, Oct 11, 2024
            dateLegoList = dateObject.split(' ');
            const dateConverted = dateLegoList[0] + ' ' + dateLegoList[2].slice(0, -1) + ' ' + dateLegoList[1] + ' ' + dateLegoList[3];
            gridDate.innerHTML = `<p>${dateConverted}</p>`;
            gridDate.classList.add('grid-item');
            forcast_item.appendChild(gridDate);

            const gridStatus = document.createElement('div');
            gridStatus.classList.add('grid-item');
            gridStatus.innerHTML = `   
                <img src="${weather_code_to_img_path(interval.values.weatherCode)}" alt="weather svg" />
                <p>${weatherCodeMap[interval.values.weatherCode][0]}</p>
            `;
            forcast_item.appendChild(gridStatus);
            
            const gridValues = ['temperatureMax', 'temperatureMin','windSpeed'];
            gridValues.forEach((valueName) => {
                const gridItem = document.createElement('div');
                gridItem.innerHTML = `<p>${interval.values[valueName]}</p>`;
                gridItem.classList.add('grid-item');
                forcast_item.appendChild(gridItem);
            });

            const displayDetails = () => {
                // put stuff in html
                document.getElementById('details-daily-header-date').innerText = dateConverted;
                document.getElementById('details-daily-header-status').innerText = weatherCodeMap[interval.values.weatherCode][0];
                document.getElementById('details-daily-header-temp').innerText = `${interval.values.temperatureMax+'\u00B0'}F/${interval.values.temperatureMin+'\u00B0'}F`;
                document.getElementById('details-daily-img').setAttribute('src', weather_code_to_img_path(interval.values.weatherCode));

                const precipitationMap = ['N/A', 'Rain', 'Snow', 'Freezing Rain', 'Ice Pellets / Sleet'];
                const precipitationTypeRow = document.createElement('tr');
                const precipitationLabel = document.createElement('td');
                precipitationLabel.innerText = 'Precipitation:';
                precipitationTypeRow.appendChild(precipitationLabel);
                const precipitationValue = document.createElement('td');
                precipitationValue.innerText = precipitationMap[interval.values.precipitationType];
                precipitationTypeRow.appendChild(precipitationValue);
                document.getElementById('details-daily-table').appendChild(precipitationTypeRow);

                const detailAttributes = [
                    ['Chance of Rain:', 'precipitationProbability', '%', 0], 
                    ['Wind Speed:', 'windSpeed', 'mph', 2], 
                    ['Humidity:', 'humidity', '%', 2], 
                    ['Visibility:', 'visibility', 'mi', 2]
                ];
                detailAttributes.forEach((attribute) => {
                    const Row = document.createElement('tr');
                    const Label = document.createElement('td');
                    Label.innerText = attribute[0];
                    Row.appendChild(Label);
                    const Value = document.createElement('td');
                    Value.innerText = interval.values[attribute[1]].toFixed(attribute[3]) + attribute[2];
                    Row.appendChild(Value);
                    document.getElementById('details-daily-table').appendChild(Row);
                })

                const sunsetRow = document.createElement('tr');
                const sunsetLabel = document.createElement('td');
                sunsetLabel.innerText = 'Sunrise/Sunset:';
                sunsetRow.appendChild(sunsetLabel);
                const sunsetValue = document.createElement('td');
                sunsetValue.innerText = `${convert_to_readable_time(interval.values.sunriseTime)}/${convert_to_readable_time(interval.values.sunsetTime)}`;
                sunsetRow.appendChild(sunsetValue);
                document.getElementById('details-daily-table').appendChild(sunsetRow);
                document.getElementById('details-div').style.display = 'block';

                // first chart
                let tempRanges = [];
                timeline_data.forEach(interval => {
                    tempRanges.push([new Date(interval.startTime).getTime(), interval.values.temperatureMin, interval.values.temperatureMax]);
                });
                Highcharts.chart('temperature-ranges-chart', {
                    chart: {
                        type: 'arearange',
                        zoomType: 'x'
                    },
                    title: {
                        text: 'Temperature Ranges (Min, Max)'
                    },
                    xAxis: {
                        type: 'datetime'
                    },
                    yAxis: {
                        title: {
                            text: null
                        }
                    },
                    tooltip: {
                        shared: true,
                        valueSuffix: '°F'
                    },
                    series: [{
                        showInLegend: false,
                        name: 'Temperature',
                        data: tempRanges
                    }]
                    }   
                );

                // second chart
                const getHourlyData = async () => {
                    return fetch(backendUrl + '/hourly', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok ' + response.statusText);
                        }
                        return response.json();
                    })
                    .catch(error => {
                        console.error('Error fetching data:', error);
                    });
                };
                
                const temperatureData = [];
                const humidityData = [];
                const pressureData = [];
                const windspeedData = [];                
                getHourlyData()
                    .then(hourlyData => {
                        hourlyData = hourlyData.timeline_info.data.timelines[0].intervals; 
                
                        if (!hourlyData) {
                            console.log('no data hourly');
                            return;
                        }
                
                        hourlyData.forEach(interval => {
                            const time = new Date(interval.startTime);
                            temperatureData.push([time, interval.values.temperature]);
                            humidityData.push([time, interval.values.humidity]);
                            pressureData.push([time, interval.values.pressureSeaLevel]);
                            windspeedData.push([time, interval.values.windSpeed]);
                        });
                    })
                    .then(() => {
                        Highcharts.chart('hourly-weather-chart', {
                            chart: {
                                zoomType: 'x'
                            },
                            title: {
                                text: 'Hourly Weather (For Next 5 Days)'
                            },
                            xAxis: {
                                type: 'datetime',
                                tickInterval:36 * 1000
                            },
                            yAxis: [{
                                title: null,
                                labels: {
                                    format: '{value}°F'
                                },
                                gridLineWidth: 1,
                                gridLineColor: '#e0e0e0',
                            }, {
                                title: null,
                                opposite: true,
                                visible: false, 
                            }, {
                                title: null,
                                opposite: true,
                                visible: false,
                            }, {
                                title: null,
                                opposite: true,
                                visible: false, 
                            }],
                            tooltip: {
                                shared: true
                            },
                            series: [{
                                name: 'Pressure',
                                type: 'spline',
                                yAxis: 1,
                                data: pressureData,
                                color: 'brown',
                                dashStyle: 'dot',
                                zIndex: 3,
                                tooltip: {
                                    valueSuffix: ' inHg'
                                },
                                showInLegend: false 
                            }, {
                                name: 'Temperature',
                                type: 'spline',
                                yAxis: 0,
                                data: temperatureData,
                                color: 'red',
                                zIndex: 2,
                                tooltip: {
                                    valueSuffix: '°F'
                                },
                                showInLegend: false
                            }, {
                                name: 'Humidity',
                                type: 'column',
                                yAxis: 3,
                                data: humidityData,
                                color: 'hsl(205, 98%, 76%)',
                                borderWidth: 0,
                                pointWidth: 4,
                                zIndex: 1,
                                dataLabels: {
                                    enabled: true,
                                    format: '{point.y:.0f}',
                                    style: {
                                        fontWeight: 'bold'
                                    }
                                },
                                tooltip: {
                                    valueSuffix: '%'
                                },
                                showInLegend: false
                            }, {
                                name: 'Wind Speed',
                                type: 'spline',
                                yAxis: 2,
                                data: windspeedData,
                                tooltip: {
                                    valueSuffix: ' mph'
                                },
                                visible: false,
                                showInLegend: false
                            }]
                        });
                    })
                    .catch(error => {
                        console.error('Error in Highcharts:', error);
                    });
                }
          
            forcast_item.addEventListener("click", () => {
                document.getElementById('result-box').style.display = 'none';
                document.getElementById('details-box').style.display = 'block';
                displayDetails();
            })

            forcast_item.setAttribute('key', index);
            document.getElementById('forcasts-div').appendChild(forcast_item);
        })

        document.getElementById('result-box').style.display = 'block';
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

let isChartHidden = true;
document.getElementById('arrow').addEventListener('click', () => {
    document.getElementById('charts').style.display = isChartHidden ? 'block' : 'none';
    document.getElementById('arrow').style.transform = isChartHidden ? 'rotate(270deg)' : 'rotate(90deg)';
    isChartHidden = !isChartHidden;
})

document.getElementById('clear').addEventListener('click', () => {
    clearForm();
}) 

const autoDetectLocation = document.getElementById('auto-detect-location');
autoDetectLocation.addEventListener('change', () => {
    if (autoDetectLocation.checked) {
        clearForm();
    }
});

const celsius_to_fahrenheit = (n) => ((n * 9.0 / 5.0) + 32.0).toFixed(2).slice(0, -1);

const weather_code_to_img_path = (weatherCode => "./Images/weather_icons/" + weatherCodeMap[weatherCode][1] + ".svg");

function convert_to_readable_time(timeString) {
    const date = new Date(timeString);
    let hours = date.getUTCHours(); 
    let minutes = date.getUTCMinutes();
    if (minutes >= 30) {
        hours += 1;
    }
    let period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; 
    return `${hours}${period}`;
}

const clearForm = () => {
    document.getElementById('street').value = '';
    document.getElementById('city').value = '';
    document.getElementById('state').value = '';
    document.getElementById('result-box').style.display = 'none';
    document.getElementById('details-box').style.display = 'none';
    document.getElementById('charts').style.display = 'none';
}

document.getElementById('auto-detect-location').addEventListener('change', (event) => {
    const requiredArr = ['street', 'city', 'state'];
    requiredArr.forEach((id) => {
        document.getElementById(id).required = !event.target.checked;
        console.log(`${id} required: ${document.getElementById(id).required}`);
    })
})
