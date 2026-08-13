import { Card, CardContent } from "@/components/ui/card";
import { BENEFITS } from "../model/constants";

export const WelcomeSection = () => {
  return (
    <div className="px-5 md:px-12 py-8 md:py-12 flex flex-col items-start max-w-4xl mx-auto w-full">
      <h1 className="text-[28px] md:text-[42px] font-bold text-white leading-tight mb-4">
        같이 쓰는데도,
        <br />
        <span className="text-blue-400">서로 방해하지 않아요.</span>
      </h1>

      <p className="text-[14px] md:text-[16px] text-gray-400 leading-relaxed mb-8 w-full">
        SyncDocs는 여러 명이 각자 다른 시간에 편집하는 문서 에디터예요.
        <br className="hidden md:block" />
        실수해도 되돌릴 수 있고, 인터넷이 느려도 막힘없이 쓸 수 있고, 같은
        부분을 동시에 고쳐도 무엇을 남길지 직접 고를 수 있어요.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 w-full">
        {BENEFITS.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <Card
              key={benefit.title}
              className={`border-[#232323] bg-transparent bg-linear-to-br ${benefit.accent} py-0`}
            >
              <CardContent className="p-5">
                <Icon className={`w-6 h-6 mb-3 ${benefit.iconColor}`} />
                <p className="text-[15px] font-semibold text-white mb-1">
                  {benefit.title}
                </p>
                <p className="text-[13px] text-gray-400 leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="w-full rounded-2xl border border-[#232323] bg-[#141414] p-5 md:p-7">
        <p className="text-[13px] font-medium text-gray-500 uppercase tracking-wide mb-4">
          이렇게 체험해보세요
        </p>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              1
            </div>
            <p className="text-[14px] md:text-[15px] text-gray-300 leading-relaxed">
              왼쪽 하단&nbsp;
              <span className="text-white font-medium">
                &quot;Start Demo&quot;
              </span>
              로 로그인하고, 문서를 만들어 자유롭게 편집해보세요.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              2
            </div>
            <p className="text-[14px] md:text-[15px] text-gray-300 leading-relaxed">
              같은 페이지를&nbsp;
              <span className="text-white font-medium">
                다른 브라우저(또는 시크릿 창)
              </span>
              에서 열어 또 다른 사용자로 로그인해보세요.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              3
            </div>
            <p className="text-[14px] md:text-[15px] text-gray-300 leading-relaxed">
              같은 문서의 같은 부분을 동시에 고쳐보면, 충돌이 감지되고 해결되는
              과정을 직접 볼 수 있어요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
