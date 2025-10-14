// Global in-memory store for consultations
function initializeStore() {
  return {
    consultations: [
      {
        id: 1,
        patientId: 1,
        patientName: "LOIDA NAVARRO",
        doctorName: "Dr. Jay Smith",
        date: "2024-03-15",
        time: "10:30 AM",
        status: "Completed",
        diagnosis: "Acute Upper Respiratory Infection",
        symptoms: [
          "Persistent cough",
          "Mild fever (99.8°F)",
          "Nasal congestion",
          "Fatigue",
        ],
        treatment:
          "Prescribed Amoxicillin 500mg (3x daily for 7 days), rest, and increased fluid intake",
        clinicalNotes:
          "Patient advised to return if symptoms worsen or persist beyond 7 days. Follow-up scheduled if needed.",
        followUp: "as needed",
        createdAt: new Date().toISOString(),
      },
    ],
    nextId: 2,
  };
}

// Use global object to ensure singleton across hot reloads
if (!global.consultationsStore) {
  global.consultationsStore = initializeStore();
}

export function getConsultationsStore() {
  return global.consultationsStore;
}

export function addConsultation(consultation) {
  const store = getConsultationsStore();
  const newConsultation = {
    ...consultation,
    id: store.nextId++,
    createdAt: new Date().toISOString(),
  };
  store.consultations.push(newConsultation);
  return newConsultation;
}

export function getConsultations() {
  return getConsultationsStore().consultations;
}

export function getConsultationById(id) {
  return getConsultationsStore().consultations.find(
    (c) => c.id === Number.parseInt(id)
  );
}
