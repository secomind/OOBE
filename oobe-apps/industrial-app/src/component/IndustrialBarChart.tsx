import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

const SHORT_CIRCUIT_COLOR = "#FF0000";
const DRILL_ERROR_COLOR = "#FFD700";

type ChartSeries = {
  name: string;
  data: number[];
};

type IndustrialBarChartProps = {
  categories: string[];
  series: ChartSeries[];
  title?: string;
};

const IndustrialBarChart: React.FC<IndustrialBarChartProps> = ({
  categories,
  series,
  title = "Industrial Production",
}) => {
  const options: ApexOptions = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
    },
    colors: [SHORT_CIRCUIT_COLOR, DRILL_ERROR_COLOR],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories,
      labels: {
        rotate: -45,
        trim: false,
        hideOverlappingLabels: false,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
    legend: {
      position: "top",
    },
    title: {
      text: title,
      align: "left",
    },
  };

  return (
    <div style={{ width: "100%" }}>
      <Chart options={options} series={series} type="bar" height={350} />
    </div>
  );
};

export default IndustrialBarChart;
