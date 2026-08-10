import { useState } from "react";
import Avatar from "./Avatar";

function FreelancerSection({ freelancers, currentUser, onSelectFreelancer }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = (freelancers ?? [])
    .filter((f) => f.id !== currentUser?.id)
    .filter((f) => {
      if (!normalizedQuery) return true;
      const haystack = [f.display_name, f.role, f.bio, ...(f.skills ?? [])].join(" ").toLowerCase();
      return haystack.includes(normalizedQuery);
    });

  return (
    <section className="min-h-screen px-5 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm font-bold text-[#1B1F4D]">Find talent</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            포트폴리오로 먼저 찾아보세요
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            작업물을 공개한 사람들을 둘러보고, 마음에 들면 바로 미션을 제안할 수 있어요.
          </p>
        </div>

        <div className="relative mb-6">
          <svg
            className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="이름, 역할, 역량으로 검색"
            className="w-full rounded-full border border-slate-200/80 bg-white py-3.5 pl-12 pr-5 text-sm text-slate-800 shadow-[0_12px_28px_-14px_rgba(27,31,77,0.25)] outline-none transition focus:border-[#1B1F4D]/30 focus:shadow-[0_16px_32px_-14px_rgba(27,31,77,0.35)] focus:ring-4 focus:ring-[#1B1F4D]/10"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="glass empty-breathe rounded-3xl border-dashed p-10 text-center">
            <h2 className="text-2xl font-black text-slate-950">아직 등록된 프리랜서가 없습니다</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              프로필 수정에서 Freelancer 공개를 켜면 여기에 표시돼요.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((freelancer) => (
              <FreelancerCard
                key={freelancer.id}
                freelancer={freelancer}
                onClick={() => onSelectFreelancer(freelancer)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FreelancerCard({ freelancer, onClick }) {
  const thumbnails = (freelancer.portfolio ?? []).filter((item) => item.image_url).slice(0, 3);

  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => event.key === "Enter" && onClick?.()}
      className="glass glass-card lift-card cursor-pointer overflow-hidden rounded-3xl hover:border-[#1B1F4D]/20 hover:shadow-[0_16px_36px_-24px_rgba(27,31,77,0.3)]"
    >
      {thumbnails.length > 0 ? (
        <div className="grid h-36 grid-cols-3 gap-0.5 bg-slate-100">
          {thumbnails.map((item) => (
            <img key={item.id} src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
          ))}
        </div>
      ) : (
        <div className="flex h-36 items-center justify-center bg-slate-50">
          <Avatar avatarUrl={freelancer.avatar_url} name={freelancer.display_name} size={56} />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center gap-3">
          <Avatar avatarUrl={freelancer.avatar_url} name={freelancer.display_name} size={36} />
          <div>
            <p className="text-base font-black text-slate-950">{freelancer.display_name}</p>
            <p className="text-xs text-slate-500">{freelancer.role}</p>
          </div>
        </div>
        {freelancer.bio && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{freelancer.bio}</p>
        )}
        {freelancer.skills?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {freelancer.skills.slice(0, 4).map((skill) => (
              <span key={skill} className="glass-pill rounded-full px-3 py-1 text-xs font-semibold text-slate-600">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default FreelancerSection;
