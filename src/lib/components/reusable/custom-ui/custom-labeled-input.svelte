<script lang="ts">
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";

  // ✅ Only one call to $props()
  // ✅ Declare bindable props using $bindable()
  let {
    id,
    label,
    type = "text",
    placeholder = "",
    required = false,
    customStyle = "",
    value = $bindable(""), // 👈 make this bindable
  } = $props();
</script>

<div class="flex flex-col gap-2">
  <Label for={id} class="text-gray-500 dark:text-gray-300 text-md">
    {label}
  </Label>

  <Input
    {id}
    {type}
    {placeholder}
    {required}
    bind:value
    class={`${customStyle} py-5.5`}
  />
</div>
