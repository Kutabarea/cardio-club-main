import Intro from "./components/Intro";
import Search from "./components/Search";
import Slider, { type HomeSliderMaterial } from "./components/Slider";
import Community from "./components/Community";
import Helper from "./components/Helper";

import { getMaterialPublicHref } from "@/lib/materialPublicHref";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getMaterialTypeLabel(type: string) {
  if (type === "VIDEO_LECTURE") return "Видео";
  if (type === "HELPER") return "Ресурс";

  return "Статья";
}

function getFallbackImage(type: string, index: number) {
  if (type === "VIDEO_LECTURE") {
    return `/images/videolecture__img__${(index % 3) + 1}.png`;
  }

  return `/images/materials__img__${(index % 3) + 1}.png`;
}

function getShortDescription(value?: string | null) {
  const text = value?.trim();

  if (!text) return "Материал Cardio Club.";

  return text.length > 170 ? `${text.slice(0, 170).trim()}...` : text;
}

export default async function Home() {
  const materials = await prisma.material.findMany({
    where: {
      isPublished: true,
    },
    orderBy: [
      {
        updatedAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    take: 6,
    include: {
      category: {
        select: {
          slug: true,
        },
      },
    },
  });

  const sliderMaterials: HomeSliderMaterial[] = materials
    .map((material, index) => {
      const href = getMaterialPublicHref(material);

      if (!href) return null;

      return {
        img: material.imageUrl || getFallbackImage(material.type, index),
        header: getMaterialTypeLabel(material.type),
        subheader: material.title,
        description: getShortDescription(material.description || material.content),
        href,
      };
    })
    .filter((item): item is HomeSliderMaterial => Boolean(item));

  return (
    <div>
      <div className="home-wrapper">
        <Intro />

        <div className="container">
          <Search />
        </div>

        <Slider materials={sliderMaterials} />

        <Community />

        <Helper />
      </div>
    </div>
  );
}