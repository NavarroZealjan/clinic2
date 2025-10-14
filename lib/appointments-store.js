console.log("[v0] Appointments store module loading...");

// Use Node.js global object to persist data across module reloads
if (!global.appointmentsStore) {
  console.log("[v0] Creating NEW global appointments store");
  global.appointmentsStore = {
    appointments: [],
    nextId: 1,
  };
} else {
  console.log(
    "[v0] Using EXISTING global appointments store with",
    global.appointmentsStore.appointments.length,
    "appointments"
  );
}

export const appointmentsStore = global.appointmentsStore;

export function getStoreInfo() {
  return {
    appointmentsCount: appointmentsStore.appointments.length,
    nextId: appointmentsStore.nextId,
    storeReference: appointmentsStore,
    isGlobal: appointmentsStore === global.appointmentsStore,
  };
}

export function getAppointmentsStore() {
  return global.appointmentsStore;
}
