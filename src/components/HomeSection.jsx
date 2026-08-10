import { useMemo, useState } from "react";
import Avatar from "./Avatar";

const CATEGORIES = [
  "Featured",
  "Web developers",
  "Content creators",
  "Graphic designers",
  "Product designers",
  "AI developers",
  "Social media marketers",
];

const FALLBACK_TALENTS = [
  {
    id: "fallback-design",
    display_name: "민서",
    role: "Product Designer",
    bio: "랜딩페이지와 프로토타입을 빠르게 정리하는 디자이너",
    skills: ["Figma", "UX 설계", "브랜딩"],
  },
  {
    id: "fallback-dev",
    display_name: "도윤",
    role: "Frontend Developer",
    bio: "React 기반 MVP 구현과 Supabase 연동에 익숙합니다",
    skills: ["React", "Tailwind", "Supabase"],
  },
  {
    id: "fallback-growth",
    display_name: "서연",
    role: "Growth Marketer",
    bio: "초기 고객 인터뷰와 콘텐츠 실험을 설계합니다",
    skills: ["콘텐츠", "SEO", "고객 인터뷰"],
  },
];

const TOPIC_STYLES = [
  "from-[#ff3b12] to-[#ff5f2f]",
  "from-slate-950 to-slate-700",
  "from-[#4b6b70] to-[#8aa09a]",
  "from-[#1d8dff] to-[#5967ff]",
  "from-[#101827] to-[#2d3748]",
];

function HomeSection({ quests, freelancers, applications, onCreateQuest, onSelectQuest, onSelectFreelancer }) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [viewMode, setViewMode] = useState("projects");
  const [category, setCategory] = useState("Featured");

  const normalizedQuery = query.trim().toLowerCase();
  const spotlightFreelancers = (freelancers?.length ? freelancers : FALLBACK_TALENTS).slice(0, 8);

  const filteredQuests = useMemo(() => {
    return quests
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .filter((quest) => {
        if (!normalizedQuery) return true;
        const haystack = [quest.title, quest.mission, quest.reward, ...(quest.skills ?? [])].join(" ").toLowerCase();
        return haystack.includes(normalizedQuery);
      });
  }, [normalizedQuery, quests]);

  const filteredFreelancers = useMemo(() => {
    return spotlightFreelancers.filter((person) => {
      if (!normalizedQuery) return true;
      const haystack = [person.display_name, person.role, person.bio, ...(person.skills ?? [])].join(" ").toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, spotlightFreelancers]);

  const visibleQuests = filteredQuests.slice(0, visibleCount);
  const hasMore = filteredQuests.length > visibleCount;

  return (
    <section className="min-h-screen px-5 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col items-center text-center">
          <p className="mb-3 text-sm font-bold text-[#1B1F4D]">Real founder matching</p>
          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            먼저 일해보고, 나중에 동행하세요
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            단기 미션, 프리랜서 탐색, 정식 팀 빌딩까지 한 화면에서 시작하세요.
          </p>
          <button
            type="button"
            onClick={onCreateQuest}
            className="mt-7 rounded-2xl bg-[#1B1F4D] px-6 py-3 text-sm font-black text-white shadow-[0_14px_24px_-10px_rgba(27,31,77,0.45)] transition hover:bg-[#262B63] active:scale-[0.98]"
          >
            미션 올리기
          </button>
        </div>

        <div className="relative mb-6">
          <svg
            className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(6);
            }}
            placeholder="미션, 사람, 역량으로 검색"
            className="w-full rounded-full border border-slate-200/80 bg-white py-3.5 pl-12 pr-5 text-sm text-slate-800 shadow-[0_12px_28px_-14px_rgba(27,31,77,0.25)] outline-none transition focus:border-[#1B1F4D]/30 focus:shadow-[0_16px_32px_-14px_rgba(27,31,77,0.35)] focus:ring-4 focus:ring-[#1B1F4D]/10"
          />
        </div>

        <TrendingFreelancers freelancers={spotlightFreelancers} onSelectFreelancer={onSelectFreelancer} />

        <div className="mt-12 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="glass-pill inline-flex w-fit rounded-2xl p-1.5">
            <SegmentButton active={viewMode === "projects"} onClick={() => setViewMode("projects")}>
              Projects
            </SegmentButton>
            <SegmentButton active={viewMode === "people"} onClick={() => setViewMode("people")}>
              People
            </SegmentButton>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-full px-5 py-3 text-sm font-bold transition ${
                  category === item ? "bg-slate-100 text-slate-950" : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {viewMode === "people" ? (
          <PeoplePreview freelancers={filteredFreelancers} onSelectFreelancer={onSelectFreelancer} />
        ) : (
          <MissionFeed
            quests={visibleQuests}
            allQuests={filteredQuests}
            applications={applications}
            freelancers={freelancers}
            hasMore={hasMore}
            onMore={() => setVisibleCount((prev) => prev + 6)}
            onSelectQuest={onSelectQuest}
          />
        )}
      </div>
    </section>
  );
}

