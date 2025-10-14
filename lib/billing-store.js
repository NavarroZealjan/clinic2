import { query } from "@/lib/db";

const transformBillingRecord = (record) => {
  if (!record) return null;
  return {
    id: record.id,
    patientName: record.patient_name,
    amount: record.amount,
    paymentMethod: record.payment_method,
    referenceNo: record.reference_number,
    status: record.status,
    description: record.description,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    paidAt: record.updated_at,
  };
};

const billingStore = {
  getAll: async () => {
    try {
      console.log("[v0] Fetching all billing records");
      const result = await query(
        `SELECT * FROM billing ORDER BY created_at DESC`
      );
      console.log("[v0] Found", result.rows.length, "billing records");
      return result.rows.map(transformBillingRecord);
    } catch (error) {
      console.error("[v0] Database error in getAll:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const result = await query(`SELECT * FROM billing WHERE id = $1`, [id]);
      return transformBillingRecord(result.rows[0]);
    } catch (error) {
      console.error("[v0] Database error in getById:", error);
      throw error;
    }
  },

  create: async (record) => {
    try {
      console.log("[v0] Inserting billing record into database:", record);
      const result = await query(
        `INSERT INTO billing (
          patient_name, amount, payment_method, reference_number, status
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
          record.patientName,
          record.amount,
          record.paymentMethod,
          record.referenceNumber,
          record.status || "pending",
        ]
      );
      console.log("[v0] Database insert successful:", result.rows[0]);
      return transformBillingRecord(result.rows[0]);
    } catch (error) {
      console.error("[v0] Database error in create:", error);
      throw error;
    }
  },

  update: async (id, updates) => {
    try {
      const result = await query(
        `UPDATE billing 
         SET patient_name = COALESCE($1, patient_name),
             amount = COALESCE($2, amount),
             payment_method = COALESCE($3, payment_method),
             status = COALESCE($4, status),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [
          updates.patientName,
          updates.amount,
          updates.paymentMethod,
          updates.status,
          id,
        ]
      );
      return transformBillingRecord(result.rows[0]);
    } catch (error) {
      console.error("[v0] Database error in update:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const result = await query(
        `DELETE FROM billing WHERE id = $1 RETURNING id`,
        [id]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error("[v0] Database error in delete:", error);
      throw error;
    }
  },
};

export { billingStore };
export default billingStore;
