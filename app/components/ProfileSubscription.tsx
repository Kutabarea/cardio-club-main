import Rates from "./Rates";

type SubscriptionStatus = "active" | "inactive";

type ProfileSubscriptionProps = {
  status: SubscriptionStatus;
  endsAtText?: string | null;
  planLabel?: string | null;
  message?: string | null;
};

export default function ProfileSubscription({
  status,
  endsAtText,
  planLabel,
  message,
}: ProfileSubscriptionProps) {
  return (
    <Rates
      status={status}
      endsAtText={endsAtText}
      planLabel={planLabel}
      message={message}
    />
  );
}