import { useState } from "react";

const TAG_OPTIONS = [
  "마감일을_칼같이_지켜요",
  "문제정의가_명확해요",
  "커뮤니케이션이_깔끔해요",
  "팀의_속도를_올려요",
  "디테일이_살아있어요",
  "재협업희망",
];

function ReviewModal({ onSubmit, onClose }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState("");
  const [privateNote, setPrivateNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const submit = async () => {
    setIsSubmitting(true);
    await onSubmit({ tags: selectedTags, comment, privateNote });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 px-4 py-8 backdrop-blur-md">
      <div className="glass-strong w-full max-w-lg rounded-[32px] p-6 sm:p-8">
        <p className="text-sm font-black text-[#0a84ff]">Mission Closed</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
          같이 일한 소감을 남겨주세요
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          공개 태그와 코멘트는 상대방의 gotchi 프로필에 그대로 노출돼요.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {TAG_OPTIONS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3 py-2 text-xs font-black transition ${
                  isSelected
                    ? "bg-slate-950 text-white"
                    : "glass-pill text-slate-600 hover:bg-white/70"
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>

        <label className="mt-5 block text-sm font-black text-slate-800">
          공개 코멘트 (선택)
          <textarea
            rows={3}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="함께 일하며 좋았던 점을 짧게 적어주세요"
            className="glass-pill mt-2 w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#0a84ff]/15"
          />
        </label>

        <label className="mt-4 block text-sm font-black text-slate-800">
          비공개 메모 (gotchi 운영진만 확인, 상대방에게 안 보여요)
          <textarea
            rows={2}
            value={privateNote}
            onChange={(event) => setPrivateNote(event.target.value)}
            placeholder="다시 협업하고 싶지 않은 이유가 있다면 솔직하게 적어주세요"
            className="glass-pill mt-2 w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#0a84ff]/15"
          />
        </label>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={submit}
            className="flex-1 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 px-5 py-4 text-sm font-black text-white shadow-[0_14px_24px_-10px_rgba(15,23,42,0.5)] transition hover:brightness-110 disabled:opacity-50"
          >
            {isSubmitting ? "저장 중..." : "리뷰 남기기"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="glass-pill flex-1 rounded-2xl px-5 py-4 text-sm font-black text-slate-600 hover:bg-white/70"
          >
            나중에
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;
