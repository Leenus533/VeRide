<script lang="ts">
  import { onMount } from "svelte";
  import { DAppKitUI } from "@vechain/dapp-kit-ui";
  import * as Dialog from "$lib/components/ui/dialog";
  import Button from "$lib/components/ui/button/button.svelte";
  import { writable } from "svelte/store";
  import { env } from "$env/dynamic/public";
  import TaskList from "$lib/components/TaskList.svelte";
  import ConfirmationDialog from "$lib/components/ConfirmationDialog.svelte";
  import { generateRandomPoint } from "$lib/extra";
  import MainPage from "./MainPage.svelte";

  let user = writable(null);
  let tasks = [
    {
      vehicleName: "Scooter#3102",
      vehicle: "Scooter",
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
      vehicleName: "E-bike#6731",
      vehicle: "E-bike",
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
      vehicleName: "E-bike#1985",
      vehicle: "E-Bike",
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
  let selectedTask = null;
  let isTaskDialogOpen = false;
  let isDialogOpen = false;
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

  const vetPerMin = 10;

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

  const walletConnectOptions = {
    projectId: "a0b855ceaf109dbc8426479a4c3d38d8",
    metadata: {
      name: "VeRide",
      description: "A Decentralized Application for Sharing Electric Bikes",
      url: window.location.origin,
      icons: [`${window.location.origin}/images/logo/my-dapp.png`],
    },
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
    if ($user) {
      initMap();
    }
  });

  onMount(() => {
    user.set(DAppKitUI.wallet.state.address);
    window.onload = function () {
      initMap();
    };
    if ($user) {
      setTimeout(initMap, 200);
    }
  });

  function acceptTask(task) {
    selectedTask = task;
    isTaskDialogOpen = true;
  }

  function confirmAcceptTask() {
    isTaskDialogOpen = false;
    // Perform task acceptance logic here
  }

  function rentTheBike(marker) {
    isDialogOpen = true;
  }
  function confirmRent() {
    isDialogOpen = false;
  }
  $: user, isDialogOpen, selectedTask, mapElement;
</script>

<svelte:head>
  <script
    async
    src={`https://maps.googleapis.com/maps/api/js?key=${env.PUBLIC_GOOGLE_MAPS_KEY}`}
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
    </div>
    <TaskList {tasks} on:accept={acceptTask} />

    {#if isDialogOpen}
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

    {#if selectedTask}
      <ConfirmationDialog
        isOpen={isTaskDialogOpen}
        onConfirm={confirmAcceptTask}
        onCancel={() => (isTaskDialogOpen = false)}
        title="Confirm Task Acceptance"
        description={`Are you sure you want to accept the task "${selectedTask.vehicleName}"?`}
      />
    {/if}
  {:else}
    <MainPage />
  {/if}
</div>
