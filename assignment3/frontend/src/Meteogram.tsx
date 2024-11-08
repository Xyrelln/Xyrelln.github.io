import React, { useEffect, useRef } from 'react';
import Highcharts, { Chart } from 'highcharts';
import HighchartsWindbarb from 'highcharts/modules/windbarb';
import { MeteogramData } from './types';

// Load the windbarb module
HighchartsWindbarb(Highcharts);

interface MeteogramProps {
  meteogramData: MeteogramData | null;
}

class MeteogramChart {
  // winds: { x: number; value: number; direction: number }[];
  // temperatures: { x: number; y: number; to: number }[];
  // pressures: { x: number; y: number }[];
  // humidity: { x: number; y: number }[];
  // json: MeteogramData;
  // container: HTMLElement | null;
  // chart?: Chart;

  // constructor(json: MeteogramData, container: HTMLElement) {
  //   this.winds = [];
  //   this.temperatures = [];
  //   this.pressures = [];
  //   this.humidity = [];
  //   this.json = json;
  //   this.container = container;

  //   // Run
  //   this.parseMeteogramData();
  //   console.log("constructor()");
  // }

  // drawBlocksForWindArrows(chart: Chart) {
  //   const xAxis = chart.xAxis[0];

  //   for (let pos = xAxis.min ? xAxis.min : 0, max = xAxis.max ? xAxis.max : 0, i = 0; pos <= max + 36e5; pos += 36e5, i += 1) {
  //     const isLast = pos === max + 36e5;
  //     const x = Math.round(xAxis.toPixels(pos)) + (isLast ? 0.5 : -0.5);
  //     const isLong = i % 2 === 0;

  //     chart.renderer
  //     .path([
  //       'M',
  //       x,
  //       chart.plotTop + chart.plotHeight + (isLong ? 0 : 28),
  //       'L',
  //       x,
  //       chart.plotTop + chart.plotHeight + 32,
  //       'Z',
  //     ])
  //     .attr({
  //       stroke: chart.options.chart?.plotBorderColor || '#000000', // Ensure stroke is a valid color
  //       'stroke-width': 1,
  //     })
  //     .add();
    
  //   }

  //   chart.get('windbarbs')?.markerGroup.attr({
  //     translateX: chart.get('windbarbs')?.markerGroup.translateX + 8,
  //   });
  // }

  // getChartOptions = () => {
  //   return {
  //     chart: {
  //       renderTo: this.container,
  //       marginBottom: 70,
  //       marginRight: 40,
  //       marginTop: 50,
  //       plotBorderWidth: 1,
  //       height: 310,
  //       alignTicks: false,
  //       scrollablePlotArea: {
  //         minWidth: 720,
  //       },
  //     },
  //     title: {
  //       text: 'Meteogram',
  //       align: 'left',
  //     },
  //     xAxis: [
  //       {
  //         type: 'datetime',
  //         tickInterval: 4 * 36e5,
  //         minorTickInterval: 36e5,
  //         tickLength: 0,
  //         gridLineWidth: 1,
  //         gridLineColor: 'rgba(128, 128, 128, 0.1)',
  //         labels: {
  //           format: '{value:%H}',
  //         },
  //       },
  //       {
  //         linkedTo: 0,
  //         type: 'datetime',
  //         tickInterval: 24 * 3600 * 1000,
  //         labels: {
  //           format: '{value:<span style="font-size: 12px; font-weight: bold">%a</span> %b %e}',
  //         },
  //         opposite: true,
  //         tickLength: 20,
  //         gridLineWidth: 1,
  //       },
  //     ],
  //     yAxis: [
  //       {
  //         labels: {
  //           format: '{value}°',
  //           x: -3,
  //         },
  //         maxPadding: 0.3,
  //         tickInterval: 1,
  //         gridLineColor: 'rgba(128, 128, 128, 0.1)',
  //       },
  //       {
  //         title: {
  //           text: 'hPa',
  //           align: 'high',
  //           rotation: 0,
  //           style: {
  //             fontSize: '10px',
  //             color: Highcharts.getOptions().colors[2],
  //           },
  //         },
  //         labels: {
  //           style: {
  //             fontSize: '8px',
  //             color: Highcharts.getOptions().colors[2],
  //           },
  //         },
  //         gridLineWidth: 0,
  //         opposite: true,
  //       },
  //     ],
  //     series: [
  //       {
  //         name: 'Temperature',
  //         data: this.temperatures,
  //         type: 'spline',
  //         color: '#FF3333',
  //         negativeColor: '#48AFE8',
  //       },
  //       {
  //         name: 'Air pressure',
  //         color: Highcharts.getOptions().colors[2],
  //         data: this.pressures,
  //         yAxis: 1,
  //       },
  //       {
  //         name: 'Humidity',
  //         type: 'column',
  //         color: Highcharts.getOptions().colors[3],
  //         data: this.humidity,
  //       },
  //       {
  //         name: 'Wind',
  //         type: 'windbarb',
  //         id: 'windbarbs',
  //         data: this.winds,
  //         vectorLength: 18,
  //         yOffset: -15,
  //       },
  //     ],
  //   };
  // }

  // onChartLoad = (chart: Chart) => {
  //   this.drawBlocksForWindArrows(chart);
  //   console.log("onchartLoad()");
  // }

  // createChart = () => {
  //   // Ensure this.container is not null before calling Highcharts.chart
  //   if (this.container) {
  //     this.chart = Highcharts.chart(this.container, this.getChartOptions(), (chart) => {
  //       this.onChartLoad(chart);
  //     });
  //   } else {
  //     console.error("Chart container is null. Chart cannot be created.");
  //   }
  // };

  // error() {
  //   const loadingElement = document.getElementById('loading');
  //   if (loadingElement) {
  //     loadingElement.innerHTML = 'Failed loading data, please try again later';
  //   }
  // }

  // parseMeteogramData() {
  //   let pointStart: number | undefined;

  //   if (!this.json) {
  //     return this.error();
  //   }

  //   this.json.data.timelines[0].intervals.forEach((node, i) => {
  //     const x = Date.parse(node.startTime);
  //     const to = x + 36e5;

  //     if (to > (pointStart || 0) + 48 * 36e5) {
  //       return;
  //     }

  //   console.log("Temperature:", node.values.temperature);

  //     this.humidity.push({ x, y: node.values.humidity });
  //     this.temperatures.push({ x, y: node.values.temperature, to });

  //     if (i % 2 === 0) {
  //       this.winds.push({ x, value: node.values.windSpeed, direction: node.values.windDirection });
  //     }

  //     this.pressures.push({ x, y: node.values.pressureSurfaceLevel });

  //     if (i === 0) {
  //       pointStart = (x + to) / 2;
  //     }
  //     console.log('1')
  //     console.log(this.temperatures[0])
  //   });

  //   this.createChart();
  // }
}

const Meteogram: React.FC<MeteogramProps> = ({ meteogramData }) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (meteogramData && chartContainerRef.current) {
      new MeteogramChart(meteogramData, chartContainerRef.current); 
    }
  }, [meteogramData]);

  return (
    <div>
      <div id="container" ref={chartContainerRef} style={{ width: '100%', height: '400px' }}></div>
      <div id="loading"></div>
    </div>
  );
};

export default Meteogram;