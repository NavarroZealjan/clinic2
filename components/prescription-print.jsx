"use client"

export function PrescriptionPrint({ prescription, patient, onClose }) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Print buttons - hidden when printing */}
        <div className="flex justify-between items-center p-4 border-b print:hidden">
          <h2 className="text-xl font-semibold">Prescription Preview</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition"
            >
              Print Prescription
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">
              Close
            </button>
          </div>
        </div>

        {/* Printable content */}
        <div className="p-8 print:p-0">
          <div className="prescription-content bg-white">
            {/* Header */}
            <div className="border-b-4 border-sky-500 pb-4 mb-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-sky-600">E-CLINIC MEDICAL CENTER</h1>
                <p className="text-sm text-gray-600 mt-1">123 Medical Street, Healthcare City, HC 12345</p>
                <p className="text-sm text-gray-600">Phone: (123) 456-7890 | Email: info@eclinic.com</p>
              </div>
            </div>

            {/* Prescription Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">PRESCRIPTION</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Date:</p>
                  <p className="font-semibold">{new Date(prescription.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Prescription No:</p>
                  <p className="font-semibold">#{prescription.id.toString().padStart(6, "0")}</p>
                </div>
              </div>
            </div>

            {/* Patient Information */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">Patient Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Name:</p>
                  <p className="font-semibold">{patient.fullName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Age:</p>
                  <p className="font-semibold">{patient.age} years old</p>
                </div>
                <div>
                  <p className="text-gray-600">Gender:</p>
                  <p className="font-semibold capitalize">{patient.gender}</p>
                </div>
                <div>
                  <p className="text-gray-600">Contact:</p>
                  <p className="font-semibold">{patient.phone}</p>
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            {prescription.diagnosis && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">Diagnosis:</h3>
                <p className="text-gray-700 pl-4">{prescription.diagnosis}</p>
              </div>
            )}

            {/* Medications */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">Rx (Medications):</h3>
              <div className="space-y-4">
                {prescription.medications.map((med, index) => (
                  <div key={index} className="border-l-4 border-sky-500 pl-4 py-2">
                    <p className="font-bold text-lg">
                      {index + 1}. {med.name}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        <span className="text-gray-600">Dosage:</span>
                        <span className="ml-2 font-semibold">{med.dosage}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Frequency:</span>
                        <span className="ml-2 font-semibold">{med.frequency}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="ml-2 font-semibold">{med.duration}</span>
                      </div>
                    </div>
                    {med.instructions && (
                      <p className="text-sm text-gray-600 mt-1 italic">Instructions: {med.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            {prescription.notes && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">Additional Notes:</h3>
                <p className="text-gray-700 pl-4 italic">{prescription.notes}</p>
              </div>
            )}

            {/* Doctor Signature */}
            <div className="mt-12 pt-6 border-t-2 border-gray-300">
              <div className="text-right">
                <div className="inline-block">
                  <p className="font-bold text-lg">{prescription.doctor_name}</p>
                  <p className="text-sm text-gray-600">Licensed Physician</p>
                  <div className="border-t-2 border-gray-400 mt-8 pt-1">
                    <p className="text-xs text-gray-500">Doctor's Signature</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
              <p>
                This is a computer-generated prescription. For verification, please contact E-Clinic Medical Center.
              </p>
              <p className="mt-1">Generated on: {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .prescription-content,
          .prescription-content * {
            visibility: visible;
          }
          .prescription-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20mm;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  )
}
