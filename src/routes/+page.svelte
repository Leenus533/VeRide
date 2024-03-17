<script lang="ts">
  import { writable } from "svelte/store";
  import { DAppKitUI } from "@vechain/dapp-kit-ui";
  import * as Dialog from "$lib/components/ui/dialog";
  import Button from "$lib/components/ui/button/button.svelte";
  import { env } from "$env/dynamic/public";
  import { onMount } from "svelte";

  const user: any = writable(null);
  const vetPerMin = 10;
  const walletConnectOptions = {
    projectId: "a0b855ceaf109dbc8426479a4c3d38d8",
    metadata: {
      name: "VeRide",
      description: "A Decentralized Application for Sharing Electric Bikes",
      url: window.location.origin,
      icons: [`${window.location.origin}/images/logo/my-dapp.png`],
    },
  };

  let isDialogOpen = false;
  let selectedButton = "Ride";
  let isTaskDialogOpen = false;
  let selectedTask = null;

  const rentTheBike = async (marker: google.maps.Marker) => {
    isDialogOpen = true;
  };

  const confirmRent = async () => {
    isDialogOpen = false;
  };

  const acceptTask = (task) => {
    selectedTask = task;
    isTaskDialogOpen = true;
  };

  const confirmAcceptTask = async () => {
    isTaskDialogOpen = false;
    // Perform task acceptance logic here
  };

  const vechainDAppKitOptions = {
    nodeUrl: "https://testnet.vechain.org/",
    genesis: "test",
    walletConnectOptions,
    usePersistence: true,
  };

  DAppKitUI.configure(vechainDAppKitOptions);

  DAppKitUI.modal.onConnectionStatusChange((status) => {
    user.set(status);
    if (status) {
      initMap();
    }
  });

  let map: google.maps.Map;
  let markers: google.maps.Marker[] = [];
  let mapElement: HTMLElement;
  let directionsService: google.maps.DirectionsService;
  let directionsRenderer: google.maps.DirectionsRenderer;
  let currentLocationMarker: google.maps.Marker;

  const markerIcons = [
    {
      url: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f6f4.png",
      title: "Scooter",
    },
    {
      url: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f6f5.png",
      title: "E-bike",
    },
    {
      url: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f6b2.png",
      title: "Bike",
    },
  ];

  let tasks = [
    {
      vehicleName: "E-scooter#3102",
      vehicle: "E-Scooter",
      distance: 2.0,
      reward: 12,
      taskType: "Relocate",
    },
    {
      vehicleName: "E-bike#0473",
      vehicle: "E-Bike",
      distance: 0.8,
      reward: 8,
      taskType: "Repair",
    },
    {
      vehicleName: "Scooter#8942",
      vehicle: "Scooter",
      distance: 1.2,
      reward: 9,
      taskType: "Charge",
    },
    {
      vehicleName: "Bike#4382",
      vehicle: "Bike",
      distance: 4.0,
      reward: 25,
      taskType: "Relocate",
    },
    {
      vehicleName: "E-scooter#6731",
      vehicle: "E-Scooter",
      distance: 3.0,
      reward: 18,
      taskType: "Repair",
    },
    {
      vehicleName: "E-bike#2951",
      vehicle: "E-Bike",
      distance: 2.2,
      reward: 13,
      taskType: "Charge",
    },
    {
      vehicleName: "Scooter#1579",
      vehicle: "Scooter",
      distance: 3.8,
      reward: 22,
      taskType: "Relocate",
    },
    {
      vehicleName: "Bike#4621",
      vehicle: "Bike",
      distance: 1.0,
      reward: 10,
      taskType: "Repair",
    },
    {
      vehicleName: "E-scooter#1985",
      vehicle: "E-Scooter",
      distance: 4.5,
      reward: 27,
      taskType: "Charge",
    },
    {
      vehicleName: "E-bike#0234",
      vehicle: "E-Bike",
      distance: 3.2,
      reward: 19,
      taskType: "Relocate",
    },
  ];

  // Sort tasks by distance from the user
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

  function getVehicleEmoji(vehicle: string): string {
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

  function initMap() {
    const currentLocationIcon = {
      url: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4cd.png",
      scaledSize: new google.maps.Size(40, 40),
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const mapOptions = {
            center: { lat: latitude, lng: longitude },
            zoom: 12,
          };
          map = new google.maps.Map(mapElement, mapOptions);

          currentLocationMarker = new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: map,
            title: "Current Location",
            icon: {
              url: currentLocationIcon.url,
              scaledSize: currentLocationIcon.scaledSize,
            },
          });

          directionsService = new google.maps.DirectionsService();
          directionsRenderer = new google.maps.DirectionsRenderer();
          directionsRenderer.setMap(map);

          const radius = 1609.34;
          for (let i = 0; i < 10; i++) {
            const randomPoint = generateRandomPoint(
              latitude,
              longitude,
              radius
            );
            const randomIconIndex = Math.floor(
              Math.random() * markerIcons.length
            );
            const marker = new google.maps.Marker({
              position: randomPoint,
              map: map,
              title: `${markerIcons[randomIconIndex].title} ${i + 1}`,
              icon: {
                url: markerIcons[randomIconIndex].url,
                scaledSize: new google.maps.Size(32, 32),
              },
            });
            markers.push(marker);
          }

          markers.forEach((marker) => {
            marker.addListener("click", () => {
              calculateWalkingTime(marker);
            });
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }

  function calculateWalkingTime(marker: google.maps.Marker) {
    if (navigator.geolocation && currentLocationMarker) {
      const request: google.maps.DirectionsRequest = {
        origin: currentLocationMarker.getPosition(),
        destination: marker.getPosition(),
        travelMode: google.maps.TravelMode.WALKING,
      };

      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
          const route = result.routes[0];
          const duration = route.legs[0].duration;
          if (duration) {
            const infowindowContent = `
            <div id="infowindow-content">
              <p>Approximate walking time: ${duration.text}</p>
              <p>Estimated arrival time: ${new Date(
                Date.now() + duration.value * 1000
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}</p>
              <p>Price: ${vetPerMin} VET</p>
              <button id="rent-bike-button" class="bg-green-400 text-white px-4 py-2 rounded">Reserve Now</button>
            </div>
          `;
            const infowindow = new google.maps.InfoWindow({
              content: infowindowContent,
            });
            infowindow.open(map, marker);
            google.maps.event.addListener(infowindow, "domready", () => {
              document
                .getElementById("rent-bike-button")
                .addEventListener("click", () => rentTheBike(marker));
            });
          }
        }
      });
    }
  }

  function generateRandomPoint(
    latitude: number,
    longitude: number,
    radius: number
  ) {
    const x0 = longitude;
    const y0 = latitude;
    const rd = radius / 111300;

    const u = Math.random();
    const v = Math.random();

    const w = rd * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);

    const xp = x / Math.cos(y0);

    const newLongitude = xp + x0;
    const newLatitude = y + y0;

    return { lat: newLatitude, lng: newLongitude };
  }

  onMount(() => {
    user.set(DAppKitUI.wallet.state.address);
    if ($user) {
      window.onload = function () {
        initMap();
      };
    }
  });
