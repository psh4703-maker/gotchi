import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Avatar from "./Avatar";
import MultiSelectChips from "./MultiSelectChips";

const SKILL_OPTIONS = [
  "기획",
  "디자인 툴 숙련자",
  "코딩 숙련자",
  "재무 관련 경험자",
  "카피라이팅 경험자",
  "데이터 분석 경험자",
  "SNS/콘텐츠 운영 경험자",
  "영업 경험자",
];

const PORTFOLIO_TYPES = ["웹사이트", "앱", "브랜딩", "Figma", "GitHub", "Notion", "Behance", "이미지 작업물", "기타"];

function EditProfileModal({
  user,
  profile,
  portfolioItems,
  onSubmit,
  onClose,
  onDeleteAccount,
  onAddPortfolioItem,
  onDeletePortfolioItem,
}) {
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [role, setRole] = useState(profile?.role || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [isFreelancer, setIsFreelancer] = useState(profile?.is_freelancer || false);
  const [bio, setBio] = useState(profile?.bio || "");
  const [skills, setSkills] = useState(profile?.skills || []);
  const [desiredTerms, setDesiredTerms] = useState(profile?.desired_terms || "");
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
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
      <form onSubmit={submit} className="glass-strong modal-pop max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[28px] p-6">
        <p className="text-sm font-black text-[#1B1F4D]">gotchi profile</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">프로필 수정</h2>

        <div className="mt-5 flex items-center gap-4">
          <Avatar avatarUrl={avatarUrl} name={displayName} size={64} />
          <label className="glass-pill cursor-pointer rounded-2xl px-4 py-2 text-sm font-black text-slate-600 transition hover:-translate-y-0.5 hover:bg-white/70">
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
            className="glass-pill mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-[#1B1F4D]/15"
          />
        </label>

        <label className="mt-4 block text-sm font-black text-slate-800">
          주요 역할
          <input
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="예: Founder, Designer, Developer"
            className="glass-pill mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-[#1B1F4D]/15"
          />
        </label>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <label className="flex cursor-pointer items-start gap-3 p-4 transition hover:bg-slate-50">
            <input
              type="checkbox"
              checked={isFreelancer}
              onChange={(event) => setIsFreelancer(event.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span>
              <span className="block text-sm font-black text-slate-800">Freelancer 메뉴에 내 프로필 공개하기</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                켜두면 팀 빌더들이 내 역할과 작업물을 보고 먼저 미션을 제안할 수 있어요.
              </span>
            </span>
          </label>

          {isFreelancer && (
            <div className="profile-reveal space-y-5 border-t border-slate-200 p-4">
              <label className="block text-sm font-black text-slate-800">
                한 줄 소개
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="어떤 문제를 잘 해결하는 사람인지 짧게 적어주세요"
                  className="glass-pill mt-2 w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-[#1B1F4D]/15"
                />
              </label>

              <MultiSelectChips label="보유 역량" options={SKILL_OPTIONS} selected={skills} onChange={setSkills} />

              <label className="block text-sm font-black text-slate-800">
                희망 조건
                <input
                  value={desiredTerms}
                  onChange={(event) => setDesiredTerms(event.target.value)}
                  placeholder="예: 주 2회 가능, 원격 선호, 단기 미션 선호"
                  className="glass-pill mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-[#1B1F4D]/15"
                />
              </label>

              <PortfolioLauncher
                items={portfolioItems ?? []}
                onOpen={() => setIsPortfolioOpen(true)}
                onDelete={onDeletePortfolioItem}
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            disabled={isLoading || isUploading}
            className="magnetic-button flex-1 rounded-2xl bg-[#1B1F4D] px-5 py-3 text-sm font-black text-white shadow-[0_14px_24px_-10px_rgba(27,31,77,0.45)] transition hover:bg-[#262B63] disabled:opacity-50"
          >
            {isLoading ? "저장 중..." : "저장하기"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="glass-pill flex-1 rounded-2xl px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-white/70"
          >
            취소
          </button>
        </div>

        <div className="mt-6 border-t border-white/60 pt-5">
          {showDeleteConfirm ? (
            <div className="space-y-3">
              <p className="text-sm font-bold text-[#ff3b30]">
                정말 탈퇴할까요? 미션, 지원 기록, 포트폴리오, 리뷰가 모두 삭제되고 되돌릴 수 없어요.
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

      {isPortfolioOpen && (
        <PortfolioUploadPanel
          userId={user.id}
          onAdd={onAddPortfolioItem}
          onClose={() => setIsPortfolioOpen(false)}
        />
      )}
    </div>
  );
}

function PortfolioLauncher({ items, onOpen, onDelete }) {
  const previewItems = items.slice(0, 3);

  return (
    <div className="rounded-3xl bg-slate-50 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-slate-800">포트폴리오</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            사진, 작업물 링크, GitHub, Figma를 따로 올릴 수 있어요.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="magnetic-button rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-[#1B1F4D]"
        >
          포트폴리오 올리기
        </button>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-center text-sm font-bold text-slate-400">
          아직 등록한 작업물이 없습니다
        </div>
      ) : (
        <div className="mt-4 grid gap-2">
          {previewItems.map((item) => (
            <div key={item.id} className="portfolio-row flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="h-11 w-11 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-400">
                    link
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">{item.title}</p>
                  {item.link && <p className="truncate text-xs text-slate-400">{item.link}</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="shrink-0 rounded-full px-2 py-1 text-xs font-black text-slate-400 transition hover:bg-red-50 hover:text-[#ff3b30]"
              >
                삭제
              </button>
            </div>
          ))}
          {items.length > previewItems.length && (
            <p className="px-1 text-xs font-bold text-slate-400">외 {items.length - previewItems.length}개 더 등록됨</p>
          )}
        </div>
      )}
    </div>
  );
}

function PortfolioUploadPanel({ userId, onAdd, onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedType, setSelectedType] = useState(PORTFOLIO_TYPES[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const canSubmit = title.trim() || link.trim() || imageUrl;

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
      if (!title.trim()) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
    setIsUploading(false);
  };

  const submitItem = async () => {
    if (!canSubmit) return;

    setIsAdding(true);
    await onAdd({
      title: title.trim() || selectedType,
      description,
      link,
      imageUrl,
    });
    setIsAdding(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 px-4 py-8 backdrop-blur-md">
      <div className="glass-strong modal-pop w-full max-w-lg rounded-[28px] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black text-[#1B1F4D]">Portfolio upload</p>
            <h3 className="mt-2 text-2xl font-black text-slate-950">포트폴리오 올리기</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">사진만 올려도 되고, 작업 링크만 붙여도 돼요.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-500 transition hover:bg-slate-200"
          >
            x
          </button>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {PORTFOLIO_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-black transition ${
                selectedType === type ? "bg-[#1B1F4D] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <label className="mt-4 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-center transition hover:border-[#1B1F4D]/40 hover:bg-white">
          {imageUrl ? (
            <img src={imageUrl} alt="업로드한 작업물" className="max-h-44 rounded-2xl object-cover shadow-sm" />
          ) : (
            <>
              <span className="text-3xl">+</span>
              <span className="mt-2 text-sm font-black text-slate-800">{isUploading ? "이미지 업로드 중..." : "사진 또는 작업물 이미지 올리기"}</span>
              <span className="mt-1 text-xs text-slate-400">클릭해서 파일 선택</span>
            </>
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>

        <div className="mt-4 space-y-3">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="작업물 제목"
            className="glass-pill w-full rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#1B1F4D]/15"
          />
          <input
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder="작업 링크, GitHub, Figma, Notion 등"
            className="glass-pill w-full rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#1B1F4D]/15"
          />
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="짧은 설명"
            className="glass-pill w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#1B1F4D]/15"
          />
        </div>

        <button
          type="button"
          onClick={submitItem}
          disabled={isAdding || isUploading || !canSubmit}
          className="magnetic-button mt-5 w-full rounded-2xl bg-[#1B1F4D] px-5 py-3 text-sm font-black text-white transition hover:bg-[#262B63] disabled:opacity-40"
        >
          {isAdding ? "올리는 중..." : "작업물 등록하기"}
        </button>
      </div>
    </div>
  );
}

export default EditProfileModal;
