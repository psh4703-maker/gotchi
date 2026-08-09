function titleFor(app, quests) {
  return quests.find((q) => q.id === app.quest_id)?.title ?? "삭제된 미션";
}

function AdminSection({ applications, quests, onResolve }) {
  const disputed = applications.filter((app) => app.status === "disputed");
  const others = applications.filter((app) => app.status !== "disputed");

  return (
    <section className="min-h-screen px-5 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-sm font-black text-[#ff3b30]">Admin only</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">분쟁 처리</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            완료 여부에 이견이 있는 매칭을 확인하고 최종 처리해요.
          </p>
        </div>

        {disputed.length === 0 ? (
          <div className="glass rounded-3xl border-dashed p-10 text-center">
            <h2 className="text-xl font-black text-slate-950">지금은 분쟁이 없어요</h2>
          </div>
        ) : (
          <div className="space-y-4">
            {disputed.map((app) => (
              <div key={app.id} className="glass rounded-3xl p-6">
                <p className="text-xs font-black text-slate-400">#미션</p>
                <h2 className="mt-1 text-lg font-black text-slate-950">
                  {titleFor(app, quests)}
                </h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <InfoBox label="지원자 ID" value={app.applicant_id} />
                  <InfoBox label="파운더 ID" value={app.owner_id} />
                </div>
                {app.submission_note && (
                  <div className="mt-3 rounded-2xl bg-white/50 p-4">
                    <p className="text-xs font-black text-slate-400">제출된 내용</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{app.submission_note}</p>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onResolve(app, "closed")}
                    className="rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-black text-white hover:bg-[#262B63]"
                  >
                    완료로 확정
                  </button>
                  <button
                    type="button"
                    onClick={() => onResolve(app, "accepted")}
                    className="glass-pill rounded-2xl px-4 py-2 text-sm font-black text-slate-600 hover:bg-white/70"
                  >
                    진행중으로 되돌리기 (재작업)
                  </button>
                  <button
                    type="button"
                    onClick={() => onResolve(app, "rejected")}
                    className="rounded-2xl border border-[#ff3b30]/30 bg-[#ff3b30]/5 px-4 py-2 text-sm font-black text-[#ff3b30] hover:bg-[#ff3b30]/10"
                  >
                    무산으로 처리
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <h2 className="text-lg font-black text-slate-950">전체 매칭 ({others.length})</h2>
          <div className="mt-3 space-y-2">
            {others.map((app) => (
              <div key={app.id} className="glass-pill flex items-center justify-between rounded-2xl px-4 py-3">
                <span className="text-sm font-bold text-slate-700">{titleFor(app, quests)}</span>
                <span className="text-xs font-black text-slate-400">{app.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="glass-pill rounded-2xl px-4 py-3">
      <p className="text-xs font-black text-slate-400">{label}</p>
      <p className="mt-1 truncate text-xs font-mono text-slate-700">{value}</p>
    </div>
  );
}

export default AdminSection;
