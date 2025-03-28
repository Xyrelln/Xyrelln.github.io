import React, { useEffect, useRef } from 'react';
import Highcharts, { Chart, SVGPathCommand } from 'highcharts';
import HighchartsWindbarb from 'highcharts/modules/windbarb';
import { MeteogramData } from './types';

// Load the windbarb module
HighchartsWindbarb(Highcharts);

interface MeteogramProps {
  meteogramData: MeteogramData | null;
}

class MeteogramChart {
  winds: { x: number; value: number; direction: number }[];
  temperatures: { x: number; y: number; to: number }[];
  pressures: { x: number; y: number }[];
  humidity: { x: number; y: number }[];
  json: MeteogramData;
  container: HTMLElement | null;
  chart?: Chart;

  constructor(json: MeteogramData, container: HTMLElement) {
    this.winds = [];
    this.temperatures = [];
    this.pressures = [];
    this.humidity = [];
    this.json = json;
    this.container = container;

    // Run
    this.parseMeteogramData();
  }

  drawBlocksForWindArrows(chart: Chart) {
    const xAxis = chart.xAxis[0];

    for (let pos = xAxis.min ? xAxis.min : 0, max = xAxis.max ? xAxis.max : 0, i = 0; pos <= max + 36e5; pos += 36e5, i += 1) {
      const isLast = pos === max + 36e5;
      const x = Math.round(xAxis.toPixels(pos)) + (isLast ? 0.5 : -0.5);
      const isLong = i % 2 === 0;
      
      // Now, use the path with defined points and add valid attributes
      chart.renderer
        .path([
          ['M' as SVGPathCommand, x, chart.plotTop + chart.plotHeight + (isLong ? 0 : 28)],
          ['L' as SVGPathCommand, x, chart.plotTop + chart.plotHeight + 32],
          ['Z']
        ])
        .attr({
          stroke: chart.options.chart?.plotBorderColor || '#000000',
          'stroke-width': 1,
        })
        .add();
    
    }

    // chart.get('windbarbs')?.attr({
    //   translateX: chart.get('windbarbs')?.markerGroup.translateX + 8,
    // });
  }

  getChartOptions = () => {
    return {
      chart: {
        renderTo: this.container,
        marginBottom: 70,
        marginRight: 40,
        marginTop: 50,
        plotBorderWidth: 1,
        height: 310,
        alignTicks: false,
        scrollablePlotArea: {
          minWidth: 720,
        },
      },
      title: {
        text: 'Hourly Weather (For Next 5 Days)',
        align: 'center',
      },
      xAxis: [
        {
          type: 'datetime',
          tickInterval: 4 * 36e5,
          minorTickInterval: 36e5,
          tickLength: 0,
          gridLineWidth: 1,
          gridLineColor: 'rgba(128, 128, 128, 0.1)',
          labels: {
            format: '{value:%H}',
          },
        },
        {
          linkedTo: 0,
          type: 'datetime',
          tickInterval: 24 * 3600 * 1000,
          labels: {
            format: '{value:<span style="font-size: 12px; font-weight: bold">%a</span> %b %e}',
          },
          opposite: true,
          tickLength: 20,
          gridLineWidth: 1,
        },
      ],
      yAxis: [
        {
          labels: {
            format: '{value}°',
            x: -3,
          },
          maxPadding: 0.3,
          tickInterval: 1,
          gridLineColor: 'rgba(128, 128, 128, 0.1)',
        },
        { // Air pressure
          allowDecimals: false,
          title: { // Title on top of axis
              text: 'hPa',
              offset: 0,
              align: 'high',
              rotation: 0,
              style: {
                  fontSize: '10px',
                  color: '#e1af45'
              },
              textAlign: 'left',
              x: 3
          },
          labels: {
              style: {
                  fontSize: '8px',
                  color: '#e1af45'
              },
              y: 2,
              x: 3
          },
          gridLineWidth: 0,
          opposite: true,
          showLastLabel: false
      }
      ],
      legend: {
        enabled: false,
      },
      tooltip: {
        shared: true,
        useHTML: true,
        headerFormat:
            '<small>{point.x:%A, %b %e, %H:%M} - ' +
            '{point.point.to:%H:%M}</small><br>' +
            '<b>{point.point.symbolName}</b><br>'

      },
      series: [
        {
          name: 'Temperature',
          data: this.temperatures,
          type: 'spline',
          color: '#f3373b',
          negativeColor: '#48AFE8',
          zIndex: 5
        },
        {
          name: 'Air pressure',
          color: '#e1af45',
          data: this.pressures,
          marker: {
            enabled: false,
          },
          shadow: false,
          tooltip: {
            valueSuffix: " hPa",
          },
          dashStyle: "shortdot",
          yAxis: 1,
          zIndex: 4
        },
        {
          name: 'Humidity',
          type: 'column',
          color: '#5fb9cf',
          data: this.humidity,
          pointWidth: 7,
          marker: {
            enabled: false,
          },
          shadow: false,
          tooltip: {
            valueSuffix: " hPa",
          },
          dashStyle: "shortdot",
          dataLabels: {
            enabled: true,
            inside: false, 
            align: 'center',
            verticalAlign: 'bottom',
            crop: false,
            overflow: 'none',
            style: {
              color: '#333',
              fontSize: '10px',
              fontWeight: 'bold',
              textOutline: 'none'
            }
          },
          yAxis: 0,
        },
        {
          name: 'Wind',
          type: 'windbarb',
          id: 'windbarbs',
          data: this.winds,
          vectorLength: 18,
          yOffset: -15,
        },
      ],
    };
  }

  onChartLoad = (chart: Chart) => {
    this.drawBlocksForWindArrows(chart);
  }

  createChart = () => {
    // Ensure this.container is not null before calling Highcharts.chart
    if (this.container) {
      this.chart = Highcharts.chart(this.container, this.getChartOptions() as Highcharts.Options, (chart) => {
        this.onChartLoad(chart);
      });
    } else {
      console.error("Chart container is null. Chart cannot be created.");
    }
  };

  error() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.innerHTML = 'Failed loading data, please try again later';
    }
  }

  parseMeteogramData() {

    if (!this.json) {
      return this.error();
    }

    this.json.data.timelines[0].intervals.forEach((node, i) => {
      const x = Date.parse(node.startTime);
      const to = x + 36e5;

      this.humidity.push({ x, y: node.values.humidity });
      this.temperatures.push({ x, y: node.values.temperature, to });

      if (i % 2 === 0) {
        this.winds.push({ x, value: node.values.windSpeed, direction: node.values.windDirection });
      }

      this.pressures.push({ x, y: node.values.pressureSurfaceLevel });

    });

    this.createChart();
  }
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
      <p>wind arrows are there but margin is a bit weird, sometimes stuck inside graph</p>
      <div id="container" ref={chartContainerRef} style={{ width: '100%', height: '400px' }}>p</div>
      <div id="loading"></div>
    </div>
  );
};

export default Meteogram;