<script>
  import { createEventDispatcher } from "svelte";

  export let task;

  const dispatch = createEventDispatcher();

  function getVehicleEmoji(vehicle) {
    switch (vehicle) {
      case "E-Bike":
        return "🛵";
      case "Scooter":
        return "🛴";
      case "Bike":
        return "🚲";
      default:
        return "";
    }
  }
</script>

<div class="bg-white rounded-lg shadow-md p-4 flex">
  <div class="flex-1">
    <div class="flex items-center">
      <h3 class="text-xl font-semibold">{task.vehicleName}</h3>
    </div>
    <p class="text-gray-500 mt-2">Distance: {task.distance} km</p>
    <p class="text-gray-500">Reward: {task.reward} VET</p>
    <p class="text-gray-500">Task Type: {task.taskType}</p>
    <button
      class="bg-green-500 text-white px-4 py-2 rounded mt-4"
      on:click={() => dispatch("accept", task)}
    >
      Accept Task
    </button>
  </div>
  <div class="ml-4 flex items-center justify-center">
    <span class="text-6xl">{getVehicleEmoji(task.vehicle)}</span>
  </div>
</div>
