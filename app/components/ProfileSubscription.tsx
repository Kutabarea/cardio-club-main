import React from "react";
import Rates from "./Rates";

type SubscriptionStatus = "active" | "inactive";

interface ProfileProps {
  status: SubscriptionStatus;
}

export default function ProfileSubscription({ status }: ProfileProps) {
  return (
    <Rates status={status}></Rates>
  );
}
