import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Avatar from "./Avatar";

function FreelancerProfileModal({ freelancer, onClose, onPropose }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .rpc("get_user_trust_stats", { target_user_id: freelancer.id })
      .single()
      .then(({ data, error }) => {
        if (!cancelled && !error) setStats(data);
      });
    return () => {
      cancelled = true;
    };
  }, [freelancer.id]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-md">
      <div className="glass-strong max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[32px] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar avatarUrl={freelancer.avatar_url} name={freelancer.display_name} size={64} />
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">{freelancer.display_name}</h1>
              <p className="text-sm text-slate-500">{freelancer.role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="glass-pill shrink-0 rounded-full px-3 py-1 text-sm font-black text-slate-500 hover:text-slate-900"
          >
            x
          </button>
        </div>

        {freelancer.bio && <p className="mt-5 text-sm leading-7 text-slate-600">{freelancer.bio}</p>}

        {freelancer.skills?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {freelancer.skills.map((skill) => (
              <span key={skill} className="glass-pill rounded-full px-3 py-1 text-xs font-semibold text-slate-600">
                {skill}
              </span>
            ))}
          </div>
        )}

        {freelancer.desired_terms && (
          <div className="mt-4 glass-pill inline-block rounded-2xl px-4 py-3">
            <p className="text-xs font-black text-slate-400">희망 조건</p>
            <p className="mt-1 text-sm font-bold text-slate-800">{freelancer.desired_terms}</p>
          </div>
        )}

        {stats && stats.completed_missions > 0 && (
          <div className="glass-pill mt-5 grid grid-cols-3 gap-2 rounded-2xl p-4 text-center">
            <div>
              <p className="text-lg font-black text-slate-950">{stats.completed_missions}</p>
              <p className="text-[10px] font-bold text-slate-400">완료 미션</p>
            </div>
            <div>
              <p className="text-lg font-black text-slate-950">{stats.review_completion_rate}%</p>
              <p className="text-[10px] font-bold text-slate-400">리뷰 작성률</p>
            </div>
            <div>
              <p className="text-lg font-black text-slate-950">{stats.public_review_count}</p>
              <p className="text-[10px] font-bold text-slate-400">받은 리뷰</p>
            </div>
          </div>
        )}

        {freelancer.portfolio?.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-black text-slate-800">포트폴리오</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {freelancer.portfolio.map((item) => (
                <a
                  key={item.id}
                  href={item.link || undefined}
                  target={item.link ? "_blank" : undefined}
                  rel="noreferrer"
                  className="glass-pill block overflow-hidden rounded-2xl transition hover:bg-white/70"
                >
                  {item.image_url && (
                    <img src={item.image_url} alt={item.title} className="h-36 w-full object-cover" />
                  )}
                  <div className="p-4">
                    <p className="text-sm font-black text-slate-900">{item.title}</p>
                    {item.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.description}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-white/60 pt-6">
          <button
            type="button"
            onClick={onPropose}
            className="w-full rounded-2xl bg-[#1B1F4D] px-5 py-4 text-sm font-black text-white shadow-[0_10px_20px_-8px_rgba(27,31,77,0.45)] transition hover:bg-[#262B63]"
          >
            미션 제안하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default FreelancerProfileModal;
