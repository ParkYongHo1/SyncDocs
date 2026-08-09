import type { LucideIcon } from "lucide-react";
import { Undo2, Zap, Users, WifiOff } from "lucide-react";

export type Benefit = {
  icon: LucideIcon;
  accent: string;
  iconColor: string;
  title: string;
  description: string;
};

export const BENEFITS: Benefit[] = [
  {
    icon: Undo2,
    accent: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-400",
    title: "안심하고 되돌리기",
    description:
      "실수해도 괜찮아요. 언제든 이전 상태로 정확히 되돌아갈 수 있어요.",
  },
  {
    icon: Zap,
    accent: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-400",
    title: "끊김 없는 타이핑",
    description: "네트워크를 기다리지 않아요. 타이핑하는 즉시 화면에 반영돼요.",
  },
  {
    icon: Users,
    accent: "from-orange-500/20 to-orange-500/5",
    iconColor: "text-orange-400",
    title: "충돌 걱정 없는 협업",
    description:
      "동시에 같은 곳을 고쳐도, 무엇을 남길지 직접 선택할 수 있어요.",
  },
  {
    icon: WifiOff,
    accent: "from-purple-500/20 to-purple-500/5",
    iconColor: "text-purple-400",
    title: "오프라인에서도 계속",
    description:
      "인터넷이 끊겨도 작업은 이어지고, 다시 연결되면 자동으로 저장돼요.",
  },
];
