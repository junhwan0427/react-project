import React from "react";
import moment from "moment";
import Calendar from "react-calendar";
import "../../styles/pages/CalendarStyle.css";
import Modal from "../Modal";
import ExpenseModal from "../expenseModal/ExpenseModal";

// 데이터 상태 관리, 서버 I/O, 합계 계산, 모달 열고 닫기 등
import { useCalendarData } from "./useCalendarData";

// 숫자 포매팅(fmt)과 부호(양수/음수)에 따라 색을 결정하는 유틸
import { fmt, signColor } from "./CalendarUtils";

const OwnCalendar = () => {
  const {
    date,
    activeStartDate,
    setActiveStartDate,
    handleDayClick, // 날짜 타일 클릭했을 때 호출되는 핸들러
    handleTodayClick,// 오늘 버튼 클릭시 이동
    filterMode, // 상단 필터링 모드
    setFilterMode,
    rangeStart, // 사용자 정의 기간 시작일
    rangeEnd, // 사용자 정의 기간 종료일
    setRangeStart,
    setRangeEnd,
    displayedTotal, // 범위 내 합계
    isModalOpen,
    closeModal,
    expenseSets,
    setExpenseSets,
    saveExpense, // 모달 등록버튼 누를시 호출
    selectedDate,
    businessId,
    getDailySum,
  } = useCalendarData();


  const handleRangeChange = (type, value) => {
    if (type === "start") {
      // 시작일 갱신
      setRangeStart(value);

      // 종료일이 이미 있고, 둘 다 유효한 날짜일 때만 유효성 검사
      if (rangeEnd && moment(value).isValid() && moment(rangeEnd).isValid()) {
        const diff = moment(rangeEnd).diff(moment(value), "days");
        if (diff > 31) {
          alert("선택 가능한 최대 기간은 31일입니다.");
          // 시작일을 기준으로 정확히 31일 뒤로 종료일 보정
          setRangeEnd(moment(value).add(31, "days").format("YYYY-MM-DD"));
        }
      }
    } else if (type === "end") {
      // 종료일 갱신
      setRangeEnd(value);

      // 시작일이 이미 있고, 둘 다 유효한 날짜일 때만 유효성 검사
      if (rangeStart && moment(rangeStart).isValid() && moment(value).isValid()) {
        const diff = moment(value).diff(moment(rangeStart), "days");
        if (diff > 31) {
          alert("선택 가능한 최대 기간은 31일입니다.");
          // 종료일을 기준으로 정확히 31일 전으로 시작일 보정
          setRangeStart(moment(value).subtract(31, "days").format("YYYY-MM-DD"));
        }
      }
    }
  };

  return (
    <div className="calendar-wrapper">
      <div className="calendar-filter-bar">
        <div className="calendar-filter-segment">
          {/* 라디오 버튼: "이번 달" */}
          <label>
            <input
              type="radio"
              name="filter"
              checked={filterMode === "month"}
              onChange={() => setFilterMode("month")} // 모드 전환 시 훅이 내부 쿼리/합계 범위를 갱신
            />
            <span>이번 달</span>
          </label>

          {/* 라디오 버튼: "기간 선택" */}
          <label>
            <input
              type="radio"
              name="filter"
              checked={filterMode === "range"}
              onChange={() => setFilterMode("range")}
            />
            <span>기간 선택</span>
          </label>
        </div>

        {/* 기간 모드일 때만 시작/종료 입력창 노출 */}
        {filterMode === "range" && (
          <div className="calendar-filter-range">
            {/* 시작일 입력: 오늘 이후는 선택 불가(max=오늘) */}
            <input
              type="date"
              value={rangeStart}
              max={moment().format("YYYY-MM-DD")}
              onChange={(e) => handleRangeChange("start", e.target.value)}
            />
            <span>~</span>
            {/* 종료일 입력: 오늘 이후는 선택 불가(max=오늘) */}
            <input
              type="date"
              value={rangeEnd}
              max={moment().format("YYYY-MM-DD")}
              onChange={(e) => handleRangeChange("end", e.target.value)}
            />
          </div>
        )}
      </div>

      <Calendar
        value={date}
        onClickDay={handleDayClick}
        formatDay={(_, d) => moment(d).format("D")}
        formatMonthYear={(_, d) => moment(d).format("YYYY. MM")} // 상단 월 타이틀
        formatShortWeekday={(_, d) => moment(d).format("ddd")} //요일
        calendarType="gregory"
        showNeighboringMonth
        next2Label={null} // 연 단위 이동 숨김
        prev2Label={null}
        minDetail="year"
        activeStartDate={activeStartDate}
        onActiveStartDateChange={({ activeStartDate }) =>
          setActiveStartDate(activeStartDate)
        }
        tileContent={({ date, view }) => {
          const key = moment(date).format("YYYY-MM-DD");
          const sum = getDailySum(key);
          if (view !== "month") return null;

          return (
            <>
              {sum !== 0 && (
                <>
                  {/* 점 표시 */}
                  <div
                    className="calendar-dot"
                    style={{ backgroundColor: signColor(sum) }}
                  />
                  {/* 금액 배지 */}
                  <div
                    className="calendar-amount-badge"
                    style={{ color: signColor(sum) }}
                  >
                    {sum > 0 ? "+" : ""}
                    {fmt(sum)}
                  </div>
                </>
              )}
            </>
          );
        }}
      />

      <button className="calendar-today-btn" onClick={handleTodayClick}>
        Today
      </button>

      <div
        className="calendar-total-float"
        style={{ color: signColor(displayedTotal) }}
      >
        총계 {displayedTotal > 0 ? "+" : ""}
        {fmt(displayedTotal)}원
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          selectedDate
            ? moment(selectedDate).format("YYYY년 MM월 DD일")
            : "지출/수익 입력"
        }
      >
        <ExpenseModal
          {...{
            businessId,     // 사업장 구분용(서버 I/O에 필요)
            expenseSets,    // 폼에 표시할 항목 배열
            setExpenseSets, // 폼 내부 상태 변경 시 상위로 반영
            onSave: saveExpense, // 저장 버튼 → 서버 반영 + 로컬 갱신
            onClose: closeModal, // 취소/닫기
            selectedDate,   // 모달 상단에 표시할 기준 날짜
          }}
        />
      </Modal>
    </div>
  );
};

export default OwnCalendar;
