import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Avatar from "./Avatar";

function ApplicantProfileModal({ userId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [profileRes, statsRes, portfolioRes, reviewsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.rpc("get_user_trust_stats", { target_user_id: userId }).single(),
        supabase.from("portfolio_items").select("*").eq("owner_id", userId).order("created_at", { ascending: false }),
        supabase
          .from("reviews")
          .select("*")
          .eq("reviewee_id", userId)
          .eq("is_public", true)
          .order("created_at", { ascending: false }),
      ]);

      if (cancelled) return;
      if (!profileRes.error) setProfile(profileRes.data);
      if (!statsRes.error) setStats(statsRes.data);
      if (!portfolioRes.error) setPortfolio(portfolioRes.data ?? []);
      if (!reviewsRes.error) setReviews(reviewsRes.data ?? []);
      setIsLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-md">
      <div className="glass-strong modal-pop max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[32px] p-6 sm:p-8">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-slate-400">불러오는 중...</p>
        ) : !profile ? (
          <p className="py-10 text-center text-sm text-slate-400">프로필을 찾을 수 없어요.</p>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar avatarUrl={profile.avatar_url} name={profile.display_name} size={64} />
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950">{profile.display_name}</h1>
                  <p className="text-sm text-slate-500">{profile.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="glass-pill shrink-0 rounded-full px-3 py-1 text-sm font-black text-slate-500 transition hover:text-slate-900"
              >
                x
              </button>
            </div>

            {profile.bio && <p className="mt-5 text-sm leading-7 text-slate-600">{profile.bio}</p>}

            {profile.skills?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span key={skill} className="glass-pill rounded-full px-3 py-1 text-xs font-semibold text-slate-600">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {stats && stats.completed_missions > 0 ? (
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
            ) : (
              <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-center text-xs font-bold text-slate-400">
                아직 gotchi에서 완료한 미션이 없는 신규 사용자예요.
              </p>
            )}

            {portfolio.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-black text-slate-800">포트폴리오</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {portfolio.map((item) => (
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

            {reviews.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-black text-slate-800">동료 평가</p>
                <div className="mt-3 space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="glass-pill rounded-2xl p-4">
                      {review.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {review.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {review.comment && (
                        <p className="mt-3 text-sm leading-6 text-slate-700">"{review.comment}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ApplicantProfileModal;
