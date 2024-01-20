<script lang="ts">
  import { enhance } from "$app/forms";
  import { Button } from "$lib/components/ui/button";

  export let data;
  const { user } = data;
</script>

<h1>Welcome to SvelteKit</h1>
<p class="">
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>
{#if user}
  <p class="semi-bold">Hi {user.name}</p>
  <form action="/forms?/logout" class="w-full" method="post" use:enhance>
    <Button class="p-4 m-2" type="submit">Logout</Button>
  </form>
{/if}
