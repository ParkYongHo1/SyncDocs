"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { WelcomeSection } from "./WelcomeSection";
import { useCurrentUser } from "@/entities/auth/model/useCurrentUser";
import { useSignInMutation } from "@/entities/auth/model/useSignInMutation";
import { useSignOutMutation } from "@/entities/auth/model/useSignOutMutation";

const dummyDocuments = [
  { id: "1", title: "Q3 launch plan" },
  { id: "2", title: "Onboarding redesign spec" },
];

export default function Editor() {
  const { data: user, isLoading } = useCurrentUser();
  const { mutate: signIn } = useSignInMutation();
  const { mutate: signOut } = useSignOutMutation();
  console.log(user);

  const handleLogin = async () => {
    signIn();
  };
  const handleLogout = async () => {
    signOut();
  };
  if (isLoading) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0D0D0D] text-[#E3E3E3]">
      <aside className="w-64 shrink-0 flex flex-col border-r border-[#1F1F1F] bg-[#141414] overflow-y-auto">
        <div className="px-6 py-5 flex items-center justify-between">
          <span className="text-[14px] font-bold tracking-tight text-white">
            SyncDocs Space
          </span>
          {user && (
            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-[#222]">
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
        <nav className="flex-1 px-3 space-y-0.5">
          <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] text-left bg-[#222] text-white font-semibold border border-[#2D2D2D]">
            Welcome to SyncDocs
          </button>

          {user &&
            dummyDocuments.map((doc) => (
              <button
                key={doc.id}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] text-left text-gray-500 hover:text-gray-300 hover:bg-[#1A1A1A] font-medium"
              >
                {doc.title}
              </button>
            ))}
        </nav>
        {user ? (
          <div className="p-3 border-t border-[#1F1F1F]">
            <Button
              onClick={handleLogout}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
            >
              Sign out
            </Button>
          </div>
        ) : (
          <div className="p-3 border-t border-[#1F1F1F]">
            <Button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
            >
              Start Demo
            </Button>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-y-auto">
        {user ? (
          <div className="px-8 py-10 max-w-4xl mx-auto">
            <div className="w-full max-w-2xl space-y-4">
              <h1 className="text-[14px] font-semibold text-white">
                Q3 launch plan
              </h1>
              <div className="bg-[#1A1A1A] rounded-xl px-6 py-8 text-gray-500 text-[14px]">
                (여기에 실제 BlockNote 편집기가 들어갈 자리)
              </div>
            </div>
          </div>
        ) : (
          <WelcomeSection />
        )}
      </main>
    </div>
  );
}
