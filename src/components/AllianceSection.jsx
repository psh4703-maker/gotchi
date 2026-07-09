const teams = [
  {
    name: "Loopdesk",
    vision: "AI로 B2B 세일즈 운영을 자동화하는 팀",
    roles: "Frontend Engineer · Growth Marketer",
    equity: "2% - 6%",
  },
  {
    name: "CreatorOS",
    vision: "1인 창작자를 위한 CRM 운영 시스템",
    roles: "Full-stack Engineer · Product Designer",
    equity: "5% - 12%",
  },
  {
    name: "MeetMind",
    vision: "회의 내용을 팀 지식으로 바꾸는 AI 워크스페이스",
    roles: "Backend Engineer · AI Engineer",
    equity: "3% - 8%",
  },
];

function AllianceSection() {
  return (
    <section className="min-h-screen px-5 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="border-b border-slate-200 pb-8">
          <p className="mb-3 text-sm font-black text-blue-600">Build-up Team</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            정식 창업 팀을 탐색하세요
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            비전, 가치관, 지분 구조를 확인하고 장기적으로 함께할 팀을
            찾아보세요.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {teams.map((team) => (
            <article
              key={team.name}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70"
            >
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">
                #정식합류
              </span>
              <h2 className="mt-5 text-xl font-black text-slate-950">
                {team.name}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {team.vision}
              </p>
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <p>
                  <strong className="text-slate-950">구인 직군:</strong>{" "}
                  {team.roles}
                </p>
                <p>
                  <strong className="text-slate-950">제공 지분:</strong>{" "}
                  {team.equity}
                </p>
              </div>
              <button className="mt-7 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700">
                팀 자세히 보기
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AllianceSection;
