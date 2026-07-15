import Intro from "./components/Intro";
import Search from "./components/Search";
import Slider from "./components/Slider";
import Community from "./components/Community";
import Helper from "./components/Helper";

import { getLatestHomeMaterials } from "@/lib/homeMaterials";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const [latestMaterials, currentUser] = await Promise.all([
    getLatestHomeMaterials(12),
    getCurrentUser(),
  ]);

  return (
    <div>
      <div className="home-wrapper">
        <Intro />

        <div className="container">
          <Search />
        </div>

        <Slider materials={latestMaterials} />

        {!currentUser ? <Community /> : null}

        <Helper />
      </div>
    </div>
  );
}