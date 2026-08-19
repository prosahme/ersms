import { NewReminderForm } from "./new-reminder-form";

export default function NewReminderPage() {
  return (
    <div className="p-8 max-w-md">
      <h1 className="text-2xl font-semibold mb-6">Add Reminder</h1>
      <NewReminderForm />
    </div>
  );
}