import React from "react";
import { ExpenseRow } from "./ExpenseRow";

export const ExpenseSection = ({
  cat,
  safeSets,
  handleAddSet,
  handleInputChange,
  handleRemoveSet,
  handleStaffSelect,
  filteredStaffs,
  activeInputId,
  setActiveInputId,
  searchText,
  setSearchText,
}) => {
  const label =
    cat === "revenue" ? "수익" : cat === "expense" ? "지출" : "인건비";

  return (
    <section className="expenseModal-section">
      <div className="expenseModal-sectionHeader">
        <span className="label">{label}</span>
        <button
          className="expenseModal-addBtn"
          onClick={() => handleAddSet(cat)}
        >
          + 항목 추가
        </button>
      </div>

      <div className="expenseModal-setList">
        {safeSets[cat].length === 0 && (
          <div className="expenseModal-emptyRow">항목을 추가하세요.</div>
        )}

        {safeSets[cat].map((row) => (
          <ExpenseRow
            key={row.id}
            cat={cat}
            row={row}
            handleInputChange={handleInputChange}
            handleRemoveSet={handleRemoveSet}
            handleStaffSelect={handleStaffSelect}
            filteredStaffs={filteredStaffs}
            activeInputId={activeInputId}
            setActiveInputId={setActiveInputId}
            searchText={searchText}
            setSearchText={setSearchText}
          />
        ))}
      </div>
    </section>
  );
};
