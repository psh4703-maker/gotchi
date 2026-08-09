import { useState } from "react";

function HomeSection({ quests, onCreateQuest, onSelectQuest }) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredQuests = quests
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .filter((quest) => {
      if (!normalizedQuery) return true;
      const haystack = [quest.title, quest.mission, ...(quest.skills ?? [])].join(" ").toLowerCase();
      return haystack.includes(normalizedQuery);
    });

  const visibleQuests = filteredQuests.slice(0, visibleCount);
  const hasMore = filteredQuests.length > visibleCount;

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

          <div className="mt-7">
            <button
              type="button"
              onClick={onCreateQuest}
              className="rounded-2xl bg-gradient-to-b from-[#ff5b4d] to-[#ff3b30] px-6 py-3 text-sm font-black text-white shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_14px_24px_-10px_rgba(255,59,48,0.55)] transition hover:brightness-105 active:scale-[0.98]"
            >
              미션 올리기
            </button>
          </div>
        </div>

        <div className="glass mb-6 flex items-center rounded-2xl p-2">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(6);
            }}
            placeholder="제목, 내용, 역량으로 검색"
            className="glass-pill w-full rounded-xl px-4 py-2 text-sm outline-none focus:ring-4 focus:ring-[#0a84ff]/15"
          />
        </div>

        {filteredQuests.length === 0 ? (
          <EmptyState
            title="아직 올라온 미션이 없습니다"
            description="첫 미션을 올려 gotchi를 시작해보세요."
          />
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleQuests.map((quest) => (
                <QuestCard key={quest.id} quest={quest} onClick={() => onSelectQuest?.(quest)} />
              ))}
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
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#ff3b30]/10 px-3 py-1 text-xs font-black text-[#ff3b30]">
          #미션
        </span>
        {quest.offers_long_term && (
          <span className="rounded-full bg-[#0a84ff]/10 px-3 py-1 text-xs font-black text-[#0a84ff]">
            장기 합류 가능
          </span>
        )}
      </div>
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
