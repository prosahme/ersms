import { requireFinancialAccess, UnauthorizedError, ForbiddenError } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { NewExpenseForm } from "./new-expense-form";

export default async function NewExpensePage() {
  try {
    await requireFinancialAccess();
  } catch (e) {
    if (e instanceof UnauthorizedError || e instanceof ForbiddenError) {
      redirect("/dashboard");
    }
    throw e;
  }

  return (
    <div className="p-4 md:p-8 max-w-md">
      <h1 className="text-2xl font-semibold mb-6">Add Expense</h1>
      <NewExpenseForm />
    </div>
  );
}
