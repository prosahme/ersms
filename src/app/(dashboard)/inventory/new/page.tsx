import { NewPartForm } from "./new-part-form";

export default function NewPartPage() {
  return (
    <div className="p-8 max-w-md">
      <h1 className="text-2xl font-semibold mb-6">Add Spare Part</h1>
      <NewPartForm />
    </div>
  );
}
