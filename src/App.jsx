import { useEffect, useRef, useState } from "react";
import HomeSection from "./components/HomeSection";
import PortfolioSection from "./components/PortfolioSection";
import WorkspaceSection from "./components/WorkspaceSection";
import ApplyModal from "./components/ApplyModal";
import DetailModal from "./components/DetailModal";
import WorkspaceModal from "./components/WorkspaceModal";
import ReviewModal from "./components/ReviewModal";
import MultiSelectChips from "./components/MultiSelectChips";
import EditProfileModal from "./components/EditProfileModal";
import Footer from "./components/Footer";
import AdminSection from "./components/AdminSection";
import Avatar from "./components/Avatar";
import NotificationBell from "./components/NotificationBell";
import RehireModal from "./components/RehireModal";
import { isSupabaseConfigured, supabase } from "./lib/supabaseClient";

const tabs = [
  { id: "home", label: "Home" },
  { id: "workspace", label: "Workspace" },
  { id: "portfolio", label: "My Portfolio" },
];

const PRIMARY_TAB_IDS = ["home", "workspace", "portfolio"];

const SKILL_OPTIONS = [
  "기획력",
  "디자인 툴 숙련자",
  "코딩 숙련자",
  "재무 관련 경험자",
  "카피라이팅 경험자",
  "데이터 분석 경험자",
  "SNS/콘텐츠 운영 경험자",
  "영업 경험자",
];
const REWARD_OPTIONS = [
  "현금 보상",
  "인터뷰 우선권",
  "협업 평판 피드백",
  "정규직 전환 기회",
  "활동비 지원",
];
const VALUE_OPTIONS = ["빠른 실험", "고객 집착", "투명한 커뮤니케이션", "데이터 기반 의사결정", "실행력", "수평적 문화"];
const WORK_TYPE_OPTIONS = ["Remote-first", "주 1회 오프라인", "주 2-3회 오프라인", "상근(출근)"];
const JOIN_PROCESS_OPTIONS = ["1개월 협업 후 논의", "3개월 협업 후 논의", "이 미션 완료 후 바로 논의"];
const MEMBER_TYPE_OPTIONS = ["Full-time", "Part-time", "Advisor"];

function friendlyError(message) {
  if (!message) return message;
  return message.replace(/^RATE_LIMIT:\s*/, "");
}

