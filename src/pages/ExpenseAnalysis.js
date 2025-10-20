import React from "react";
import "../../src/styles/pages/ExpenseAnalysis.css";
import { useExpenseAnalysis } from "../components/chart/useExpenseAnalysis";
import ExpensePieChart from "../components/chart/ExpensePieChart";
import ExpenseLineChart from "../components/chart/ExpenseLineChart";
import { useSelector } from "react-redux";
import { useBusinessReload } from "../hooks/useBusinessReload";

export default function ExpenseAnalysis() {
  const reloadKey = useBusinessReload();
  const currentId = useSelector((s) => s.business.currentId);
  const { data, loading } = useExpenseAnalysis(currentId);

  return (
    <div className="expenseAnalysis-page" key={reloadKey}>
      <h1 className="expenseAnalysis-title">이번 달 지출 분석</h1>
      {loading ? (
        <div className="expenseAnalysis-loadingWrapper">
          <div className="spinner" />
          <p className="expenseAnalysis-loading">분석 중...</p>
        </div>
      ) : (
        <div className="expenseAnalysis-container">
          <ExpensePieChart data={data.byCategory} total={data.totalExpense} />
          <ExpenseLineChart data={data.byDate} />
        </div>
      )}
    </div>
  );
}
