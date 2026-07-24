import HeaderClient from "./HeaderClient";

import { getPublicNavigation } from "@/lib/publicNavigation";
import type { PublicNavigationItem } from "@/lib/publicNavigationRoutes";

export default async function Header() {
  let navigation: PublicNavigationItem[] =
    [];

  try {
    navigation =
      await getPublicNavigation();
  } catch {
    navigation = [];
  }

  return (
    <HeaderClient
      navigation={navigation}
    />
  );
}