const emptyQuestForm = {
  title: "",
  mission: "",
  period: "7일",
  rewardTags: [],
  rewardDetail: "",
  skills: [],
  offersLongTerm: false,
  teamName: "",
  teamVision: "",
  teamValues: [],
  teamMembers: [],
  joinProcess: JOIN_PROCESS_OPTIONS[0],
  workType: WORK_TYPE_OPTIONS[0],
  longTermReward: "",
};

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [quests, setQuests] = useState([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [authMode, setAuthMode] = useState("sign-in");
  const [statusMessage, setStatusMessage] = useState("");
  const [questForm, setQuestForm] = useState(emptyQuestForm);
  const [applications, setApplications] = useState([]);
  const [adminApplications, setAdminApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
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
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === "PASSWORD_RECOVERY") {
        setIsResetPasswordOpen(true);
      }
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
      setNotifications([]);
      return;
    }

    loadProfile(currentUser.id);
    loadApplications(currentUser.id);
    loadReviews(currentUser.id);
    loadNotifications(currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !isSupabaseConfigured) return;

    const channel = supabase
      .channel(`notifications-${currentUser.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${currentUser.id}` },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  const didResolveDeepLink = useRef(false);

  useEffect(() => {
    if (didResolveDeepLink.current) return;
    if (quests.length === 0) return;

    const match = window.location.pathname.match(/^\/quest\/([^/]+)$/);
    if (match) {
      const [, id] = match;
      const item = quests.find((entry) => entry.id === id);
      if (item) {
        setDetailTarget({ item, type: "quest" });
      }
    }
    didResolveDeepLink.current = true;
  }, [quests]);

  useEffect(() => {
    const handlePopState = () => {
      const match = window.location.pathname.match(/^\/quest\/([^/]+)$/);
      if (!match) {
        setDetailTarget(null);
        return;
      }
      const [, id] = match;
      const item = quests.find((entry) => entry.id === id);
      setDetailTarget(item ? { item, type: "quest" } : null);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [quests]);

  const loadPublicData = async () => {
    const { data: questData, error: questError } = await supabase
      .from("quests")
      .select("*")
      .order("created_at", { ascending: false });

    if (questError) {
      setStatusMessage(
        "데이터를 불러오지 못했습니다. Supabase 테이블과 정책 설정을 확인해주세요.",
      );
      return;
    }

    setQuests(questData ?? []);
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

  const updateProfile = async (displayName, role, avatarUrl) => {
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, role, avatar_url: avatarUrl || "" })
      .eq("id", currentUser.id);

    if (error) {
      setStatusMessage(friendlyError(error.message));
      return;
    }

    setIsEditProfileOpen(false);
    setStatusMessage("프로필이 업데이트됐어요.");
    await loadProfile(currentUser.id);
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

    const reward = [...questForm.rewardTags, questForm.rewardDetail.trim()]
      .filter(Boolean)
      .join(" + ");

    const { error } = await supabase.from("quests").insert({
      owner_id: currentUser.id,
      title: questForm.title,
      mission: questForm.mission,
      period: questForm.period,
      reward,
      skills: questForm.skills,
      offers_long_term: questForm.offersLongTerm,
      team_name: questForm.offersLongTerm ? questForm.teamName : "",
      team_vision: questForm.offersLongTerm ? questForm.teamVision : "",
      team_values: questForm.offersLongTerm ? questForm.teamValues : [],
      team_members: questForm.offersLongTerm ? questForm.teamMembers : [],
      join_process: questForm.offersLongTerm ? questForm.joinProcess : "",
      work_type: questForm.offersLongTerm ? questForm.workType : "",
      long_term_reward: questForm.offersLongTerm ? questForm.longTermReward : "",
    });

    if (error) {
      setStatusMessage(friendlyError(error.message));
      return;
    }

    setQuestForm(emptyQuestForm);
    await loadPublicData();
    setActiveTab("home");
  };

  const deleteQuest = async (quest) => {
    if (!window.confirm("이 미션을 삭제할까요? 되돌릴 수 없어요.")) return;
    const { error } = await supabase.from("quests").delete().eq("id", quest.id);
    if (error) {
      setStatusMessage(friendlyError(error.message));
      return;
    }
    await loadPublicData();
  };

  // ---- Matching workflow: 지원 -> 수락 -> 워크스페이스 -> 완료 -> 리뷰 ----

  useEffect(() => {
    if (!profile?.is_admin || !isSupabaseConfigured) {
      setAdminApplications([]);
      return;
    }

    supabase
      .from("applications")
      .select("*")
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setAdminApplications(data ?? []);
      });
  }, [profile]);

  const resolveDispute = async (application, status) => {
    const { error } = await supabase
      .from("applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", application.id);

    if (error) {
      setStatusMessage(friendlyError(error.message));
      return;
    }

    setStatusMessage("분쟁이 처리됐어요.");
    const { data } = await supabase.from("applications").select("*").order("updated_at", { ascending: false });
    setAdminApplications(data ?? []);
    if (currentUser) await loadApplications(currentUser.id);
  };

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

  const loadNotifications = async (userId) => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (!error) {
      setNotifications(data ?? []);
    }
  };

  const openNotification = async (notif) => {
    if (!notif.is_read) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id);
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)));
    }

    if (notif.application_id) {
      const { data } = await supabase
        .from("applications")
        .select("*")
        .eq("id", notif.application_id)
        .single();
      if (data) {
        setActiveTab("workspace");
        await openWorkspace(data);
      }
    }
  };

  const deleteAccount = async () => {
    const { error } = await supabase.rpc("delete_own_account");
    if (error) {
      setStatusMessage(friendlyError(error.message));
      return;
    }

    setIsEditProfileOpen(false);
    await supabase.auth.signOut();
    setStatusMessage("계정이 삭제됐어요. 그동안 이용해주셔서 감사합니다.");
  };

  const titleForApplication = (app) => {
    if (!app) return "";
    return quests.find((q) => q.id === app.quest_id)?.title ?? "삭제된 미션";
  };

  const findMyApplication = (item) => {
    if (!currentUser) return null;
    return applications.find(
      (app) => app.applicant_id === currentUser.id && app.quest_id === item.id,
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

  const openDetail = (item) => {
    setDetailTarget({ item, type: "quest" });
    window.history.pushState(null, "", `/quest/${item.id}`);
  };

  const closeDetail = () => {
    setDetailTarget(null);
    if (window.location.pathname !== "/") {
      window.history.pushState(null, "", "/");
    }
  };

  const openApply = (item) => {
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
    setApplyTarget({ item, type: "quest" });
  };

  const [pairHistory, setPairHistory] = useState([]);
  const [counterpartStats, setCounterpartStats] = useState(null);
  const [rehireTarget, setRehireTarget] = useState(null);

  const openWorkspace = async (application) => {
    setDetailTarget(null);
    setApplyTarget(null);
    setWorkspaceApp(application);
    await loadMessages(application.id);
    await loadPairHistory(application);
    await loadCounterpartStats(application);
  };

  const loadCounterpartStats = async (application) => {
    if (!currentUser) return;
    const counterpartId =
      currentUser.id === application.applicant_id ? application.owner_id : application.applicant_id;

    const { data, error } = await supabase
      .rpc("get_user_trust_stats", { target_user_id: counterpartId })
      .single();

    if (!error) {
      setCounterpartStats(data);
    }
  };

  const closeWorkspace = () => {
    setWorkspaceApp(null);
    setMessages([]);
    setAttachmentUrls({});
    setPairHistory([]);
    setCounterpartStats(null);
  };

  const loadPairHistory = async (application) => {
    if (!currentUser) return;
    const counterpartId =
      currentUser.id === application.applicant_id ? application.owner_id : application.applicant_id;

    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("status", "closed")
      .or(
        `and(applicant_id.eq.${currentUser.id},owner_id.eq.${counterpartId}),and(applicant_id.eq.${counterpartId},owner_id.eq.${currentUser.id})`,
      )
      .order("updated_at", { ascending: false });

    if (!error) {
      setPairHistory(data ?? []);
    }
  };

  const rehireCollaborator = async (fields) => {
    if (!rehireTarget || !currentUser) return;

    const collaboratorId =
      currentUser.id === rehireTarget.applicant_id ? rehireTarget.owner_id : rehireTarget.applicant_id;

    const { data: newQuest, error: questError } = await supabase
      .from("quests")
      .insert({
        owner_id: currentUser.id,
        title: fields.title,
        mission: fields.mission,
        period: fields.period,
        reward: fields.reward,
        skills: [],
      })
      .select()
      .single();

    if (questError) {
      setStatusMessage(friendlyError(questError.message));
      return;
    }

    const { data: newApplication, error: appError } = await supabase
      .from("applications")
      .insert({
        quest_id: newQuest.id,
        applicant_id: collaboratorId,
        owner_id: currentUser.id,
        note: "이전에 함께 일했던 사이라 재계약으로 바로 시작돼요.",
        status: "accepted",
      })
      .select()
      .single();

    if (appError) {
      setStatusMessage(friendlyError(appError.message));
      return;
    }

    setRehireTarget(null);
    setStatusMessage("새 미션이 시작됐어요. 워크스페이스에서 바로 진행하세요.");
    await loadPublicData();
    await loadApplications(currentUser.id);
    setActiveTab("workspace");
    await openWorkspace(newApplication);
  };

  const [attachmentUrls, setAttachmentUrls] = useState({});

  const loadMessages = async (applicationId) => {
    const { data, error } = await supabase
      .from("application_messages")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: true });

    if (!error) {
      setMessages(data ?? []);
      await loadAttachmentUrls(data ?? []);
    }
  };

  const loadAttachmentUrls = async (messageRows) => {
    const paths = messageRows.filter((m) => m.attachment_path).map((m) => m.attachment_path);
    if (paths.length === 0) return;

    const entries = await Promise.all(
      paths.map(async (path) => {
        const { data } = await supabase.storage.from("attachments").createSignedUrl(path, 60 * 60);
        return [path, data?.signedUrl];
      }),
    );

    setAttachmentUrls((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
  };

  const sendMessage = async (body) => {
    if (!workspaceApp || !currentUser) return;
    const { error } = await supabase.from("application_messages").insert({
      application_id: workspaceApp.id,
      sender_id: currentUser.id,
      body,
    });

    if (error) {
      setStatusMessage(friendlyError(error.message));
      return;
    }
    await loadMessages(workspaceApp.id);
  };

  const sendAttachment = async (file) => {
    if (!workspaceApp || !currentUser) return;

    const path = `${workspaceApp.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("attachments").upload(path, file);

    if (uploadError) {
      setStatusMessage(friendlyError(uploadError.message));
      return;
    }

    const { error } = await supabase.from("application_messages").insert({
      application_id: workspaceApp.id,
      sender_id: currentUser.id,
      body: "",
      attachment_path: path,
      attachment_name: file.name,
      attachment_type: file.type,
    });

    if (error) {
      setStatusMessage(friendlyError(error.message));
      return;
    }
    await loadMessages(workspaceApp.id);
  };

  const submitApplication = async (note) => {
    if (!applyTarget || !currentUser) return;
    const { item } = applyTarget;

    const { error } = await supabase.from("applications").insert({
      quest_id: item.id,
      applicant_id: currentUser.id,
      owner_id: item.owner_id,
      note,
    });

    if (error) {
      setStatusMessage(friendlyError(error.message));
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
      setStatusMessage(friendlyError(error.message));
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
      setStatusMessage(friendlyError(error.message));
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
      setStatusMessage(friendlyError(error.message));
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
      setStatusMessage(friendlyError(error.message));
      return;
    }
    setStatusMessage(
      "분쟁으로 표시됐어요. gotchi 운영진이 확인 후 다시 진행 상태로 돌려드릴게요.",
    );
    await refreshWorkspaceApp(application.id, currentUser.id);
  };

  const updatePaymentNote = async (application, paymentNote) => {
    const { error } = await supabase
      .from("applications")
      .update({ payment_note: paymentNote, updated_at: new Date().toISOString() })
      .eq("id", application.id);

    if (error) {
      setStatusMessage(friendlyError(error.message));
      return;
    }
    await refreshWorkspaceApp(application.id, currentUser.id);
  };

  const confirmPayment = async (application, confirmed) => {
    const { error } = await supabase
      .from("applications")
      .update({ payment_confirmed: confirmed, updated_at: new Date().toISOString() })
      .eq("id", application.id);

    if (error) {
      setStatusMessage(friendlyError(error.message));
      return;
    }
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
      setStatusMessage(friendlyError(error.message));
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

  const allTabs = profile?.is_admin ? [...tabs, { id: "admin", label: "Admin" }] : tabs;
  const primaryTabs = allTabs.filter((tab) => PRIMARY_TAB_IDS.includes(tab.id));
  const moreTabs = allTabs.filter((tab) => !PRIMARY_TAB_IDS.includes(tab.id));

  const renderSection = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeSection
            quests={quests}
            onCreateQuest={() => requireAuth("create-quest")}
            onSelectQuest={openDetail}
          />
        );
      case "workspace":
        return (
          <WorkspaceSection
            applications={applications}
            quests={quests}
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
            applications={applications.map((app) => ({
              ...app,
              title: quests.find((q) => q.id === app.quest_id)?.title ?? "삭제된 미션",
            }))}
            reviews={reviews}
            onLogin={() => setIsAuthOpen(true)}
            onOpenApplication={openWorkspace}
            onDeleteQuest={deleteQuest}
            onEditProfile={() => setIsEditProfileOpen(true)}
          />
        );
      case "admin":
        return profile?.is_admin ? (
          <AdminSection
            applications={adminApplications}
            quests={quests}
            onResolve={resolveDispute}
          />
        ) : null;
      case "create-quest":
        return (
          <CreateQuestSection
            form={questForm}
            setForm={setQuestForm}
            onSubmit={createQuest}
            onCancel={() => setActiveTab("home")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-slate-950">
      <header className="sticky top-0 z-40 border-b border-[#eceef4] bg-white">
        <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
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

            <div className="flex shrink-0 items-center gap-2 sm:hidden">
              {currentUser && (
                <NotificationBell notifications={notifications} onOpenNotification={openNotification} />
              )}
              {currentUser ? (
                <Avatar
                  avatarUrl={profile?.avatar_url}
                  name={profile?.display_name || currentUser.email}
                  size={36}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("sign-in");
                    setIsAuthOpen(true);
                  }}
                  className="glass-pill rounded-full px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-white/70"
                >
                  로그인
                </button>
              )}
            </div>
          </div>

          <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            <div className="flex shrink-0 items-center gap-1">
              {primaryTabs.map((tab, index) => {
                const isActive = activeTab === tab.id;

                return (
                  <span key={tab.id} className="flex shrink-0 items-center">
                    {index > 0 && <span className="mx-2 text-xs font-medium text-slate-300">|</span>}
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative shrink-0 whitespace-nowrap px-1 pb-1 text-xs font-black uppercase tracking-wide transition-colors sm:text-sm ${
                        isActive ? "text-[#1B1F4D]" : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      {tab.label}
                      {isActive && (
                        <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-[#1B1F4D]" />
                      )}
                    </button>
                  </span>
                );
              })}

              <span className="mx-2 text-xs font-medium text-slate-300">|</span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMoreMenuOpen((prev) => !prev)}
                  className={`flex shrink-0 items-center gap-1 whitespace-nowrap px-1 text-xs font-black uppercase tracking-wide transition-colors sm:text-sm ${
                    moreTabs.some((tab) => tab.id === activeTab) ? "text-[#1B1F4D]" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  더보기
                  <span className="text-[10px]">{isMoreMenuOpen ? "▲" : "▼"}</span>
                </button>

                {isMoreMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsMoreMenuOpen(false)} />
                    <div className="glass-strong absolute left-0 z-40 mt-3 w-44 overflow-hidden rounded-2xl p-1.5">
                      {moreTabs.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsMoreMenuOpen(false);
                          }}
                          className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-bold transition ${
                            activeTab === tab.id ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-white/70"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => requireAuth("create-quest")}
              className="shrink-0 whitespace-nowrap rounded-full bg-[#1B1F4D] px-4 py-2 text-sm font-black text-white shadow-[0_10px_20px_-8px_rgba(27,31,77,0.5)] transition hover:bg-[#262B63] active:scale-[0.97]"
            >
              미션 올리기
            </button>

            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              {currentUser ? (
                <>
                  <NotificationBell notifications={notifications} onOpenNotification={openNotification} />
                  <div className="glass-pill flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3">
                    <Avatar
                      avatarUrl={profile?.avatar_url}
                      name={profile?.display_name || currentUser.email}
                      size={28}
                    />
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
                </>
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
          </div>

          {currentUser && (
            <button
              type="button"
              onClick={handleSignOut}
              className="text-left text-xs font-black text-slate-400 hover:text-slate-900 sm:hidden"
            >
              {profile?.display_name || currentUser.email} · 로그아웃
            </button>
          )}
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

      <Footer />

      {detailTarget && (
        <DetailModal
          item={detailTarget.item}
          currentUser={currentUser}
          myApplication={findMyApplication(detailTarget.item)}
          onApply={openApply}
          onOpenWorkspace={openWorkspace}
          onClose={closeDetail}
        />
      )}

      {applyTarget && (
        <ApplyModal
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
          attachmentUrls={attachmentUrls}
          onSendAttachment={sendAttachment}
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
          onUpdatePaymentNote={(note) => updatePaymentNote(workspaceApp, note)}
          onConfirmPayment={(confirmed) => confirmPayment(workspaceApp, confirmed)}
          onClose={closeWorkspace}
          onOpenReview={() => setReviewApp(workspaceApp)}
          pairHistory={pairHistory
            .filter((app) => app.id !== workspaceApp.id)
            .map((app) => ({ ...app, title: titleForApplication(app) }))}
          counterpartStats={counterpartStats}
          onRehire={() => setRehireTarget(workspaceApp)}
        />
      )}

      {rehireTarget && (
        <RehireModal onSubmit={rehireCollaborator} onClose={() => setRehireTarget(null)} />
      )}

      {reviewApp && (
        <ReviewModal
          onSubmit={(payload) => submitReviewForApp(reviewApp, payload)}
          onClose={() => setReviewApp(null)}
        />
      )}

      {isEditProfileOpen && (
        <EditProfileModal
          user={currentUser}
          profile={profile}
          onSubmit={updateProfile}
          onClose={() => setIsEditProfileOpen(false)}
          onDeleteAccount={deleteAccount}
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

      {isResetPasswordOpen && (
        <ResetPasswordModal
          onClose={() => setIsResetPasswordOpen(false)}
          onDone={(message) => {
            setIsResetPasswordOpen(false);
            setStatusMessage(message);
          }}
        />
      )}
    </div>
  );
}

function translateAuthError(message) {
  const map = {
    "User already registered": "이미 가입된 이메일이에요. 로그인하거나 비밀번호를 찾아주세요.",
    "Invalid login credentials": "이메일 또는 비밀번호가 올바르지 않아요.",
    "Email not confirmed": "이메일 인증이 아직 안 됐어요. 받은 메일함을 확인해주세요.",
    "Password should be at least 6 characters": "비밀번호는 최소 6자 이상이어야 해요.",
    "For security purposes, you can only request this after 60 seconds.":
      "보안을 위해 재전송은 60초 뒤에 다시 시도할 수 있어요.",
  };
  return map[message] ?? message;
}

function AuthModal({ mode, setMode, onClose, onAuthed, onError }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
    role: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const isSignUp = mode === "sign-up";
  const isForgot = mode === "forgot";

  const submit = async (event) => {
    event.preventDefault();

    if (!isSupabaseConfigured) {
      onError("Supabase 환경변수를 먼저 설정해야 실제 로그인이 가능합니다.");
      return;
    }

    setIsLoading(true);

    if (isForgot) {
      const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
        redirectTo: window.location.origin,
      });

      setIsLoading(false);

      if (error) {
        onError(translateAuthError(error.message));
        return;
      }

      setResetSent(true);
      return;
    }

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
        onError(translateAuthError(error.message));
        setIsLoading(false);
        return;
      }

      if (data.user?.identities?.length === 0) {
        onError("이미 가입된 이메일이에요. 로그인하거나 비밀번호를 찾아주세요.");
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
        onError(translateAuthError(error.message));
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
            <p className="text-sm font-black text-[#1B1F4D]">gotchi account</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              {isForgot ? "비밀번호 찾기" : isSignUp ? "회원가입" : "로그인"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {isForgot
                ? "가입할 때 쓴 이메일로 재설정 링크를 보내드려요."
                : "실제 이메일과 비밀번호로 Supabase Auth에 연결됩니다."}
            </p>
          </div>
          <button type="button" onClick={onClose} className="glass-pill rounded-full px-3 py-1 text-sm font-black text-slate-500 hover:text-slate-900">
            x
          </button>
        </div>

        {isForgot ? (
          resetSent ? (
            <p className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
              {form.email}(으)로 재설정 링크를 보냈어요. 메일함(스팸함도)을 확인해주세요.
            </p>
          ) : (
            <TextInput
              label="이메일"
              type="email"
              value={form.email}
              onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
              placeholder="you@example.com"
            />
          )
        ) : (
          <>
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
          </>
        )}

        {!resetSent && (
          <button
            disabled={isLoading}
            className="mt-6 w-full rounded-2xl bg-[#1B1F4D] px-5 py-4 text-sm font-black text-white shadow-[0_14px_24px_-10px_rgba(27,31,77,0.45)] transition hover:bg-[#262B63] disabled:opacity-50"
          >
            {isLoading
              ? "처리 중..."
              : isForgot
                ? "재설정 링크 보내기"
                : isSignUp
                  ? "회원가입하기"
                  : "로그인하기"}
          </button>
        )}

        {!isForgot && !isSignUp && (
          <button
            type="button"
            onClick={() => setMode("forgot")}
            className="mt-3 w-full text-xs font-bold text-slate-400 hover:text-slate-700"
          >
            비밀번호를 잊으셨나요?
          </button>
        )}

        <button
          type="button"
          onClick={() => setMode(isForgot ? "sign-in" : isSignUp ? "sign-in" : "sign-up")}
          className="mt-4 w-full text-sm font-bold text-slate-500 hover:text-slate-950"
        >
          {isForgot ? "로그인으로 돌아가기" : isSignUp ? "이미 계정이 있어요" : "처음이라면 회원가입하기"}
        </button>
      </form>
    </div>
  );
}

function ResetPasswordModal({ onClose, onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 해요.");
      return;
    }
    if (password !== confirm) {
      setError("두 비밀번호가 서로 달라요.");
      return;
    }

    setIsLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (updateError) {
      setError(translateAuthError(updateError.message));
      return;
    }

    onDone("비밀번호가 변경됐어요. 새 비밀번호로 로그인해주세요.");
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-md">
      <form onSubmit={submit} className="glass-strong w-full max-w-md rounded-[28px] p-6">
        <p className="text-sm font-black text-[#1B1F4D]">gotchi account</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">새 비밀번호 설정</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          새로 사용할 비밀번호를 입력해주세요.
        </p>

        <TextInput label="새 비밀번호" type="password" value={password} onChange={setPassword} placeholder="6자 이상" />
        <TextInput label="새 비밀번호 확인" type="password" value={confirm} onChange={setConfirm} placeholder="다시 한 번 입력" />

        {error && <p className="mt-3 text-sm font-bold text-[#ff3b30]">{error}</p>}

        <button
          disabled={isLoading}
          className="mt-6 w-full rounded-2xl bg-[#1B1F4D] px-5 py-4 text-sm font-black text-white shadow-[0_14px_24px_-10px_rgba(27,31,77,0.45)] transition hover:bg-[#262B63] disabled:opacity-50"
        >
          {isLoading ? "변경 중..." : "비밀번호 변경하기"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full text-sm font-bold text-slate-500 hover:text-slate-950"
        >
          취소
        </button>
      </form>
    </div>
  );
}

function CreateQuestSection({ form, setForm, onSubmit, onCancel }) {
  const [memberDraft, setMemberDraft] = useState({ name: "", role: "", type: MEMBER_TYPE_OPTIONS[0] });

  const addMember = () => {
    if (!memberDraft.name.trim() || !memberDraft.role.trim()) return;
    setForm((prev) => ({ ...prev, teamMembers: [...prev.teamMembers, memberDraft] }));
    setMemberDraft({ name: "", role: "", type: MEMBER_TYPE_OPTIONS[0] });
  };

  const removeMember = (index) => {
    setForm((prev) => ({ ...prev, teamMembers: prev.teamMembers.filter((_, i) => i !== index) }));
  };

  return (
    <EditorShell title="새 미션 올리기" eyebrow="Create Mission">
      <form onSubmit={onSubmit} className="space-y-5">
        <TextInput label="미션 제목" value={form.title} onChange={(value) => setForm((prev) => ({ ...prev, title: value }))} />
        <TextareaInput label="해결이 필요한 구체적 미션" value={form.mission} onChange={(value) => setForm((prev) => ({ ...prev, mission: value }))} />
        <TextInput label="기간" value={form.period} onChange={(value) => setForm((prev) => ({ ...prev, period: value }))} />

        <MultiSelectChips
          label="필요 역량"
          options={SKILL_OPTIONS}
          selected={form.skills}
          onChange={(skills) => setForm((prev) => ({ ...prev, skills }))}
        />

        <MultiSelectChips
          label="보상 유형"
          options={REWARD_OPTIONS}
          selected={form.rewardTags}
          onChange={(rewardTags) => setForm((prev) => ({ ...prev, rewardTags }))}
          allowCustom={false}
        />
        <TextInput
          label="보상 상세 (선택)"
          value={form.rewardDetail}
          onChange={(value) => setForm((prev) => ({ ...prev, rewardDetail: value }))}
          placeholder="예: 800,000원"
        />

        <div className="rounded-2xl border border-dashed border-slate-300 p-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.offersLongTerm}
              onChange={(event) => setForm((prev) => ({ ...prev, offersLongTerm: event.target.checked }))}
              className="h-4 w-4"
            />
            <span className="text-sm font-black text-slate-800">
              이 미션은 장기 합류로 이어질 수 있어요
            </span>
          </label>
          <p className="mt-1 pl-7 text-xs text-slate-500">
            체크하면 지원자가 미션 지원 전에 팀 정보를 미리 볼 수 있어요.
          </p>

          {form.offersLongTerm && (
            <div className="mt-5 space-y-5 border-t border-slate-200 pt-5">
              <TextInput label="팀 이름" value={form.teamName} onChange={(value) => setForm((prev) => ({ ...prev, teamName: value }))} />
              <TextareaInput label="팀 비전" value={form.teamVision} onChange={(value) => setForm((prev) => ({ ...prev, teamVision: value }))} />

              <MultiSelectChips
                label="팀 가치관"
                options={VALUE_OPTIONS}
                selected={form.teamValues}
                onChange={(teamValues) => setForm((prev) => ({ ...prev, teamValues }))}
              />

              <TextInput
                label="장기 합류시 조건 (현금 우선, 지분은 추후 별도 협의)"
                value={form.longTermReward}
                onChange={(value) => setForm((prev) => ({ ...prev, longTermReward: value }))}
                placeholder="예: 활동비 지급, 세부 조건은 협의 후 결정"
              />

              <div>
                <p className="text-sm font-black text-slate-800">근무 형태</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {WORK_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, workType: option }))}
                      className={`rounded-full px-3 py-2 text-xs font-bold transition ${
                        form.workType === option ? "bg-slate-950 text-white" : "glass-pill text-slate-600 hover:bg-white/70"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-black text-slate-800">합류 방식</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {JOIN_PROCESS_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, joinProcess: option }))}
                      className={`rounded-full px-3 py-2 text-xs font-bold transition ${
                        form.joinProcess === option ? "bg-slate-950 text-white" : "glass-pill text-slate-600 hover:bg-white/70"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-black text-slate-800">현재 팀원 (선택)</p>
                {form.teamMembers.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {form.teamMembers.map((member, index) => (
                      <div key={`${member.name}-${index}`} className="glass-pill flex items-center justify-between rounded-2xl px-4 py-2">
                        <span className="text-sm font-bold text-slate-700">
                          {member.name} · {member.role}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-slate-950 px-2 py-1 text-xs font-black text-white">{member.type}</span>
                          <button type="button" onClick={() => removeMember(index)} className="text-xs font-black text-slate-400 hover:text-slate-900">
                            x
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <input
                    value={memberDraft.name}
                    onChange={(event) => setMemberDraft((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="이름"
                    className="glass-pill w-28 rounded-2xl px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-[#1B1F4D]/15"
                  />
                  <input
                    value={memberDraft.role}
                    onChange={(event) => setMemberDraft((prev) => ({ ...prev, role: event.target.value }))}
                    placeholder="역할 (예: Founder / Product)"
                    className="glass-pill flex-1 rounded-2xl px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-[#1B1F4D]/15"
                  />
                  <select
                    value={memberDraft.type}
                    onChange={(event) => setMemberDraft((prev) => ({ ...prev, type: event.target.value }))}
                    className="glass-pill rounded-2xl px-3 py-2 text-sm outline-none"
                  >
                    {MEMBER_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={addMember} className="glass-pill rounded-2xl px-4 py-2 text-sm font-black text-slate-600 hover:bg-white/70">
                    팀원 추가
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <EditorActions submitLabel="미션 등록하기" onCancel={onCancel} />
      </form>
    </EditorShell>
  );
}

function EditorShell({ eyebrow, title, children }) {
  return (
    <section className="min-h-screen px-5 py-10 sm:px-6 lg:px-8">
      <div className="glass-strong mx-auto max-w-3xl rounded-[32px] p-6 sm:p-8">
        <p className="text-sm font-black text-[#1B1F4D]">{eyebrow}</p>
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
        className="glass-pill mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition focus:border-[#1B1F4D]/40 focus:ring-4 focus:ring-[#1B1F4D]/15"
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
        className="glass-pill mt-2 w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none transition focus:border-[#1B1F4D]/40 focus:ring-4 focus:ring-[#1B1F4D]/15"
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

export default App;
