import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function Dashboard() {
  const [records, setRecords] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [groupBy, setGroupBy] = useState("daily"); // or "weekly", "monthly"
  const [availableCategories, setAvailableCategories] = useState([]);

  // Load data from localStorage on first render
  useEffect(() => {
    const stored = localStorage.getItem("spendingRecords");
    if (stored) {
      setRecords(JSON.parse(stored));
    }

    // Also load the custom categories to keep Dashboard in sync with Journal
    const storedCategories = localStorage.getItem("customCategories");
    if (storedCategories) {
      setAvailableCategories(JSON.parse(storedCategories));
    }
  }, []);

  // Get total spending for selected month
  function totalForSelectedMonth() {
    if (!selectedMonth) return 0;

    const [year, month] = selectedMonth.split("-").map(Number);

    return records.reduce((total, record) => {
      const recordDate = new Date(record.date);
      const recordYear = recordDate.getFullYear();
      const recordMonth = recordDate.getMonth() + 1;

      if (recordYear === year && recordMonth === month) {
        return total + record.amount;
      }
      return total;
    }, 0);
  }

  // Get total all time
  function totalAllTime() {
    return records.reduce((total, record) => total + record.amount, 0);
  }

  const filteredRecords = selectedMonth
    ? records.filter((record) => {
        const date = new Date(record.date);
        const [year, month] = selectedMonth.split("-").map(Number);
        return date.getFullYear() === year && date.getMonth() === month;
      })
    : records;

  // Group the filtered records based on the selected groupBy option
  const groupedData = groupDataByPeriod(filteredRecords, groupBy);

  // Create arrays for the line chart from grouped data
  const sortedPeriods = Object.keys(groupedData).sort();
  const lineChartLabels = sortedPeriods;
  const lineChartValues = sortedPeriods.map(
    (period) => groupedData[period].totalAmount
  );

  const lineChartData = {
    labels: lineChartLabels,
    datasets: [
      {
        label: `Spending (${groupBy})`,
        data: lineChartValues,
        borderColor: "blue",
        backgroundColor: "lightblue",
        tension: 0.3,
      },
    ],
  };

  // For pie chart, we still want to show categories, but aggregate across all periods
  const pieChartData = {
    labels: [...new Set(filteredRecords.map((r) => r.category))],
    datasets: [
      {
        label: "Spending by Category",
        data: pieChartAggregate(filteredRecords),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#9CCC65",
          "#FFA726",
        ],
      },
    ],
  };

  function pieChartAggregate(data) {
    const map = {};
    data.forEach((r) => {
      map[r.category] = (map[r.category] || 0) + r.amount;
    });
    return Object.values(map);
  }

  // Helper function to get the week number of a date
  function getWeekNumber(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    const weekNumber = Math.ceil((d.getDate() + firstDay.getDay()) / 7);
    return `${year}-${String(month + 1).padStart(2, "0")}-W${weekNumber}`;
  }

  // Helper function to format date based on groupBy option
  function formatDateForGrouping(date, groupBy) {
    const d = new Date(date);

    if (groupBy === "daily") {
      return date; // Keep original date format (YYYY-MM-DD)
    } else if (groupBy === "weekly") {
      return getWeekNumber(date);
    } else if (groupBy === "monthly") {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }
    return date;
  }

  // Function to group data based on the selected groupBy option
  function groupDataByPeriod(data, groupBy) {
    const grouped = {};

    // Group the data by the specified period
    data.forEach((record) => {
      const key = formatDateForGrouping(record.date, groupBy);

      if (!grouped[key]) {
        grouped[key] = {
          totalAmount: 0,
          records: [],
          categories: {},
        };
      }

      // Add to total amount for this period
      grouped[key].totalAmount += record.amount;

      // Keep track of all records in this period
      grouped[key].records.push(record);

      // Group by categories within this period
      if (!grouped[key].categories[record.category]) {
        grouped[key].categories[record.category] = 0;
      }
      grouped[key].categories[record.category] += record.amount;
    });

    return grouped;
  }

  return (
    <div className="container">
      <h2>Dashboard</h2>

      <div>
        <h4>Total Spendings: </h4>
        <div>
          <label>
            Select Month:{" "}
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </label>
        </div>

        <div>
          <h4>
            Total Spending (selected month): THB{" "}
            {totalForSelectedMonth().toFixed(2)}
          </h4>
          <h4>Total Spending (all time): THB {totalAllTime().toFixed(2)}</h4>
        </div>
        <br />
        <hr />
        <br />

        <div>
          <div>
            <label>Group By: </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <h4>Line Chart (spending over time)</h4>
          <Line data={lineChartData} />

          <br />
          <h4>Pie Chart (spending by category)</h4>
          <Pie data={pieChartData} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
