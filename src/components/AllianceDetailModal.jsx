import { useState } from "react";

function AllianceDetailModal({ team, isOpen, onClose, onMoveToQuest }) {
  const [isMissionFormOpen, setIsMissionFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    portfolioUrl: "",
    message: "",
  });

  if (!isOpen || !team) {
    return null;
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    window.alert("단기 미션 신청이 완료되었습니다. 팀이 곧 검토할 예정입니다.");
    setFormData({ name: "", portfolioUrl: "", message: "" });
    setIsMissionFormOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alliance-detail-title"
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-sm font-black text-blue-600">Build-up Team</p>
            <h2
              id="alliance-detail-title"
              className="mt-1 text-2xl font-black tracking-tight text-slate-950"
            >
              {team.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
            aria-label="Close modal"
          >
            x
          </button>
        </div>

        <div className="space-y-8 px-6 py-7">
          <section>
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600 ring-1 ring-blue-100">
              {team.badge}
            </span>

            <h3 className="mt-5 text-xl font-black text-slate-950">
              팀의 상세 비전
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {team.detailVision}
            </p>
          </section>

          <section>
            <h3 className="text-xl font-black text-slate-950">가치관</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {team.values.map((value) => (
                <div
                  key={value}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-sm font-black text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-black text-slate-950">
              현재 팀원 현황
            </h3>

            <div className="mt-4 space-y-3">
              {team.members.map((member) => (
                <div
                  key={`${member.name}-${member.role}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div>
                    <p className="text-sm font-black text-slate-950">
                      {member.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {member.role}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                    {member.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-xl font-black text-slate-950">모집 정보</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <InfoItem label="구인 직군" value={team.roles.join(" · ")} />
              <InfoItem label="제공 지분 범위" value={team.equity} />
              <InfoItem label="합류 방식" value={team.joinType} />
              <InfoItem label="근무 형태" value={team.workStyle} />
            </div>
          </section>

          <section className="space-y-4 border-t border-slate-200 pt-8">
            <button
              type="button"
              className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-slate-800"
            >
              정식 멤버 지원하기
            </button>

            <button
              type="button"
              onClick={() => setIsMissionFormOpen((prev) => !prev)}
              className="w-full overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-600 to-cyan-500 p-[1px] text-left shadow-xl shadow-blue-100 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-200"
            >
              <div className="rounded-3xl bg-white/10 px-6 py-6 text-white">
                <p className="text-sm font-black text-blue-100">
                  아직 정식 합류가 고민된다면
                </p>
                <p className="mt-2 text-xl font-black leading-snug">
                  이 팀과 팝업 미션으로 먼저 일해보며 핏 확인하기
                </p>
                <p className="mt-3 text-sm leading-6 text-blue-50">
                  1주일짜리 미션으로 서로의 속도, 커뮤니케이션, 문제 해결
                  방식을 가볍게 확인해보세요.
                </p>
              </div>
            </button>

            {isMissionFormOpen && (
              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-sm leading-7 text-slate-700">
                  우리 팀에 관심은 가지만 확신이 없나요? 현재 열려 있는
                  1주일짜리{" "}
                  <span className="font-black text-blue-700">
                    [랜딩페이지 프로토타입 디자인]
                  </span>{" "}
                  미션에 참여하여 서로의 일하는 스타일을 먼저 검증해보세요!
                </p>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <TextInput
                    label="이름"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="홍길동"
                  />
                  <TextInput
                    label="포트폴리오 링크"
                    name="portfolioUrl"
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    placeholder="https://your-portfolio.com"
                  />

                  <div>
                    <label
                      htmlFor="message"
                      className="text-sm font-black text-slate-800"
                    >
                      한줄 각오
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="이번 미션에서 어떤 방식으로 기여하고 싶은지 적어주세요."
                      required
                      rows={4}
                      className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="submit"
                      className="flex-1 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700"
                    >
                      단기 미션 신청하기
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onMoveToQuest?.();
                      }}
                      className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      열린 미션 더 보기
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function TextInput({ label, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-black text-slate-800">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

export default AllianceDetailModal;
