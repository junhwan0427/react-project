import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ExpenseLineChart({ data }) {
  return (
    <div className="expenseAnalysis-card">
      <h2>📆 날짜별 지출 추이</h2>
      {data.length === 0 ? (
        <p className="expenseAnalysis-emptyText">지출 데이터가 없습니다.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(v) => `${v.toLocaleString()}원`} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#EF4444"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