function TrendingFreelancers({ freelancers, onSelectFreelancer }) {
  const cards = freelancers.slice(0, 5);

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">Trending freelancers ↗</p>
        <button type="button" className="text-sm font-bold text-slate-500 hover:text-slate-950">
          View community
        </button>
      </div>
      <div className="flex gap-5 overflow-x-auto pb-2">
        {cards.map((person, index) => (
          <button
            key={person.id}
            type="button"
            onClick={() => onSelectFreelancer?.(person)}
            className={`group relative h-36 min-w-[300px] overflow-hidden rounded-3xl bg-gradient-to-br ${TOPIC_STYLES[index % TOPIC_STYLES.length]} p-5 text-left text-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.65)] transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_28px_60px_-32px_rgba(15,23,42,0.75)]`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.32),transparent_34%)] opacity-80" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-black"># {person.display_name}</p>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-white/90">{person.role}</p>
                </div>
                <span className="text-2xl transition duration-500 group-hover:translate-x-1">→</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-lg font-black">{person.skills?.length || 3}</p>
                  <p className="text-xs font-semibold text-white/70">Skills</p>
                </div>
                <AvatarStack people={[person, ...cards.filter((item) => item.id !== person.id).slice(0, 2)]} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function MissionFeed({ quests, allQuests, applications, freelancers, hasMore, onMore, onSelectQuest }) {
  if (allQuests.length === 0) {
    return <EmptyState title="아직 올라온 미션이 없습니다" description="첫 미션을 올려 gotchi를 시작해보세요." />;
  }

  return (
    <section className="mt-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">지금 구하고 있는 미션</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">지원자 흐름과 필요한 역량을 한눈에 보고 바로 참여하세요.</p>
        </div>
        <button type="button" className="hidden text-sm font-bold text-slate-500 hover:text-slate-950 sm:block">
          View more
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {quests.map((quest, index) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            index={index}
            applicants={resolveApplicants(quest, applications, freelancers, index)}
            onClick={() => onSelectQuest?.(quest)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onMore}
            className="glass-pill rounded-full px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-white/70"
          >
            더보기
          </button>
        </div>
      )}
    </section>
  );
}

function PeoplePreview({ freelancers, onSelectFreelancer }) {
  return (
    <section className="mt-12">
      <div className="mb-5">
        <h2 className="text-2xl font-black tracking-tight text-slate-950">요즘 뜨는 프리랜서</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">작업물과 역할을 보고 먼저 미션을 제안해보세요.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {freelancers.map((person) => (
          <button
            key={person.id}
            type="button"
            onClick={() => onSelectFreelancer?.(person)}
            className="glass glass-card rounded-3xl p-5 text-left hover:border-[#1B1F4D]/20 hover:shadow-[0_16px_36px_-24px_rgba(27,31,77,0.3)]"
          >
            <div className="flex items-center gap-3">
              <Avatar avatarUrl={person.avatar_url} name={person.display_name} size={48} />
              <div>
                <p className="text-base font-black text-slate-950">{person.display_name}</p>
                <p className="text-xs text-slate-500">{person.role}</p>
              </div>
            </div>
            <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{person.bio || "첫 미션으로 협업 핏을 확인해보세요."}</p>
            <TagList tags={person.skills?.slice(0, 4)} />
          </button>
        ))}
      </div>
    </section>
  );
}

