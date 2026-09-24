import { Button } from "@/components/ui/button";
import { signOut } from "@/app/auth/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="ghost" size="sm">
        Выйти
      </Button>
    </form>
  );
}
