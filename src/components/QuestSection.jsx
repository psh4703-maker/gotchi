function QuestSection({ quests, onCreateQuest }) {
  return (
    <section className="min-h-screen px-5 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 text-sm font-black text-red-500">Popup Mission</p>
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
            className="rounded-2xl bg-red-500 px-5 py-3 text-sm font-black text-white hover:bg-red-600"
          >
            새 미션 올리기
          </button>
        </div>

        {quests.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-2xl font-black text-slate-950">
              아직 등록된 미션이 없습니다
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              로그인 후 첫 팝업 미션을 올려보세요.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {quests.map((quest) => (
              <article
                key={quest.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-red-200 hover:shadow-xl hover:shadow-red-100/70"
              >
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600">
                  #팝업미션
                </span>
                <h2 className="mt-5 text-xl font-black text-slate-950">
                  {quest.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
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
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500"
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
