import Intro from "./components/Intro";
import Search from "./components/Search";
import Slider from "./components/Slider";
import Community from "./components/Community";
import Helper from "./components/Helper";

import { getLatestHomeMaterials } from "@/lib/homeMaterials";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const latestMaterials = await getLatestHomeMaterials(12);

  return (
    <div>
      <div className="home-wrapper">
        <Intro />

        <div className="container">
          <Search />
        </div>

        <Slider materials={latestMaterials} />

        <Community />

        <Helper />
      </div>
    </div>
  );
}