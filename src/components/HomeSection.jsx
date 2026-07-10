import { useMemo, useState } from "react";

function HomeSection({ quests, alliances, onCreateQuest, onCreateAlliance }) {
  const [filter, setFilter] = useState("all");

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

  const filteredItems =
    filter === "all" ? feedItems : feedItems.filter((item) => item.type === filter);

  return (
    <section className="min-h-screen px-5 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 border-b border-slate-200 pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 text-sm font-bold text-blue-600">
              Real founder matching
            </p>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              실제 미션과 팀 모집글이 쌓이는 gotchi
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              로그인한 사용자가 올린 팝업 미션과 정식 팀 모집글만 표시됩니다.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onCreateQuest}
              className="rounded-2xl bg-red-500 px-5 py-3 text-sm font-black text-white hover:bg-red-600"
            >
              팝업 미션 올리기
            </button>
            <button
              type="button"
              onClick={onCreateAlliance}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700"
            >
              팀 모집 올리기
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          {[
            ["all", "전체 보기"],
            ["quest", "팝업 미션만 보기"],
            ["alliance", "빌드업 팀 모집만 보기"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-xl px-4 py-2 text-sm font-bold ${
                filter === id
                  ? "bg-slate-950 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <EmptyState
            title="아직 올라온 글이 없습니다"
            description="첫 팝업 미션이나 팀 모집글을 올려 gotchi를 시작해보세요."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) =>
              item.type === "quest" ? (
                <QuestCard key={item.id} quest={item} />
              ) : (
                <AllianceCard key={item.id} alliance={item} />
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function QuestCard({ quest }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-red-200 hover:shadow-xl hover:shadow-red-100/70">
      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600">
        #팝업미션
      </span>
      <h2 className="mt-5 text-xl font-black text-slate-950">{quest.title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{quest.mission}</p>
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

function AllianceCard({ alliance }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70">
      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">
        #정식합류
      </span>
      <h2 className="mt-5 text-xl font-black text-slate-950">
        {alliance.team_name}
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{alliance.vision}</p>
      <div className="mt-5 space-y-2 text-sm text-slate-600">
        <p>
          <strong className="text-slate-950">구인 직군:</strong>{" "}
          {alliance.roles.join(" · ")}
        </p>
        <p>
          <strong className="text-slate-950">제공 지분:</strong> {alliance.equity}
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
          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h2 className="text-2xl font-black text-slate-950">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export default HomeSection;
