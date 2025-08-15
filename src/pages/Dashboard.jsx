import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./../styles/Dashboard.css";
import { Pie, Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Filler,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Filler
);

// Use environment variable for backend URL
const backendURL = import.meta.env.VITE_BACKEND_URL;

const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [inactiveUsers, setInactiveUsers] = useState(0);
  const [roleData, setRoleData] = useState([]);
  const [signupStats, setSignupStats] = useState([]);
  const [verifiedSenders, setVerifiedSenders] = useState(0);
  const [providerDistribution, setProviderDistribution] = useState([]);
  const [topSenderNames, setTopSenderNames] = useState([]);
  const [domainStats, setDomainStats] = useState(null);
  const [topDomains, setTopDomains] = useState([]);
  const [dailyEmailStatus, setDailyEmailStatus] = useState([]);

  const chartRef = useRef();

  useEffect(() => {
    axios.get(`${backendURL}/api/dashboard/total-users`).then((res) => setTotalUsers(res.data.total));
    axios.get(`${backendURL}/api/dashboard/active-users`).then((res) => setActiveUsers(res.data.active));
    axios.get(`${backendURL}/api/dashboard/inactive-users`).then((res) => setInactiveUsers(res.data.inactive));
    axios.get(`${backendURL}/api/dashboard/role-counts`).then((res) => setRoleData(res.data));
    axios.get(`${backendURL}/api/dashboard/monthly-signups`).then((res) => setSignupStats(res.data));
    axios.get(`${backendURL}/api/dashboard/total-verified-senders`).then((res) => setVerifiedSenders(res.data.total));
    axios.get(`${backendURL}/api/dashboard/email-providers`).then((res) => setProviderDistribution(res.data));
    axios.get(`${backendURL}/api/dashboard/top-sender-names`).then((res) => setTopSenderNames(res.data));
    axios.get(`${backendURL}/api/dashboard/domain-email-stats`).then((res) => setDomainStats(res.data));
    axios.get(`${backendURL}/api/dashboard/top-domains`).then((res) => setTopDomains(res.data));
    axios.get(`${backendURL}/api/dashboard/daily-email-status`).then((res) => setDailyEmailStatus(res.data));
  }, []);

  const pieData = {
    labels: roleData.map((r) => r.Role),
    datasets: [
      {
        label: "Users by Role",
        data: roleData.map((r) => r.count),
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const getGradient = (ctx, chartArea) => {
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, "rgba(75,192,192,0.2)");
    gradient.addColorStop(1, "rgba(75,192,192,0.6)");
    return gradient;
  };

  const lineData = {
    labels: signupStats.map((s) => s.month),
    datasets: [
      {
        label: "Monthly Signups",
        data: signupStats.map((s) => s.total),
        fill: true,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          return getGradient(ctx, chartArea);
        },
        borderColor: "#36A2EB",
        tension: 0.4,
        pointBackgroundColor: "#007bff",
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const topDomainsBarData = {
    labels: topDomains.map((d) => d.domain),
    datasets: [
      {
        label: "Emails per Domain",
        data: topDomains.map((d) => d.email_count),
        backgroundColor: ["#36A2EB", "#FF6384"],
        borderColor: ["#1f77b4", "#c0392b"],
        borderWidth: 1,
      },
    ],
  };

  const topDomainsBarOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Top 2 Domains by Email Count" },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  const dailyStatusLineData = {
    labels: dailyEmailStatus.map((d) => d.date),
    datasets: [
      {
        label: "Sent",
        data: dailyEmailStatus.map((d) => d.sent),
        fill: false,
        borderColor: "#2ecc71",
        backgroundColor: "#2ecc71",
        tension: 0.3,
      },
      {
        label: "Failed",
        data: dailyEmailStatus.map((d) => d.failed),
        fill: false,
        borderColor: "#e74c3c",
        backgroundColor: "#e74c3c",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <div className="top-cards">
        <div className="info-card blue">👥 Total Users: {totalUsers}</div>
        <div className="info-card green">🟢 Active Users: {activeUsers}</div>
        <div className="info-card red">🔴 Inactive Users: {inactiveUsers}</div>
        <div className="info-card purple">📬 Sender Mails: {verifiedSenders}</div>
      </div>

      <div className="charts-grid">
        <div className="chart-box">
          <h3>📊 Users by Role</h3>
          <Pie data={pieData} />
        </div>

        <div className="chart-box">
          <h3>📈 Monthly New Users</h3>
          <Line ref={chartRef} data={lineData} />
        </div>

        {domainStats && (
          <div className="chart-box">
            <h3>📩 Domain Email Stats</h3>
            <p>🌐 Domains: {domainStats.totalDomains}</p>
            <p>✉️ Total Emails: {domainStats.totalEmails}</p>
            <p>🕒 Pending: {domainStats.pending}</p>
            <p>✅ Sent: {domainStats.sent}</p>
            <p>❌ Failed: {domainStats.failed}</p>
          </div>
        )}

        <div className="chart-box">
          <h3>📧 Sender Email Providers</h3>
          <Pie
            data={{
              labels: providerDistribution.map((p) => p.provider),
              datasets: [
                {
                  label: "Senders",
                  data: providerDistribution.map((p) => p.total),
                  backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#8e44ad", "#2ecc71", "#e67e22"],
                },
              ],
            }}
          />
        </div>

        <div className="chart-box">
          <h3>🏢 Top 2 Domains by Email Count</h3>
          <Bar data={topDomainsBarData} options={topDomainsBarOptions} />
        </div>

        <div className="chart-box">
          <h3>📉 Daily Emails Status</h3>
          <Line data={dailyStatusLineData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
