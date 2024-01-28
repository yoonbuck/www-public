<script lang="ts">
  const formats = {
    monthYear: new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      timeZone: "UTC",
    }),
    dayMonthYear: new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }),
  };

  export let date: Date;
  export let format: keyof typeof formats;
</script>

{formats[format].format(date)}
