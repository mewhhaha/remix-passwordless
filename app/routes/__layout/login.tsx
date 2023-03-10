import { Client } from "@passwordlessdev/passwordless-client";
import { Button } from "~/components/Button";
import { cookieSession, verify } from "~/helpers/auth";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import type {
  ActionArgs,
  LoaderArgs,
  TypedResponse,
} from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";

export async function loader({ context }: LoaderArgs) {
  return { apiKey: context.AUTH_PUBLIC, apiUrl: context.AUTH_API };
}

export async function action({
  request,
  context,
}: ActionArgs): Promise<
  TypedResponse<{ success: false; message: string } | { success: true }>
> {
  const { session, commitSession } = await cookieSession(request, context);

  const formData = await request.formData();
  const token = formData.get("token")?.toString();

  if (!token) {
    return json({ success: false, message: "Missing form data" });
  }

  const body = await verify(token, context);

  if (body.success) {
    session.set("user", JSON.stringify(body));
    return json(
      { success: true as const },
      {
        status: 302,
        headers: { "Set-Cookie": await commitSession(session), Location: "/" },
      }
    );
  }

  return json({ success: false, message: "Login was not successful" });
}

export default function Login() {
  const clientConfig = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const submit = useSubmit();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const client = new Client(clientConfig);
        const formData = new FormData(e.target as HTMLFormElement);
        const username = formData.get("username")?.toString();
        if (username) {
          const token = await client.signinWithAlias(username);
          submit({ token }, { method: "post" });
        }
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col">
        <label>Username</label>
        <input
          required
          name="username"
          className="border px-2 py-1 rounded-md"
          placeholder="username"
        />
      </div>
      <div className="text-red-500">
        {actionData?.success === false && actionData.message}
      </div>
      <Button htmlType="submit" className="bg-orange-400 text-white">
        Login
      </Button>
    </form>
  );
}
