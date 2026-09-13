"use client";

import { useActionState, useState } from "react";
import { createCustomerWithRepairAction, type CustomerRepairFormState } from "../actions";

const initialState: CustomerRepairFormState = {};

export function NewCustomerForm({
  technicians,
  isAdmin,
}: {
  technicians: { id: string; fullName: string }[];
  isAdmin: boolean;
}) {
  const [state, formAction, isPending] = useActionState(createCustomerWithRepairAction, initialState);
  // On by default — the primary workflow is customer + repair together.
  // Turning it off falls back to the plain "customer only" save.
  const [includeRepair, setIncludeRepair] = useState(true);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="includeRepair" value={includeRepair ? "1" : "0"} />

      <div className="space-y-4">
        <h2 className="font-semibold text-orange-500 text-xs uppercase tracking-wide">Customer Information</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input name="name" type="text" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input name="phone" type="text" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email (optional)</label>
          <input name="email" type="email" className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address (optional)</label>
          <input name="address" type="text" className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-orange-100 pt-4">
        <input
          id="include-repair"
          type="checkbox"
          checked={includeRepair}
          onChange={(e) => setIncludeRepair(e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="include-repair" className="text-sm font-medium">
          Also create a repair ticket for this customer now
        </label>
      </div>

      {includeRepair && (
        <div className="space-y-4">
          <h2 className="font-semibold text-orange-500 text-xs uppercase tracking-wide">Repair Information</h2>

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
            <select name="deviceType" required={includeRepair} className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm">
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
              <input name="deviceBrand" type="text" required={includeRepair} className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Device Model</label>
              <input name="deviceModel" type="text" required={includeRepair} className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Serial Number / IMEI (optional)</label>
            <input name="serialNumberImei" type="text" className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reported Problem</label>
            <textarea name="reportedProblem" required={includeRepair} rows={3} className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Cost</label>
              <input name="estimatedCost" type="number" step="0.01" required={includeRepair} className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Deposit Amount</label>
              <input name="depositAmount" type="number" step="0.01" required={includeRepair} className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deposit Payment Method</label>
            <select name="paymentMethod" required={includeRepair} className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm">
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
        </div>
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
      >
        {isPending ? "Saving..." : includeRepair ? "Save Customer & Create Repair" : "Save Customer"}
      </button>
    </form>
  );
}
