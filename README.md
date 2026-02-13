# Ruler

테이블탑 롤플레잉 게임 진행자 LLM과 커뮤니티 서비스

## 개발 환경

필수

- Node Js 24.11.1
- Docker

권장 설치 (문제 생기면 내가 확인 가능함)

- IDE : VS code
- DB GUI
  - MySql : HeidiSQL
  - MongoDB : Mongo Compass
  - Redis : Another Redis Desktop Manager or DB Gate

## 프로젝트 안내

### client : 서버에 접속하는 웹 프론트, 사용자 화면

React JS 기반.
Axios를 통한 서버 통신

### server : 실제 프로젝트 로직

Express 프레임워크 기반
HTTP 통신,

### redis : 레디스 캐시 설정 파일

## 개발 환경 설정 방법

### 클라이언트 실행

1. `\ruler-main\client` 경로 이동
2. `pnpm install` 로 디펜던시 설치
3. `pnpm run dev` 로 개발 모드 실행
4. `localhost:5173` 접속

### 데이터베이스 셋업

1. `\ruler-main` 프로젝트 루트 경로에서
2. `docker-compose up`

### 서버 실행

0. 데이터베이스 셋업이 완료 된 후.
1. `\ruler-main\server` 경로 이동
2. `pnpm install` 로 디펜던시 설치
3. `pnpm run migration:generate` 으로 mysql 데이터베이스 마이그레이션 지시 파일 생성
4. `pnpm run migration:run` 으로 mysql 데이터베이스 마이그레이션 진행
5. `pnpm run start:dev` 로 서버 실행
