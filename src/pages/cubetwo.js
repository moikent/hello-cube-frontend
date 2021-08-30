import ReactDOM from "react-dom";
import cubejs from "@cubejs-client/core";
import { QueryRenderer } from "@cubejs-client/react";
import { Spin } from "antd";
import "antd/dist/antd.css";
import React from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
import { useDeepCompareMemo } from "use-deep-compare";
import { Row, Col, Statistic, Table } from "antd";

const COLORS_SERIES = [
  "#5b8ff9",
  "#5ad8a6",
  "#5e7092",
  "#f6bd18",
  "#6f5efa",
  "#6ec8ec",
  "#945fb9",
  "#ff9845",
  "#299796",
  "#fe99c3",
];
const PALE_COLORS_SERIES = [
  "#d7e3fd",
  "#daf5e9",
  "#d6dbe4",
  "#fdeecd",
  "#dad8fe",
  "#dbf1fa",
  "#e4d7ed",
  "#ffe5d2",
  "#cce5e4",
  "#ffe6f0",
];
const commonOptions = {
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
  },
  plugins: {
    legend: {
      position: "bottom",
    },
  },
  scales: {
    x: {
      ticks: {
        autoSkip: true,
        maxRotation: 0,
        padding: 12,
        minRotation: 0,
      },
    },
  },
};

const LineChartRenderer = ({ resultSet }) => {
  const datasets = useDeepCompareMemo(
    () =>
      resultSet.series().map((s, index) => ({
        label: s.title,
        data: s.series.map((r) => r.value),
        borderColor: COLORS_SERIES[index],
        pointRadius: 1,
        tension: 0.1,
        pointHoverRadius: 1,
        borderWidth: 2,
        tickWidth: 1,
        fill: false,
      })),
    [resultSet]
  );
  const data = {
    labels: resultSet.categories().map((c) => c.x),
    datasets,
  };
  return <Line type="line" data={data} options={commonOptions} />;
};

const BarChartRenderer = ({ resultSet, pivotConfig }) => {
  const datasets = useDeepCompareMemo(
    () =>
      resultSet.series().map((s, index) => ({
        label: s.title,
        data: s.series.map((r) => r.value),
        backgroundColor: COLORS_SERIES[index],
        fill: false,
      })),
    [resultSet]
  );
  const data = {
    labels: resultSet.categories().map((c) => c.x),
    datasets,
  };
  const stacked = !(pivotConfig.x || []).includes("measures");
  const options = {
    ...commonOptions,
    scales: {
      x: { ...commonOptions.scales.x, stacked },
      y: { ...commonOptions.scales.y, stacked },
    },
  };
  return <Bar type="bar" data={data} options={options} />;
};

const AreaChartRenderer = ({ resultSet }) => {
  const datasets = useDeepCompareMemo(
    () =>
      resultSet.series().map((s, index) => ({
        label: s.title,
        data: s.series.map((r) => r.value),
        pointRadius: 1,
        pointHoverRadius: 1,
        backgroundColor: PALE_COLORS_SERIES[index],
        borderWidth: 0,
        fill: true,
        tension: 0,
      })),
    [resultSet]
  );
  const data = {
    labels: resultSet.categories().map((c) => c.x),
    datasets,
  };
  const options = {
    ...commonOptions,
    scales: {
      ...commonOptions.scales,
      y: {
        stacked: true,
      },
    },
  };
  return <Line type="area" data={data} options={options} />;
};

const formatTableData = (columns, data) => {
  function flatten(columns = []) {
    return columns.reduce((memo, column) => {
      if (column.children) {
        return [...memo, ...flatten(column.children)];
      }

      return [...memo, column];
    }, []);
  }

  const typeByIndex = flatten(columns).reduce((memo, column) => {
    return { ...memo, [column.dataIndex]: column };
  }, {});

  function formatValue(value, { type, format } = {}) {
    if (value == undefined) {
      return value;
    }

    if (type === "boolean") {
      return Boolean(value).toString();
    }

    if (type === "number" && format === "percent") {
      return [parseFloat(value).toFixed(2), "%"].join("");
    }

    return value.toString();
  }

  function format(row) {
    return Object.fromEntries(
      Object.entries(row).map(([dataIndex, value]) => {
        return [dataIndex, formatValue(value, typeByIndex[dataIndex])];
      })
    );
  }

  return data.map(format);
};

const TableRenderer = ({ resultSet, pivotConfig }) => {
  const [tableColumns, dataSource] = useDeepCompareMemo(() => {
    const columns = resultSet.tableColumns(pivotConfig);
    return [
      columns,
      formatTableData(columns, resultSet.tablePivot(pivotConfig)),
    ];
  }, [resultSet, pivotConfig]);
  return (
    <Table pagination={false} columns={tableColumns} dataSource={dataSource} />
  );
};

const cubejsApi = cubejs(
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MzAzMjUzNzcsImV4cCI6MTYzMDQxMTc3N30.NF29ZN-pc1pNevEM0Ckpwb5BswyWTFOM1v3BM8GMc3k",
  { apiUrl: "http://127.0.0.1:4000/cubejs-api/v1" }
);

const renderChart = ({ resultSet, error, pivotConfig }) => {
  if (error) {
    return <div>{error.toString()}</div>;
  }

  if (!resultSet) {
    return <Spin />;
  }

  return <TableRenderer resultSet={resultSet} pivotConfig={pivotConfig} />;
};

const ChartRenderer = () => {
  return (
    <QueryRenderer
      query={{
        measures: ["Film.rentalDuration"],
        timeDimensions: [
          {
            dimension: "Film.lastUpdate",
          },
        ],
        order: {
          "Film.rentalDuration": "desc",
        },
        dimensions: ["Actor.firstName", "Actor.lastName"],
        filters: [],
      }}
      cubejsApi={cubejsApi}
      resetResultSetOnChange={false}
      render={(props) =>
        renderChart({
          ...props,
          chartType: "table",
          pivotConfig: {
            x: ["Actor.firstName", "Actor.lastName"],
            y: ["measures"],
            fillMissingDates: true,
            joinDateRange: false,
          },
        })
      }
    />
  );
};

// const rootElement = document.getElementById("root");
// ReactDOM.render(<ChartRenderer />, rootElement);
export default ChartRenderer;