import { useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { getMonthRange, isWithinAllowedRange, groupByDate } from "./utils/dateUtils";

/**
 * Passive Effects 최적화 버전 (Chunked State 중심)
 * - Supabase 데이터를 불러와 groupByDate로 그룹화
 * - setExpensesByDate는 chunk 단위로 나눠서 적용
 * - UI 렉 없이 대량 데이터 처리
 */
export const useRevenueFetch = (
  businessId,
  { filterMode, rangeStart, rangeEnd, activeStartDate, setExpensesByDate }
) => {
  const fetchRevenueData = useCallback(async () => {
    if (!businessId) return;

    let start, end;
    if (filterMode === "range" && rangeStart && rangeEnd) {
      if (!isWithinAllowedRange(rangeStart, rangeEnd)) {
        alert("조회는 저번 달부터 이번 달까지만 가능합니다.");
        return;
      }
      start = rangeStart;
      end = rangeEnd;
    } else {
      ({ start, end } = getMonthRange(activeStartDate));
    }

    try {
      // Supabase 데이터 불러오기
      const { data, error } = await supabase
        .from("revenue")
        .select("*")
        .eq("business_id", businessId)
        .gte("date", start)
        .lte("date", end);

      if (error) throw error;
      if (!data || data.length === 0) {
        setExpensesByDate({});
        return;
      }

      // groupByDate (동기 처리)
      const grouped = groupByDate(data);

      // Chunk 단위로 setExpensesByDate 호출
      const entries = Object.entries(grouped);
      const chunkSize = 3000;
      let chunkIndex = 0;

      // 기존 데이터 초기화
      setExpensesByDate({});

      const applyChunks = async () => {
        while (chunkIndex < entries.length) {
          const slice = entries.slice(chunkIndex, chunkIndex + chunkSize);

          // 이전 데이터에 병합
          setExpensesByDate((prev) => ({
            ...prev,
            ...Object.fromEntries(slice),
          }));

          chunkIndex += chunkSize;

          // 다음 chunk 업데이트 전 잠깐 대기 → 렌더링 프리즈 방지
          await new Promise((r) => setTimeout(r, 16));
        }
      };

      await applyChunks();
    } catch (err) {
      alert("데이터 불러오는 중 오류가 발생했습니다.");
    }
  }, [
    businessId,
    filterMode,
    rangeStart,
    rangeEnd,
    activeStartDate,
    setExpensesByDate,
  ]);

  return { fetchRevenueData };
};
