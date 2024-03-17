<script>
  import TaskItem from "$lib/components/TaskItem.svelte";

  export let tasks;

  let sortCriteria = "";

  function sortTasks() {
    if (sortCriteria === "distance") {
      tasks = tasks.sort((a, b) => a.distance - b.distance);
    } else if (sortCriteria === "reward") {
      tasks = tasks.sort((a, b) => b.reward - a.reward);
    } else if (sortCriteria === "taskType") {
      tasks = tasks.sort((a, b) => a.taskType.localeCompare(b.taskType));
    } else if (sortCriteria === "vehicleType") {
      tasks = tasks.sort((a, b) => a.vehicle.localeCompare(b.vehicle));
    }
  }
</script>

<section>
  <div class="flex items-center justify-between">
    <h2 class="text-2xl font-bold mt-4">Tasks</h2>
    <div>
      <select
        class="bg-gray-200 px-4 py-2 rounded"
        bind:value={sortCriteria}
        on:change={sortTasks}
      >
        <option value="">Sort by</option>
        <option value="distance">Distance</option>
        <option value="reward">Reward</option>
        <option value="taskType">Task Type</option>
        <option value="vehicleType">Vehicle Type</option>
      </select>
    </div>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
    {#each tasks as task}
      <TaskItem {task} />
    {/each}
  </div>
</section>
