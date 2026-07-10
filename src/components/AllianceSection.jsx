function AllianceSection({ alliances, onCreateAlliance }) {
  return (
    <section className="min-h-screen px-5 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 text-sm font-black text-blue-600">
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
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700"
          >
            팀 모집 올리기
          </button>
        </div>

        {alliances.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
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
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70"
              >
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">
                  #정식합류
                </span>
                <h2 className="mt-5 text-xl font-black text-slate-950">
                  {alliance.team_name}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
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
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500"
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
