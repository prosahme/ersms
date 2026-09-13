"use client";

import { useActionState } from "react";
import { createRepairAction, type RepairFormState } from "../actions";
import { CustomerPicker } from "./customer-picker";

const initialState: RepairFormState = {};
export function NewRepairForm({
  customers,
  technicians,
  isAdmin,
}: {
  customers: { id: string; name: string; phone: string }[];
  technicians: { id: string; fullName: string }[];
  isAdmin: boolean;
}) {
  const [state, formAction, isPending] = useActionState(createRepairAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <CustomerPicker customers={customers} />

  <div>
    <label className="block text-sm font-medium mb-1">Assign Technician (optional)</label>
    <select name="assignedTechnicianId" className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm">
      <option value="">Unassigned</option>
      {technicians.map((tech) => (
        <option key={tech.id} value={tech.id}>{tech.fullName}</option>
      ))}
    </select>
  </div>

      <div>
        <label className="block text-sm font-medium mb-1">Device Type</label>
        <select name="deviceType" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm">
          <option value="PHONE">Phone</option>
          <option value="TABLET">Tablet</option>
          <option value="LAPTOP">Laptop</option>
          <option value="DESKTOP">Desktop</option>
          <option value="TV">TV</option>
          <option value="RECEIVER">Receiver</option>
          <option value="AMPLIFIER">Amplifier</option>
          <option value="MOSQUE_MICROPHONE">Mosque Microphone</option>
          <option value="SPEAKER">Speaker</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Device Brand</label>
          <input name="deviceBrand" type="text" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Device Model</label>
          <input name="deviceModel" type="text" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Serial Number / IMEI (optional)</label>
        <input name="serialNumberImei" type="text" className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Reported Problem</label>
        <textarea name="reportedProblem" required rows={3} className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Estimated Cost</label>
          <input name="estimatedCost" type="number" step="0.01" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Deposit Amount</label>
          <input name="depositAmount" type="number" step="0.01" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
  <label className="block text-sm font-medium mb-1">Deposit Payment Method</label>
  <select name="paymentMethod" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm">
    <option value="CASH">Cash</option>
    <option value="TELEBIRR">Telebirr</option>
    <option value="BANK_TRANSFER">Bank Transfer</option>
  </select>
</div>

      {isAdmin && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-md p-3">
          <input id="visibility-private" name="visibility" type="checkbox" value="PRIVATE" className="h-4 w-4" />
          <label htmlFor="visibility-private" className="text-sm">
            Mark as private (owner-only — hidden from Technicians)
          </label>
        </div>
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Create Repair Ticket"}
      </button>
    </form>
  );
}
