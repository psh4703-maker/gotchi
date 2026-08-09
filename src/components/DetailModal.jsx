import { useState } from "react";

function DetailModal({ item, currentUser, myApplication, onApply, onOpenWorkspace, onClose }) {
  const [copied, setCopied] = useState(false);
  const isOwner = currentUser && currentUser.id === item.owner_id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-md">
      <div className="glass-strong max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[32px] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#ff3b30]/10 px-3 py-1 text-xs font-black text-[#ff3b30]">
                #미션
              </span>
              {item.offers_long_term && (
                <span className="rounded-full bg-[#0a84ff]/10 px-3 py-1 text-xs font-black text-[#0a84ff]">
                  장기 합류 가능
                </span>
              )}
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              {item.title}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }}
              className="glass-pill rounded-full px-3 py-1 text-sm font-black text-slate-500 hover:text-slate-900"
            >
              {copied ? "복사됨!" : "링크 복사"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="glass-pill rounded-full px-3 py-1 text-sm font-black text-slate-500 hover:text-slate-900"
            >
              x
            </button>
          </div>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-600">{item.mission}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <InfoRow label="기간" value={item.period} />
          <InfoRow label="보상/리워드" value={item.reward} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(item.skills ?? []).map((tag) => (
            <span key={tag} className="glass-pill rounded-full px-3 py-1 text-xs font-semibold text-slate-600">
              {tag}
            </span>
          ))}
        </div>

        {item.offers_long_term && (
          <div className="mt-6 rounded-2xl border border-[#0a84ff]/20 bg-[#0a84ff]/5 p-5">
            <p className="text-sm font-black text-[#0a84ff]">이 미션은 장기 합류로 이어질 수 있어요</p>
            <p className="mt-1 text-xs text-slate-500">
              지원 전에 미리 확인할 수 있는 팀 정보예요.
            </p>

            {item.team_name && (
              <p className="mt-4 text-lg font-black text-slate-950">{item.team_name}</p>
            )}
            {item.team_vision && (
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.team_vision}</p>
            )}

            {item.team_values?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.team_values.map((value) => (
                  <span key={value} className="glass-pill rounded-full px-3 py-1 text-xs font-semibold text-slate-600">
                    {value}
                  </span>
                ))}
              </div>
            )}

            {item.team_members?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-black text-slate-400">현재 팀원 현황</p>
                <div className="mt-2 space-y-2">
                  {item.team_members.map((member, index) => (
                    <div key={`${member.name}-${index}`} className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                      <div>
                        <p className="text-sm font-black text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.role}</p>
                      </div>
                      <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">
                        {member.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {item.join_process && <InfoRow label="합류 방식" value={item.join_process} />}
              {item.work_type && <InfoRow label="근무 형태" value={item.work_type} />}
              {item.long_term_reward && (
                <InfoRow label="장기 합류시 조건" value={item.long_term_reward} />
              )}
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-white/60 pt-6">
          {isOwner ? (
            <p className="rounded-2xl bg-white/50 p-4 text-sm font-bold text-slate-500">
              내가 올린 글입니다. 지원자가 생기면 Workspace 탭에서 확인할 수 있어요.
            </p>
          ) : myApplication ? (
            <button
              type="button"
              onClick={() => onOpenWorkspace(myApplication)}
              className="w-full rounded-2xl bg-gradient-to-b from-[#ff5b4d] to-[#ff3b30] px-5 py-4 text-sm font-black text-white shadow-[0_1px_0_rgba(255,255,255,0.4)_inset] shadow-[0_10px_20px_-8px_rgba(255,59,48,0.55)] transition hover:brightness-105"
            >
              이미 지원했어요 · 워크스페이스 열기
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onApply(item)}
              className="w-full rounded-2xl bg-gradient-to-b from-[#ff5b4d] to-[#ff3b30] px-5 py-4 text-sm font-black text-white shadow-[0_1px_0_rgba(255,255,255,0.4)_inset] shadow-[0_10px_20px_-8px_rgba(255,59,48,0.55)] transition hover:brightness-105"
            >
              미션 지원하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="glass-pill rounded-2xl px-4 py-3">
      <p className="text-xs font-black text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

export default DetailModal;
