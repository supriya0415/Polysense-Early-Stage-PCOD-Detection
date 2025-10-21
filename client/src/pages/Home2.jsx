import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Calendar } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format, differenceInDays, addDays } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  Label,
} from "recharts";
import cycleImage from "../../assets/cycle-tracking.jpg";
import axios from "axios";

function Home2() {
  const navigate = useNavigate();
  const [lastPeriodDates, setLastPeriodDates] = useState([]);
  const [approxNextPeriodDate, setApproxNextPeriodDate] = useState(null);
  const [username, setUsername] = useState("User");
  const [cycleStats, setCycleStats] = useState({
    avgCycle: 0,
    minCycle: 0,
    maxCycle: 0,
  });
  const [selectedDateToCancel, setSelectedDateToCancel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "User";
    setUsername(storedUsername);
    fetchPeriodDates();
  }, []);

  const fetchPeriodDates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication required. Please log in again.");
        setIsLoading(false);
        return;
      }

      const response = await axios.get("/api/period/dates", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.dates && Array.isArray(response.data.dates)) {
        const datesArray = response.data.dates.map((date) => new Date(date));
        setLastPeriodDates(datesArray.sort((a, b) => a - b));
      }
    } catch (error) {
      console.error("Error fetching period dates:", error);
      setError("Failed to load your period data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const savePeriodDates = async (dates) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication required. Please log in again.");
        return;
      }

      await axios.post(
        "/api/period/dates",
        { dates: dates.map((date) => date.toISOString()) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Period dates saved successfully");
    } catch (error) {
      console.error("Error saving period dates:", error);
      setError("Failed to save your period data. Please try again later.");
    }
  };

  const calculateIntervals = () => {
    if (lastPeriodDates.length < 2) return [];

    return lastPeriodDates.slice(1).map((date, index) => ({
      name: format(lastPeriodDates[index], "MMM d"),
      interval: differenceInDays(date, lastPeriodDates[index]),
      date: format(date, "MMM d, yyyy"),
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded-md border border-pink-200">
          <p className="font-semibold text-[#ad3559]">{`Period started: ${label}`}</p>
          <p className="text-gray-600">{`Next period: ${payload[0].payload.date}`}</p>
          <p className="font-bold text-[#cf446d]">{`Cycle length: ${payload[0].value} days`}</p>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    if (lastPeriodDates.length >= 2) {
      const intervals = calculateIntervals().map((data) => data.interval);
      setCycleStats({
        avgCycle: Math.round(
          intervals.reduce((sum, val) => sum + val, 0) / intervals.length
        ),
        minCycle: Math.min(...intervals),
        maxCycle: Math.max(...intervals),
      });

      if (lastPeriodDates.length > 0) {
        const lastDate = lastPeriodDates[lastPeriodDates.length - 1];
        const predictedCycleLength =
          Math.round(
            intervals.reduce((sum, val) => sum + val, 0) / intervals.length
          ) || 28;
        setApproxNextPeriodDate(addDays(lastDate, predictedCycleLength));
      }
    }
  }, [lastPeriodDates]);

  const handleDateSelection = (date) => {
    const dateExists = lastPeriodDates.some(
      (existingDate) =>
        format(existingDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );

    let updatedDates;

    if (dateExists) {
      updatedDates = lastPeriodDates.filter(
        (existingDate) =>
          format(existingDate, "yyyy-MM-dd") !== format(date, "yyyy-MM-dd")
      );
    } else {
      updatedDates = [...lastPeriodDates, date];
    }

    updatedDates = updatedDates.sort((a, b) => a - b);
    setLastPeriodDates(updatedDates);
    savePeriodDates(updatedDates);
  };

  const handleCancelDate = (index) => {
    const updatedDates = [...lastPeriodDates];
    updatedDates.splice(index, 1);
    setLastPeriodDates(updatedDates);
    setSelectedDateToCancel(null);
    savePeriodDates(updatedDates);
  };

  const isCycleRegular = () => {
    if (lastPeriodDates.length < 3) return "Insufficient data";
    const intervals = calculateIntervals().map((data) => data.interval);
    return intervals.every((interval) => interval >= 27 && interval <= 34)
      ? "Regular"
      : "Irregular";
  };

  const getDaysUntilNextPeriod = () => {
    if (!approxNextPeriodDate) return null;
    return differenceInDays(approxNextPeriodDate, new Date());
  };

  const handleDetailedTracking = () => {
    navigate("/track");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f595a8]/10 to-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#cf446d]"></div>
          <p className="ml-4 text-[#cf446d] font-medium">
            Loading your cycle data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f595a8]/10 to-gray-100">
        <Navbar />
        <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md shadow-md">
            <h2 className="text-red-600 text-xl font-bold mb-3">
              Something went wrong
            </h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchPeriodDates();
              }}
              className="bg-[#cf446d] text-white py-2 px-4 rounded-md hover:bg-[#ad3559] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f595a8]/10 to-gray-100">
      <Navbar />

      <div className="bg-white shadow-md border-b border-[#f595a8]/30">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              Welcome, <span className="text-[#ad3559] ml-2">{username}</span>
            </h1>
            <p className="text-sm text-gray-500">
              Your personal health tracking dashboard
            </p>
          </div>
          {approxNextPeriodDate && (
            <div className="hidden md:flex flex-col items-center bg-[#f595a8]/10 rounded-lg p-4 shadow-sm">
              <span className="text-xs text-gray-500">Next period in</span>
              <span className="text-2xl font-bold text-[#ad3559]">
                {getDaysUntilNextPeriod()} days
              </span>
              <span className="text-xs text-gray-400">
                {format(approxNextPeriodDate, "MMM d, yyyy")}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <section className="bg-gradient-to-r from-[#f595a8]/20 to-[#f595a8]/30 rounded-xl p-6 mb-8 shadow-md">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-2/3 mb-6 lg:mb-0">
              <h2 className="text-3xl text-[#ad3559] font-bold mb-4">
                Your Cycle Matters
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Understanding your menstrual cycle helps maintain overall health
                and wellness. By tracking your periods, you can identify
                patterns, predict future cycles, and gain insights into your
                reproductive health.
              </p>
            </div>

            <div className="lg:w-1/3 flex justify-center">
              <img
                src={cycleImage}
                alt="Cycle Tracking"
                className="rounded-full w-40 h-40 object-cover border-4 border-white shadow-lg"
              />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="text-xl font-semibold text-[#ad3559] mb-4 text-center">
                Track Your Dates
              </h3>
              <div className="flex justify-center">
                <Calendar
                  date={
                    lastPeriodDates[lastPeriodDates.length - 1] || new Date()
                  }
                  onChange={(date) => handleDateSelection(date)}
                  className="rounded-lg border border-gray-200"
                />
              </div>
              <div className="mt-4 text-center text-sm">
                <p className="text-gray-500">
                  Click on dates to mark the start of your period.
                  {lastPeriodDates.length < 3 && (
                    <span className="block mt-1 text-[#ad3559] font-medium">
                      Select {3 - lastPeriodDates.length} more date(s) for
                      predictions.
                    </span>
                  )}
                </p>
                {lastPeriodDates.length === 3 && (
                  <div className="mt-3 bg-[#f595a8]/20 p-3 rounded-lg">
                    <p className="text-[#ad3559] font-medium">
                      Your next period is predicted for:
                    </p>
                    <p className="text-[#cf446d] font-bold mt-1">
                      {approxNextPeriodDate
                        ? format(approxNextPeriodDate, "MMMM d, yyyy")
                        : "Calculating..."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 h-full">
              <h3 className="text-2xl font-semibold text-[#ad3559] mb-4">
                {username}'s Cycle Summary
              </h3>

              {lastPeriodDates.length > 0 ? (
                <div className="space-y-6">
                  <div className="bg-[#f595a8]/10 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-[#ad3559] font-medium">
                        Selected Period Start Dates
                      </h4>
                      {selectedDateToCancel !== null ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCancelDate(selectedDateToCancel)}
                            className="text-white bg-[#cf446d] px-3 py-1 rounded-md text-sm hover:bg-[#ad3559] transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setSelectedDateToCancel(null)}
                            className="text-[#ad3559] bg-gray-100 px-3 py-1 rounded-md text-sm hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">
                          Click date to remove
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {lastPeriodDates.map((date, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm shadow-sm cursor-pointer transition-all ${
                            selectedDateToCancel === index
                              ? "bg-[#cf446d] text-white"
                              : "bg-white text-[#ad3559] hover:bg-[#f595a8]/20"
                          }`}
                          onClick={() => setSelectedDateToCancel(index)}
                        >
                          {format(date, "MMMM d, yyyy")}
                        </span>
                      ))}
                    </div>
                  </div>

                  {lastPeriodDates.length >= 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white border border-[#f595a8]/30 rounded-lg p-4 text-center shadow-sm">
                        <p className="text-gray-500 text-sm">Average Cycle</p>
                        <p className="text-[#ad3559] text-2xl font-bold">
                          {cycleStats.avgCycle} days
                        </p>
                      </div>
                      <div className="bg-white border border-[#f595a8]/30 rounded-lg p-4 text-center shadow-sm">
                        <p className="text-gray-500 text-sm">Shortest Cycle</p>
                        <p className="text-[#ad3559] text-2xl font-bold">
                          {cycleStats.minCycle} days
                        </p>
                      </div>
                      <div className="bg-white border border-[#f595a8]/30 rounded-lg p-4 text-center shadow-sm">
                        <p className="text-gray-500 text-sm">Longest Cycle</p>
                        <p className="text-[#ad3559] text-2xl font-bold">
                          {cycleStats.maxCycle} days
                        </p>
                      </div>
                    </div>
                  )}

                  {lastPeriodDates.length >= 3 && (
                    <div>
                      <h4 className="text-[#ad3559] font-medium mb-2">
                        Cycle Length Trends
                      </h4>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-[#cf446d] mr-2"></div>
                            <span className="text-sm text-gray-600">Cycle Length (days)</span>
                          </div>
                          <div className="text-xs text-gray-500 italic">Hover for details</div>
                        </div>
                        
                        <ResponsiveContainer width="100%" height={250}>
                          <AreaChart data={calculateIntervals()} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                            <defs>
                              <linearGradient id="colorInterval" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#cf446d" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#cf446d" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis 
                              dataKey="name" 
                              stroke="#9ca3af" 
                              tick={{ fontSize: 12 }}
                              tickMargin={10}
                            />
                            <YAxis 
                              stroke="#9ca3af" 
                              tick={{ fontSize: 12 }}
                              domain={[0, dataMax => Math.max(dataMax, 35)]}
                              tickCount={8}
                            >
                              <Label 
                                value="Days" 
                                position="insideLeft" 
                                angle={-90} 
                                style={{ textAnchor: 'middle', fill: '#9ca3af', fontSize: 12 }}
                              />
                            </YAxis>
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine 
                              y={28} 
                              stroke="#10b981" 
                              strokeDasharray="3 3"
                              strokeWidth={2}
                            >
                              <Label 
                                value="Regular" 
                                position="right" 
                                fill="#10b981"
                              />
                            </ReferenceLine>
                            <Area 
                              type="monotone" 
                              dataKey="interval" 
                              name="Days" 
                              stroke="#cf446d" 
                              strokeWidth={3}
                              fillOpacity={1}
                              fill="url(#colorInterval)"
                              activeDot={{ r: 8, stroke: '#ad3559', strokeWidth: 2, fill: '#fff' }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                        
                        <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
                          <div className="flex items-center">
                            <div className="h-2 w-4 bg-green-500 mr-1 rounded-sm"></div>
                            <span>Regular cycle (28 days)</span>
                          </div>
                          <div className="flex items-center">
                            <div className="h-2 w-4 bg-[#cf446d] opacity-80 mr-1 rounded-sm"></div>
                            <span>Your cycle length</span>
                          </div>
                        </div>
                      </div>
                      
                      {isCycleRegular() === "Irregular" && (
                        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="text-amber-500 mt-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-5 h-5"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div>
                              <h5 className="text-amber-800 font-medium">
                                Your cycle appears to be irregular
                              </h5>
                              <p className="text-amber-700 text-sm mt-1">
                                More detailed tracking can help you better
                                understand your body's patterns.
                              </p>
                              <button
                                onClick={handleDetailedTracking}
                                className="mt-3 text-white bg-[#cf446d] px-4 py-2 rounded-md text-sm hover:bg-[#ad3559] transition-colors flex items-center"
                              >
                                <span>Go to Detailed Tracking</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  className="w-4 h-4 ml-2"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-gray-400 mb-4">
                    No period dates selected yet.
                  </p>
                  <p className="text-[#ad3559]">
                    Use the calendar to mark your period start dates.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Home2;