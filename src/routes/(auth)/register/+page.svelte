<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import FormInput from "$lib/components/FormInput.svelte";

  import { enhance } from "$app/forms";
  export let form;
</script>

<div class="m-8 flex flex-col items-center py-10">
  <div class="w-96 px-6 py-4">
    <h3 class="pb-6 pt-4 text-xl font-medium text-gray-900 dark:text-white">
      Register
    </h3>
    <form class="space-y-2" method="post" use:enhance>
      <FormInput type="text" label="Name" name="name" errors={form?.errors} />

      <FormInput type="text" label="Email" name="email" errors={form?.errors} />

      <FormInput
        type="password"
        label="Password"
        name="password"
        errors={form?.errors}
      />

      <FormInput
        type="password"
        label="Confirm Password"
        name="confirmPassword"
        errors={form?.errors}
      />

      {#if form?.errors?.formError}
        <span class="ml-1 py-4 text-red-500">{form?.errors?.formError[0]}</span>
      {/if}
      <Button type="submit" class="w-full pt-4">Register</Button>
      <div class=" pt-2 text-sm font-medium text-gray-500 dark:text-gray-300">
        Already registered? <a
          href="/login"
          class="text-red-500 hover:underline dark:text-red-500">Login</a
        >
      </div>
    </form>
  </div>
</div>
