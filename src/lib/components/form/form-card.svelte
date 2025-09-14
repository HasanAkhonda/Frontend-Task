<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Card from "$lib/components/ui/card/index.js";

  let bool = false;
  const toggleSecondCard = () => {
    bool = !bool;
  };
</script>

<div class="flex flex-col md:flex-row justify-center overflow-hidden mt-12 items-start md:items-center gap-10 p-4 bg-gray-200 dark:bg-background">
  
  <!-- First Card with smooth fade + slide-up -->
  <Card.Root class="w-full max-w-lg flex flex-col justify-between px-8 py-8 shadow-lg rounded-lg h-[500px] fade-slide-up">
    <!-- Logo -->
    <div class="flex justify-center mb-6">
      <div class="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300">
        <img
          src="https://dummyimage.com/150x150/4f46e5/ffffff&text=Logo"
          alt="Logo"
          class="w-full h-full object-cover"
        />
      </div>
    </div>

    <Card.Content class="px-0 overflow-auto flex-1">
      <form class="flex flex-col gap-6">
        <!-- Row 1: Full Name + Title -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div class="flex flex-col gap-2">
            <Label for="fullname">Full Name</Label>
            <Input id="fullname" type="text" placeholder="Enter full name" required class="w-full px-3 py-2"/>
          </div>
          <div class="flex flex-col gap-2">
            <Label for="title">Title</Label>
            <Input id="title" type="text" placeholder="Enter title" required class="w-full px-3 py-2"/>
          </div>
        </div>

        <!-- Row 2: Company + Tags -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div class="flex flex-col gap-2">
            <Label for="company">Company</Label>
            <Input id="company" type="text" placeholder="Enter company" required class="w-full px-3 py-2"/>
          </div>
          <div class="flex flex-col gap-2">
            <Label for="tags">Tags</Label>
            <Input id="tags" type="text" placeholder="Enter tags" required class="w-full px-3 py-2"/>
          </div>
        </div>

        <!-- Row 3: Tone + Goal -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div class="flex flex-col gap-2">
            <Label for="tone">Tone</Label>
            <Input id="tone" type="text" placeholder="Enter tone" required class="w-full px-3 py-2"/>
          </div>
          <div class="flex flex-col gap-2">
            <Label for="goal">Goal</Label>
            <Input id="goal" type="text" placeholder="Enter goal" required class="w-full px-3 py-2"/>
          </div>
        </div>
      </form>
    </Card.Content>

    <Card.Footer class="flex flex-col gap-2 mt-6">
      <Button type="button" class="w-full" onclick={toggleSecondCard}>Submit</Button>
    </Card.Footer>
  </Card.Root>

  <!-- Second Card: conditional -->
  {#if bool}
    <Card.Root class="fade-slide-left w-full max-w-lg flex flex-col justify-between px-8 py-8 shadow-lg rounded-lg h-[500px]">
      <Card.Content class="px-0 flex-1">
        <div class="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-lg p-4 overflow-auto">
          <h2 class="text-lg font-semibold mb-2">Description</h2>
          <p class="text-gray-700 dark:text-gray-200">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <p class="mt-2 text-gray-700 dark:text-gray-200">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
        </div>
      </Card.Content>
    </Card.Root>
  {/if}
</div>

<style>
/* Smooth fade + slide-up for first card */
.fade-slide-up {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeSlideUp 0.8s ease forwards;
}

@keyframes fadeSlideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Smooth fade + slide-left for second card */
.fade-slide-left {
  opacity: 0;
  transform: translateX(50px);
  animation: fadeSlideLeft 0.6s ease forwards;
}

@keyframes fadeSlideLeft {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
