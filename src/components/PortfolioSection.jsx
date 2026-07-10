function PortfolioSection({ user, profile, quests, alliances, onLogin }) {
  if (!user) {
    return (
      <section className="min-h-screen px-5 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-black text-blue-600">Portfolio locked</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            로그인 후 내 활동을 확인하세요
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-500">
            My Portfolio는 실제 로그인한 사용자의 미션과 팀 모집 기록을 보여줍니다.
          </p>
          <button
            type="button"
            onClick={onLogin}
            className="mt-7 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white hover:bg-blue-700"
          >
            로그인하기
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen px-5 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-6 py-8 text-white sm:px-8">
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
            <StatCard label="완료한 미션" value="0" />
            <StatCard label="받은 평판" value="0" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ActivityPanel title="내 팝업 미션" items={quests} type="quest" />
          <ActivityPanel title="내 팀 모집글" items={alliances} type="alliance" />
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-black text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-black tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}

function ActivityPanel({ title, items, type }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-slate-950">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
          아직 등록한 글이 없습니다.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-xs font-black text-blue-600">
                {type === "quest" ? "#팝업미션" : "#팀모집"}
              </p>
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
