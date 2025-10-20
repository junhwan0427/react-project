import React from "react";
import moment from "moment";
import "../../styles/pages/ExpenseModal.css";
import { useExpenseModal } from "./useExpenseModal"; // 내부 상태 관리 - 세트 배열, 입력 핸들러, 일일합계 등
import { ExpenseSection } from "./ExpenseSection"; // 세부 입력 섹션 렌더링
import { fmt, signPrefix } from "./expenseUtils"; // 숫자 포매팅 및 부호 표시 유틸리티 함수

const ExpenseModal = ({
  expenseSets,
  setExpenseSets,
  onSave,
  onClose,
  selectedDate,
  businessId,
}) => {

  // safeSets: 빈 값 방지
  // handleAddSet: 새로운 항목 추가 버튼 클릭 시 동작
  // handleMemoChange: 메모 변경 핸들러
  // dailyTotal: 일일 합계
  // sectionProps: 나머지 핸들러 모음
  const {
    safeSets,
    handleAddSet,
    handleMemoChange,
    dailyTotal,
    ...sectionProps
  } = useExpenseModal({ expenseSets, setExpenseSets, businessId });

  return (
    <div className="expenseModal-wrap">
      <div className="expenseModal-topbar">
        <div className="expenseModal-btnGroup">
          {/* 닫기 버튼 → onClose 콜백 호출 */}
          <button className="expenseModal-btn ghost" onClick={onClose}>
            닫기
          </button>

          {/* 등록 버튼 → onSave 콜백 호출 (DB 저장 등) */}
          <button className="expenseModal-btn primary" onClick={onSave}>
            등록
          </button>
        </div>
      </div>

      <h3 className="expenseModal-date">
        {selectedDate
          ? moment(selectedDate).format("YYYY년 MM월 DD일")
          : "날짜 미선택"}
      </h3>

      <div className="expenseModal-sectionGroup">
        {["revenue", "expense", "labor"].map((cat) => (
          <ExpenseSection
            key={cat}
            cat={cat} // 카테고리명 전달
            safeSets={safeSets} // 해당 카테고리 항목 리스트
            handleAddSet={handleAddSet} // 항목 추가 버튼 핸들러
            {...sectionProps} // 나머지 공통 핸들러 전달
          />
        ))}
      </div>

      <div
        className="expenseModal-totalBar"
        style={{
          "--total-color":
            dailyTotal > 0 ? "#166534" : dailyTotal < 0 ? "#991b1b" : "#374151",
        }}
      >
        <span>일일 매출 합계</span>
        <strong>
          {/* 부호(+/–)와 금액 포맷 */}
          {signPrefix(dailyTotal)}
          {fmt(dailyTotal)}원
        </strong>
      </div>

      {/* handleMemoChange로 상태 업데이트 */}
      <div className="expenseModal-memoBox">
        <label htmlFor="memo">메모</label>
        <textarea
          id="memo"
          placeholder="메모를 입력하세요"
          value={safeSets.memo}
          onChange={handleMemoChange}
          rows={4}
        />
      </div>
    </div>
  );
};

export default ExpenseModal;
