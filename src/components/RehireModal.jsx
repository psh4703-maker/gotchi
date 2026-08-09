import { useState } from "react";

function RehireModal({
  onSubmit,
  onClose,
  eyebrow = "Rehire",
  heading = "이 사람과 다음 미션 시작하기",
  description = "이미 한 번 같이 일해본 사이라 별도 지원/수락 절차 없이 바로 진행돼요.",
  submitLabel = "바로 시작하기",
}) {
  const [title, setTitle] = useState("");
  const [mission, setMission] = useState("");
  const [period, setPeriod] = useState("7일");
  const [reward, setReward] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    await onSubmit({ title, mission, period, reward });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-md">
      <form onSubmit={submit} className="glass-strong w-full max-w-lg rounded-[32px] p-6 sm:p-8">
        <p className="text-sm font-black text-[#1B1F4D]">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
          {heading}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>

        <label className="mt-5 block text-sm font-black text-slate-800">
          미션 제목
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="예: 2차 랜딩페이지 개선"
            className="glass-pill mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#1B1F4D]/15"
          />
        </label>

        <label className="mt-4 block text-sm font-black text-slate-800">
          해결할 내용
          <textarea
            required
            rows={3}
            value={mission}
            onChange={(event) => setMission(event.target.value)}
            className="glass-pill mt-2 w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#1B1F4D]/15"
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-black text-slate-800">
            기간
            <input
              required
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="glass-pill mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#1B1F4D]/15"
            />
          </label>
          <label className="block text-sm font-black text-slate-800">
            보상
            <input
              required
              value={reward}
              onChange={(event) => setReward(event.target.value)}
              placeholder="예: 600,000원"
              className="glass-pill mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#1B1F4D]/15"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            disabled={isSubmitting}
            className="flex-1 rounded-2xl bg-[#1B1F4D] px-5 py-3 text-sm font-black text-white shadow-[0_14px_24px_-10px_rgba(27,31,77,0.45)] transition hover:bg-[#262B63] disabled:opacity-50"
          >
            {isSubmitting ? "시작하는 중..." : submitLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="glass-pill flex-1 rounded-2xl px-5 py-3 text-sm font-black text-slate-600 hover:bg-white/70"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default RehireModal;
