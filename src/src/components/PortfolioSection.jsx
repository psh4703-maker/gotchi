import Avatar from "./Avatar";

function PortfolioSection({ user, profile, quests, applications, reviews, onLogin, onOpenApplication, onDeleteQuest, onEditProfile }) {
  if (!user) {
    return (
      <section className="min-h-screen px-5 py-10 sm:px-6 lg:px-8">
        <div className="glass-strong mx-auto max-w-3xl rounded-[32px] p-8 text-center">
          <p className="text-sm font-black text-[#1B1F4D]">Portfolio locked</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            로그인 후 내 활동을 확인하세요
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-500">
            My Portfolio는 실제 로그인한 사용자의 미션 기록을 보여줍니다.
          </p>
          <button
            type="button"
            onClick={onLogin}
            className="mt-7 rounded-2xl bg-[#1B1F4D] px-6 py-4 text-sm font-black text-white shadow-[0_14px_24px_-10px_rgba(27,31,77,0.45)] transition hover:bg-[#262B63]"
          >
            로그인하기
          </button>
        </div>
      </section>
    );
  }

  const myApplications = applications ?? [];
  const closedAll = myApplications.filter((app) => app.status === "closed");
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

  const reviewedCount = closedAll.filter((app) =>
    app.applicant_id === user.id ? app.applicant_reviewed : app.owner_reviewed,
  ).length;
  const myReviewCompletionRate = closedAll.length ? Math.round((reviewedCount / closedAll.length) * 100) : 0;

  const trust = computeTrustScore(closedAll, myPublicReviews);

  return (
    <section className="min-h-screen px-5 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="glass-strong overflow-hidden rounded-[32px]">
          <div className="flex flex-col gap-6 bg-gradient-to-br from-slate-950 via-slate-900 to-[#0a2a52] px-6 py-8 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-center gap-4">
              <Avatar avatarUrl={profile?.avatar_url} name={profile?.display_name || user.email} size={64} />
              <div>
                <p className="text-sm font-bold text-blue-200">
                  gotchi member profile
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  {profile?.display_name || user.email}
                </h1>
                <p className="mt-2 text-sm font-medium text-slate-300">
                  {profile?.role || "Member"}
                </p>
                <button
                  type="button"
                  onClick={onEditProfile}
                  className="mt-3 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white transition hover:bg-white/20"
                >
                  프로필 수정
                </button>
              </div>
            </div>

            <TrustScoreRing score={trust.score} isRookie={trust.isRookie} />
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="내가 올린 미션" value={quests.length} />
            <StatCard label="완료한 미션" value={closedAll.length} />
            <StatCard label="받은 평판" value={myPublicReviews.length} />
            <StatCard label="리뷰 작성률" value={`${myReviewCompletionRate}%`} />
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

        <ActivityPanel title="내 미션" items={quests} onDelete={onDeleteQuest} />

        <section className="glass rounded-3xl p-6">
          <p className="text-sm font-bold text-[#1B1F4D]">Peer Reputation</p>
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

// 매칭 신뢰 지수 = 완료한 미션 수(최대 40점) + 리뷰당 평균 긍정 태그 밀도(최대 30점)
// + 재협업 희망 비율(최대 30점). 전부 applications/reviews 실데이터 기반으로 계산되고,
// 완료 미션이 3건 미만이면 점수 대신 "신인" 배지를 보여줘 초기 데이터 왜곡을 막음.
function computeTrustScore(closedAll, publicReviewsReceived) {
  const completed = closedAll.length;
  const isRookie = completed < 3;

  const volumeScore = Math.min(completed * 8, 40);

  const totalTags = publicReviewsReceived.reduce((sum, review) => sum + (review.tags?.length ?? 0), 0);
  const avgTagsPerReview = publicReviewsReceived.length ? totalTags / publicReviewsReceived.length : 0;
  const feedbackScore = Math.min((avgTagsPerReview / 3) * 30, 30);

  const recollabCount = publicReviewsReceived.filter((review) => review.tags?.includes("재협업희망")).length;
  const recollabScore = completed ? Math.min((recollabCount / completed) * 30, 30) : 0;

  const score = Math.round(Math.min(volumeScore + feedbackScore + recollabScore, 100));

  return { score, isRookie };
}

function TrustScoreRing({ score, isRookie }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = isRookie ? 0 : (score / 100) * circumference;

  return (
    <div className="glass-dark flex shrink-0 items-center gap-4 rounded-3xl p-5">
      <svg width="112" height="112" viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
        {!isRookie && (
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#0a84ff"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
          />
        )}
        <text
          x="60"
          y="66"
          textAnchor="middle"
          transform="rotate(90 60 60)"
          fill="white"
          fontSize={isRookie ? "22" : "30"}
          fontWeight="900"
        >
          {isRookie ? "신인" : score}
        </text>
      </svg>
      <div className="max-w-[180px]">
        <p className="text-sm font-black text-white">매칭 신뢰 지수</p>
        <p className="mt-1 text-xs leading-5 text-slate-300">
          {isRookie
            ? "완료한 미션이 3건 이상 쌓이면 점수가 계산돼요."
            : "완료 미션, 동료 피드백, 재협업 요청률을 기반으로 계산됩니다."}
        </p>
      </div>
    </div>
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
    accepted: ["진행중", "bg-[#1B1F4D]/8 text-[#1B1F4D]"],
    submitted: ["제출완료", "bg-emerald-100 text-emerald-700"],
    disputed: ["분쟁중", "bg-[#ff3b30]/10 text-[#ff3b30]"],
    closed: ["종료", "bg-slate-200 text-slate-600"],
    expired: ["자동 만료됨", "bg-slate-200 text-slate-500"],
  };
  const [label, className] = map[status] ?? [status, "bg-slate-100 text-slate-600"];

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${className}`}>
      {label}
    </span>
  );
}

function ActivityPanel({ title, items, onDelete }) {
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
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-black text-[#1B1F4D]">#미션</p>
                  {item.offers_long_term && (
                    <span className="rounded-full bg-[#1B1F4D]/8 px-2 py-0.5 text-[10px] font-black text-[#1B1F4D]">
                      장기 합류 가능
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onDelete?.(item)}
                  className="text-xs font-black text-slate-400 hover:text-[#ff3b30]"
                >
                  삭제
                </button>
              </div>
              <h3 className="mt-2 text-lg font-black text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.mission}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default PortfolioSection;
