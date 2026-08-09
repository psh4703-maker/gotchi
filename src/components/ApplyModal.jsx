import { useState } from "react";

function ApplyModal({ item, onSubmit, onClose }) {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    await onSubmit(note);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-md">
      <div className="glass-strong w-full max-w-lg rounded-[32px] p-6 sm:p-8">
        <p className="text-sm font-black text-slate-400">#미션</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
          {item.title}
        </h1>
        {item.offers_long_term && (
          <p className="mt-2 text-xs font-bold text-[#0a84ff]">
            이 미션은 장기 합류로 이어질 수 있어요
          </p>
        )}
        <p className="mt-2 text-sm leading-6 text-slate-500">
          간단한 지원 메시지를 남기면 상대방이 수락 여부를 더 빠르게 판단할 수 있어요.
        </p>

        <label className="mt-5 block text-sm font-black text-slate-800">
          지원 메시지 (선택)
          <textarea
            rows={4}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="왜 이 미션에 잘 맞다고 생각하는지 짧게 적어주세요."
            className="glass-pill mt-2 w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#0a84ff]/15"
          />
        </label>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={submit}
            className="flex-1 rounded-2xl bg-gradient-to-b from-[#ff5b4d] to-[#ff3b30] px-5 py-4 text-sm font-black text-white shadow-[0_1px_0_rgba(255,255,255,0.4)_inset] shadow-[0_10px_20px_-8px_rgba(255,59,48,0.55)] transition hover:brightness-105 disabled:opacity-50"
          >
            {isSubmitting ? "지원 중..." : "미션 지원하기"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="glass-pill flex-1 rounded-2xl px-5 py-4 text-sm font-black text-slate-600 hover:bg-white/70"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApplyModal;
