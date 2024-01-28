import { getCollection } from "astro:content";
import { marked } from "marked";

// This is a little bit of gymnastics to help us get the correct type for the
// recipe collection entry. The type is established through astro magic and
// doesn't seem to get automatically inferred for GET, so we have to find it
// and pull it out ourselves.
function recipeCollection() {
  return getCollection("recipes");
}
type RecipeEntry = Awaited<ReturnType<typeof recipeCollection>>[number];

export async function getStaticPaths() {
  const recipes = await recipeCollection();
  return recipes.flatMap((entry) => [
    {
      params: {
        slug: entry.slug,
      },
      props: { entry, render: false },
    },
    {
      params: {
        slug: `${entry.slug}.rendered`,
      },
      props: { entry, render: true },
    },
  ]);
}

interface GET_PARAM {
  props: {
    entry: RecipeEntry;
    render: boolean;
  };
}
export async function GET({ props: { entry, render } }: GET_PARAM) {
  if (!entry) {
    return new Response("Not found", { status: 404 });
  }
  let body = entry.body;
  if (render) {
    body = await marked.parse(body);
  }
  return new Response(
    JSON.stringify({
      ...entry.data,
      body,
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    }
  );
}
