"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- DEFAULT CATEGORIES INITIALIZER ---
export async function ensureDefaultExpenseCategories() {
  const count = await prisma.expenseCategory.count();
  if (count === 0) {
    const defaults = [
      { name: "Rent & Facilities", type: "BUSINESS" },
      { name: "Salaries & Wages", type: "BUSINESS" },
      { name: "Utilities & Electricity", type: "BUSINESS" },
      { name: "Internet & Phone", type: "BUSINESS" },
      { name: "Office Supplies", type: "BUSINESS" },
      { name: "Tea, Snacks & Refreshments", type: "BUSINESS" },
      { name: "Fuel & Transport", type: "BUSINESS" },
      { name: "Maintenance & Repairs", type: "BUSINESS" },
      { name: "Marketing & Advertising", type: "BUSINESS" },
      { name: "Loan EMI", type: "BUSINESS" },
      { name: "Miscellaneous Business", type: "BUSINESS" },
      { name: "Home & Personal", type: "PERSONAL" },
      { name: "College Fees & Education", type: "PERSONAL" },
    ];

    for (const cat of defaults) {
      await prisma.expenseCategory.upsert({
        where: { name: cat.name },
        update: {},
        create: cat,
      });
    }
  }
}

// --- AUTOMATED RECURRING FIXED EXPENSES & LOAN EMIS GENERATOR ---
export async function processRecurringFixedExpenses() {
  try {
    await ensureDefaultExpenseCategories();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth() + 1; // 1-12
    const currentDay = now.getDate();
    const monthKey = `${currentYear}-${String(currentMonthNum).padStart(2, "0")}`;

    // 1. Process Fixed Expense Templates
    if (!prisma.fixedExpenseTemplate) {
      console.warn("fixedExpenseTemplate model not initialized on Prisma Client");
      return;
    }

    const templates = await prisma.fixedExpenseTemplate.findMany({
      where: { isActive: true },
    });

    for (const template of templates) {
      // Check if not already generated for this month AND today >= dayOfMonth
      if (template.lastGeneratedMonth !== monthKey && currentDay >= template.dayOfMonth) {
        // Calculate transaction date for the expense in current month
        const daysInMonth = new Date(currentYear, currentMonthNum, 0).getDate();
        const expDay = Math.min(template.dayOfMonth, daysInMonth);
        const expDate = new Date(currentYear, currentMonthNum - 1, expDay, 10, 0, 0);

        // Create the Expense entry automatically
        await prisma.expense.create({
          data: {
            title: template.name,
            amount: template.amount,
            date: expDate,
            categoryId: template.categoryId,
            expenseType: template.expenseType,
            paymentMethod: template.paymentMethod,
            isFixed: true,
            isRecurring: true,
            remarks: template.notes || `Auto-generated monthly fixed expense (${monthKey})`,
            fixedTemplateId: template.id,
          },
        });

        // Update lastGeneratedMonth
        await prisma.fixedExpenseTemplate.update({
          where: { id: template.id },
          data: { lastGeneratedMonth: monthKey },
        });
      }
    }

    // 2. Process Active Loans & Automatic Monthly EMIs
    const loans = await prisma.loan.findMany({
      where: { status: "ACTIVE" },
      include: { emis: true },
    });

    for (const loan of loans) {
      const paidCount = loan.emis.length;
      if (paidCount < loan.durationMonths) {
        // Check if EMI for current month was already generated
        const emiAlreadyGenerated = loan.lastEmiMonth === monthKey;

        if (!emiAlreadyGenerated && currentDay >= loan.dueDate) {
          const daysInMonth = new Date(currentYear, currentMonthNum, 0).getDate();
          const emiDay = Math.min(loan.dueDate, daysInMonth);
          const emiDate = new Date(currentYear, currentMonthNum - 1, emiDay, 10, 0, 0);

          const emiNumber = paidCount + 1;
          const emiAmount = loan.emiAmount;

          // Find or create "Loan EMI" category
          let emiCat = await prisma.expenseCategory.findUnique({
            where: { name: "Loan EMI" },
          });
          if (!emiCat) {
            emiCat = await prisma.expenseCategory.create({
              data: { name: "Loan EMI", type: loan.expenseType || "BUSINESS" },
            });
          }

          // Create LoanEMI record first
          const loanEmi = await prisma.loanEMI.create({
            data: {
              loanId: loan.id,
              emiNumber: emiNumber,
              amount: emiAmount,
              paymentDate: emiDate,
              dueDate: emiDate,
              status: "PAID",
            },
          });

          // Create Expense record linked to LoanEMI
          await prisma.expense.create({
            data: {
              title: `EMI - ${loan.name} (#${emiNumber}/${loan.durationMonths})`,
              amount: emiAmount,
              date: emiDate,
              categoryId: emiCat.id,
              expenseType: loan.expenseType || "BUSINESS",
              paymentMethod: loan.paymentMethod || "BANK",
              isFixed: true,
              isRecurring: true,
              remarks: `Auto-generated monthly EMI payment for ${loan.name}`,
              loanEmiId: loanEmi.id,
            },
          });

          // Calculate interest & principal breakdown
          // Monthly interest approx = Remaining Balance * (InterestRate / 100 / 12)
          const monthlyInterestRate = (loan.interestRate / 100) / 12;
          const monthlyInterest = loan.remainingBalance * monthlyInterestRate;
          const principalRepayment = Math.max(0, emiAmount - monthlyInterest);
          const newBalance = Math.max(0, loan.remainingBalance - principalRepayment);
          const isClosed = emiNumber >= loan.durationMonths || newBalance <= 0;

          await prisma.loan.update({
            where: { id: loan.id },
            data: {
              remainingBalance: Math.round(newBalance * 100) / 100,
              lastEmiMonth: monthKey,
              status: isClosed ? "CLOSED" : "ACTIVE",
            },
          });
        }
      }
    }

  } catch (err) {
    console.error("Error in processRecurringFixedExpenses:", err);
  }
}

