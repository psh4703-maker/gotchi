function titleFor(app, quests) {
  return quests.find((q) => q.id === app.quest_id)?.title ?? "삭제된 미션";
}

const STATUS_LABEL = {
  pending: ["대기중", "bg-amber-100 text-amber-700"],
  accepted: ["진행중", "bg-[#0a84ff]/10 text-[#0a84ff]"],
  submitted: ["제출완료", "bg-emerald-100 text-emerald-700"],
  disputed: ["분쟁중", "bg-[#ff3b30]/10 text-[#ff3b30]"],
  closed: ["종료", "bg-slate-200 text-slate-600"],
  rejected: ["거절됨", "bg-slate-200 text-slate-500"],
  expired: ["자동 만료됨", "bg-slate-200 text-slate-500"],
};

function StatusPill({ status }) {
  const [label, className] = STATUS_LABEL[status] ?? [status, "bg-slate-100 text-slate-600"];
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${className}`}>
      {label}
    </span>
  );
}

function WorkspaceSection({ applications, quests, currentUser, onOpenApplication, onLogin }) {
  if (!currentUser) {
    return (
      <section className="min-h-screen px-5 py-10 sm:px-6 lg:px-8">
        <div className="glass-strong mx-auto max-w-2xl rounded-[32px] p-8 text-center">
          <p className="text-sm font-black text-[#0a84ff]">Workspace locked</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            로그인 후 매칭 현황을 확인하세요
          </h1>
          <button
            type="button"
            onClick={onLogin}
            className="mt-7 rounded-2xl bg-gradient-to-b from-[#3aa0ff] to-[#0a84ff] px-6 py-4 text-sm font-black text-white shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_14px_24px_-10px_rgba(10,132,255,0.55)] transition hover:brightness-105"
          >
            로그인하기
          </button>
        </div>
      </section>
    );
  }

  const sent = applications.filter((app) => app.applicant_id === currentUser.id);
  const received = applications.filter((app) => app.owner_id === currentUser.id);

  return (
    <section className="min-h-screen px-5 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-sm font-black text-[#0a84ff]">Matching workflow</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            Workspace
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            지원한 미션과, 내가 올린 미션에 들어온 지원을 여기서 관리해요.
          </p>
        </div>

        <WorkspaceList
          title="내가 지원한 것"
          items={sent}
          quests={quests}
          onOpen={onOpenApplication}
          emptyText="아직 지원한 미션이 없어요."
        />

        <WorkspaceList
          title="내 미션에 들어온 지원"
          items={received}
          quests={quests}
          onOpen={onOpenApplication}
          emptyText="아직 들어온 지원이 없어요."
        />
      </div>
    </section>
  );
}

function WorkspaceList({ title, items, quests, onOpen, emptyText }) {
  return (
    <section className="glass rounded-3xl p-6">
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-white/50 p-5 text-sm text-slate-500">{emptyText}</p>
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => onOpen(app)}
              className="glass-pill flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-white/70"
            >
              <div>
                <p className="text-xs font-black text-slate-400">#미션</p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {titleFor(app, quests)}
                </p>
              </div>
              <StatusPill status={app.status} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default WorkspaceSection;
