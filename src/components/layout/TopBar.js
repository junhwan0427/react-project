import React, { useState, useEffect, useRef } from "react";
import "../../styles/layout/TopBar.css";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleBizDropdown,
  closeBizDropdown,
} from "../../store/slices/uiSlice";
import {
  switchBusiness,
  fetchMyBusinesses,
} from "../../store/slices/businessSlice";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const TopBar = ({ onMenuOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((s) => s.auth.user);
  const { list, currentId } = useSelector((s) => s.business);
  const { isBizDropdownOpen } = useSelector((s) => s.ui);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  const currentName =
    list.find((b) => b.id === currentId)?.name ||
    (user ? "사업장 선택" : "로그인이 필요합니다");

  // 최초 렌더 시 사업장 목록 로드
  useEffect(() => {
    if (user?.id) dispatch(fetchMyBusinesses(user.id));
  }, [user, dispatch]);

  // ESC 키로 닫기
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        dispatch(closeBizDropdown());
        setProfileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  // 바깥 클릭 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="topbar-root">
      <div className="topbar-left">
        <button
          className="topbar-hamburger"
          onClick={onMenuOpen}
          aria-label="메뉴 열기"
        >
          <span />
          <span />
          <span />
        </button>

        {user && (
          <div className="topbar-bizSelector">
            <button
              className="topbar-bizBtn"
              onClick={() => {
                if (user?.id) dispatch(fetchMyBusinesses(user.id));
                dispatch(toggleBizDropdown());
              }}
              aria-expanded={isBizDropdownOpen}
            >
              {currentName}
            </button>

            {isBizDropdownOpen && (
              <div
                className="topbar-bizDropdown"
                onMouseLeave={() => dispatch(closeBizDropdown())}
              >
                {list.length === 0 && (
                  <div className="topbar-bizEmpty">
                    등록된 사업장이 없습니다.
                    <div
                      className="topbar-bizLink"
                      onClick={() => {
                        dispatch(closeBizDropdown());
                        navigate("/business");
                      }}
                    >
                      + 사업장 등록하기
                    </div>
                  </div>
                )}

                {list.map((b) => (
                  <div
                    key={b.id}
                    className={`topbar-bizItem ${
                      b.id === currentId ? "active" : ""
                    }`}
                    onClick={() => {
                      dispatch(switchBusiness(b.id));
                      dispatch(closeBizDropdown());
                    }}
                  >
                    {b.name}
                  </div>
                ))}

                {list.length > 0 && (
                  <>
                    <div className="topbar-bizSep" />
                    <div
                      className="topbar-bizItem"
                      onClick={() => {
                        dispatch(closeBizDropdown());
                        navigate("/business");
                      }}
                    >
                      + 새 사업장 등록
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="topbar-right" ref={profileRef}>
        {!user ? (
          <button
            className="topbar-btn"
            onClick={() => navigate("/landing")}
          >
            로그인
          </button>
        ) : (
          <>
            <button
              className="topbar-btn"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
            >
              마이페이지
            </button>

            {profileMenuOpen && (
              <ul className="topbar-profileDropdown">
                <li>
                  <a onClick={() => navigate("/profile/edit")}>개인정보 수정</a>
                </li>
                <li>
                  <a onClick={() => navigate("/business/edit")}>업체 수정</a>
                </li>
                <li>
                  <a
                    onClick={async () => {
                      await supabase.auth.signOut();
                      navigate("/landing", { replace: true });
                    }}
                  >
                    로그아웃
                  </a>
                </li>
              </ul>
            )}
          </>
        )}
      </div>
    </header>
  );
};

export default TopBar;
