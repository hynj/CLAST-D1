<script lang="ts">
  import { enhance } from "$app/forms";
  import FormInput from "$lib/components/FormInput.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";

  const handleLogin = () => {};
  const handleReset = () => {};
  export let form;
</script>

<div class="m-8 flex flex-col items-center py-10">
  <h3 class="">Login</h3>
  <form method="post" use:enhance={handleLogin}>
    <FormInput name="email" label="Email" errors={form?.errors}></FormInput>

    <FormInput
      type="password"
      name="password"
      label="Password"
      errors={form?.errors}
    ></FormInput>

    {#if form?.errors?.formError}<span class="text-red-500"
        >{form.errors.formError[0]}</span
      >{/if}
    <div class="flex flex-col pt-2">
      <div class="flex items-start py-2">
        <checkbox name="remember" id="remember" />
        <Label for="remember" class="px-2">Remember Me</Label>
        <a
          on:click={handleReset}
          class="ml-auto text-sm text-red-500 hover:underline">Lost password?</a
        >
      </div>
      <Button type="submit" class="w-full">Login</Button>
      <div class=" pt-2 text-sm font-medium text-gray-500 dark:text-gray-300">
        Not registered? <a
          href="/register"
          class="text-red-500 hover:underline dark:text-red-500">Register</a
        >
      </div>
    </div>
  </form>
</div>
