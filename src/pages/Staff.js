import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import "../styles/staffManager.css";
// import { useBusinessReload } from "../hooks/useBusinessReload";
import { useSelector } from "react-redux";

const Staff = () => {
  // 기본 급여 표시 (PC 등)
  const formatSalaryDefault = (value) => {
    if (!value) return "-";
    return value.toLocaleString("ko-KR") + "원";
  };

  // 모바일(600px 이하)일 때 "만원 단위"로 변환
  const formatSalaryMobile = (value, type) => {
    if (!value) return "-";
    const num = Number(value);

    // 월급인 경우만 "만원 단위"로 표시
    if (type === "월급" && num >= 10000) {
      const man = Math.floor(num / 10000);
      return `${man.toLocaleString("ko-KR")}만원`;
    }

    // 시급은 그대로 원 단위 유지
    return `${num.toLocaleString("ko-KR")}원`;
  };
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newRow, setNewRow] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("asc");

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  const observerRef = useRef(null);
  const inputRowRef = useRef(null);
  const nameInputRef = useRef(null);
  const PAGE_SIZE = 10;

  const reloadKey = null;
  const businessId = useSelector((s) => s.business.currentId);

  // 직원 목록 불러오기 (항상 전체 정렬 유지)
  const fetchStaff = async (reset = false) => {
    if (!businessId || loading) return;
    setLoading(true);

    const from = reset ? 0 : page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("business_id", businessId)
      .range(from, to);

    if (error) {
      console.error("❌ 데이터 불러오기 오류:", error);
      setLoading(false);
      return;
    }

    // 기존 데이터 유지 + 새로 가져온 데이터 추가
    const updatedList = reset ? data : [...staffList, ...data];

    // 항상 정렬 상태 유지
    const sortedList = [...updatedList].sort((a, b) => {
      const valA = a[sortField] ?? "";
      const valB = b[sortField] ?? "";
      if (!isNaN(valA) && !isNaN(valB)) {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }
      return sortOrder === "asc"
        ? String(valA).localeCompare(String(valB), "ko-KR")
        : String(valB).localeCompare(String(valA), "ko-KR");
    });

    setStaffList(sortedList);
    setHasMore(data.length >= PAGE_SIZE);
    setLoading(false);
  };

  // business 변경 시 초기화
  useEffect(() => {
    if (businessId) {
      setPage(0);
      setHasMore(true);
      fetchStaff(true);
    }
  }, [businessId, reloadKey]);

  // 무한 스크롤 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 0) fetchStaff();
  }, [page]);

  // 창 크기 변화 감지해서 실시간 반응형 처리
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // TOP 버튼 감지
  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTop = () => window.scrollTo({ top: 0, behavior: "auto" });

  // 정렬 클릭 시 — 전체 데이터 유지 + 무한스크롤 영향 없음
  const handleSort = async (field) => {
    setEditId(null);
    setNewRow(null);

    let newOrder = "asc";
    if (sortField === field && sortOrder === "asc") newOrder = "desc";
    const currentScroll = window.scrollY;
    setSortField(field);
    setSortOrder(newOrder);

    await new Promise((resolve) => setTimeout(resolve, 50));

    // 기존 staffList 전체 재정렬 (fetchStaff 재호출 안함)
    setStaffList((prev) => {
      const sorted = [...prev].sort((a, b) => {
        const valA = a[field] ?? "";
        const valB = b[field] ?? "";
        if (!isNaN(valA) && !isNaN(valB)) {
          return newOrder === "asc" ? valA - valB : valB - valA;
        }
        return newOrder === "asc"
          ? String(valA).localeCompare(String(valB), "ko-KR")
          : String(valB).localeCompare(String(valA), "ko-KR");
      });
      return sorted;
    });

    window.scrollTo({ top: currentScroll, behavior: "smooth" });
  };

  // 인원 추가
  const handleAddRow = () => {
    setEditId(null);
    setNewRow({
      name: "",
      gender: "남",
      age: "",
      phone: "",
      pay_type: "시급",
      wage: "",
    });
    setTimeout(() => {
      inputRowRef.current?.scrollIntoView({
        behavior: "auto",
        block: "center",
      });
      nameInputRef.current?.focus();
    }, 100);
  };

  const handleChange = (e) =>
    setNewRow((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // 저장
  const handleSave = async () => {
    if (!newRow.name || !newRow.age || !newRow.phone || !newRow.wage)
      return alert("모든 항목을 입력해주세요.");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return alert("로그인이 필요합니다.");

    const { data: existing } = await supabase
      .from("staff")
      .select("id")
      .eq("business_id", businessId)
      .eq("name", newRow.name)
      .eq("phone", newRow.phone);

    if (existing?.length > 0)
      return alert("⚠️ 동일한 이름과 연락처의 직원이 이미 등록되어 있습니다!");

    const { error } = await supabase.from("staff").insert([
      {
        owner_id: user.id,
        business_id: businessId,
        name: newRow.name,
        gender: newRow.gender,
        age: parseInt(newRow.age, 10),
        phone: newRow.phone,
        pay_type: newRow.pay_type,
        wage: parseInt(newRow.wage, 10),
      },
    ]);
    if (error) alert("등록 실패 ❌: " + error.message);
    else {
      alert("등록 완료 ✅");
      setNewRow(null);

      // 무한스크롤 관련 상태 초기화
      setPage(0);
      setHasMore(true);

      // 데이터 새로 불러오기 (최신순)
      await fetchStaff(true);

      // 스크롤 다시 활성화 (observer 재연결용)
      setTimeout(() => {
        if (observerRef.current) {
          observerRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      }, 200);
    }
  };

  // 수정
  const handleEdit = (staff) => {
    setNewRow(null);
    setEditId(staff.id);
    setEditData({ ...staff });
  };

  // 수정 저장
  const handleEditSave = async () => {
    const { error } = await supabase
      .from("staff")
      .update({
        name: editData.name,
        gender: editData.gender,
        age: parseInt(editData.age, 10),
        phone: editData.phone,
        pay_type: editData.pay_type,
        wage: parseInt(editData.wage, 10),
      })
      .eq("id", editId);

    if (error) {
      alert("수정 실패 ❌: " + error.message);
    } else {
      alert("수정 완료 ✅");
      setEditId(null);

      // 페이지 리셋 & 스크롤 맨 위로 이동
      setPage(0);
      window.scrollTo({ top: 0, behavior: "smooth" });

      // 전체 데이터 새로 불러오기
      await fetchStaff(true);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`"${name}" 직원을 삭제하시겠습니까?`)) {
      const { error } = await supabase.from("staff").delete().eq("id", id);
      if (error) alert("삭제 실패 ❌: " + error.message);
      else {
        alert("삭제 완료 ✅");
        fetchStaff(true);
      }
    }
  };

  const filteredStaff = staffList.filter((s) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderSortBtn = (field) => (
    <button
      className={`sort-btn ${sortField === field ? sortOrder : ""}`}
      onClick={() => handleSort(field)}
    >
      {sortField === field ? (sortOrder === "asc" ? "▲" : "▼") : "⇅"}
    </button>
  );

  return (
    <div className="main-content">
      {/* 광고 배너 */}
      <div className="top-ad-banner">
        <a
          href="https://www.alba.co.kr"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/ads/배너1.png" alt="알바천국" className="ad-img alba" />
        </a>
        <a
          href="https://www.albamon.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/ads/배너2.png" alt="알바몬" className="ad-img mon" />
        </a>
      </div>

      <div className="topbar2">
        <h1>직원(알바)관리 페이지</h1>
      </div>

      {/* 검색 + 추가 */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="직원/알바 검색하기"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="register-btn" onClick={handleAddRow}>
          + 인원 추가
        </button>
      </div>

      {/* 테이블 */}
      <table className="staff-table">
        <thead>
          <tr>
            <th>이름 {renderSortBtn("name")}</th>
            <th>성별 {renderSortBtn("gender")}</th>
            <th>나이 {renderSortBtn("age")}</th>
            <th>연락처</th>
            <th>근무형태 {renderSortBtn("pay_type")}</th>
            <th>급여 {renderSortBtn("wage")}</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {newRow && (
            <tr className="edit-row" ref={inputRowRef}>
              <td>
                <input
                  ref={nameInputRef}
                  name="name"
                  value={newRow.name}
                  onChange={handleChange}
                />
              </td>
              <td>
                <select
                  name="gender"
                  value={newRow.gender}
                  onChange={handleChange}
                >
                  <option value="남">남</option>
                  <option value="여">여</option>
                </select>
              </td>
              <td>
                <input
                  name="age"
                  type="number"
                  value={newRow.age}
                  onChange={handleChange}
                />
              </td>
              <td>
                <input
                  name="phone"
                  value={newRow.phone}
                  onChange={handleChange}
                />
              </td>
              <td>
                <select
                  name="pay_type"
                  value={newRow.pay_type}
                  onChange={handleChange}
                >
                  <option value="시급">시급</option>
                  <option value="월급">월급</option>
                </select>
              </td>
              <td>
                <input
                  name="wage"
                  type="number"
                  value={newRow.wage}
                  onChange={handleChange}
                />
              </td>
              <td>
                <button className="save-btn" onClick={handleSave}>
                  저장
                </button>
                <button className="cancel-btn" onClick={() => setNewRow(null)}>
                  취소
                </button>
              </td>
            </tr>
          )}

          {filteredStaff.length > 0 ? (
            filteredStaff.map((s) =>
              editId === s.id ? (
                <tr key={s.id} className="edit-row">
                  <td>
                    <input
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={editData.gender}
                      onChange={(e) =>
                        setEditData({ ...editData, gender: e.target.value })
                      }
                    >
                      <option value="남">남</option>
                      <option value="여">여</option>
                    </select>
                  </td>
                  <td>
                    <input
                      value={editData.age}
                      onChange={(e) =>
                        setEditData({ ...editData, age: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={editData.phone}
                      onChange={(e) =>
                        setEditData({ ...editData, phone: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={editData.pay_type}
                      onChange={(e) =>
                        setEditData({ ...editData, pay_type: e.target.value })
                      }
                    >
                      <option value="시급">시급</option>
                      <option value="월급">월급</option>
                    </select>
                  </td>
                  <td>
                    <input
                      value={editData.wage}
                      onChange={(e) =>
                        setEditData({ ...editData, wage: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <button className="save-btn" onClick={handleEditSave}>
                      저장
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => setEditId(null)}
                    >
                      취소
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.gender}</td>
                  <td>{s.age}</td>
                  <td>{s.phone}</td>
                  <td>{s.pay_type}</td>
                  <td>
                    {window.innerWidth <= 600
                      ? formatSalaryMobile(s.wage, s.pay_type)
                      : formatSalaryDefault(s.wage)}
                  </td>

                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(s)}>
                      수정
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(s.id, s.name)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              )
            )
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", color: "#777" }}>
                등록된 직원이 없습니다.
              </td>
            </tr>
          )}
          <tr ref={observerRef}></tr>
        </tbody>
      </table>

      {loading && <p style={{ textAlign: "center" }}>불러오는 중...</p>}

      {showTopBtn && (
        <button className="scroll-top-btn" onClick={handleScrollTop}>
          ▲ TOP
        </button>
      )}
    </div>
  );
};

export default Staff;
