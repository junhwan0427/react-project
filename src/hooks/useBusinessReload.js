import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

/**
 현재 사업장 ID를 감지
 바뀔 때마다 강제로 컴포넌트를 다시 렌더링
 **/
export const useBusinessReload = () => {
  const currentId = useSelector((state) => state.business.currentId);
  const [reloadKey, setReloadKey] = useState(currentId);

  // 사업장이 바뀔 때마다 key 갱신
  useEffect(() => {
    if (currentId) setReloadKey(currentId);
  }, [currentId]);

  return reloadKey;
};