</script>

<svelte:head>
  <script
    async
    src={`https://maps.googleapis.com/maps/api/js?key=${env.PUBLIC_GOOGLE_MAPS_KEY}`}
    defer
  ></script>
</svelte:head>

<div class="container mx-auto">
  <div class="border-b border-green-600">
    <div class="flex h-16 items-center px-4 justify-between">
      <h1
        class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-700"
      >
        VeRide
      </h1>
      <div class="flex items-center space-x-4">
        <vdk-button></vdk-button>
      </div>
    </div>
  </div>
  {#if $user}
    <div class="relative min-h-[50%]">
      <div id="map" style="height: 400px;" bind:this={mapElement}></div>
      {#if map}
        <Dialog.Root
          onOpenChange={(change) => (isDialogOpen = change)}
          open={isDialogOpen}
        >
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Are you sure?</Dialog.Title>
              <Dialog.Description>
                Current Cost is {vetPerMin} VET per minute
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Button variant="outline" on:click={() => (isDialogOpen = false)}
                >Cancel</Button
              >
              <Button variant="outline" on:click={confirmRent}>Confirm</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Root>
      {/if}
    </div>
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
                on:click={() => acceptTask(task)}
              >
                Accept Task
              </button>
            </div>
            <div class="ml-4 flex items-center justify-center">
              <span class="text-6xl">{getVehicleEmoji(task.vehicle)}</span>
            </div>
          </div>
        {/each}
      </div>

      {#if selectedTask}
        <Dialog.Root
          onOpenChange={(change) => (isTaskDialogOpen = change)}
          open={isTaskDialogOpen}
        >
          <Dialog.Overlay
            class="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm"
          />
          <Dialog.Content
            class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 max-w-md w-full"
          >
            <Dialog.Header>
              <Dialog.Title>Confirm Task Acceptance</Dialog.Title>
              <Dialog.Description>
                Are you sure you want to accept the task "{selectedTask.vehicleName}"?
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Button
                variant="outline"
                on:click={() => (isTaskDialogOpen = false)}>Cancel</Button
              >
              <Button variant="outline" on:click={confirmAcceptTask}
                >Accept Task</Button
              >
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Root>
      {/if}
    </section>
  {:else}
    <section class=" ">
      <div
        class="container mx-auto px-4 py-8 lg:py-16 flex flex-col lg:flex-row items-center lg:items-start justify-between max-w-screen-xl"
      >
        <div class="lg:w-1/2 text-center lg:text-left">
          <h1
            class="text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight leading-none dark:text-white mb-4"
          >
            VeRide: Bringing Power To The People
          </h1>
          <p
            class="text-gray-500 dark:text-gray-400 md:text-lg lg:text-xl font-light mb-6 lg:mb-8"
          >
            Decentralized electric bike sharing platform built, powered, and
            used by the users themselves.
          </p>
          <div>
            <vdk-button></vdk-button>
          </div>
        </div>
        <div class="lg:w-1/2 mt-8 lg:mt-0 flex justify-center lg:justify-end">
          <div
            class="w-full lg:max-w-lg xl:max-w-xl overflow-hidden rounded-lg shadow-lg relative"
          >
            <img
              src="/Hero.webp"
              alt="mockup"
              class="w-full h-auto transform hover:scale-105 transition-transform duration-500 ease-in-out"
            />
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent to-white dark:to-gray-900 opacity-50"
            ></div>
          </div>
        </div>
      </div>
      <div
        class="px-4 mx-auto text-center md:max-w-screen-md lg:max-w-screen-lg lg:px-36"
      >
        <span class="font-semibold text-gray-400 uppercase">FEATURED IN</span>
        <div
          class="flex flex-wrap justify-center items-center mt-8 text-gray-500 sm:justify-between"
        >
          <a
            href="#"
            class="mr-5 mb-5 lg:mb-0 hover:text-gray-800 dark:hover:text-gray-400"
          >
            <img src="/vechain.png" />
          </a>
          <a
            href="#"
            class="mr-5 mb-5 lg:mb-0 hover:text-gray-800 dark:hover:text-gray-400"
          >
            <img src="/easya.svg" />
          </a>
          <a
            href="#"
            class="mr-5 mb-5 lg:mb-0 hover:text-gray-800 dark:hover:text-gray-400"
          >
            <img src="/bcg-logo.png.webp" alt="BCG" class="h-11" />
          </a>
        </div>
      </div>
    </section>
  {/if}
</div>