// --- EXPENSE DASHBOARD SUMMARY DATA ---
export async function getExpenseDashboardSummary() {
  await processRecurringFixedExpenses();

  const expenses = await prisma.expense.findMany({
    include: { category: true, fixedTemplate: true, loanEmi: true },
    orderBy: { date: "desc" },
  });

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let todayExpenses = 0;
  let thisMonthExpenses = 0;
  let thisYearExpenses = 0;
  let totalBusinessExpenses = 0;
  let totalPersonalExpenses = 0;
  let fixedExpensesTotal = 0;
  let variableExpensesTotal = 0;

  // Monthly breakdown for trend chart (last 6 months)
  const monthlyTrends: Record<string, { business: number; personal: number; fixed: number; total: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
    monthlyTrends[label] = { business: 0, personal: 0, fixed: 0, total: 0 };
  }

  // Category breakdown
  const categoryTotals: Record<string, number> = {};

  expenses.forEach((exp) => {
    const expDate = new Date(exp.date);
    const expDateStr = expDate.toISOString().split("T")[0];
    const amount = exp.amount;
    const isBus = exp.expenseType === "BUSINESS";

    // Summary calculations
    if (expDateStr === todayStr) {
      todayExpenses += amount;
    }

    if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
      thisMonthExpenses += amount;
      if (exp.isFixed) {
        fixedExpensesTotal += amount;
      } else {
        variableExpensesTotal += amount;
      }
    }

    if (expDate.getFullYear() === currentYear) {
      thisYearExpenses += amount;
    }

    if (isBus) {
      totalBusinessExpenses += amount;
    } else {
      totalPersonalExpenses += amount;
    }

    // Category aggregation
    const catName = exp.category?.name || "Uncategorized";
    categoryTotals[catName] = (categoryTotals[catName] || 0) + amount;

    // Monthly trend aggregation
    const monthLabel = expDate.toLocaleString("default", { month: "short", year: "2-digit" });
    if (monthlyTrends[monthLabel]) {
      monthlyTrends[monthLabel].total += amount;
      if (isBus) monthlyTrends[monthLabel].business += amount;
      else monthlyTrends[monthLabel].personal += amount;
      if (exp.isFixed) monthlyTrends[monthLabel].fixed += amount;
    }
  });

  // Calculate upcoming fixed expenses due this month
  const fixedTemplates = await prisma.fixedExpenseTemplate.findMany({
    where: { isActive: true },
    include: { category: true },
  });
  const activeLoans = await prisma.loan.findMany({
    where: { status: "ACTIVE" },
  });

  const currentDay = now.getDate();
  const upcomingFixedList: Array<{ name: string; amount: number; dueDate: number; type: string; category?: string }> = [];

  fixedTemplates.forEach((t) => {
    if (t.dayOfMonth > currentDay || t.lastGeneratedMonth !== `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`) {
      upcomingFixedList.push({
        name: t.name,
        amount: t.amount,
        dueDate: t.dayOfMonth,
        type: t.expenseType,
        category: t.category?.name || "Fixed Expense",
      });
    }
  });

  activeLoans.forEach((l) => {
    if (l.dueDate > currentDay || l.lastEmiMonth !== `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`) {
      upcomingFixedList.push({
        name: `EMI - ${l.name}`,
        amount: l.emiAmount,
        dueDate: l.dueDate,
        type: l.expenseType || "BUSINESS",
        category: "Loan EMI",
      });
    }
  });

  upcomingFixedList.sort((a, b) => a.dueDate - b.dueDate);
  const upcomingFixedTotal = upcomingFixedList.reduce((sum, item) => sum + item.amount, 0);

  return {
    todayExpenses,
    thisMonthExpenses,
    thisYearExpenses,
    totalBusinessExpenses,
    totalPersonalExpenses,
    fixedExpensesTotal,
    variableExpensesTotal,
    upcomingFixedTotal,
    upcomingFixedList,
    recentExpenses: expenses.slice(0, 8),
    trendData: Object.entries(monthlyTrends).map(([month, data]) => ({
      month,
      business: Math.round(data.business),
      personal: Math.round(data.personal),
      fixed: Math.round(data.fixed),
      total: Math.round(data.total),
    })),
    categoryData: Object.entries(categoryTotals).map(([name, amount]) => ({
      name,
      amount: Math.round(amount),
    })),
  };
}

