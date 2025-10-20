import React from "react";
import styled from "styled-components";
import OwnCalendar from "../components/calendar/OwnCalendar";
import { useBusinessReload } from "../hooks/useBusinessReload";

function Main() {
  const reloadKey = useBusinessReload(); // 사업장 변경 감지
  return (
    <OwnCalendar key={reloadKey} />
  );
}

export default Main;
