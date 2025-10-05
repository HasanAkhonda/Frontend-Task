<script lang="ts">
  /**
   * Loading Spinner Component
   * Displays animated loader during AI generation
   */
</script>

<div class="flex justify-center items-center h-[520px]">
  <span class="loader"></span>
</div>

<style>
  /* Loader animation */
  .loader {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
