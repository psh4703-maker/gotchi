import { useState } from "react";

const PAGES = {
  about: {
    title: "gotchi 소개",
    body: `gotchi는 "먼저 일해보고, 팀이 되는" 미션 기반 매칭 플랫폼입니다.

짧은 단기 협업 미션으로 먼저 협업해보고, 서로 확신이 생기면 장기 팀으로 합류하는 흐름을 만듭니다. 말이 아니라 실제 협업 기록으로 좋은 팀을 찾을 수 있도록 돕는 것이 목표입니다.

현재 gotchi는 베타 단계로 운영되고 있으며, 기능과 정책이 계속 변경될 수 있습니다.`,
  },
  terms: {
    title: "이용약관",
    body: `본 약관은 gotchi(이하 "서비스") 이용에 관한 기본 사항을 안내합니다. 서비스는 현재 베타 단계로 운영되고 있으며, 아래 내용은 정식 법률 검토를 거치지 않은 초안입니다.

1. 서비스 이용
회원은 실명 또는 실제로 연락 가능한 정보로 가입해야 하며, 허위 정보 기재로 인한 문제는 회원 본인에게 책임이 있습니다.

2. 미션 및 매칭
gotchi는 미션 게시와 매칭 과정을 중개할 뿐, 게시된 내용의 진위나 완료 여부를 보증하지 않습니다. 금전 거래는 현재 이용자 간 직접 정산 방식으로 이루어지며, gotchi는 결제를 대행하지 않습니다.

3. 콘텐츠 책임
회원이 게시한 미션, 리뷰, 메시지 등의 내용에 대한 책임은 작성자 본인에게 있습니다.

4. 서비스 변경 및 중단
gotchi는 서비스 운영상 필요에 따라 기능을 변경하거나 일시 중단할 수 있습니다.

5. 문의
서비스 이용 중 문제가 발생하면 운영자에게 문의해주세요.`,
  },
  privacy: {
    title: "개인정보처리방침",
    body: `gotchi는 서비스 제공을 위해 아래와 같은 개인정보를 수집·이용합니다. 아래 내용은 정식 법률 검토를 거치지 않은 초안이며, 정식 서비스 전환 시 갱신될 예정입니다.

1. 수집하는 정보
- 이메일 주소, 비밀번호(암호화 저장): 회원가입 및 로그인
- 이름, 역할: 프로필 표시
- 등록한 미션, 지원 내역, 채팅 메시지, 리뷰: 서비스 이용 기록

2. 이용 목적
- 회원 인증 및 계정 관리
- 미션 매칭 서비스 제공
- 협업 신뢰 지수 등 서비스 품질 향상

3. 보관 및 파기
회원 탈퇴 시 관련 개인정보는 지체 없이 파기합니다. 단, 법령에 따라 보관이 필요한 경우는 예외로 합니다.

4. 제3자 제공
gotchi는 원칙적으로 개인정보를 외부에 제공하지 않습니다. 서비스 운영에 필요한 인프라(Supabase, Vercel 등)를 통해서만 데이터가 처리됩니다.

5. 문의
개인정보 관련 문의는 운영자에게 연락해주세요.`,
  },
};

function Footer() {
  const [openPage, setOpenPage] = useState(null);

  return (
    <>
      <footer className="mx-auto mt-16 max-w-7xl px-5 pb-10 sm:px-6 lg:px-8">
        <div className="glass rounded-3xl px-6 py-6 text-sm text-slate-500">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">
                g
              </div>
              <span className="font-black text-slate-700">gotchi</span>
              <span className="text-xs text-slate-400">· 먼저 일해보고, 팀이 되는 곳</span>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-bold">
              <button type="button" onClick={() => setOpenPage("about")} className="hover:text-slate-900">
                소개
              </button>
              <button type="button" onClick={() => setOpenPage("terms")} className="hover:text-slate-900">
                이용약관
              </button>
              <button type="button" onClick={() => setOpenPage("privacy")} className="hover:text-slate-900">
                개인정보처리방침
              </button>
              <a href="mailto:hello@gotchi.app" className="hover:text-slate-900">
                문의: hello@gotchi.app
              </a>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            gotchi는 현재 베타 단계로 운영되고 있어요. © {new Date().getFullYear()} gotchi
          </p>
        </div>
      </footer>

      {openPage && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-md">
          <div className="glass-strong max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-[32px] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-black text-slate-950">{PAGES[openPage].title}</h2>
              <button
                type="button"
                onClick={() => setOpenPage(null)}
                className="glass-pill shrink-0 rounded-full px-3 py-1 text-sm font-black text-slate-500 hover:text-slate-900"
              >
                x
              </button>
            </div>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {PAGES[openPage].body}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default Footer;
