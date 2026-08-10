import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const PORTFOLIO_TYPES = ["웹사이트", "앱", "브랜딩", "Figma", "GitHub", "Notion", "Behance", "이미지 작업물", "기타"];

function PortfolioUploadModal({ userId, onAdd, onClose }) {
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

export default PortfolioUploadModal;
