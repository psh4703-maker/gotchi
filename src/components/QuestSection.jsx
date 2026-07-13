import { useState } from "react";

function QuestSection({ quests, onCreateQuest, onSelectQuest }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredQuests = quests.filter((quest) => {
    if (!normalizedQuery) return true;
    const haystack = [quest.title, quest.mission, ...(quest.skills ?? [])].join(" ").toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  return (
    <section className="min-h-screen px-5 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 text-sm font-black text-[#ff3b30]">Popup Mission</p>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              실제 등록된 단기 미션
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              팀이 올린 1~2주 단기 미션만 모아보는 공간입니다.
            </p>
          </div>

          <button
            type="button"
            onClick={onCreateQuest}
            className="rounded-2xl bg-gradient-to-b from-[#ff5b4d] to-[#ff3b30] px-5 py-3 text-sm font-black text-white shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_14px_24px_-10px_rgba(255,59,48,0.55)] transition hover:brightness-105 active:scale-[0.98]"
          >
            새 미션 올리기
          </button>
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="제목, 내용, 필요 역량으로 검색"
          className="glass-pill mb-6 w-full rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#ff3b30]/15 sm:max-w-sm"
        />

        {filteredQuests.length === 0 ? (
          <div className="glass mt-2 rounded-3xl border-dashed p-10 text-center">
            <h2 className="text-2xl font-black text-slate-950">
              {quests.length === 0 ? "아직 등록된 미션이 없습니다" : "검색 결과가 없습니다"}
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              {quests.length === 0 ? "로그인 후 첫 팝업 미션을 올려보세요." : "다른 키워드로 검색해보세요."}
            </p>
          </div>
        ) : (
          <div className="mt-2 grid gap-5 md:grid-cols-3">
            {filteredQuests.map((quest) => (
              <article
                key={quest.id}
                onClick={() => onSelectQuest?.(quest)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => event.key === "Enter" && onSelectQuest?.(quest)}
                className="glass glass-card cursor-pointer rounded-3xl p-6 hover:border-[#ff3b30]/30 hover:shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_28px_48px_-24px_rgba(255,59,48,0.35)]"
              >
                <span className="rounded-full bg-[#ff3b30]/10 px-3 py-1 text-xs font-black text-[#ff3b30]">
                  #팝업미션
                </span>
                <h2 className="mt-5 text-xl font-black text-slate-950">
                  {quest.title}
                </h2>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                  {quest.mission}
                </p>
                <div className="mt-5 space-y-2 text-sm text-slate-600">
                  <p>
                    <strong className="text-slate-950">기간:</strong>{" "}
                    {quest.period}
                  </p>
                  <p>
                    <strong className="text-slate-950">보상:</strong>{" "}
                    {quest.reward}
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {quest.skills.map((skill) => (
                    <span
                      key={skill}
                      className="glass-pill rounded-full px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default QuestSection;
