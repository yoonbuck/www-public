<script lang="ts">
  import type { MarkdownHeading } from "astro";

  interface Props {
    headings: MarkdownHeading[];
  }
  const { headings } = $props<Props>();
</script>

<h2>Contents</h2>
<ul>
  {#each headings as heading}
    {#if heading.depth < 4}
      <li>
        <a href="#{heading.slug}" data-depth={heading.depth}>
          {heading.text}
        </a>
      </li>
    {/if}
  {/each}
</ul>

<style lang="scss">
  @use "../styles/type.scss";
  @use "../styles/space.scss";
  @use "../styles/color.scss";

  h2 {
    margin: space.sp(2) space.sp(-3);
    @include type.scale(0);
    font-weight: 400;
    color: color.$secondary;
    text-transform: uppercase;
  }

  li {
    list-style: none;
  }

  a {
    @include type.scale(-1);
    display: block;
    padding: space.sp(-5) space.sp(-3);
    border-radius: space.sp(-3);
    background-color: transparent;
    margin: 0;
    text-decoration: none;
    color: color.$link;
    &:visited {
      color: color.$link-visited;
    }
    &:hover {
      background-color: color.$background-secondary;
      h2 {
        text-decoration: underline;
        text-decoration-style: wavy;
      }
    }
    transition: background-color 0.15s ease;
    font-weight: 600;
    &[data-depth="2"] {
      margin-left: calc(1 * #{space.sp(0)});
      font-weight: 400;
    }
    &[data-depth="3"] {
      margin-left: calc(2 * #{space.sp(0)});
      font-weight: 400;
      color: color.$secondary;
    }
  }

  a,
  a:visited {
    color: color.$text;
  }

  a:target {
    color: color.$link;
  }

  ul {
    padding: 0;
  }
</style>
