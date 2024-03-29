<script>
  import * as Dialog from "$lib/components/ui/dialog";
  import Button from "$lib/components/ui/button/button.svelte";

  export let isOpen;
  export let onConfirm;
  export let onCancel;
  export let title;
  export let description;
</script>

<Dialog.Root onOpenChange={(change) => (isOpen = change)} open={isOpen}>
  <Dialog.Overlay
    class="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm"
  />
  <Dialog.Content
    class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black rounded-lg shadow-lg p-6 max-w-md w-full"
  >
    <Dialog.Header>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Description>{description}</Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button variant="outline" on:click={onCancel}>Cancel</Button>
      <Button variant="outline" on:click={onConfirm}>Confirm</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
