<script lang="ts">
  import { Label } from "./ui/label";
  import { Input } from "./ui/input";

  export let name = "";
  export let label = "";
  export let valueForm: number | undefined | string = undefined;
  export let errors:
    | {
        fieldErrors: any;
        formError: any;
      }
    | undefined;
</script>

<div class="flex flex-row w-full py-2">
  <div class="w-full flex flex-col items-start space-y-2">
    <Label class="" for="firstname">{label}</Label>
    <Input
      class="pt-2 w-full"
      {name}
      id={name}
      bind:value={valueForm}
      {...$$restProps}
    />
  </div>
</div>
{#if errors?.fieldErrors?.[name]}
  {#each errors?.fieldErrors?.[name] as anError}
    <p class="mx-1 text-red-500">{anError}</p>
  {/each}
{/if}
