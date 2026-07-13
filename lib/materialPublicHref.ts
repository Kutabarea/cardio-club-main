type MaterialPublicHrefInput = {
  slug: string;
  type: string;
  category?: {
    slug: string;
  } | null;
};

export function getMaterialPublicHref(material: MaterialPublicHrefInput) {
  if (material.type === "VIDEO_LECTURE") {
    return `/videolecture/${material.slug}`;
  }

  if (material.type === "VIDEO_COURSE") {
    return `/videocourses/${material.slug}`;
  }

  if (material.category?.slug === "ecg-base") {
    return `/library/base/${material.slug}`;
  }

  if (material.category?.slug) {
    return `/library/${material.category.slug}/${material.slug}`;
  }

  return null;
}