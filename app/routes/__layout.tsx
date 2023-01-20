import type { LoaderArgs } from "@remix-run/cloudflare";
import { Outlet, useLoaderData } from "@remix-run/react";
import { cookieSession } from "~/helpers/auth";

export async function loader({ request, context }: LoaderArgs) {
  const { user } = await cookieSession(request, context);
  return user;
}

export default function Layout() {
  const user = useLoaderData<typeof loader>();
  return (
    <>
      <header className="w-full h-12 border-b text-center text-xl pt-1">
        {user ? `You're authenticated ${user.nickname}` : "Who are you?"}
      </header>
      <main className="mx-auto max-w-md pt-4 px-4">
        <Outlet />
      </main>
    </>
  );
}
