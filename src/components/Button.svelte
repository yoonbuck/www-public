<button on:click {...$props}><slot /></button>

<style lang="scss">
  @use "../styles/type.scss";
  @use "../styles/space.scss";
  @use "../styles/color.scss";
  button {
    cursor: pointer;
    background: color.$link;
    color: color.$background;
    appearance: none;
    border: none;
    padding: space.sp(-2) space.sp(1);
    border-radius: space.sp(-4);
    font-family: inherit;
    @include type.scale(0);
  }
</style>
