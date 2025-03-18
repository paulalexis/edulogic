import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function Graph({ x, y, xlabel, ylabel }) {
  // Combine x and y arrays into an array of objects, which recharts needs
  const data = x.map((_x, idx) => ({
    name: x[idx], // could use xunit to create labels
    [ylabel]: y[idx], // Use y values
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis
          label={{ [ylabel]: `${ylabel}`, angle: -90, position: "insideLeft" }}
        />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={ylabel} stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
