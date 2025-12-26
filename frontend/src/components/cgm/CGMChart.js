import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";

const CGMChart = () => {
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/cgm/trends`).then(res => {
            const dates = res.data.map(entry => entry.date.split("T")[0]);
            const sugarLevels = res.data.map(entry => entry.postMealSugarLevel);

            setChartData({
                labels: dates,
                datasets: [{ label: "Post-Meal Sugar Level", data: sugarLevels, borderColor: "blue" }]
            });
        });
    }, []);

    return <Line data={chartData} />;
};

export default CGMChart;
