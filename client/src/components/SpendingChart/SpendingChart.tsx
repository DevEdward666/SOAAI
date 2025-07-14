// src/components/SpendingChart.tsx
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Cell,
  Pie,
  Legend,
} from "recharts";
import { PieChartSOAData } from "../../interface/SOADetailsInterface";
import './SpendingChart.css'
const COLORS = [
  "#3b82f6",
  "#06b6d4",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#a855f7",
];

const renderAmountOutsideLabel = ({ percent, index, x, y, value }: any) => {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fill={COLORS[index % COLORS.length]}
    >
      ₱{value.toLocaleString()}
    </text>
  );
};

const SpendingChart: React.FC<PieChartSOAData> = ({ data,ChartTitle}) => {
  return (
    <div style={{ width: "100%", height: 350,paddingBottom:15 }}>
      <h3 className="chart-title">{ChartTitle}</h3>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={renderAmountOutsideLabel}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                display={entry.amount}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `₱${value.toLocaleString()}`}
          />
          <Legend
            verticalAlign="bottom"
            content={(props) => {
              const { payload } = props;
              return (
                <ul
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    listStyle: "none",
                    padding: 0,
                  }}
                >
                  {payload?.map((entry, index) => (
                    <li
                      key={`item-${index}`}
                      style={{ margin: "0 8px", fontSize: "12px" }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: 10,
                          height: 10,
                          backgroundColor: entry.color,
                          marginRight: 4,
                          borderRadius: "50%",
                        }}
                      />
                      {entry.value}
                    </li>
                  ))}
                </ul>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendingChart;
