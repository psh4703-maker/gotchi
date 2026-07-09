const completedMissions = [
  {
    id: 1,
    title: "AI SaaS 랜딩페이지 7일 스프린트",
    role: "UI/UX Design",
    result: "랜딩페이지 IA, 와이어프레임, Figma 컴포넌트 시스템 제작",
    date: "2026.06",
  },
  {
    id: 2,
    title: "온보딩 퍼널 개선 프로토타입",
    role: "Product Design",
    result: "가입 후 첫 행동까지의 모바일 온보딩 플로우 개선",
    date: "2026.05",
  },
  {
    id: 3,
    title: "투자자용 데모 페이지 디자인",
    role: "Interaction Design",
    result: "시드 투자 미팅용 인터랙티브 데모 화면 설계",
    date: "2026.04",
  },
];

const reputationFeedback = [
  {
    id: 1,
    reviewer: "실명 인증 동료",
    mission: "AI SaaS 랜딩페이지 7일 스프린트",
    tags: ["#마감일을_칼같이_지켜요", "#Figma_컴포넌트_장인"],
    review:
      "이 분은 문제 정의가 명확하고 1주일 스프린트 기간 동안 Figma 컴포넌트화를 완벽하게 처리해주어 팀의 속도를 2배 올렸습니다.",
  },
  {
    id: 2,
    reviewer: "익명 팀원",
    mission: "온보딩 퍼널 개선 프로토타입",
    tags: ["#사용자_관점이_날카로워요", "#커뮤니케이션이_깔끔해요"],
    review:
      "처음에는 요구사항이 꽤 모호했는데, 핵심 사용자 행동을 빠르게 정리해주고 플로우별 우선순위를 명확하게 잡아줬습니다.",
  },
  {
    id: 3,
    reviewer: "실명 인증 PM",
    mission: "투자자용 데모 페이지 디자인",
    tags: ["#밤샘에도_지치지_않는_텐션", "#디테일이_살아있어요"],
    review:
      "짧은 일정이었는데도 끝까지 텐션을 잃지 않고 인터랙션 디테일을 챙겨줬습니다. 덕분에 데모의 완성도가 훨씬 좋아졌습니다.",
  },
  {
    id: 4,
    reviewer: "익명 개발자",
    mission: "크리에이터 CRM MVP 개선",
    tags: ["#코드_가독성이_예술", "#개발자와_협업이_편해요"],
    review:
      "디자인 산출물이 개발자가 바로 이해할 수 있게 정리되어 있었습니다. 컴포넌트 상태, 예외 케이스, 반응형 기준까지 꼼꼼했습니다.",
  },
];

function PortfolioSection() {
  const trustScore = 98;
  const trustRingStyle = {
    background: `conic-gradient(#2563eb ${trustScore * 3.6}deg, #e2e8f0 0deg)`,
  };

  return (
    <section className="min-h-screen px-5 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-6 py-8 text-white sm:px-8">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-2xl font-black text-slate-950 shadow-lg">
                  JY
                </div>

                <div>
                  <p className="text-sm font-bold text-blue-200">
                    Verified Collaboration Portfolio
                  </p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                    정지윤
                  </h1>
                  <p className="mt-2 text-sm font-medium text-slate-300">
                    UI/UX 디자이너 · Product Designer
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <ProfileBadge label="Figma" />
                    <ProfileBadge label="Design System" />
                    <ProfileBadge label="Sprint UX" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-5 rounded-3xl bg-white/10 p-5 backdrop-blur">
                <div
                  className="flex h-28 w-28 items-center justify-center rounded-full"
                  style={trustRingStyle}
                  aria-label={`매칭 신뢰 지수 ${trustScore}점`}
                >
                  <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-slate-950">
                    <span className="text-2xl font-black text-white">
                      {trustScore}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      /100
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-blue-200">
                    매칭 신뢰 지수
                  </p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-300">
                    완료 미션, 동료 피드백, 재협업 요청률을 기반으로 계산된
                    협업 신뢰도입니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="완료한 팝업 미션" value="12" caption="최근 6개월 기준" />
            <StatCard label="정식 매칭 횟수" value="3" caption="팀 합류 또는 장기 협업" />
            <StatCard label="평균 만족도" value="4.9" caption="동료 리뷰 기반" />
            <StatCard label="재협업 요청률" value="87%" caption="미션 종료 후 요청" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-black text-slate-500">
                Mission History
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                완료한 팝업 미션
              </h2>

              <div className="mt-6 space-y-4">
                {completedMissions.map((mission) => (
                  <MissionCard key={mission.id} mission={mission} />
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-black text-slate-500">
                Collaboration Style
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                자주 언급된 강점
              </h2>

              <div className="mt-6 flex flex-wrap gap-2">
                <KeywordBadge label="#마감일을_칼같이_지켜요" />
                <KeywordBadge label="#문제정의가_명확해요" />
                <KeywordBadge label="#팀의_속도를_올려요" />
                <KeywordBadge label="#개발자와_협업이_편해요" />
                <KeywordBadge label="#Figma_컴포넌트_장인" />
              </div>
            </div>
          </aside>

          <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-200 pb-5">
              <p className="text-sm font-black text-blue-600">
                Peer Reputation
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                동료들의 찐 평판 피드백
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                미션이 끝난 뒤 함께 일한 팀원들이 남긴 협업 스타일 리뷰입니다.
              </p>
            </div>

            <div className="mt-6 max-h-[650px] space-y-4 overflow-y-auto pr-2">
              {reputationFeedback.map((feedback) => (
                <FeedbackCard key={feedback.id} feedback={feedback} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}

function ProfileBadge({ label }) {
  return (
    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-blue-100 ring-1 ring-white/15">
      {label}
    </span>
  );
}

function StatCard({ label, value, caption }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-black text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-black tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-xs font-bold text-slate-400">{caption}</p>
    </div>
  );
}

function MissionCard({ mission }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/40">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-sm font-black leading-6 text-slate-950">
          {mission.title}
        </h3>
        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
          {mission.date}
        </span>
      </div>
      <p className="mt-3 text-xs font-black text-blue-600">{mission.role}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{mission.result}</p>
    </article>
  );
}

function KeywordBadge({ label }) {
  return (
    <span className="rounded-full bg-slate-950 px-3 py-2 text-xs font-black text-white shadow-sm">
      {label}
    </span>
  );
}

function FeedbackCard({ feedback }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-blue-100">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-black text-slate-950">
            {feedback.reviewer}
          </p>
          <p className="mt-1 text-xs font-bold text-slate-500">
            {feedback.mission}
          </p>
        </div>

        <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">
          Mission Closed
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {feedback.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-black text-blue-600"
          >
            {tag}
          </span>
        ))}
      </div>

      <p className="mt-5 rounded-2xl bg-white p-4 text-sm leading-7 text-slate-700 ring-1 ring-slate-200">
        "{feedback.review}"
      </p>
    </article>
  );
}

export default PortfolioSection;