function QuestCard({ quest, applicants, index, onClick }) {
  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => event.key === "Enter" && onClick?.()}
      className="glass glass-card group flex min-h-[300px] cursor-pointer flex-col rounded-[32px] p-6 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-[#1B1F4D]/20 hover:shadow-[0_24px_48px_-30px_rgba(27,31,77,0.42)]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-[#1B1F4D]">#미션</span>
        {quest.offers_long_term && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-[#1B1F4D]">장기 합류 가능</span>
        )}
      </div>

      <h2 className="mt-6 text-2xl font-black tracking-tight text-slate-950">{quest.title}</h2>
      <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600">{quest.mission}</p>

      <div className="mt-6 space-y-2 text-sm text-slate-600">
        <p><strong className="text-slate-950">기간:</strong> {quest.period}</p>
        <p><strong className="text-slate-950">보상:</strong> {quest.reward}</p>
      </div>

      <TagList tags={quest.skills} />

      <div className="mt-auto flex items-end justify-between gap-4 pt-6">
        <div>
          <p className="text-xs font-bold text-slate-400">지원 관심도</p>
          <p className="mt-1 text-sm font-black text-slate-800">{applicants.count}명 지원 중</p>
        </div>
        <AvatarStack people={applicants.people} overflow={Math.max(applicants.count - applicants.people.length, 0)} seed={index} />
      </div>
    </article>
  );
}

function AvatarStack({ people, overflow = 0, seed = 0 }) {
  const visible = people.slice(0, 4);

  return (
    <div className="flex items-center justify-end -space-x-2">
      {visible.map((person, index) => (
        <div key={`${person.id}-${index}`} className="rounded-full border-2 border-white shadow-sm">
          <Avatar avatarUrl={person.avatar_url} name={person.display_name || person.name} size={34} />
        </div>
      ))}
      {overflow > 0 && (
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-white bg-slate-950 text-[11px] font-black text-white shadow-sm">
          +{overflow}
        </div>
      )}
      {visible.length === 0 && (
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-black text-slate-500">
          {seed + 1}
        </div>
      )}
    </div>
  );
}

function SegmentButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-5 py-3 text-base font-bold transition ${
        active ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function resolveApplicants(quest, applications = [], freelancers = [], seed = 0) {
  const realApps = applications.filter((app) => app.quest_id === quest.id);
  const realPeople = realApps.map((app) => {
    const profile = freelancers.find((person) => person.id === app.applicant_id);
    return profile ?? { id: app.applicant_id, display_name: "지원자" };
  });

  if (realPeople.length > 0) {
    return { count: realPeople.length, people: realPeople };
  }

  const fallbackCount = Math.min(7, Math.max(2, ((quest.title?.length ?? 0) + seed) % 6 + 2));
  const fallbackPeople = FALLBACK_TALENTS.slice(0, Math.min(3, fallbackCount)).map((person, index) => ({
    ...person,
    id: `${quest.id}-${person.id}-${index}`,
  }));

  return { count: fallbackCount, people: fallbackPeople };
}

function TagList({ tags }) {
  if (!tags?.length) return null;

  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {tags.slice(0, 5).map((tag) => (
        <span key={tag} className="glass-pill rounded-full px-3 py-1 text-xs font-semibold text-slate-600">
          {tag}
        </span>
      ))}
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="glass rounded-3xl border-dashed p-10 text-center">
      <h2 className="text-2xl font-black text-slate-950">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export default HomeSection;
