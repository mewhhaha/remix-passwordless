import type { LoaderArgs } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { Button } from "~/components/Button";
import { cookieSession } from "~/helpers/auth";

export async function loader({ request, context }: LoaderArgs) {
  const { session, destroySession } = await cookieSession(request, context);

  return new Response(null, {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}

export default function Logout() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">You are now logged out</div>
      <Button as={Link} to="/">
        Back
      </Button>
    </div>
  );
}
