import { useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { Card, Row, Col } from "react-bootstrap";
import "./ECGChart.scss";

interface ECGDataPoint {
  x: number; // timestamp
  y: number; // value
}

interface ECGChartProps {
  data: ECGDataPoint[];
  title: string;
  subtitle: string;
  color?: string;
}

const ECGChart = ({
  data,
  title,
  subtitle,
  color = "#00ff00",
}: ECGChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const uPlotRef = useRef<uPlot | null>(null);

  // Initialize uPlot
  useEffect(() => {
    if (!chartRef.current) return;

    const opts: uPlot.Options = {
      title: "",
      width: chartRef.current.clientWidth,
      height: 150,
      series: [
        {}, // x-series
        {
          // y-series
          stroke: color,
          width: 2,
          points: { show: false },
        },
      ],
      axes: [
        {
          // x-axis
          show: true,
          grid: { show: true, stroke: "#333", width: 1 },
          stroke: "#fff",
          values: (self, ticks) => {
             return ticks.map(t => new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
          }
        },
        {
          // y-axis
          show: false, // hide y axis
          grid: { show: false },
        },
      ],
      legend: { show: false },
      cursor: {
        drag: { x: false, y: false },
        points: { size: 7 },
      },
      scales: {
        x: {
          time: false,
        },
      },
    };

    const chartData = [
      data.map((d) => d.x),
      data.map((d) => d.y),
    ] as [number[], number[]];

    const u = new uPlot(opts, chartData, chartRef.current);
    uPlotRef.current = u;

    // Resize observer to handle window resize
    const resizeObserver = new ResizeObserver((entries) => {
      if (!uPlotRef.current) return;
      for (const entry of entries) {
        if (entry.contentRect) {
            uPlotRef.current.setSize({
                width: entry.contentRect.width,
                height: 150
            });
        }
      }
    });
    resizeObserver.observe(chartRef.current);

    return () => {
      u.destroy();
      resizeObserver.disconnect();
      uPlotRef.current = null;
    };
    // We only want to initialize once or when color changes significantly (which it shouldn't)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);

  // Update data
  useEffect(() => {
    if (!uPlotRef.current) return;
    
    // Transform data for uPlot
    // uPlot expects [series1_data, series2_data, ...]
    // where series1_data is x-values
    const xValues = data.map((d) => d.x);
    const yValues = data.map((d) => d.y);

    if (xValues.length > 0) {
        // Update data
        uPlotRef.current.setData([xValues, yValues]);
    }
  }, [data]);

  return (
    <Card className="ecg-chart-card rounded-5 border-secondary border-2">
      <Card.Body className="d-flex flex-column">
        <Card.Header className="d-flex justify-content-between align-items-center mb-1 bg-transparent border-0">
          <Card.Title className="fw-bold fs-5 mb-1 ms-1 text-white">
            {title}
          </Card.Title>
        </Card.Header>

        <div className="usage-section d-flex flex-column h-100">
          <Row className="subtitle-container align-items-center justify-content-between mb-2">
            <Col xs="auto" className="d-flex align-items-center ms-3 gap-3">
               <div className="dot dot-default" style={{backgroundColor: color}} />
              <span className="fw-semibold fs-1 text-white">
                {subtitle || "Loading..."}
              </span>
            </Col>
          </Row>
          <div ref={chartRef} className="uplot-container flex-grow-1" />
        </div>
      </Card.Body>
    </Card>
  );
};

export default ECGChart;
