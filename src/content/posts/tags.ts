import { getCollection } from "astro:content";

export async function getTags() {
  const posts = await getCollection("posts");
  const tagSet = new Set<string>();
  for (const post of posts) {
    for (const tag of post.data.tags ?? []) {
      tagSet.add(tag);
    }
  }
  const result = Array.from(tagSet);
  return result.sort();
}
