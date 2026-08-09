import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Avatar from "./Avatar";
import MultiSelectChips from "./MultiSelectChips";

const SKILL_OPTIONS = [
  "기획력",
  "디자인 툴 숙련자",
  "코딩 숙련자",
  "재무 관련 경험자",
  "카피라이팅 경험자",
  "데이터 분석 경험자",
  "SNS/콘텐츠 운영 경험자",
  "영업 경험자",
];

function EditProfileModal({ user, profile, portfolioItems, onSubmit, onClose, onDeleteAccount, onAddPortfolioItem, onDeletePortfolioItem }) {
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [role, setRole] = useState(profile?.role || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [isFreelancer, setIsFreelancer] = useState(profile?.is_freelancer || false);
  const [bio, setBio] = useState(profile?.bio || "");
  const [skills, setSkills] = useState(profile?.skills || []);
  const [desiredTerms, setDesiredTerms] = useState(profile?.desired_terms || "");
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
    await onSubmit({ displayName, role, avatarUrl, isFreelancer, bio, skills, desiredTerms });
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-md">
      <form onSubmit={submit} className="glass-strong max-h-[88vh] w-full max-w-md overflow-y-auto rounded-[28px] p-6">
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

        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isFreelancer}
              onChange={(event) => setIsFreelancer(event.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm font-black text-slate-800">Freelancer 탭에 내 포트폴리오 공개하기</span>
          </label>
          <p className="mt-1 pl-7 text-xs text-slate-500">
            켜두면 파운더들이 내 작업물을 보고 먼저 미션을 제안할 수 있어요.
          </p>

          {isFreelancer && (
            <div className="mt-5 space-y-4 border-t border-slate-200 pt-4">
              <label className="block text-sm font-black text-slate-800">
                한 줄 소개
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="어떤 작업을 하는 사람인지 짧게 소개해주세요"
                  className="glass-pill mt-2 w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#1B1F4D]/15"
                />
              </label>

              <MultiSelectChips label="보유 역량" options={SKILL_OPTIONS} selected={skills} onChange={setSkills} />

              <label className="block text-sm font-black text-slate-800">
                희망 조건 (선택)
                <input
                  value={desiredTerms}
                  onChange={(event) => setDesiredTerms(event.target.value)}
                  placeholder="예: 주 2일 가능, 원격 선호"
                  className="glass-pill mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#1B1F4D]/15"
                />
              </label>

              <PortfolioManager
                items={portfolioItems ?? []}
                userId={user.id}
                onAdd={onAddPortfolioItem}
                onDelete={onDeletePortfolioItem}
              />
            </div>
          )}
        </div>

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
                정말 탈퇴할까요? 내 미션, 지원 기록, 포트폴리오, 리뷰가 모두 삭제되고 되돌릴 수 없어요.
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

function PortfolioManager({ items, userId, onAdd, onDelete }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("portfolio").upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
      setImageUrl(data.publicUrl);
    }
    setIsUploading(false);
  };

  const submitItem = async () => {
    if (!title.trim()) return;
    setIsAdding(true);
    await onAdd({ title, description, link, imageUrl });
    setTitle("");
    setDescription("");
    setLink("");
    setImageUrl("");
    setIsAdding(false);
  };

  return (
    <div>
      <p className="text-sm font-black text-slate-800">포트폴리오</p>

      {items.length > 0 && (
        <div className="mt-2 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">{item.title}</p>
                {item.link && <p className="truncate text-xs text-slate-400">{item.link}</p>}
              </div>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="shrink-0 text-xs font-black text-slate-400 hover:text-[#ff3b30]"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 space-y-2 rounded-2xl bg-white/50 p-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="작업물 제목"
          className="glass-pill w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-[#1B1F4D]/15"
        />
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="짧은 설명 (선택)"
          className="glass-pill w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-[#1B1F4D]/15"
        />
        <input
          value={link}
          onChange={(event) => setLink(event.target.value)}
          placeholder="링크 (선택)"
          className="glass-pill w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-[#1B1F4D]/15"
        />
        <div className="flex items-center gap-2">
          <label className="glass-pill cursor-pointer rounded-xl px-3 py-2 text-xs font-black text-slate-600 hover:bg-white/70">
            {isUploading ? "업로드 중..." : imageUrl ? "이미지 선택됨" : "이미지 추가"}
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
          <button
            type="button"
            onClick={submitItem}
            disabled={isAdding || !title.trim()}
            className="ml-auto rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white hover:bg-slate-800 disabled:opacity-50"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;
