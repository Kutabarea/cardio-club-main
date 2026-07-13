import type { ReactNode } from "react";

type ProfileTemplateProps = {
  children: ReactNode;
};

export default function ProfileTemplate({ children }: ProfileTemplateProps) {
  return <>{children}</>;
}