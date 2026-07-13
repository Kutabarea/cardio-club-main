import type { ReactNode } from "react";

import SiteInteractionLayer from "./components/SiteInteractionLayer";

type RootTemplateProps = {
  children: ReactNode;
};

export default function RootTemplate({ children }: RootTemplateProps) {
  return <SiteInteractionLayer>{children}</SiteInteractionLayer>;
}