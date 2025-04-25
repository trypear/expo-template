import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "../hooks/api";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
