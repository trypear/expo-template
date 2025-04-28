import { useQuery } from "@tanstack/react-query";

import { HydrateClient, trpc } from "~/trpc/server";

export default function HomePage() {
  const { isLoading, data } = useQuery(trpc.test.getHello.queryOptions());

  return (
    <HydrateClient>
      <main className="container h-screen py-16">
        Test data:
        {isLoading ? "Loading..." : JSON.stringify(data)}
      </main>
    </HydrateClient>
  );
}
