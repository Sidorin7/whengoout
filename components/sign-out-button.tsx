import { signOut } from "@/app/auth/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-md border-[1.5px] border-foreground px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
      >
        Выйти из аккаунта
      </button>
    </form>
  );
}
