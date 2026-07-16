import { useState } from "react";

const STATUS_LABEL = {
  pending: "수락 대기중",
  accepted: "진행중",
  submitted: "제출 완료 · 확인 대기중",
  disputed: "분쟁중 · 운영자 확인 필요",
  closed: "종료됨",
  rejected: "거절됨",
  expired: "자동 만료됨 (48시간 무응답)",
};

const TABS = [
  { id: "brief", label: "브리프" },
  { id: "chat", label: "채팅" },
  { id: "wrap", label: "제출·완료" },
];

function WorkspaceModal({
  application,
  currentUser,
  messages,
  attachmentUrls,
  myReview,
  onSendMessage,
  onSendAttachment,
  onAccept,
  onReject,
  onSubmitWork,
  onConfirmClose,
  onRaiseDispute,
  onUpdatePaymentNote,
  onConfirmPayment,
  onClose,
  onOpenReview,
  pairHistory,
  onRehire,
}) {
  const [tab, setTab] = useState(
    ["accepted", "submitted", "disputed"].includes(application.status) ? "chat" : "brief",
  );
  const [draft, setDraft] = useState("");
  const [submissionText, setSubmissionText] = useState(application.submission_note || "");
  const [paymentNote, setPaymentNote] = useState(application.payment_note || "");
  const [isUploading, setIsUploading] = useState(false);

  const isOwner = currentUser.id === application.owner_id;
  const isApplicant = currentUser.id === application.applicant_id;

  const send = async () => {
    if (!draft.trim()) return;
    await onSendMessage(draft.trim());
    setDraft("");
  };

  const handleFilePick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setIsUploading(true);
    await onSendAttachment(file);
    setIsUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-md">
      <div className="glass-strong flex h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] sm:h-[85vh] sm:rounded-[32px]">
        <div className="flex items-start justify-between gap-4 border-b border-white/60 px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-black text-slate-400">
              {application.type === "quest" ? "#단기협업미션" : "#장기팀원모집"}
            </p>
            <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
              {application.title}
            </h1>
            <span className="mt-2 inline-block rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">
              {STATUS_LABEL[application.status] ?? application.status}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="glass-pill shrink-0 rounded-full px-3 py-1 text-sm font-black text-slate-500 hover:text-slate-900"
          >
            x
          </button>
        </div>

        <div className="glass-pill mx-6 mt-4 flex gap-1 rounded-full p-1 sm:mx-8">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-full px-3 py-2 text-xs font-black transition ${
                tab === t.id ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-white/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5 sm:px-8">
          {tab === "brief" && (
            <div className="space-y-5">
              {pairHistory?.length > 0 && (
                <div className="rounded-2xl bg-[#0a84ff]/10 px-4 py-3 text-sm font-bold text-[#0a84ff]">
                  🤝 이 사람과 벌써 {pairHistory.length}번째 협업이에요
                </div>
              )}

              {application.note && (
                <div className="glass-pill rounded-2xl p-4">
                  <p className="text-xs font-black text-slate-400">지원 메시지</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{application.note}</p>
                </div>
              )}

              {application.status === "pending" && isOwner && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={onAccept}
                    className="flex-1 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 px-5 py-3 text-sm font-black text-white shadow-[0_14px_24px_-10px_rgba(15,23,42,0.5)] transition hover:brightness-110"
                  >
                    수락하고 시작하기
                  </button>
                  <button
                    type="button"
                    onClick={onReject}
                    className="glass-pill flex-1 rounded-2xl px-5 py-3 text-sm font-black text-slate-600 hover:bg-white/70"
                  >
                    거절하기
                  </button>
                </div>
              )}

              {application.status === "pending" && isApplicant && (
                <p className="rounded-2xl bg-amber-50/80 p-4 text-sm font-bold text-amber-700">
                  상대방의 수락을 기다리고 있어요. 48시간 안에 응답이 없으면 다른 미션을 찾아보는 걸 추천해요.
                </p>
              )}

              {application.status === "rejected" && (
                <p className="rounded-2xl bg-white/50 p-4 text-sm font-bold text-slate-500">
                  이 매칭은 거절되었습니다.
                </p>
              )}

              {application.status === "expired" && (
                <p className="rounded-2xl bg-white/50 p-4 text-sm font-bold text-slate-500">
                  48시간 동안 응답이 없어 자동으로 만료됐어요.
                </p>
              )}

              {!["pending", "rejected", "expired"].includes(application.status) && (
                <p className="rounded-2xl bg-white/50 p-4 text-sm text-slate-500">
                  진행 상황은 채팅 탭에서, 제출·완료 처리는 제출·완료 탭에서 확인하세요.
                </p>
              )}
            </div>
          )}

          {tab === "chat" && (
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex-1 space-y-3 overflow-y-auto pb-3">
                {messages.length === 0 ? (
                  <p className="rounded-2xl bg-white/50 p-4 text-center text-sm text-slate-400">
                    아직 메시지가 없어요. 첫 업데이트를 남겨보세요.
                  </p>
                ) : (
                  messages.map((message) => {
                    const isMine = message.sender_id === currentUser.id;
                    const isImage = message.attachment_type?.startsWith("image/");
                    return (
                      <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-6 ${
                            isMine
                              ? "bg-gradient-to-b from-[#3aa0ff] to-[#0a84ff] text-white"
                              : "glass-pill text-slate-700"
                          }`}
                        >
                          {message.attachment_path && (
                            <div className="mb-1">
                              {isImage ? (
                                attachmentUrls[message.attachment_path] ? (
                                  <a href={attachmentUrls[message.attachment_path]} target="_blank" rel="noreferrer">
                                    <img
                                      src={attachmentUrls[message.attachment_path]}
                                      alt={message.attachment_name}
                                      className="max-h-56 rounded-xl object-cover"
                                    />
                                  </a>
                                ) : (
                                  <p className="text-xs opacity-70">이미지 불러오는 중...</p>
                                )
                              ) : (
                                <a
                                  href={attachmentUrls[message.attachment_path]}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs font-bold underline ${
                                    isMine ? "text-white" : "text-[#0a84ff]"
                                  }`}
                                >
                                  📎 {message.attachment_name}
                                </a>
                              )}
                            </div>
                          )}
                          {message.body && <span>{message.body}</span>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="mt-2 flex gap-2 border-t border-white/60 pt-3">
                <label className="glass-pill flex shrink-0 cursor-pointer items-center justify-center rounded-2xl px-3 py-3 text-lg hover:bg-white/70">
                  {isUploading ? "..." : "📎"}
                  <input type="file" onChange={handleFilePick} disabled={isUploading} className="hidden" />
                </label>
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && send()}
                  placeholder="메시지 보내기"
                  className="glass-pill flex-1 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#0a84ff]/15"
                />
                <button
                  type="button"
                  onClick={send}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
                >
                  전송
                </button>
              </div>
            </div>
          )}

          {tab === "wrap" && (
            <div className="space-y-5">
              {application.status === "accepted" && isApplicant && (
                <div className="space-y-2">
                  <label className="block text-sm font-black text-slate-800">
                    제출물 (링크 또는 요약)
                    <textarea
                      rows={3}
                      value={submissionText}
                      onChange={(event) => setSubmissionText(event.target.value)}
                      placeholder="Figma 링크, 배포 URL, 또는 결과 요약을 남겨주세요"
                      className="glass-pill mt-2 w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#0a84ff]/15"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => onSubmitWork(submissionText)}
                    disabled={!submissionText.trim()}
                    className="w-full rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-5 py-3 text-sm font-black text-white shadow-[0_14px_24px_-10px_rgba(16,185,129,0.5)] transition hover:brightness-105 disabled:opacity-50"
                  >
                    제출 완료
                  </button>
                </div>
              )}

              {application.status === "accepted" && isOwner && (
                <p className="rounded-2xl bg-white/50 p-4 text-sm text-slate-500">
                  지원자가 제출하면 여기서 완료 확인을 할 수 있어요.
                </p>
              )}

              {application.status === "submitted" && (
                <div className="glass-pill rounded-2xl p-4">
                  <p className="text-xs font-black text-slate-400">제출된 내용</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {application.submission_note}
                  </p>
                  {isOwner && (
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={onConfirmClose}
                        className="flex-1 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-5 py-3 text-sm font-black text-white shadow-[0_14px_24px_-10px_rgba(16,185,129,0.5)] transition hover:brightness-105"
                      >
                        완료 확인
                      </button>
                      <button
                        type="button"
                        onClick={onRaiseDispute}
                        className="flex-1 rounded-2xl border border-[#ff3b30]/30 bg-[#ff3b30]/5 px-5 py-3 text-sm font-black text-[#ff3b30] hover:bg-[#ff3b30]/10"
                      >
                        아직 완료가 아니에요
                      </button>
                    </div>
                  )}
                  {isApplicant && (
                    <p className="mt-3 text-xs font-bold text-slate-400">
                      상대방의 완료 확인을 기다리고 있어요. 72시간 내 무응답 시 자동으로 종료돼요.
                    </p>
                  )}
                </div>
              )}

              {application.status === "disputed" && (
                <p className="rounded-2xl bg-[#ff3b30]/5 p-4 text-sm font-bold text-[#ff3b30]">
                  완료 여부에 대한 이견이 있어요. gotchi 운영자가 확인 후 다시 열어드릴게요.
                </p>
              )}

              {["accepted", "submitted", "disputed", "closed"].includes(application.status) &&
                application.type === "quest" && (
                  <div className="glass-pill rounded-2xl p-4">
                    <p className="text-xs font-black text-slate-400">정산 안내 (수동 확인)</p>
                    <p className="mt-1 text-xs text-slate-500">
                      gotchi는 아직 결제를 대행하지 않아요. 계좌 정보를 남기고, 입금을 직접 주고받은 뒤 확인 체크만 해주세요.
                    </p>
                    {isOwner ? (
                      <div className="mt-3 space-y-2">
                        <textarea
                          rows={2}
                          value={paymentNote}
                          onChange={(event) => setPaymentNote(event.target.value)}
                          placeholder="예: 카카오뱅크 3333-01-1234567 예금주 김도윤"
                          className="w-full resize-none rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-[#0a84ff]/15"
                        />
                        <button
                          type="button"
                          onClick={() => onUpdatePaymentNote(paymentNote)}
                          className="w-full rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white hover:bg-slate-800"
                        >
                          계좌 정보 저장
                        </button>
                      </div>
                    ) : (
                      <p className="mt-3 whitespace-pre-wrap text-sm font-bold text-slate-700">
                        {application.payment_note || "아직 계좌 정보가 등록되지 않았어요."}
                      </p>
                    )}
                    <label className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={application.payment_confirmed}
                        onChange={(event) => onConfirmPayment(event.target.checked)}
                      />
                      입금을 확인했어요
                    </label>
                  </div>
                )}

              {application.status === "closed" && (
                <div className="glass-pill rounded-2xl p-4">
                  <p className="text-sm font-bold text-slate-700">
                    미션이 종료됐어요. 서로에 대한 리뷰를 남겨야 다음 미션에 지원할 수 있어요.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenReview}
                    disabled={Boolean(myReview)}
                    className="mt-4 w-full rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 px-5 py-3 text-sm font-black text-white shadow-[0_14px_24px_-10px_rgba(15,23,42,0.5)] transition hover:brightness-110 disabled:opacity-50"
                  >
                    {myReview ? "리뷰 완료" : "리뷰 남기기"}
                  </button>
                  <button
                    type="button"
                    onClick={onRehire}
                    className="mt-3 w-full rounded-2xl bg-gradient-to-b from-[#3aa0ff] to-[#0a84ff] px-5 py-3 text-sm font-black text-white shadow-[0_14px_24px_-10px_rgba(10,132,255,0.5)] transition hover:brightness-105"
                  >
                    이 사람과 다음 미션 시작하기
                  </button>

                  {pairHistory?.length > 0 && (
                    <div className="mt-4 border-t border-white/60 pt-4">
                      <p className="text-xs font-black text-slate-400">
                        이 사람과 함께한 미션 {pairHistory.length}건
                      </p>
                      <div className="mt-2 space-y-1">
                        {pairHistory.map((past) => (
                          <p key={past.id} className="text-xs text-slate-500">
                            · {past.title}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {["pending", "rejected", "expired"].includes(application.status) && (
                <p className="rounded-2xl bg-white/50 p-4 text-sm text-slate-500">
                  아직 진행 전이에요. 브리프 탭에서 수락 여부를 먼저 확인하세요.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkspaceModal;
