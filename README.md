# gotchi

gotchi는 단기 팝업 미션으로 먼저 함께 일해보고, 확신이 생기면 정식 스타트업 팀 빌딩으로 이어지는 투 트랙 매칭 플랫폼 프로토타입입니다.

## 로컬 실행

```bash
pnpm install
pnpm dev
```

브라우저에서 아래 주소를 엽니다.

```txt
http://127.0.0.1:5173
```

## 정식 사이트로 배포하기

가장 쉬운 방법은 GitHub에 이 프로젝트를 올린 뒤 Vercel에 연결하는 것입니다.

1. GitHub에서 `gotchi`라는 새 저장소를 만듭니다.
2. 이 프로젝트 폴더에서 GitHub 저장소 주소를 연결합니다.
3. 코드를 GitHub로 올립니다.
4. Vercel에서 `New Project`를 누르고 GitHub의 `gotchi` 저장소를 선택합니다.
5. 기본 설정 그대로 `Deploy`를 누릅니다.

Vercel 설정값은 보통 자동으로 잡힙니다.

```txt
Framework Preset: Vite
Build Command: pnpm build
Output Directory: dist
Install Command: pnpm install
```

## 주요 화면

- Home: 팝업 미션과 빌드업 팀 모집 피드
- Quest: 단기 미션 탐색
- Alliance: 정식 팀 모집 탐색
- My Portfolio: 완료 미션과 동료 평판 피드백 대시보드
