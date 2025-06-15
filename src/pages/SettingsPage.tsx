
import { ProfileForm } from "@/components/settings/ProfileForm"
import Header from "@/components/Header"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
          <div className="grid gap-6">
            <ProfileForm />
          </div>
        </div>
      </main>
    </div>
  )
}
