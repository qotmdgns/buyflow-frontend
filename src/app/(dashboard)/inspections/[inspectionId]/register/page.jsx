import Link from "next/link";

export const metadata = {
  title: "검수 등록 | BuyFlow ERP",
};

export default function InspectionRegisterPage() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-[22px] font-bold text-slate-900">검수 등록</h1>

      <p className="mt-2 text-[14px] text-slate-500">
        다음 단계에서 품목별 합격 수량, 불량 수량, 불량 사유를 입력하는 화면으로 교체할 임시 페이지입니다.
      </p>

      <Link
        href="/inspections"
        className="mt-5 inline-flex h-10 items-center rounded-md border border-slate-200 px-4 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        목록으로 돌아가기
      </Link>
    </section>
  );
}
