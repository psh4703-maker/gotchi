import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Avatar from "./Avatar";

function EditProfileModal({ user, profile, onSubmit, onClose, onDeleteAccount }) {
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [role, setRole] = useState(profile?.role || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
      cacheControl: "3600",
    });

    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
    }
    setIsUploading(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    await onSubmit(displayName, role, avatarUrl);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-md">
      <form onSubmit={submit} className="glass-strong w-full max-w-md rounded-[28px] p-6">
        <p className="text-sm font-black text-[#1B1F4D]">gotchi profile</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">프로필 수정</h2>

        <div className="mt-5 flex items-center gap-4">
          <Avatar avatarUrl={avatarUrl} name={displayName} size={64} />
          <label className="glass-pill cursor-pointer rounded-2xl px-4 py-2 text-sm font-black text-slate-600 hover:bg-white/70">
            {isUploading ? "업로드 중..." : "사진 바꾸기"}
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>

        <label className="mt-5 block text-sm font-black text-slate-800">
          이름
          <input
            required
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="glass-pill mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#1B1F4D]/15"
          />
        </label>

        <label className="mt-4 block text-sm font-black text-slate-800">
          주요 역할
          <input
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="예: Founder, Designer, Developer"
            className="glass-pill mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#1B1F4D]/15"
          />
        </label>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            disabled={isLoading || isUploading}
            className="flex-1 rounded-2xl bg-[#1B1F4D] px-5 py-3 text-sm font-black text-white shadow-[0_14px_24px_-10px_rgba(27,31,77,0.45)] transition hover:bg-[#262B63] disabled:opacity-50"
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

        <div className="mt-6 border-t border-white/60 pt-5">
          {showDeleteConfirm ? (
            <div className="space-y-3">
              <p className="text-sm font-bold text-[#ff3b30]">
                정말 탈퇴할까요? 내 미션, 팀 모집글, 지원 기록, 리뷰가 모두 삭제되고 되돌릴 수 없어요.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onDeleteAccount}
                  className="flex-1 rounded-2xl bg-[#ff3b30] px-4 py-2 text-sm font-black text-white hover:bg-[#262B63]"
                >
                  네, 탈퇴할게요
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="glass-pill flex-1 rounded-2xl px-4 py-2 text-sm font-black text-slate-600 hover:bg-white/70"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs font-bold text-slate-400 hover:text-[#ff3b30]"
            >
              회원 탈퇴
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default EditProfileModal;
