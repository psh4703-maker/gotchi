import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import MultiSelectChips from "./MultiSelectChips";

const PORTFOLIO_TYPES = ["웹사이트", "앱", "브랜딩", "Figma", "GitHub", "Notion", "Behance", "이미지 작업물", "기타"];

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

function PortfolioUploadModal({ userId, profile, portfolioItems, onSave, onDeleteItem, onClose }) {
  const [bio, setBio] = useState(profile?.bio || "");
  const [skills, setSkills] = useState(profile?.skills || []);
  const [desiredTerms, setDesiredTerms] = useState(profile?.desired_terms || "");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedType, setSelectedType] = useState(PORTFOLIO_TYPES[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const submit = async () => {
    setIsSaving(true);
    await onSave({
      bio,
      skills,
      desiredTerms,
      item: {
        title: title.trim() || selectedType,
        description,
        link,
        imageUrl,
      },
    });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 px-4 py-8 backdrop-blur-md">
      <div className="glass-strong modal-pop max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-[28px] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black text-[#1B1F4D]">Freelancer profile</p>
            <h3 className="mt-2 text-2xl font-black text-slate-950">포트폴리오 올리기</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              여기서 저장하면 Freelancer 탭에 내 프로필이 공개돼요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-500 transition hover:bg-slate-200"
          >
            x
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-black text-slate-800">
            한 줄 소개
            <textarea
              rows={2}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="어떤 문제를 잘 해결하는 사람인지 짧게 적어주세요"
              className="glass-pill mt-2 w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#1B1F4D]/15"
            />
          </label>

          <MultiSelectChips label="보유 역량" options={SKILL_OPTIONS} selected={skills} onChange={setSkills} />

          <label className="block text-sm font-black text-slate-800">
            희망 조건
            <input
              value={desiredTerms}
              onChange={(event) => setDesiredTerms(event.target.value)}
              placeholder="예: 주 2회 가능, 원격 선호, 단기 미션 선호"
              className="glass-pill mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#1B1F4D]/15"
            />
          </label>
        </div>

        {portfolioItems?.length > 0 && (
          <div className="mt-6 border-t border-slate-200 pt-5">
            <p className="text-sm font-black text-slate-800">등록된 작업물</p>
            <div className="mt-3 space-y-2">
              {portfolioItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="h-11 w-11 rounded-xl object-cover" />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-400">
                        link
                      </div>
                    )}
                    <p className="truncate text-sm font-bold text-slate-800">{item.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    className="shrink-0 rounded-full px-2 py-1 text-xs font-black text-slate-400 transition hover:bg-red-50 hover:text-[#ff3b30]"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 border-t border-slate-200 pt-5">
          <p className="text-sm font-black text-slate-800">새 작업물 추가 (선택)</p>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
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

          <label className="mt-3 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-center transition hover:border-[#1B1F4D]/40 hover:bg-white">
            {imageUrl ? (
              <img src={imageUrl} alt="업로드한 작업물" className="max-h-36 rounded-2xl object-cover shadow-sm" />
            ) : (
              <>
                <span className="text-3xl">+</span>
                <span className="mt-2 text-sm font-black text-slate-800">
                  {isUploading ? "이미지 업로드 중..." : "사진 또는 작업물 이미지 올리기"}
                </span>
                <span className="mt-1 text-xs text-slate-400">클릭해서 파일 선택</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>

          <div className="mt-3 space-y-3">
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
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="짧은 설명"
              className="glass-pill w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#1B1F4D]/15"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={isSaving || isUploading}
          className="magnetic-button mt-6 w-full rounded-2xl bg-[#1B1F4D] px-5 py-3 text-sm font-black text-white transition hover:bg-[#262B63] disabled:opacity-40"
        >
          {isSaving ? "저장 중..." : "저장하고 공개하기"}
        </button>
      </div>
    </div>
  );
}

export default PortfolioUploadModal;
