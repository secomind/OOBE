import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import { useIntl } from "react-intl";
import { useMemo } from "react";
import { CameraHistoryData } from "types";

type ChartProps = {
  data: CameraHistoryData[];
  minX?: Date;
  maxX?: Date;
};

const LineChart = ({ data, minX, maxX }: ChartProps) => {
  const intl = useIntl();

  const series = useMemo(() => {
    let peopleInside = 0;

    const sorted = [...data].sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
    );

    const chartData = sorted.map((item) => {
      const number = item.numberOfPeople ?? 1;

      if (item.event === "Person detected" && item.behavior === "Entering") {
        peopleInside += 1;
      } else if (item.behavior === "Leaving") {
        peopleInside -= 1;
      } else if (item.event === "Group of people") {
        peopleInside += number;
      }
      if (peopleInside < 0) peopleInside = 0;

      return {
        x: new Date(item.datetime),
        y: peopleInside,
      };
    });

    return [
      {
        name: intl.formatMessage({
          id: "peopleDetected",
          defaultMessage: "People detected",
        }),

        data: chartData,
        type: "line",
        color: "var(--bs-yellow)",
      },
    ];
  }, [data, intl]);

  const options: ApexOptions = {
    chart: {
      type: "line",
      animations: {
        enabled: false,
      },
      toolbar: {
        offsetX: 5,
        offsetY: 5,
      },
      zoom: { enabled: true, allowMouseWheelZoom: false },
    },
    fill: {
      colors: ["var(--bs-yellow)"],
      type: "solid",
    },
    stroke: {
      width: 2,
      curve: "linestep",
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: "datetime",
      labels: {
        datetimeUTC: false,
      },
      min: minX?.getTime(),
      max: maxX?.getTime(),
    },
    yaxis: {
      labels: {
        formatter: (value) => (value === null ? "N/A" : `${value.toFixed(0)}`),
      },
      min: 0,
      forceNiceScale: true,
    },
    grid: {
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
    },
    legend: {
      show: true,
      showForSingleSeries: true,
      position: "top",
      horizontalAlign: "left",
      markers: {
        customHTML: function () {
          return `
            <div style="
              width: 10px;
              height: 10px;
              background-color: var(--bs-yellow);
              border-radius: 50%;
              display: inline-block;
              margin-right: 5px;
            "></div>`;
        },
      },
    },
    responsive: [
      {
        breakpoint: 1000,
        options: {
          legend: {
            position: "bottom",
            horizontalAlign: "center",
          },
        },
      },
    ],
    tooltip: {
      theme: "dark",
      x: {
        show: false,
        formatter: function (val) {
          const date = new Date(val);
          const day = intl.formatDate(date, {
            day: "numeric",
            month: "short",
          });
          const time = intl.formatDate(date, {
            hour: "numeric",
            minute: "numeric",
            hour12: false,
          });
          return `${day}, ${time}`;
        },
      },
      y: {
        title: {
          formatter: () => "",
        },
      },
    },
  };

  return (
    <div className="chart-container align-self-center p-4">
      <Chart
        type="line"
        height={400}
        width="100%"
        options={options}
        series={series}
      />
    </div>
  );
};

export default LineChart;
