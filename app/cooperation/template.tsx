import type { ReactNode } from "react";

import CooperationHashScroll from "../components/CooperationHashScroll";

type CooperationTemplateProps = {
  children: ReactNode;
};

export default function CooperationTemplate({ children }: CooperationTemplateProps) {
  return (
    <>
      <CooperationHashScroll />
      {children}
    </>
  );
}