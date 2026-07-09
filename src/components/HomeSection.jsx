import { useMemo, useState } from "react";
import AllianceDetailModal from "./AllianceDetailModal";

const feedItems = [
  {
    id: 1,
    type: "quest",
    badge: "#1주일미션",
    title: "AI 고객 인터뷰 요약 랜딩페이지 제작",
    mission:
      "고객 인터뷰 20건을 기반으로 문제 정의와 가치 제안을 담은 랜딩페이지를 제작합니다.",
    period: "7일",
    reward: "800,000원 + 팀 합류 인터뷰 우선권",
    skills: ["React", "UX Writing", "Landing Page"],
  },
  {
    id: 2,
    type: "alliance",
    badge: "#정식합류",
    title: "B2B 세일즈 자동화 SaaS 초기 팀",
    name: "Loopdesk",
    vision:
      "반복적인 영업 리서치와 팔로업을 AI 에이전트로 자동화하는 제품을 만듭니다.",
    detailVision:
      "작은 팀도 엔터프라이즈 수준의 세일즈 운영을 할 수 있도록, 리드 발굴부터 첫 메일 작성, 후속 팔로업까지 하나의 흐름으로 자동화합니다.",
    roles: ["Frontend Engineer", "Growth Marketer"],
    equity: "2% - 6%",
    values: ["빠른 실험", "고객 집착", "투명한 커뮤니케이션"],
    members: [
      { name: "김도윤", role: "Founder / Product", status: "Full-time" },
      { name: "이지원", role: "Backend Engineer", status: "Part-time" },
      { name: "박서연", role: "Sales Advisor", status: "Advisor" },
    ],
    joinType: "1개월 협업 후 정식 합류 논의",
    workStyle: "Remote-first / 주 1회 오프라인",
  },
  {
    id: 3,
    type: "quest",
    badge: "#단기스프린트",
    title: "온보딩 퍼널 개선 프로토타입",
    mission:
      "가입 후 첫 핵심 행동까지의 이탈 구간을 줄이는 모바일 온보딩 플로우를 설계합니다.",
    period: "10일",
    reward: "1,200,000원 + 협업 평판 피드백",
    skills: ["Product Design", "Figma", "User Flow"],
  },
  {
    id: 4,
    type: "alliance",
    badge: "#공동창업",
    title: "크리에이터 CRM 플랫폼 공동창업자 모집",
    name: "CreatorOS",
    vision:
      "1인 창작자가 팬, 협찬, 콘텐츠 일정을 한곳에서 관리하는 운영 OS를 만듭니다.",
    detailVision:
      "콘텐츠 제작자가 브랜드 협찬, 팬 커뮤니티, 콘텐츠 캘린더를 따로 관리하지 않아도 되는 업무 허브를 만들고 있습니다.",
    roles: ["Full-stack Engineer", "Product Designer"],
    equity: "5% - 12%",
    values: ["작은 팀", "제품 중심", "장기적 신뢰"],
    members: [
      { name: "한유진", role: "Founder / Growth", status: "Full-time" },
      { name: "최민재", role: "Creator Advisor", status: "Advisor" },
    ],
    joinType: "팝업 미션 후 공동창업 논의",
    workStyle: "Hybrid / 서울 월 2회",
  },
  {
    id: 5,
    type: "quest",
    badge: "#1주일미션",
    title: "투자자용 데모 페이지 구현",
    mission:
      "시드 투자 미팅에 사용할 핵심 기능 중심의 인터랙티브 웹 데모를 구현합니다.",
    period: "6일",
    reward: "900,000원 + 후속 미션 제안",
    skills: ["Vite", "Tailwind CSS", "Prototype"],
  },
  {
    id: 6,
    type: "alliance",
    badge: "#정식합류",
    title: "AI 회의록 기반 지식관리 툴",
    name: "MeetMind",
    vision:
      "흩어진 회의 내용을 팀의 의사결정 자산으로 바꾸는 협업 지식관리 제품을 만듭니다.",
    detailVision:
      "회의록을 단순 저장하지 않고, 결정 사항과 액션 아이템을 팀 지식으로 연결하는 AI 워크스페이스를 지향합니다.",
    roles: ["Backend Engineer", "AI Engineer"],
    equity: "3% - 8%",
    values: ["문서화", "기술 깊이", "책임감"],
    members: [
      { name: "오세준", role: "Founder / AI Product", status: "Full-time" },
      { name: "정하린", role: "Design Partner", status: "Part-time" },
    ],
    joinType: "2주 테스트 협업 후 합류 논의",
    workStyle: "Remote / 비동기 중심",
  },
];

function HomeSection({ onMoveToQuest }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState(null);

  const filters = [
    { id: "all", label: "전체 보기" },
    { id: "quest", label: "팝업 미션만 보기" },
    { id: "alliance", label: "빌드업 팀 모집만 보기" },
  ];

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") {
      return feedItems;
    }

    return feedItems.filter((item) => item.type === activeFilter);
  }, [activeFilter]);

  return (
    <section className="min-h-screen px-5 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 border-b border-slate-200 pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 text-sm font-bold text-blue-600">
              Mission-based founder matching
            </p>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              짧게 함께 일해보고, 확신이 생기면 팀이 됩니다.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              gotchi는 단기 미션과 정식 팀 빌딩을 연결해, 말보다 실제 협업
              기록으로 좋은 팀을 찾게 돕습니다.
            </p>
          </div>

          <div className="flex w-full flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:w-auto">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.id;

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-slate-950 text-white shadow-md"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) =>
            item.type === "quest" ? (
              <QuestFeedCard key={item.id} item={item} />
            ) : (
              <AllianceFeedCard
                key={item.id}
                item={item}
                onOpen={() => setSelectedTeam(item)}
              />
            ),
          )}
        </div>
      </div>

      <AllianceDetailModal
        team={selectedTeam}
        isOpen={Boolean(selectedTeam)}
        onClose={() => setSelectedTeam(null)}
        onMoveToQuest={onMoveToQuest}
      />
    </section>
  );
}

function QuestFeedCard({ item }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:border-red-200 hover:shadow-xl hover:shadow-red-100/70">
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600 ring-1 ring-red-100">
          {item.badge}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
          Track A
        </span>
      </div>

      <h2 className="mt-5 text-xl font-black leading-snug text-slate-950">
        {item.title}
      </h2>

      <div className="mt-5 space-y-4">
        <InfoBlock label="해결이 필요한 구체적 미션" value={item.mission} />
        <InfoBlock label="기간" value={item.period} />
        <InfoBlock label="보상/리워드" value={item.reward} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {item.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500"
          >
            {skill}
          </span>
        ))}
      </div>

      <button className="mt-7 w-full rounded-2xl bg-red-500 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-red-600">
        미션 지원하기
      </button>
    </article>
  );
}

function AllianceFeedCard({ item, onOpen }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70">
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600 ring-1 ring-blue-100">
          {item.badge}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
          Track B
        </span>
      </div>

      <h2 className="mt-5 text-xl font-black leading-snug text-slate-950">
        {item.title}
      </h2>

      <div className="mt-5 space-y-4">
        <InfoBlock label="팀 비전" value={item.vision} />
        <InfoBlock label="구인 직군" value={item.roles.join(" · ")} />
        <InfoBlock label="제공 지분 범위" value={item.equity} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {item.values.map((value) => (
          <span
            key={value}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500"
          >
            {value}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="mt-7 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-blue-700"
      >
        팀 자세히 보기
      </button>
    </article>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

export default HomeSection;
