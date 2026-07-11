import { useEffect, useState } from "react";
import AllianceSection from "./components/AllianceSection";
import HomeSection from "./components/HomeSection";
import PortfolioSection from "./components/PortfolioSection";
import QuestSection from "./components/QuestSection";
import WorkspaceSection from "./components/WorkspaceSection";
import ApplyModal from "./components/ApplyModal";
import DetailModal from "./components/DetailModal";
import WorkspaceModal from "./components/WorkspaceModal";
import ReviewModal from "./components/ReviewModal";
import { isSupabaseConfigured, supabase } from "./lib/supabaseClient";

const tabs = [
  { id: "home", label: "Home" },
  { id: "quest", label: "Quest" },
  { id: "alliance", label: "Alliance" },
  { id: "workspace", label: "Workspace" },
  { id: "portfolio", label: "My Portfolio" },
];

const emptyQuestForm = {
  title: "",
  mission: "",
  period: "7일",
  reward: "",
  skills: "",
};

const emptyAllianceForm = {
  teamName: "",
  vision: "",
  roles: "",
  equity: "",
  values: "",
};

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [quests, setQuests] = useState([]);
  const [alliances, setAlliances] = useState([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("sign-in");
  const [statusMessage, setStatusMessage] = useState("");
  const [questForm, setQuestForm] = useState(emptyQuestForm);
  const [allianceForm, setAllianceForm] = useState(emptyAllianceForm);
  const [applications, setApplications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [detailTarget, setDetailTarget] = useState(null); // { item, type }
  const [applyTarget, setApplyTarget] = useState(null); // { item, type }
  const [workspaceApp, setWorkspaceApp] = useState(null); // application row
  const [messages, setMessages] = useState([]);
  const [reviewApp, setReviewApp] = useState(null); // application row

  const currentUser = session?.user ?? null;

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatusMessage(
        "Supabase 환경변수가 아직 없어 실제 로그인과 저장은 비활성화되어 있습니다.",
      );
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    loadPublicData();
  }, []);

  useEffect(() => {
    if (!currentUser || !isSupabaseConfigured) {
      setProfile(null);
      setApplications([]);
      setReviews([]);
      return;
    }

    loadProfile(currentUser.id);
    loadApplications(currentUser.id);
    loadReviews(currentUser.id);
  }, [currentUser]);

  const loadPublicData = async () => {
    const [{ data: questData, error: questError }, { data: allianceData, error: allianceError }] =
      await Promise.all([
        supabase.from("quests").select("*").order("created_at", { ascending: false }),
        supabase.from("alliances").select("*").order("created_at", { ascending: false }),
      ]);

    if (questError || allianceError) {
      setStatusMessage(
        "데이터를 불러오지 못했습니다. Supabase 테이블과 정책 설정을 확인해주세요.",
      );
      return;
    }

    setQuests(questData ?? []);
    setAlliances(allianceData ?? []);
  };

  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error) {
      setProfile(data);
    }
  };

  const requireAuth = (nextTab) => {
    if (!currentUser) {
      setAuthMode("sign-in");
      setIsAuthOpen(true);
      return;
    }

    setActiveTab(nextTab);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setActiveTab("home");
  };

  const createQuest = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const { error } = await supabase.from("quests").insert({
      owner_id: currentUser.id,
      title: questForm.title,
      mission: questForm.mission,
      period: questForm.period,
      reward: questForm.reward,
      skills: splitTags(questForm.skills),
    });

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    setQuestForm(emptyQuestForm);
    await loadPublicData();
    setActiveTab("quest");
  };

  const createAlliance = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const { error } = await supabase.from("alliances").insert({
      owner_id: currentUser.id,
      team_name: allianceForm.teamName,
      vision: allianceForm.vision,
      roles: splitTags(allianceForm.roles),
      equity: allianceForm.equity,
      values: splitTags(allianceForm.values),
    });

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    setAllianceForm(emptyAllianceForm);
    await loadPublicData();
    setActiveTab("alliance");
  };

  // ---- Matching workflow: 지원 -> 수락 -> 워크스페이스 -> 완료 -> 리뷰 ----

  const loadApplications = async (userId) => {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .or(`applicant_id.eq.${userId},owner_id.eq.${userId}`)
      .order("updated_at", { ascending: false });

    if (!error) {
      setApplications(data ?? []);
    }
  };

  const loadReviews = async (userId) => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("reviewee_id", userId);

    if (!error) {
      setReviews(data ?? []);
    }
  };

  const titleForApplication = (app) => {
    if (!app) return "";
    if (app.type === "quest") {
      return quests.find((q) => q.id === app.quest_id)?.title ?? "삭제된 미션";
    }
    return alliances.find((a) => a.id === app.alliance_id)?.team_name ?? "삭제된 팀 모집글";
  };

  const findMyApplication = (item, type) => {
    if (!currentUser) return null;
    return applications.find(
      (app) =>
        app.applicant_id === currentUser.id &&
        app.type === type &&
        (type === "quest" ? app.quest_id === item.id : app.alliance_id === item.id),
    );
  };

  const hasUnreviewedClosedMissions = () => {
    if (!currentUser) return false;
    return applications.some((app) => {
      if (app.status !== "closed") return false;
      if (app.applicant_id === currentUser.id) return !app.applicant_reviewed;
      if (app.owner_id === currentUser.id) return !app.owner_reviewed;
      return false;
    });
  };

  const openDetail = (item, type) => setDetailTarget({ item, type });
  const closeDetail = () => setDetailTarget(null);

  const openApply = (item, type) => {
    if (!currentUser) {
      setAuthMode("sign-in");
      setIsAuthOpen(true);
      return;
    }
    if (item.owner_id === currentUser.id) {
      setStatusMessage("내가 올린 글에는 지원할 수 없습니다.");
      return;
    }
    if (hasUnreviewedClosedMissions()) {
      setStatusMessage(
        "종료된 미션에 대한 리뷰를 먼저 남겨야 다음 미션에 지원할 수 있어요. Workspace 탭에서 확인해주세요.",
      );
      return;
    }
    setDetailTarget(null);
    setApplyTarget({ item, type });
  };

  const openWorkspace = async (application) => {
    setDetailTarget(null);
    setApplyTarget(null);
    setWorkspaceApp(application);
    await loadMessages(application.id);
  };

  const closeWorkspace = () => {
    setWorkspaceApp(null);
    setMessages([]);
  };

  const loadMessages = async (applicationId) => {
    const { data, error } = await supabase
      .from("application_messages")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: true });

    if (!error) {
      setMessages(data ?? []);
    }
  };

  const sendMessage = async (body) => {
    if (!workspaceApp || !currentUser) return;
    const { error } = await supabase.from("application_messages").insert({
      application_id: workspaceApp.id,
      sender_id: currentUser.id,
      body,
    });

    if (error) {
      setStatusMessage(error.message);
      return;
    }
    await loadMessages(workspaceApp.id);
  };

  const submitApplication = async (note) => {
    if (!applyTarget || !currentUser) return;
    const { item, type } = applyTarget;

    const { error } = await supabase.from("applications").insert({
      type,
      quest_id: type === "quest" ? item.id : null,
      alliance_id: type === "alliance" ? item.id : null,
      applicant_id: currentUser.id,
      owner_id: item.owner_id,
      note,
    });

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    setApplyTarget(null);
    setStatusMessage("지원이 접수됐습니다. Workspace 탭에서 진행 상황을 확인하세요.");
    await loadApplications(currentUser.id);
    setActiveTab("workspace");
  };

  const refreshWorkspaceApp = async (applicationId, userId) => {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (!error && data) {
      setWorkspaceApp(data);
    }
    await loadApplications(userId);
  };

  const respondApplication = async (application, status) => {
    const { error } = await supabase
      .from("applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", application.id);

    if (error) {
      setStatusMessage(error.message);
      return;
    }
    await refreshWorkspaceApp(application.id, currentUser.id);
  };

  const submitWork = async (application, submissionNote, submissionLink) => {
    const { error } = await supabase
      .from("applications")
      .update({
        status: "submitted",
        submission_note: submissionNote,
        submission_link: submissionLink,
        updated_at: new Date().toISOString(),
      })
      .eq("id", application.id);

    if (error) {
      setStatusMessage(error.message);
      return;
    }
    await refreshWorkspaceApp(application.id, currentUser.id);
  };

  const closeApplication = async (application) => {
    const { error } = await supabase
      .from("applications")
      .update({ status: "closed", updated_at: new Date().toISOString() })
      .eq("id", application.id);

    if (error) {
      setStatusMessage(error.message);
      return;
    }
    await refreshWorkspaceApp(application.id, currentUser.id);
  };

  const raiseDispute = async (application) => {
    const { error } = await supabase
      .from("applications")
      .update({ status: "disputed", updated_at: new Date().toISOString() })
      .eq("id", application.id);

    if (error) {
      setStatusMessage(error.message);
      return;
    }
    setStatusMessage(
      "분쟁으로 표시됐어요. gotchi 운영진이 확인 후 다시 진행 상태로 돌려드릴게요.",
    );
    await refreshWorkspaceApp(application.id, currentUser.id);
  };

  const submitReview = async (application, revieweeId, { tags, comment, isPublic }) => {
    const { error } = await supabase.from("reviews").insert({
      application_id: application.id,
      reviewer_id: currentUser.id,
      reviewee_id: revieweeId,
      tags,
      comment,
      is_public: isPublic,
    });

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    const field = currentUser.id === application.applicant_id ? "applicant_reviewed" : "owner_reviewed";
    await supabase.from("applications").update({ [field]: true }).eq("id", application.id);
  };

  const submitReviewForApp = async (application, { tags, comment, privateNote }) => {
    const revieweeId =
      currentUser.id === application.applicant_id ? application.owner_id : application.applicant_id;

    await submitReview(application, revieweeId, { tags, comment, isPublic: true });
    if (privateNote.trim()) {
      await submitReview(application, revieweeId, { tags: [], comment: privateNote, isPublic: false });
    }

    setStatusMessage("리뷰가 등록됐습니다. 다음 미션에도 지원할 수 있어요.");
    setReviewApp(null);
    await refreshWorkspaceApp(application.id, currentUser.id);
    await loadReviews(currentUser.id);
  };

  const renderSection = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeSection
            quests={quests}
            alliances={alliances}
            onCreateQuest={() => requireAuth("create-quest")}
            onCreateAlliance={() => requireAuth("create-alliance")}
            onSelectQuest={(quest) => openDetail(quest, "quest")}
            onSelectAlliance={(alliance) => openDetail(alliance, "alliance")}
          />
        );
      case "quest":
        return (
          <QuestSection
            quests={quests}
            onCreateQuest={() => requireAuth("create-quest")}
            onSelectQuest={(quest) => openDetail(quest, "quest")}
          />
        );
      case "alliance":
        return (
          <AllianceSection
            alliances={alliances}
            onCreateAlliance={() => requireAuth("create-alliance")}
            onSelectAlliance={(alliance) => openDetail(alliance, "alliance")}
          />
        );
      case "workspace":
        return (
          <WorkspaceSection
            applications={applications}
            quests={quests}
            alliances={alliances}
            currentUser={currentUser}
            onOpenApplication={openWorkspace}
            onLogin={() => setIsAuthOpen(true)}
          />
        );
      case "portfolio":
        return (
          <PortfolioSection
            user={currentUser}
            profile={profile}
            quests={quests.filter((quest) => quest.owner_id === currentUser?.id)}
            alliances={alliances.filter((alliance) => alliance.owner_id === currentUser?.id)}
            applications={applications.map((app) => ({
              ...app,
              title:
                app.type === "quest"
                  ? quests.find((q) => q.id === app.quest_id)?.title ?? "삭제된 미션"
                  : alliances.find((a) => a.id === app.alliance_id)?.team_name ?? "삭제된 팀 모집글",
            }))}
            reviews={reviews}
            onLogin={() => setIsAuthOpen(true)}
            onOpenApplication={openWorkspace}
          />
        );
      case "create-quest":
        return (
          <CreateQuestSection
            form={questForm}
            setForm={setQuestForm}
            onSubmit={createQuest}
            onCancel={() => setActiveTab("quest")}
          />
        );
      case "create-alliance":
        return (
          <CreateAllianceSection
            form={allianceForm}
            setForm={setAllianceForm}
            onSubmit={createAlliance}
            onCancel={() => setActiveTab("alliance")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-slate-950">
      <header className="sticky top-3 z-40 px-3 sm:top-4 sm:px-4">
        <nav className="glass-strong mx-auto flex max-w-7xl flex-col gap-3 rounded-[28px] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <button
            type="button"
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-lg font-black text-white shadow-[0_1px_0_rgba(255,255,255,0.35)_inset]">
              g
            </div>
            <div className="text-left">
              <p className="text-base font-black tracking-tight text-slate-950">
                gotchi
              </p>
              <p className="hidden text-xs font-medium text-slate-500 sm:block">
                먼저 일해보고, 팀이 되는 곳
              </p>
            </div>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <div className="glass-pill flex items-center gap-1 rounded-full p-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative rounded-full px-3 py-2 text-xs font-bold transition-colors duration-300 sm:px-4 sm:text-sm ${
                      isActive ? "text-slate-950" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <span className="relative z-10">{tab.label}</span>
                    {isActive && (
                      <span className="absolute inset-0 rounded-full bg-white/90 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_6px_16px_-6px_rgba(15,23,42,0.35)] transition-all duration-300" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => requireAuth("create-quest")}
              className="rounded-full bg-gradient-to-b from-[#ff5b4d] to-[#ff3b30] px-4 py-2 text-sm font-black text-white shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_10px_20px_-8px_rgba(255,59,48,0.6)] transition hover:brightness-105 active:scale-[0.97]"
            >
              미션 올리기
            </button>

            <button
              type="button"
              onClick={() => requireAuth("create-alliance")}
              className="rounded-full bg-gradient-to-b from-[#3aa0ff] to-[#0a84ff] px-4 py-2 text-sm font-black text-white shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_10px_20px_-8px_rgba(10,132,255,0.6)] transition hover:brightness-105 active:scale-[0.97]"
            >
              팀 모집 올리기
            </button>

            {currentUser ? (
              <div className="glass-pill flex items-center gap-2 rounded-full px-3 py-2">
                <span className="text-sm font-bold text-slate-700">
                  {profile?.display_name || currentUser.email}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-xs font-black text-slate-400 hover:text-slate-900"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode("sign-in");
                  setIsAuthOpen(true);
                }}
                className="glass-pill rounded-full px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-white/70"
              >
                로그인
              </button>
            )}
          </div>
        </nav>
      </header>

      {statusMessage && (
        <div className="mx-auto mt-4 max-w-3xl px-4">
          <div className="glass rounded-2xl border-amber-200/70 px-4 py-3 text-center text-sm font-bold text-amber-800">
            {statusMessage}
          </div>
        </div>
      )}

      <main>{renderSection()}</main>

      {detailTarget && (
        <DetailModal
          type={detailTarget.type}
          item={detailTarget.item}
          currentUser={currentUser}
          myApplication={findMyApplication(detailTarget.item, detailTarget.type)}
          onApply={openApply}
          onOpenWorkspace={openWorkspace}
          onClose={closeDetail}
        />
      )}

      {applyTarget && (
        <ApplyModal
          type={applyTarget.type}
          item={applyTarget.item}
          onSubmit={submitApplication}
          onClose={() => setApplyTarget(null)}
        />
      )}

      {workspaceApp && currentUser && (
        <WorkspaceModal
          application={{ ...workspaceApp, title: titleForApplication(workspaceApp) }}
          currentUser={currentUser}
          messages={messages}
          myReview={
            currentUser.id === workspaceApp.applicant_id
              ? workspaceApp.applicant_reviewed
              : workspaceApp.owner_reviewed
          }
          onSendMessage={sendMessage}
          onAccept={() => respondApplication(workspaceApp, "accepted")}
          onReject={() => respondApplication(workspaceApp, "rejected")}
          onSubmitWork={(text) => submitWork(workspaceApp, text, "")}
          onConfirmClose={() => closeApplication(workspaceApp)}
          onRaiseDispute={() => raiseDispute(workspaceApp)}
          onClose={closeWorkspace}
          onOpenReview={() => setReviewApp(workspaceApp)}
        />
      )}

      {reviewApp && (
        <ReviewModal
          onSubmit={(payload) => submitReviewForApp(reviewApp, payload)}
          onClose={() => setReviewApp(null)}
        />
      )}

      {isAuthOpen && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => setIsAuthOpen(false)}
          onAuthed={() => setIsAuthOpen(false)}
          onError={setStatusMessage}
        />
      )}
    </div>
  );
}

