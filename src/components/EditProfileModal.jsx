import { useState } from "react";

function EditProfileModal({ profile, onSubmit, onClose }) {
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [role, setRole] = useState(profile?.role || "");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    await onSubmit(displayName, role);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-md">
      <form onSubmit={submit} className="glass-strong w-full max-w-md rounded-[28px] p-6">
        <p className="text-sm font-black text-[#0a84ff]">gotchi profile</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">프로필 수정</h2>

        <label className="mt-5 block text-sm font-black text-slate-800">
          이름
          <input
            required
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="glass-pill mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#0a84ff]/15"
          />
        </label>

        <label className="mt-4 block text-sm font-black text-slate-800">
          주요 역할
          <input
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="예: Founder, Designer, Developer"
            className="glass-pill mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#0a84ff]/15"
          />
        </label>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            disabled={isLoading}
            className="flex-1 rounded-2xl bg-gradient-to-b from-[#3aa0ff] to-[#0a84ff] px-5 py-3 text-sm font-black text-white shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_14px_24px_-10px_rgba(10,132,255,0.6)] transition hover:brightness-105 disabled:opacity-50"
          >
            {isLoading ? "저장 중..." : "저장하기"}
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

export default EditProfileModal;