// --- FIXED EXPENSE TEMPLATES CRUD ---
export async function createFixedExpenseTemplate(data: {
  name: string;
  amount: number | string;
  categoryId?: string;
  expenseType?: "BUSINESS" | "PERSONAL";
  paymentMethod?: string;
  dayOfMonth: number | string;
  notes?: string;
}) {
  try {
    const amount = parseFloat(String(data.amount));
    const dayOfMonth = Math.min(31, Math.max(1, parseInt(String(data.dayOfMonth))));

    const template = await prisma.fixedExpenseTemplate.create({
      data: {
        name: data.name,
        amount: amount,
        categoryId: data.categoryId || null,
        expenseType: data.expenseType || "BUSINESS",
        paymentMethod: data.paymentMethod || "BANK",
        dayOfMonth: dayOfMonth,
        notes: data.notes || null,
      },
    });

    // Run trigger to immediately auto-generate for current month if dayOfMonth <= today
    await processRecurringFixedExpenses();

    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/expenses/fixed");
    return { success: true, template };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getFixedExpenseTemplates() {
  await processRecurringFixedExpenses();
  const templates = await prisma.fixedExpenseTemplate.findMany({
    include: { category: true, expenses: { orderBy: { date: "desc" }, take: 5 } },
    orderBy: { dayOfMonth: "asc" },
  });
  return templates;
}

export async function toggleFixedExpenseTemplateStatus(id: string, isActive: boolean) {
  try {
    await prisma.fixedExpenseTemplate.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/expenses/fixed");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteFixedExpenseTemplate(id: string) {
  try {
    await prisma.fixedExpenseTemplate.delete({ where: { id } });
    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/expenses/fixed");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- MANUAL EXPENSES CRUD ---
export async function createExpense(data: {
  title: string;
  amount: number | string;
  date: string;
  categoryId?: string;
  expenseType?: "BUSINESS" | "PERSONAL";
  paymentMethod?: string;
  vendor?: string;
  remarks?: string;
  isFixed?: boolean;
}) {
  try {
    const expense = await prisma.expense.create({
      data: {
        title: data.title,
        amount: parseFloat(String(data.amount)),
        date: new Date(data.date),
        categoryId: data.categoryId || null,
        expenseType: data.expenseType || "BUSINESS",
        paymentMethod: data.paymentMethod || "CASH",
        vendor: data.vendor || null,
        remarks: data.remarks || null,
        isFixed: data.isFixed || false,
        isRecurring: false,
      },
    });

    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/expenses/manual");
    revalidatePath("/dashboard/expenses/list");
    revalidatePath("/dashboard/accounting");
    return { success: true, expense };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateExpense(id: string, data: any) {
  try {
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        title: data.title,
        amount: parseFloat(String(data.amount)),
        date: new Date(data.date),
        categoryId: data.categoryId || null,
        expenseType: data.expenseType || "BUSINESS",
        paymentMethod: data.paymentMethod || "CASH",
        vendor: data.vendor || null,
        remarks: data.remarks || null,
      },
    });

    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/expenses/manual");
    revalidatePath("/dashboard/expenses/list");
    revalidatePath("/dashboard/accounting");
    return { success: true, expense };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteExpense(id: string) {
  try {
    await prisma.expense.delete({ where: { id } });
    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/expenses/manual");
    revalidatePath("/dashboard/expenses/list");
    revalidatePath("/dashboard/accounting");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getExpenses(filter?: { expenseType?: string; categoryId?: string }) {
  await processRecurringFixedExpenses();
  const where: any = {};
  if (filter?.expenseType && filter.expenseType !== "ALL") {
    where.expenseType = filter.expenseType;
  }
  if (filter?.categoryId && filter.categoryId !== "ALL") {
    where.categoryId = filter.categoryId;
  }

  return await prisma.expense.findMany({
    where,
    include: { category: true, fixedTemplate: true, loanEmi: { include: { loan: true } } },
    orderBy: { date: "desc" },
  });
}

// --- LOAN MANAGEMENT CRUD & AUTO-EMI CALCULATION ---
export async function createLoan(data: {
  name: string;
  amount: number | string;
  interestRate: number | string;
  durationMonths: number | string;
  startDate?: string;
  dueDate: number | string;
  expenseType?: "BUSINESS" | "PERSONAL";
  paymentMethod?: string;
  notes?: string;
}) {
  try {
    const P = parseFloat(String(data.amount));
    const R = parseFloat(String(data.interestRate));
    const N = parseInt(String(data.durationMonths));
    const dueDate = Math.min(31, Math.max(1, parseInt(String(data.dueDate))));

    let emi = 0;
    let totalInterest = 0;

    if (P > 0 && N > 0) {
      if (R === 0) {
        emi = P / N;
        totalInterest = 0;
      } else {
        const r = R / (12 * 100);
        emi = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
        totalInterest = emi * N - P;
      }
    }

    const loan = await prisma.loan.create({
      data: {
        name: data.name,
        amount: P,
        interestRate: R,
        durationMonths: N,
        emiAmount: Math.round(emi * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        remainingBalance: P,
        dueDate: dueDate,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        expenseType: data.expenseType || "BUSINESS",
        paymentMethod: data.paymentMethod || "BANK",
        notes: data.notes || null,
        status: "ACTIVE",
      },
    });

    // Run trigger to immediately generate current month's EMI if dueDate <= today
    await processRecurringFixedExpenses();

    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/expenses/loans");
    revalidatePath("/dashboard/accounting");
    return {
      success: true,
      loan,
      emiAmount: Math.round(emi * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalPayable: Math.round((P + totalInterest) * 100) / 100,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getLoans() {
  await processRecurringFixedExpenses();
  return await prisma.loan.findMany({
    include: {
      emis: {
        orderBy: { emiNumber: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteLoan(id: string) {
  try {
    await prisma.loan.delete({ where: { id } });
    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/expenses/loans");
    revalidatePath("/dashboard/accounting");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- CATEGORIES ---
export async function getExpenseCategories() {
  await ensureDefaultExpenseCategories();
  return await prisma.expenseCategory.findMany({
    include: {
      _count: { select: { expenses: true, fixedTemplates: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function createExpenseCategory(name: string, type: "BUSINESS" | "PERSONAL" = "BUSINESS") {
  try {
    const category = await prisma.expenseCategory.create({
      data: { name, type },
    });
    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/expenses/categories");
    return { success: true, category };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteExpenseCategory(id: string) {
  try {
    const inUseExp = await prisma.expense.findFirst({ where: { categoryId: id } });
    const inUseFixed = await prisma.fixedExpenseTemplate.findFirst({ where: { categoryId: id } });
    if (inUseExp || inUseFixed) {
      return { success: false, error: "Cannot delete category in use by expenses or fixed templates." };
    }
    await prisma.expenseCategory.delete({ where: { id } });
    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/expenses/categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- COLLEGE FEES ---
export async function createCollegeFee(data: any) {
  try {
    const fee = await prisma.collegeFee.create({
      data: {
        collegeName: data.collegeName,
        course: data.course,
        semester: data.semester,
        feeAmount: parseFloat(data.feeAmount),
        dueDate: new Date(data.dueDate),
        paymentStatus: data.paymentStatus || "PENDING",
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
        receiptUrl: data.receiptUrl || null,
      },
    });

    // Also add to expenses under Personal
    let cat = await prisma.expenseCategory.findUnique({
      where: { name: "College Fees & Education" },
    });
    if (!cat) {
      cat = await prisma.expenseCategory.create({
        data: { name: "College Fees & Education", type: "PERSONAL" },
      });
    }

    await prisma.expense.create({
      data: {
        title: `College Fee: ${data.collegeName} (${data.course} - Sem ${data.semester})`,
        amount: parseFloat(data.feeAmount),
        date: new Date(data.dueDate),
        categoryId: cat.id,
        expenseType: "PERSONAL",
        paymentMethod: "BANK",
        remarks: "Auto-logged from College Fee Manager",
      },
    });

    revalidatePath("/dashboard/expenses");
    return { success: true, fee };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