function AuthModal({ mode, setMode, onClose, onAuthed, onError }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
    role: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const isSignUp = mode === "sign-up";

  const submit = async (event) => {
    event.preventDefault();

    if (!isSupabaseConfigured) {
      onError("Supabase 환경변수를 먼저 설정해야 실제 로그인이 가능합니다.");
      return;
    }

    setIsLoading(true);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            display_name: form.displayName,
            role: form.role || "Founder",
          },
        },
      });

      if (error) {
        onError(error.message);
        setIsLoading(false);
        return;
      }

      if (data.user && !data.session) {
        onError("가입 확인 메일을 보냈습니다. 메일 인증 후 로그인해주세요.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        onError(error.message);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(false);
    onAuthed();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-md">
      <form onSubmit={submit} className="glass-strong w-full max-w-md rounded-[28px] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black text-[#0a84ff]">gotchi account</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              {isSignUp ? "회원가입" : "로그인"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              실제 이메일과 비밀번호로 Supabase Auth에 연결됩니다.
            </p>
          </div>
          <button type="button" onClick={onClose} className="glass-pill rounded-full px-3 py-1 text-sm font-black text-slate-500 hover:text-slate-900">
            x
          </button>
        </div>

        {isSignUp && (
          <>
            <TextInput
              label="이름"
              value={form.displayName}
              onChange={(value) => setForm((prev) => ({ ...prev, displayName: value }))}
              placeholder="예: 박승혁"
            />
            <TextInput
              label="주요 역할"
              value={form.role}
              onChange={(value) => setForm((prev) => ({ ...prev, role: value }))}
              placeholder="예: Founder, Designer, Developer"
            />
          </>
        )}

        <TextInput
          label="이메일"
          type="email"
          value={form.email}
          onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
          placeholder="you@example.com"
        />
        <TextInput
          label="비밀번호"
          type="password"
          value={form.password}
          onChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
          placeholder="8자 이상"
        />

        <button
          disabled={isLoading}
          className="mt-6 w-full rounded-2xl bg-gradient-to-b from-[#3aa0ff] to-[#0a84ff] px-5 py-4 text-sm font-black text-white shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_14px_24px_-10px_rgba(10,132,255,0.6)] transition hover:brightness-105 disabled:opacity-50"
        >
          {isLoading ? "처리 중..." : isSignUp ? "회원가입하기" : "로그인하기"}
        </button>

        <button
          type="button"
          onClick={() => setMode(isSignUp ? "sign-in" : "sign-up")}
          className="mt-4 w-full text-sm font-bold text-slate-500 hover:text-slate-950"
        >
          {isSignUp ? "이미 계정이 있어요" : "처음이라면 회원가입하기"}
        </button>
      </form>
    </div>
  );
}

function CreateQuestSection({ form, setForm, onSubmit, onCancel }) {
  return (
    <EditorShell title="새 팝업 미션 올리기" eyebrow="Create Popup Mission">
      <form onSubmit={onSubmit} className="space-y-5">
        <TextInput label="미션 제목" value={form.title} onChange={(value) => setForm((prev) => ({ ...prev, title: value }))} />
        <TextareaInput label="해결이 필요한 구체적 미션" value={form.mission} onChange={(value) => setForm((prev) => ({ ...prev, mission: value }))} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="기간" value={form.period} onChange={(value) => setForm((prev) => ({ ...prev, period: value }))} />
          <TextInput label="보상/리워드" value={form.reward} onChange={(value) => setForm((prev) => ({ ...prev, reward: value }))} />
        </div>
        <TextInput label="필요 스킬" value={form.skills} onChange={(value) => setForm((prev) => ({ ...prev, skills: value }))} placeholder="쉼표로 구분: Figma, React" />
        <EditorActions submitLabel="미션 등록하기" onCancel={onCancel} />
      </form>
    </EditorShell>
  );
}

function CreateAllianceSection({ form, setForm, onSubmit, onCancel }) {
  return (
    <EditorShell title="정식 팀 모집글 올리기" eyebrow="Create Build-up Team">
      <form onSubmit={onSubmit} className="space-y-5">
        <TextInput label="팀 이름" value={form.teamName} onChange={(value) => setForm((prev) => ({ ...prev, teamName: value }))} />
        <TextareaInput label="팀 비전" value={form.vision} onChange={(value) => setForm((prev) => ({ ...prev, vision: value }))} />
        <TextInput label="모집 직군" value={form.roles} onChange={(value) => setForm((prev) => ({ ...prev, roles: value }))} placeholder="쉼표로 구분: Frontend Engineer, Designer" />
        <TextInput label="제공 지분 범위" value={form.equity} onChange={(value) => setForm((prev) => ({ ...prev, equity: value }))} placeholder="예: 2% - 6%" />
        <TextInput label="팀 가치관" value={form.values} onChange={(value) => setForm((prev) => ({ ...prev, values: value }))} placeholder="쉼표로 구분: 빠른 실험, 투명한 소통" />
        <EditorActions submitLabel="팀 모집 등록하기" onCancel={onCancel} />
      </form>
    </EditorShell>
  );
}

function EditorShell({ eyebrow, title, children }) {
  return (
    <section className="min-h-screen px-5 py-10 sm:px-6 lg:px-8">
      <div className="glass-strong mx-auto max-w-3xl rounded-[32px] p-6 sm:p-8">
        <p className="text-sm font-black text-[#0a84ff]">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          등록한 글은 Supabase 데이터베이스에 저장되고 모든 방문자에게 노출됩니다.
        </p>
        <div className="mt-7">{children}</div>
      </div>
    </section>
  );
}

function TextInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="mt-4 block text-sm font-black text-slate-800">
      {label}
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="glass-pill mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition focus:border-[#0a84ff]/50 focus:ring-4 focus:ring-[#0a84ff]/15"
      />
    </label>
  );
}

function TextareaInput({ label, value, onChange }) {
  return (
    <label className="block text-sm font-black text-slate-800">
      {label}
      <textarea
        required
        rows={5}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="glass-pill mt-2 w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none transition focus:border-[#0a84ff]/50 focus:ring-4 focus:ring-[#0a84ff]/15"
      />
    </label>
  );
}

function EditorActions({ submitLabel, onCancel }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button className="flex-1 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 px-5 py-4 text-sm font-black text-white shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_14px_24px_-10px_rgba(15,23,42,0.5)] transition hover:brightness-110">
        {submitLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="glass-pill flex-1 rounded-2xl px-5 py-4 text-sm font-black text-slate-600 transition hover:bg-white/70"
      >
        취소
      </button>
    </div>
  );
}

function splitTags(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default App;
