import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#4F46E5",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
];

export default function ExpensePieChart({ data, total }) {
  return (
    <div className="expenseAnalysis-card">
      <h2>💸 항목별 지출 비중</h2>
      {data.length === 0 ? (
        <p className="expenseAnalysis-emptyText">지출 내역이 없습니다.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(1)}%`
                }
              >
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v.toLocaleString()}원`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <p className="expenseAnalysis-total">
            총 지출:{" "}
            <span className="expenseAnalysis-totalValue">
              {total.toLocaleString()}원
            </span>
          </p>
        </>
      )}
    </div>
  );
}
