function PortfolioSection({ user, profile, quests, alliances, applications, reviews, onLogin, onOpenApplication, onDeleteQuest, onDeleteAlliance }) {
  if (!user) {
    return (
      <section className="min-h-screen px-5 py-10 sm:px-6 lg:px-8">
        <div className="glass-strong mx-auto max-w-3xl rounded-[32px] p-8 text-center">
          <p className="text-sm font-black text-[#0a84ff]">Portfolio locked</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            로그인 후 내 활동을 확인하세요
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-500">
            My Portfolio는 실제 로그인한 사용자의 미션과 팀 모집 기록을 보여줍니다.
          </p>
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

  const myApplications = applications ?? [];
  const closedAsApplicant = myApplications.filter(
    (app) => app.applicant_id === user.id && app.status === "closed",
  );
  const inProgress = myApplications.filter((app) =>
    ["pending", "accepted", "submitted", "disputed"].includes(app.status),
  );
  const myPublicReviews = (reviews ?? []).filter(
    (review) => review.reviewee_id === user.id && review.is_public,
  );
  const requestedAgain = closedAsApplicant.length
    ? Math.round(
        (myPublicReviews.filter((review) => review.tags?.includes("재협업희망")).length /
          closedAsApplicant.length) *
          100,
      )
    : 0;

  return (
    <section className="min-h-screen px-5 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="glass-strong overflow-hidden rounded-[32px]">
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-[#0a2a52] px-6 py-8 text-white sm:px-8">
            <p className="text-sm font-bold text-blue-200">
              gotchi member profile
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              {profile?.display_name || user.email}
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-300">
              {profile?.role || "Member"}
            </p>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="내가 올린 팝업 미션" value={quests.length} />
            <StatCard label="내가 올린 팀 모집글" value={alliances.length} />
            <StatCard label="완료한 미션" value={closedAsApplicant.length} />
            <StatCard label="받은 평판" value={myPublicReviews.length} />
          </div>
        </div>

        {inProgress.length > 0 && (
          <section className="glass rounded-3xl p-6">
            <h2 className="text-xl font-black text-slate-950">진행 중인 매칭</h2>
            <p className="mt-1 text-sm text-slate-500">
              워크스페이스에서 브리프 확인, 산출물 제출, 완료 처리를 할 수 있어요.
            </p>
            <div className="mt-5 space-y-3">
              {inProgress.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => onOpenApplication?.(app)}
                  className="glass-pill flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-white/70"
                >
                  <span className="text-sm font-bold text-slate-800">
                    {app.title}
                  </span>
                  <StatusBadge status={app.status} />
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <ActivityPanel title="내 팝업 미션" items={quests} type="quest" onDelete={onDeleteQuest} />
          <ActivityPanel title="내 팀 모집글" items={alliances} type="alliance" onDelete={onDeleteAlliance} />
        </div>

        <section className="glass rounded-3xl p-6">
          <p className="text-sm font-bold text-[#0a84ff]">Peer Reputation</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">
            동료들의 평판 피드백
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            미션이 끝난 뒤 함께 일한 팀원들이 남긴 협업 스타일 리뷰입니다.
          </p>
          {myPublicReviews.length === 0 ? (
            <p className="mt-5 rounded-2xl bg-white/50 p-5 text-sm text-slate-500">
              아직 받은 리뷰가 없습니다. 첫 미션을 완료하면 여기에 쌓여요.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {myPublicReviews.map((review) => (
                <div key={review.id} className="glass-pill rounded-2xl p-4">
                  <div className="flex flex-wrap gap-2">
                    {review.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  {review.comment && (
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      "{review.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          {closedAsApplicant.length > 0 && (
            <p className="mt-4 text-xs font-bold text-slate-400">
              재협업 요청률 {requestedAgain}% · 완료한 미션 기준
            </p>
          )}
        </section>
      </div>
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="glass-pill rounded-2xl p-5">
      <p className="text-sm font-black text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-black tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: ["대기중", "bg-amber-100 text-amber-700"],
    accepted: ["진행중", "bg-[#0a84ff]/10 text-[#0a84ff]"],
    submitted: ["제출완료", "bg-emerald-100 text-emerald-700"],
    disputed: ["분쟁중", "bg-[#ff3b30]/10 text-[#ff3b30]"],
    closed: ["종료", "bg-slate-200 text-slate-600"],
  };
  const [label, className] = map[status] ?? [status, "bg-slate-100 text-slate-600"];

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${className}`}>
      {label}
    </span>
  );
}

function ActivityPanel({ title, items, type, onDelete }) {
  return (
    <section className="glass rounded-3xl p-6">
      <h2 className="text-2xl font-black text-slate-950">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-white/50 p-5 text-sm text-slate-500">
          아직 등록한 글이 없습니다.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="glass-pill rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-black text-[#0a84ff]">
                  {type === "quest" ? "#팝업미션" : "#팀모집"}
                </p>
                <button
                  type="button"
                  onClick={() => onDelete?.(item)}
                  className="text-xs font-black text-slate-400 hover:text-[#ff3b30]"
                >
                  삭제
                </button>
              </div>
              <h3 className="mt-2 text-lg font-black text-slate-950">
                {type === "quest" ? item.title : item.team_name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {type === "quest" ? item.mission : item.vision}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default PortfolioSection;
