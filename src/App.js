import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, Suspense, lazy } from "react";
import AppBoot from "./components/AppBoot";
import Layout from "./components/layout/Layout";
import "./styles/theme.css"; // 테마 색상 및 공통 변수 CSS
import "./styles/common.css"; // 공통 스타일(폰트, 레이아웃 기본값 등)

// React.lazy로 각 페이지 컴포넌트를 비동기로 import
const Main = lazy(() => import("./pages/Main"));
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Business = lazy(() => import("./pages/Business"));
const BusinessEdit = lazy(() => import("./pages/BusinessEdit"));
const BusinessSwitch = lazy(() => import("./pages/BusinessSwitch"));
const Staff = lazy(() => import("./pages/Staff"));
const ProfileReauth = lazy(() => import("./pages/ProfileReauth"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const ExpenseAnalysis = lazy(() => import("./pages/ExpenseAnalysis"));


export default function App() {
  // 현재 URL 정보를 가져오기 (react-router-dom 훅)
  // 현재 페이지의 경로(location.pathname)를 기반으로
  // 메뉴 표시 여부, 경로 조건 등에 활용
  const location = useLocation();

  // 메뉴(사이드드로어 등) 열림 상태를 관리하는 state
  const [menuOpen, setMenuOpen] = useState(false);

  // 메뉴를 감추고 싶은 페이지 경로 지정
  const hideMenuPaths = ["/login", "/landing"];

  // 현재 경로가 위 배열에 포함되면 메뉴 감춤 플래그 true
  const shouldHideMenu = hideMenuPaths.includes(location.pathname);

  // ───────────────────────────────────────────────────────────────
  // Suspense: lazy 로딩 중일 때 Fallback UI(로딩 표시)를 보여줌
  // → Lazy 컴포넌트가 실제로 import될 때까지 “로딩 중...” 표시
  // ───────────────────────────────────────────────────────────────
  return (
    <div>
      <AppBoot />

      <Suspense>
        {/* - 앱의 모든 URL 경로를 정의하는 최상위 라우팅 영역*/}
        <Routes>
          {/* 상단 메뉴 (layout) 없는 페이지 */}
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* 상단메뉴 있는 페이지*/}
          <Route
            element={
              !shouldHideMenu && (
                <Layout
                  // 메뉴(햄버거 버튼 등) 열기 콜백
                  onMenuOpen={() => setMenuOpen(true)}
                  // 현재 열림 상태 (드로어 컴포넌트 제어)
                  menuOpen={menuOpen}
                  // 닫기 콜백 (오버레이 클릭 시)
                  onClose={() => setMenuOpen(false)}
                />
              )
            }
          >
            {/* 
              Layout 안에서 보여질 실제 페이지 라우트들
              (즉, 공통 상단바/사이드메뉴가 함께 렌더링됨)
            */}
            <Route path="/" element={<Main />} />                       {/* 대시보드 */}
            <Route path="/business" element={<Business />} />            {/* 사업장 등록/리스트 */}
            <Route path="/business/edit" element={<BusinessEdit />} />   {/* 사업장 수정 */}
            <Route path="/business/switch" element={<BusinessSwitch />} />{/* 사업장 전환 */}
            <Route path="/staff" element={<Staff />} />                  {/* 직원 관리 */}
            <Route path="/profile/reauth" element={<ProfileReauth />} /> {/* 프로필 재인증 */}
            <Route path="/profile/edit" element={<ProfileEdit />} />     {/* 프로필 수정 */}
            <Route path="/analysis" element={<ExpenseAnalysis />} />     {/* 지출 분석 */}
          </Route>

          {/* 404 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}
