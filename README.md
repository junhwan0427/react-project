# 소상공인을 위한 달력 가계부 웹 애플리케이션

# 기획의도

- 현재 많은 개인 자영업자들은 일일 매출 및 지출 내역을 수기로 기록하거나 엑셀에 수동 입력하고 있습니다.
- 시간 소모가 크고, 데이터 누락 위험이 있는 방식을 개선하기 위해 간단하면서도 직관적인 <strong>'웹 기반 매출 관리 서비스’</strong >를 기획했습니다.

## 기대 효과

- **간단한 매출/지출 기록 가능**

  복잡한 회계 지식 없이도 달력만 클릭하면 매출/지출을 바로 기록하고 요약할 수 있도록 설계했습니다.

- **편리한 직원 관리 서비스 제공**

  사용자가 쉽게 직원을 등록 및 삭제가 가능하고, 등록된 직원을 검색 및 정렬해주는 기능을 제공합니다.

- **월별 지출 내역 시각화**

  월별로 어떤 항목에 지출을 많이 했는지 시각화해주는 편의 서비스를 제공합니다.

## **참고 사이트 및 차별점**

- 참고 사이트: [그랜터](https://granter.biz/ai-automation)
- 문제점: 회계 지식이 부족한 사용자가 활용하기 어려운 한계가 있습니다.
- 차별점: 익숙한 달력 형식에 가계부를 더해 직관적인 사용이 가능합니다.

---

# 팀원 및 역할 분담

|                                        한정연(팀장)                                        |                                           강진수                                           |                                           조준환                                           |
| :----------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------: |
| <img src="https://avatars.githubusercontent.com/u/131198770?v=4" alt="한정연" width="100"> | <img src="https://avatars.githubusercontent.com/u/238125879?v=4" alt="조준환" width="100"> | <img src="https://avatars.githubusercontent.com/u/213219013?v=4" alt="김진수" width="100"> |
|              메인, 분석 페이지 제작. Calendar, Modal, Layout components 제작.              |                직원 관리 페이지 제작. 무한 스크롤 적용. 전체 아이디어 제공                 |               로그인, 회원가입, 업체 관리 페이지 제작. Supabase 테이블 관리                |
|                            [GitHub](https://github.com/DOT-SOY)                            |                          [GitHub](https://github.com/shanekang1)                           |                          [GitHub](https://github.com/junhwan0427)                          |

# 주요 구현 기능

## CRUD

- 매출 및 직원정보 등록, 조회, 검색, 수정, 삭제 기능을 지원합니다.

## SPA(router)

- 필요한 데이터만 갱신해 더 나은 UX 제공을 위해 SPA환경을 구축했습니다.
- SPA 구성 (메인 | 업체관리 | 직원관리 | 회원정보 | 분석)

## 무한 스크롤

- 보이는 영역의 데이터만 랜더링해 성능을 최적화했습니다.
- 작동화면

  ![가상 스크롤 작동 화면](./imgs/scroll_gif.gif)

- 최적화 내용 (Render time: 441ms -> 2ms)

  ![가상 스크롤 최적화](./imgs/scroll_image.png)

## 코드스플리팅

- React의 lazy()와 Suspense를 각 페이지별로 적용해 로딩속도를 최적화했습니다.
- 최적화 내용 (Render time: 666ms -> 15ms)

  ![코드 스플리팅 최적화](./imgs/splitting_image.png)

## API 연동

- Supabase API를 사용해 데이터베이스와 로그인 인증 기능을 구현했습니다.
- Supabase DB 구조

  ![DB 구조](./imgs/erd.png)

## 반응형웹

- 반응형 UI로 구성되어 있어 PC/모바일 모두 대응 가능합니다.

  ![web](./imgs/web.gif)

# UI 및 상세 Flow 요약

## **메인 페이지**

> flow 요약: 메인 경로 진입 → useBusinessReload가 현재 사업장 ID 변경을 감지해 OwnCalendar를 재마운트 → useCalendarData가 사업장·기간 상태를 초기화하고 useRevenueFetch로 Supabase에서 범위 데이터를 로딩 → 날짜 클릭 시 하루 데이터를 조회해 모달을 열고, useRevenueSave가 입력값과 DB를 동기화해 합계·배지·모달 상태를 갱신

- 기간별 수익 조회
- 달력 클릭을 통한 매출 입력 가능

  ![main](./imgs/mainui.gif)

## **분석 페이지**

> flow 요약: 페이지 로드시 useBusinessReload가 사업장 전환을 감지 → useExpenseAnalysis가 해당 사업장의 월간 지출을 Supabase에서 조회·집계 → 카테고리별 합계·일자별 추이를 계산 → 로딩 이후 파이 차트와 라인 차트 컴포넌트에 데이터를 전달해 시각화 랜더링

- 항목/일자 별 지출 시각화 제공

  ![anal](./imgs/analui.gif)

## **로그인/회원가입**

> flow 요약: Supabase에서 ID/PW 검증 -> 실패 시 회원가입으로 전환 -> 회원가입 폼이 실시간 유효성 검사·중복 확인을 거쳐 Auth 계정과 profiles 레코드를 생성

- 사용자 인증
- 실시간 유효성 검사·중복 확인

  ![login](./imgs/loginui.gif)

## **직원 관리 페이지**

> flow 요약: BusinessId 변경 감지 → fetchStaff()로 Supabase 데이터 조회 → 검색/정렬/무한 스크롤로 리스트를 갱신하고, 추가·수정·삭제 시 Supabase와 동기화 후 목록을 재로딩 → 반응형 급여 표기와 TOP 버튼 등 UI 상태를 실시간 관리

- 직원 등록, 삭제, 수정, 검색 기능 지원
- 직원 정렬 및 필터링 기능 지원

![staff](./imgs/staffui.gif)

## **업체 관리 페이지**

> flow 요약: 인증 여부 확인 → 신규 사업장은 폼 값을 mapBusinessToRow로 변환해 Supabase 테이블에 저장 → 목록에서 고른 사업장을 수정해 같은 테이블로 업데이트 → 업체 전환에서 선택 ID가 바뀌면 useBusinessReload이 감지해 메인화면이 해당 ID기준으로 재랜더링

- 업체 등록, 수정, 전환 가능
- 업체 전환 시 해당 업체 데이터로 변경

![biz](./imgs/bizui.gif)

# Flow Chart

![flow](./imgs/flow_image.png)

# 개발 환경

<img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black">

<img src="https://img.shields.io/badge/supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=black">

<img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"> <img src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white"> <img src="https://img.shields.io/badge/css-1572B6?style=for-the-badge&logo=css3&logoColor=white">
