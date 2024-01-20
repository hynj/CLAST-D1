<script lang="ts">
  export let data;
  const { user } = data;
</script>

<h1>Welcome to SvelteKit</h1>
<p class="">
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>
{#if user}
  <p class="semi-bold">Hi {user.name}</p>
{/if}
