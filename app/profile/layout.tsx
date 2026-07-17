import { redirect } from "next/navigation";
import ProfileAside from "../components/ProfileAside";
import { getCurrentUser } from "@/lib/auth";
import styles from "../styles/ProfileSubscription.module.css";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className={styles.profile}>
      <div className="container">
        <div className={styles.profile__inner}>
          {children}
          <ProfileAside />
        </div>
      </div>
    </div>
  );
}