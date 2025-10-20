<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";

  // ✅ Define the exact type accepted by the Button
  type ButtonVariant =
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  type ButtonSize = "default" | "sm" | "lg" | "icon";

  let {
    disabled = false,
    buttonType = "",
    buttonStyle = "",
    buttonTitle = "",
    buttonTitleStyle = "",
    customVarient = "default",
    buttonSize = "default",
    Onclicked = () => {},
  }: {
    disabled?: boolean;
    buttonType?: any;
    buttonStyle?: string;
    buttonTitle?: string;
    buttonTitleStyle?: string;
    Onclicked?: () => void;
    customVarient?: ButtonVariant;
    buttonSize?: ButtonSize;
  } = $props();
</script>

<Button
  class={buttonStyle}
  onclick={Onclicked}
  variant={customVarient}
  size={buttonSize}
  type={buttonType}
  {disabled}
>
  <slot><!-- optional fallback --></slot>
  <span class={buttonTitleStyle}>{buttonTitle}</span>
</Button>
