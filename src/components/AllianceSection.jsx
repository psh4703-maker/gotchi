function AllianceSection({ alliances, onCreateAlliance, onSelectAlliance }) {
  return (
    <section className="min-h-screen px-5 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 text-sm font-black text-[#0a84ff]">
              Build-up Team
            </p>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              실제 등록된 정식 팀 모집
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              비전, 모집 직군, 지분 구조를 명시한 창업 팀 모집글입니다.
            </p>
          </div>

          <button
            type="button"
            onClick={onCreateAlliance}
            className="rounded-2xl bg-gradient-to-b from-[#3aa0ff] to-[#0a84ff] px-5 py-3 text-sm font-black text-white shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_14px_24px_-10px_rgba(10,132,255,0.55)] transition hover:brightness-105 active:scale-[0.98]"
          >
            팀 모집 올리기
          </button>
        </div>

        {alliances.length === 0 ? (
          <div className="glass mt-8 rounded-3xl border-dashed p-10 text-center">
            <h2 className="text-2xl font-black text-slate-950">
              아직 등록된 팀 모집글이 없습니다
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              로그인 후 첫 정식 팀 모집글을 올려보세요.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {alliances.map((alliance) => (
              <article
                key={alliance.id}
                onClick={() => onSelectAlliance?.(alliance)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => event.key === "Enter" && onSelectAlliance?.(alliance)}
                className="glass glass-card cursor-pointer rounded-3xl p-6 hover:border-[#0a84ff]/30 hover:shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_28px_48px_-24px_rgba(10,132,255,0.35)]"
              >
                <span className="rounded-full bg-[#0a84ff]/10 px-3 py-1 text-xs font-black text-[#0a84ff]">
                  #정식합류
                </span>
                <h2 className="mt-5 text-xl font-black text-slate-950">
                  {alliance.team_name}
                </h2>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                  {alliance.vision}
                </p>
                <div className="mt-5 space-y-2 text-sm text-slate-600">
                  <p>
                    <strong className="text-slate-950">구인 직군:</strong>{" "}
                    {alliance.roles.join(" · ")}
                  </p>
                  <p>
                    <strong className="text-slate-950">제공 지분:</strong>{" "}
                    {alliance.equity}
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {alliance.values.map((value) => (
                    <span
                      key={value}
                      className="glass-pill rounded-full px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {value}
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

export default AllianceSection;
