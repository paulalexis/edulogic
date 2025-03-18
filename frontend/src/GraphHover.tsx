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

const colors = [
  "#FF6633",
  "#66B3FF",
  "#99DD99",
  "#FFFF99",
  "#B399FF",
  "#FF99E6",
];

export function Graph({ x, ys, xlabel, ylabels }) {
  // Combine x and y arrays into an array of objects, which recharts needs
  const data_0 = x.map((ex) => ({ x: ex }));

  const data = data_0.map((d, t) => {
    for (let i = 0; i < ylabels.length; i++) {
      d[ylabels[i]] = ys[i][t];
    }
    return d;
  });

  return (
    <ResponsiveContainer>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" />
        <YAxis
          label={
            {
              /*
            [ylabel]: `${ylabel}`,
            angle: -90,
            position: "insideLeft",
            */
            }
          }
        />
        <Tooltip />
        <Legend />
        {ylabels.map((lab, idx) => (
          <Line
            type="linear"
            dataKey={lab}
            dot={false}
            key={lab}
            stroke={colors[idx % colors.length]}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
