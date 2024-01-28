<script lang="ts">
  let revealed = $state(false);
</script>

<div class="spoiler">
  {#if !revealed}
    <button on:click={() => (revealed = true)}>Reveal</button>
  {/if}
  <div class="inner" class:revealed>
    <slot />
  </div>
</div>

<style lang="scss">
  @use "../styles/type.scss";
  @use "../styles/space.scss";
  @use "../styles/color.scss";

  .spoiler {
    padding: space.sp(1);
    border-radius: space.sp(0);
    background-color: color.$background-secondary;
    margin: space.sp(2) 0;
  }

  button {
    appearance: none;
    background: none;
    border: none;
    font: inherit;
    color: color.$link;
    cursor: pointer;
  }

  .inner {
    display: none;
    &.revealed {
      display: block;
    }

    > :global(astro-slot > :last-child) {
      margin-bottom: 0;
    }
  }
</style>
