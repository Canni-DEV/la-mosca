<script lang="ts">
  import type { AppScreen, MatchSetup } from "./app/navigation.ts";
  import { DEFAULT_HUMAN_NAME } from "./game/LocalGameSession.ts";
  import { unlockAudio } from "./game/match-controller.ts";
  import HowToPlayScreen from "./screens/HowToPlayScreen.svelte";
  import MenuScreen from "./screens/MenuScreen.svelte";
  import OptionsScreen from "./screens/OptionsScreen.svelte";
  import PlaygroundScreen from "./screens/PlaygroundScreen.svelte";
  import SetupScreen from "./screens/SetupScreen.svelte";
  import TableScreen from "./screens/TableScreen.svelte";

  const initialScreen: AppScreen = typeof window !== "undefined" && window.location.hash === "#playground" ? "playground" : "menu";

  let screen = $state<AppScreen>(initialScreen);
  let setup = $state<MatchSetup>({
    playerCount: 4,
    deckConfiguration: "TRADITIONAL_40",
    seed: 1,
    humanName: DEFAULT_HUMAN_NAME,
  });
  let tableKey = $state(0);

  function go(next: AppScreen): void {
    void unlockAudio();
    screen = next;
  }

  function startMatch(next: MatchSetup): void {
    setup = next;
    tableKey += 1;
    go("table");
  }

  function rematch(): void {
    startMatch({ ...setup, seed: Date.now() % 1_000_000_000 });
  }
</script>

{#if screen === "menu"}
  <MenuScreen
    onPlay={() => go("setup")}
    onHowTo={() => go("howto")}
    onOptions={() => go("options")}
    onPlayground={() => go("playground")}
  />
{:else if screen === "setup"}
  <SetupScreen initial={setup} onStart={startMatch} onBack={() => go("menu")} />
{:else if screen === "howto"}
  <HowToPlayScreen onBack={() => go("menu")} />
{:else if screen === "options"}
  <OptionsScreen onBack={() => go("menu")} />
{:else if screen === "playground"}
  <PlaygroundScreen onBack={() => go("menu")} />
{:else if screen === "table"}
  {#key tableKey}
    <TableScreen setup={setup} onMenu={() => go("menu")} onNewGame={() => go("setup")} onRematch={rematch} />
  {/key}
{/if}
