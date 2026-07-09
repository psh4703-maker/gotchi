const quests = [
  {
    title: "랜딩페이지 프로토타입 디자인",
    period: "7일",
    reward: "800,000원",
    role: "UI/UX Designer",
  },
  {
    title: "투자자용 데모 페이지 구현",
    period: "6일",
    reward: "900,000원",
    role: "Frontend Developer",
  },
  {
    title: "온보딩 퍼널 UX 개선",
    period: "10일",
    reward: "1,200,000원",
    role: "Product Designer",
  },
];

function QuestSection() {
  return (
    <section className="min-h-screen px-5 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="border-b border-slate-200 pb-8">
          <p className="mb-3 text-sm font-black text-red-500">Popup Mission</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            지금 바로 합류할 수 있는 단기 미션
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            1~2주 안에 명확한 산출물을 만들고, 함께 일한 사람들의 평판을
            포트폴리오에 쌓아보세요.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {quests.map((quest) => (
            <article
              key={quest.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-red-200 hover:shadow-xl hover:shadow-red-100/70"
            >
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600">
                #1주일미션
              </span>
              <h2 className="mt-5 text-xl font-black text-slate-950">
                {quest.title}
              </h2>
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <p>
                  <strong className="text-slate-950">기간:</strong>{" "}
                  {quest.period}
                </p>
                <p>
                  <strong className="text-slate-950">필요 역할:</strong>{" "}
                  {quest.role}
                </p>
                <p>
                  <strong className="text-slate-950">보상:</strong>{" "}
                  {quest.reward}
                </p>
              </div>
              <button className="mt-7 w-full rounded-2xl bg-red-500 px-4 py-3 text-sm font-black text-white hover:bg-red-600">
                지원하기
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default QuestSection;
