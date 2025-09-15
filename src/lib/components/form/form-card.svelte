<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { fly } from "svelte/transition";
  import TiptapEditor from "$lib/components/editor/TiptapEditor.svelte";
   import SunIcon from "@lucide/svelte/icons/sun";
  import MoonIcon from "@lucide/svelte/icons/moon";

  import { toggleMode } from "mode-watcher";

  // -----------------------------
  // Local state
  // -----------------------------
  let editorContent = "";

  function handleEditorUpdate(html: any) {
    editorContent = html;
    console.log("Editor content:", html);
  }

  let showSecondCard = false;

  // Form data variables
  let fullname = "";
  let title = "";
  let company = "";
  let tags = "";
  let tone = "";
  let goal = "";

  // Store submitted data separately
  type SubmittedData = {
    fullname: string;
    title: string;
    company: string;
    tags: string;
    tone: string;
    goal: string;
  };

  let submittedData: SubmittedData | null = null;

  // -----------------------------
  // Handlers
  // -----------------------------
  const handleSubmit = (e: any) => {
    e.preventDefault();
    submittedData = { fullname, title, company, tags, tone, goal };
    console.log("Form Data:", submittedData);
    showSecondCard = true;
  };
</script>

<!-- ===========================
     Layout Wrapper
     =========================== -->
<div
  class="flex flex-col 
         bg-slate-100 
         dark:bg-[url('https://images.unsplash.com/photo-1610505466122-b1d9482901ef?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0')]  
         bg-cover bg-center bg-no-repeat 
         w-full h-screen 
         md:flex-row justify-center items-center 
         gap-10 px-4 md:px-0 my-auto"
>




  <!-- ===========================
       First Card (Form)
       =========================== -->
  <Card.Root
    class="w-full max-w-lg flex flex-col px-8 py-8 shadow-xl rounded-2xl h-[520px] bg-white dark:bg-gray-900"
  >
    <!-- Title -->
    <div class="relative w-full flex justify-center items-center mb-6">
  <!-- Center Title -->
  <h1
    class="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
  >
    MagicMind
  </h1>

  <!-- Theme Button (top-right) -->
  <div class="absolute -right-6 -top-6">
    <Button onclick={toggleMode} variant="ghost" size="icon">
      <SunIcon
        class="h-[1rem] w-[1.rem] rotate-0 scale-100 !transition-all dark:-rotate-90 dark:scale-0"
      />
      <MoonIcon
        class="absolute h-[1rem] w-[1rem] rotate-90 scale-0 !transition-all dark:rotate-0 dark:scale-100"
      />
      <span class="sr-only">Toggle theme</span>
    </Button>
  </div>
</div>


    <!-- Form -->
    <Card.Content class="flex-1 overflow-auto px-0 ">
      
      <form class="flex flex-col gap-4 space-y-1" on:submit={handleSubmit}>
        <!-- Row 1 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div class="flex flex-col gap-2">
            <Label class='text-md text-gray-600 dark:text-gray-300' for="fullname">Full Name</Label>
            <Input
              id="fullname"
              type="text"
              class="py-6 placeholder:text-[16px]"
              placeholder="Enter full name"
              required
              bind:value={fullname}
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label class='text-md text-gray-600 dark:text-gray-300' for="title">Title</Label>
            <Input
              id="title"
              type="text"
              class="py-6 placeholder:text-[16px]"
              placeholder="Enter title"
              required
              bind:value={title}
            />
          </div>
        </div>

        <!-- Row 2 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div class="flex flex-col gap-2">
            <Label class='text-md text-gray-600 dark:text-gray-300' for="company">Company</Label>
            <Input
              id="company"
              type="text"
              class="py-6 placeholder:text-[16px]"
              placeholder="Enter company"
              required
              bind:value={company}
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label class='text-md text-gray-600 dark:text-gray-300' for="tags">Tags</Label>
            <Input
              id="tags"
              type="text"
              class="py-6 placeholder:text-[16px]"
              placeholder="Enter tags"
              required
              bind:value={tags}
            />
          </div>
        </div>

        <!-- Row 3 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div class="flex flex-col gap-2">
            <Label class='text-md text-gray-600 dark:text-gray-300' for="tone">Tone</Label>
            <Input
              id="tone"
              type="text"
              class="py-6 placeholder:text-[16px]"
              placeholder="Enter tone"
              required
              bind:value={tone}
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label class='text-md text-gray-600 dark:text-gray-300' for="goal">Goal</Label>
            <Input
              id="goal"
              type="text"
              class="py-6 placeholder:text-[16px]"
              placeholder="Enter goal"
              required
              bind:value={goal}
            />
          </div>
        </div>

        <!-- Submit -->
        <Card.Footer class="flex flex-col gap-2 mt-4 px-0 ">
          <Button type="submit" class="w-full py-6 font-semibold text-lg">
            Generate
          </Button>
        </Card.Footer>
      </form>
    </Card.Content>
  </Card.Root>
<!-- ===========================
     Second Card (Editor)
     =========================== -->
{#if showSecondCard && submittedData}
  <div in:fly={{ x: 400, duration: 800 }} out:fly={{ x: 400, duration: 800 }}  class="w-full max-w-lg ">
    <Card.Root
      class="flex-col px-8 py-8 shadow-xl rounded-2xl h-[520px] bg-white dark:bg-gray-900"
    >
      <Card.Content class="px-0 flex-1 w-full max-w-2xl">
        <TiptapEditor
        class=" w-full h-[450px] bg-gray-100 dark:bg-gray-700 rounded-lg p-4 overflow-auto "
          content={` 
              <h2 class='text-lg font-semibold mb-4'>Description</h2>
              <ul class='space-y-2 text-gray-700 dark:text-gray-200'>
                <li><strong>Full Name:</strong> ${submittedData.fullname}</li>
                <li><strong>Title:</strong> ${submittedData.title}</li>
                <li><strong>Company:</strong> ${submittedData.company}</li>
                <li><strong>Tags:</strong> ${submittedData.tags}</li>
                <li><strong>Tone:</strong> ${submittedData.tone}</li>
                <li><strong>Goal:</strong> ${submittedData.goal}</li>
              </ul>
           `}
          onUpdate={handleEditorUpdate}
        />
      </Card.Content>
    </Card.Root>
  </div>
{/if}

</div>
