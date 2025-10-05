MagicMind Svelte Bio Generator
A modular Svelte project that generates professional bios using an AI-powered editor experience. It features a clean, two-panel layout: a form-driven left panel to collect user details and a right panel with a rich TipTap editor, inline formatting toolbar, and a compact AI prompt overlay to regenerate selected text based on user instructions. The UI is componentized for reuse and maintainability, with strict preservation of design and styles.

Features
Clean two-panel layout (Form + Editor) with smooth transitions
TipTap-based rich text editor with:
Bold, Italic, Underline, Code Block
Heading levels (H1–H3)
Selection-aware floating toolbar
Highlight-on-selection and auto-clearing
Inline AI “Regenerate with prompt” overlay
AI integration (Cohere Chat API) for:
Generating full bios from user inputs
Regenerating selected text with user prompt
Fully modular architecture with reusable components
Dark mode support with theme toggle
Type-safe TypeScript structure and clean services layer
Project Structure
Use this in your README to display the tree structure clearly:
```
Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).
Project Flow:
📁lib
├───📁 assets/
│   └───📄 favicon.svg
├───📁components
├───📁 left-side-section/
│   └───📁 personal-bio/
│       └───biodata.svelte
├───📁 right-side-section/
│   └───📁 editor/
│       └───TiptapEditor.svelte
├───📁 sub-components/
│   ├───📄 BioForm.svelte
|   ├───📄 BioFormButtons.svelte
│   ├───📄 BioGeneratorLayout.svelte
│   ├───📄 EditorCard.svelte
│   ├───📄 FormCard.svelte
│   ├───📄 FormField.svelte
│   ├───📄 Loader.svelte
│   └───📄 ThemeToggle.svelte
└───📁 ui/
    ├───📁 badge/
    │   └───...
    ├───📁 button/
    │   └───...
    ├───📁 card/
    │   └───...
    ├───📁 input/
    │   └───...
    ├───📁 label/
    │   └───...
    └───📁 textarea/
        └───...
├───📁 services/
│   └───📄 bioService.ts
├───📁 stores/
│   └───📄 bioStore.ts
├───📁 types/
│   └───📄 bio.ts
├───📁 utils/
│   └───📄 aiFormatter.ts
├───📄 index.ts
└───📄 utils.ts
```
