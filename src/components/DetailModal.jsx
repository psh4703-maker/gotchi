function DetailModal({ type, item, currentUser, myApplication, relatedQuest, onApply, onOpenWorkspace, onSelectQuest, onClose }) {
  const isQuest = type === "quest";
  const accent = isQuest
    ? { text: "text-[#ff3b30]", chip: "bg-[#ff3b30]/10", grad: "from-[#ff5b4d] to-[#ff3b30]", ring: "shadow-[0_10px_20px_-8px_rgba(255,59,48,0.55)]" }
    : { text: "text-[#0a84ff]", chip: "bg-[#0a84ff]/10", grad: "from-[#3aa0ff] to-[#0a84ff]", ring: "shadow-[0_10px_20px_-8px_rgba(10,132,255,0.55)]" };

  const isOwner = currentUser && currentUser.id === item.owner_id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-md">
      <div className="glass-strong max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[32px] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className={`rounded-full ${accent.chip} px-3 py-1 text-xs font-black ${accent.text}`}>
              {isQuest ? "#팝업미션" : "#정식합류"}
            </span>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              {isQuest ? item.title : item.team_name}
            </h1>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="glass-pill shrink-0 rounded-full px-3 py-1 text-sm font-black text-slate-500 hover:text-slate-900"
          >
            x
          </button>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-600">
          {isQuest ? item.mission : item.vision}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {isQuest ? (
            <>
              <InfoRow label="기간" value={item.period} />
              <InfoRow label="보상/리워드" value={item.reward} />
            </>
          ) : (
            <>
              <InfoRow label="모집 직군" value={item.roles.join(" · ")} />
              <InfoRow label="제공 지분 범위" value={item.equity} />
            </>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(isQuest ? item.skills : item.values).map((tag) => (
            <span key={tag} className="glass-pill rounded-full px-3 py-1 text-xs font-semibold text-slate-600">
              {tag}
            </span>
          ))}
        </div>

        {!isQuest && item.team_members?.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-black text-slate-800">현재 팀원 현황</p>
            <div className="mt-3 space-y-2">
              {item.team_members.map((member, index) => (
                <div key={`${member.name}-${index}`} className="glass-pill flex items-center justify-between rounded-2xl px-4 py-3">
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

        {!isQuest && (item.join_process || item.work_type) && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {item.join_process && <InfoRow label="합류 방식" value={item.join_process} />}
            {item.work_type && <InfoRow label="근무 형태" value={item.work_type} />}
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
              className={`w-full rounded-2xl bg-gradient-to-b ${accent.grad} px-5 py-4 text-sm font-black text-white shadow-[0_1px_0_rgba(255,255,255,0.4)_inset] ${accent.ring} transition hover:brightness-105`}
            >
              이미 지원했어요 · 워크스페이스 열기
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onApply(item, type)}
              className={`w-full rounded-2xl bg-gradient-to-b ${accent.grad} px-5 py-4 text-sm font-black text-white shadow-[0_1px_0_rgba(255,255,255,0.4)_inset] ${accent.ring} transition hover:brightness-105`}
            >
              {isQuest ? "미션 지원하기" : "정식 멤버 지원하기"}
            </button>
          )}
        </div>

        {!isQuest && !isOwner && relatedQuest && (
          <button
            type="button"
            onClick={() => onSelectQuest(relatedQuest)}
            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#3aa0ff] to-[#0a84ff] p-5 text-left text-white shadow-[0_14px_24px_-10px_rgba(10,132,255,0.5)] transition hover:brightness-105"
          >
            <p className="text-xs font-bold text-blue-100">아직 정식 합류가 고민된다면</p>
            <p className="mt-1 text-base font-black">이 팀과 팝업 미션으로 먼저 일해보며 핏 확인하기</p>
            <p className="mt-2 text-sm text-blue-100">
              "{relatedQuest.title}" 미션으로 서로의 속도, 커뮤니케이션, 문제 해결 방식을 가볍게 확인해보세요.
            </p>
          </button>
        )}
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
