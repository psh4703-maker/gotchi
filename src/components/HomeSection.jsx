import { useMemo, useState } from "react";

function HomeSection({ quests, alliances, onCreateQuest, onCreateAlliance, onSelectQuest, onSelectAlliance }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);

  const feedItems = useMemo(() => {
    const questItems = quests.map((quest) => ({ ...quest, type: "quest" }));
    const allianceItems = alliances.map((alliance) => ({
      ...alliance,
      type: "alliance",
    }));

    return [...questItems, ...allianceItems].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
  }, [quests, alliances]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredItems = feedItems
    .filter((item) => filter === "all" || item.type === filter)
    .filter((item) => {
      if (!normalizedQuery) return true;
      const haystack =
        item.type === "quest"
          ? [item.title, item.mission, ...(item.skills ?? [])]
          : [item.team_name, item.vision, ...(item.roles ?? []), ...(item.values ?? [])];
      return haystack.join(" ").toLowerCase().includes(normalizedQuery);
    });

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = filteredItems.length > visibleCount;

  return (
    <section className="relative min-h-screen px-5 py-10 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(10,132,255,0.16),rgba(255,59,48,0.08)_45%,transparent_75%)]"
      />
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col items-center text-center">
          <p className="mb-3 text-sm font-bold text-[#0a84ff]">
            Real founder matching
          </p>
          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            먼저 일해보고, 나중에 동행하세요
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            단기적인 보상으로 시작된 협업이, 끈끈한 결속력이 되는 경험을 gotchi가 제공합니다
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onCreateQuest}
              className="rounded-2xl bg-gradient-to-b from-[#ff5b4d] to-[#ff3b30] px-5 py-3 text-sm font-black text-white shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_14px_24px_-10px_rgba(255,59,48,0.55)] transition hover:brightness-105 active:scale-[0.98]"
            >
              단기 협업 미션 올리기
            </button>
            <button
              type="button"
              onClick={onCreateAlliance}
              className="rounded-2xl bg-gradient-to-b from-[#3aa0ff] to-[#0a84ff] px-5 py-3 text-sm font-black text-white shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_14px_24px_-10px_rgba(10,132,255,0.55)] transition hover:brightness-105 active:scale-[0.98]"
            >
              팀 모집 올리기
            </button>
          </div>
        </div>

        <div
          className="glass mb-6 flex flex-col gap-3 rounded-2xl p-2 sm:flex-row sm:items-center"
        >
          <div className="flex flex-wrap gap-2">
            {[
              ["all", "전체 보기"],
              ["quest", "단기 협업 미션만 보기"],
              ["alliance", "장기 팀원 모집만 보기"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setFilter(id);
                  setVisibleCount(6);
                }}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  filter === id
                    ? "bg-slate-950 text-white shadow-[0_10px_18px_-8px_rgba(15,23,42,0.5)]"
                    : "text-slate-500 hover:bg-white/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(6);
            }}
            placeholder="제목, 내용, 역량으로 검색"
            className="glass-pill w-full rounded-xl px-4 py-2 text-sm outline-none focus:ring-4 focus:ring-[#0a84ff]/15 sm:ml-auto sm:w-64"
          />
        </div>

        {filteredItems.length === 0 ? (
          <EmptyState
            title="아직 올라온 글이 없습니다"
            description="첫 단기 협업 미션이나 팀 모집글을 올려 gotchi를 시작해보세요."
          />
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleItems.map((item) =>
                item.type === "quest" ? (
                  <QuestCard key={item.id} quest={item} onClick={() => onSelectQuest?.(item)} />
                ) : (
                  <AllianceCard key={item.id} alliance={item} onClick={() => onSelectAlliance?.(item)} />
                ),
              )}
            </div>
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="glass-pill rounded-full px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-white/70"
                >
                  더보기
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function QuestCard({ quest, onClick }) {
  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => event.key === "Enter" && onClick?.()}
      className="glass glass-card cursor-pointer rounded-3xl p-6 hover:border-[#ff3b30]/30 hover:shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_28px_48px_-24px_rgba(255,59,48,0.35)]"
    >
      <span className="rounded-full bg-[#ff3b30]/10 px-3 py-1 text-xs font-black text-[#ff3b30]">
        #단기협업미션
      </span>
      <h2 className="mt-5 text-xl font-black text-slate-950">{quest.title}</h2>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{quest.mission}</p>
      <div className="mt-5 space-y-2 text-sm text-slate-600">
        <p>
          <strong className="text-slate-950">기간:</strong> {quest.period}
        </p>
        <p>
          <strong className="text-slate-950">보상:</strong> {quest.reward}
        </p>
      </div>
      <TagList tags={quest.skills} />
    </article>
  );
}

function AllianceCard({ alliance, onClick }) {
  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => event.key === "Enter" && onClick?.()}
      className="glass glass-card cursor-pointer rounded-3xl p-6 hover:border-[#0a84ff]/30 hover:shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_28px_48px_-24px_rgba(10,132,255,0.35)]"
    >
      <span className="rounded-full bg-[#0a84ff]/10 px-3 py-1 text-xs font-black text-[#0a84ff]">
        #장기팀원모집
      </span>
      <h2 className="mt-5 text-xl font-black text-slate-950">
        {alliance.team_name}
      </h2>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{alliance.vision}</p>
      <div className="mt-5 space-y-2 text-sm text-slate-600">
        <p>
          <strong className="text-slate-950">구인 직군:</strong>{" "}
          {alliance.roles.join(" · ")}
        </p>
        <p>
          <strong className="text-slate-950">보상 조건:</strong> {alliance.equity}
        </p>
      </div>
      <TagList tags={alliance.values} />
    </article>
  );
}

function TagList({ tags }) {
  if (!tags?.length) {
    return null;
  }

  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="glass-pill rounded-full px-3 py-1 text-xs font-semibold text-slate-600"
        >
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
