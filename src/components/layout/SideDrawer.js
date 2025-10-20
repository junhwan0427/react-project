import React from "react";
import "../../styles/layout/SideDrawer.css";
import { useNavigate } from "react-router-dom";

const SideDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();

  const go = (path) => {
    navigate(path);
    onClose?.();
  };

  return (
    <>
      <aside
        className={`sideDrawer-root ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="sideDrawer-head">
          <strong>메뉴</strong>
          <button
            className="sideDrawer-closeBtn"
            aria-label="메뉴 닫기"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <ul className="sideDrawer-navList">
          <li>
            <a onClick={() => go("/calendar")}>캘린더</a>
          </li>
          <li>
            <a onClick={() => go("/analysis")}>분석</a>
          </li>
          <li>
            <a onClick={() => go("/staff")}>직원 관리</a>
          </li>
        </ul>
      </aside>

      {open && <div className="sideDrawer-backdrop" onClick={onClose} />}
    </>
  );
};

export default SideDrawer;
