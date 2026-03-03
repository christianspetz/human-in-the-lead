import React, { useState, useMemo, useCallback, useEffect, useRef, Suspense } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, CartesianGrid
} from "recharts";
import generatePPTX from "./generatePPTX";

/* Lazy-loaded companion components (graceful fallback if not yet created) */
const BlueprintReconciler = React.lazy(() => import("./BlueprintReconciler").catch(() => ({ default: () => null })));
const MiningLinker = React.lazy(() => import("./MiningLinker").catch(() => ({ default: () => null })));

/* ═══════════════════════════════════════════════════════
   DESIGN TOKENS — Prism Design Language
   ═══════════════════════════════════════════════════════ */
const GOLD = "#D4A853", GREEN = "#7CB9A8", PURPLE = "#C4A1D4",
  BLUE = "#7BA7CC", RED = "#D48A8A", ORANGE = "#D4A07A";
const FONT = "'DM Sans',sans-serif", SERIF = "'Playfair Display',serif";
const TH = {
  dark: { bg: "#111110", card: "#1A1A18", bdr: "#2A2A25", tx: "#EEEAE4", tx2: "#B8B0A4", mut: "#888", sub: "#555", hover: "#1E1E1B" },
  light: { bg: "#F5F0E8", card: "#FFFFFF", bdr: "#D8D2C6", tx: "#1A1A18", tx2: "#555548", mut: "#888880", sub: "#BBB5A8", hover: "#F0EBE0" },
};

/* ═══════════════════════════════════════════════════════
   BLUEPRINTS — EY-style blueprint areas → APQC L2 mapping
   ═══════════════════════════════════════════════════════ */
const BLUEPRINTS = {
  finance: [
    { id: "bp-rev", name: "Revenue Management",
      desc: "Pricing, billing, collections, cash application, credit management",
      apqcL2s: ["8.1", "8.2", "8.3"],
      color: "#D4A853" },
    { id: "bp-close", name: "Financial Close & Reporting",
      desc: "Period-end close, reconciliations, consolidation, management reporting",
      apqcL2s: ["9.1", "9.2", "9.3"],
      color: "#7CB9A8" },
    { id: "bp-procure", name: "Procurement & Payables",
      desc: "Requisition, PO management, invoice processing, supplier payments",
      apqcL2s: ["10.1", "10.2", "10.3"],
      color: "#7BA7CC" },
    { id: "bp-treasury", name: "Treasury & Cash Management",
      desc: "Cash forecasting, bank account management, working capital optimization",
      apqcL2s: ["8.3", "9.2"],
      color: "#C4A1D4" },
    { id: "bp-tax", name: "Tax & Compliance",
      desc: "Tax provisioning, regulatory reporting, audit readiness",
      apqcL2s: ["9.3"],
      color: "#D4A07A" },
    { id: "bp-planning", name: "Planning & Analysis (xP&A)",
      desc: "Budgeting, forecasting, variance analysis, driver-based planning",
      apqcL2s: ["9.1"],
      color: "#D48A8A" },
  ]
};

const FUNCTIONS = [
  { id: "finance", name: "Finance", icon: "◆", color: GOLD, active: true,
    desc: "Order to Cash, Record to Report, Procure to Pay",
    apqcL1s: ["8.0", "9.0", "10.0"], status: "Live" },
  { id: "supply-chain", name: "Supply Chain", icon: "◈", color: PURPLE, active: false,
    desc: "Plan, Source, Make, Deliver, Return",
    apqcL1s: ["4.0", "5.0", "6.0"], status: "Coming Soon" },
  { id: "hr", name: "HR", icon: "◉", color: GREEN, active: false,
    desc: "Hire to Retire, Talent Management, Payroll",
    apqcL1s: ["7.0"], status: "Coming Soon" },
  { id: "it", name: "IT", icon: "◎", color: BLUE, active: false,
    desc: "IT Service Management, Infrastructure, Security",
    apqcL1s: ["11.0"], status: "Coming Soon" },
  { id: "customer", name: "Customer", icon: "◇", color: RED, active: false,
    desc: "Marketing, Sales, Service, Experience",
    apqcL1s: ["3.0"], status: "Coming Soon" },
  { id: "sales", name: "Sales", icon: "▪", color: ORANGE, active: false,
    desc: "Lead to Cash, Pipeline Management, Forecasting",
    apqcL1s: ["3.0", "8.0"], status: "Coming Soon" },
];

/* ═══════════════════════════════════════════════════════
   APQC L1→L4 PROCESS HIERARCHY
   O2C: Deep (fully populated ~40 L4s with KPIs, benchmarks, SAP, agents)
   R2R + P2P: Browsable with hierarchy, lighter data
   ═══════════════════════════════════════════════════════ */
const APQC = [
  // ─── ORDER TO CASH (DEEP) ───
  {
    l1: "8.0 Manage Financial Resources", l1id: "8.0", e2e: "Order to Cash", color: BLUE, icon: "◆",
    groups: [
      {
        l2: "8.2 Manage Revenue Accounting", l2id: "8.2",
        subs: [
          {
            l3: "8.2.1 Process Customer Credit", l3id: "8.2.1",
            procs: [
              { id: "o2c-001", l4: "8.2.1.1", label: "Evaluate customer creditworthiness", jobs: ["Run credit scoring models","Pull external credit reports","Assess customer financial statements","Recommend credit decision"], kpis: [
                { name: "Credit evaluation cycle time", unit: "days", current: null, benchmark: 2.0, agentBenchmark: 0.5, src: "APQC", method: "Avg days from credit request to decision", occurrence: "recurring", capability: "Intelligent Credit Management" },
                { name: "Auto-approval rate", unit: "%", current: null, benchmark: 70, agentBenchmark: 92, src: "Hackett", method: "% orders auto-approved without manual review", occurrence: "recurring", capability: "Intelligent Credit Management" },
                { name: "Bad debt write-off rate", unit: "%", current: null, benchmark: 0.25, agentBenchmark: 0.1, src: "APQC", method: "Bad debt expense / net revenue × 100", occurrence: "recurring", capability: "Intelligent Credit Management" },
              ], sap: [{ module: "FI-AR", desc: "Credit management & scoring in SAP S/4HANA", scenario: "Automated credit scoring with ML-based risk assessment replaces manual review. Real-time credit exposure monitoring." }],
                valLevers: [{ lever: "Reduce credit evaluation cycle time", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }],
                },
              { id: "o2c-002", l4: "8.2.1.2", label: "Establish & manage customer credit limits", jobs: ["Set initial credit limit","Review credit limits periodically","Adjust limits based on payment behavior"], kpis: [
                { name: "Credit limit review frequency", unit: "days", current: null, benchmark: 90, agentBenchmark: 7, src: "APQC", method: "Avg days between credit limit reviews", occurrence: "recurring", capability: "Intelligent Credit Management" },
                { name: "Credit limit utilization", unit: "%", current: null, benchmark: 65, agentBenchmark: 65, src: "Hackett", method: "Avg credit used / credit limit × 100", occurrence: "recurring", capability: "Intelligent Credit Management" },
              ], sap: [{ module: "FI-AR", desc: "Dynamic credit limit management", scenario: "AI-driven dynamic credit limits adjust based on payment behavior, financial health signals, and market conditions." }],
                valLevers: [{ lever: "Automate credit limit adjustments", vtype: "Tangible", vclass: "Standardization", fintype: "SGA", stmt: "Income Statement" }],
                },
              { id: "o2c-003", l4: "8.2.1.3", label: "Monitor & resolve customer credit issues", jobs: ["Review credit-blocked orders","Evaluate override requests","Escalate high-risk accounts","Release or reject blocked orders"], kpis: [
                { name: "Blocked order resolution time", unit: "hours", current: null, benchmark: 4, agentBenchmark: 0.5, src: "APQC", method: "Avg hours to resolve credit block", occurrence: "recurring", capability: "Intelligent Credit Management" },
                { name: "% orders blocked for credit", unit: "%", current: null, benchmark: 5, agentBenchmark: 2, src: "Hackett", method: "Credit-blocked orders / total orders × 100", occurrence: "recurring", capability: "Intelligent Credit Management" },
              ], sap: [{ module: "FI-AR", desc: "Credit block management & workflow", scenario: "Intelligent credit block resolution with automated escalation, risk-tiered approval workflows, and customer self-service portal." }],
                valLevers: [{ lever: "Reduce blocked order resolution time", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "Revenue", stmt: "Income Statement" }],
                },
            ]
          },
          {
            l3: "8.2.2 Process Customer Billing", l3id: "8.2.2",
            procs: [
              { id: "o2c-004", l4: "8.2.2.1", label: "Generate customer billing data", jobs: ["Generate invoice from sales order","Apply pricing and tax rules","Validate billing data accuracy","Archive billing document"], kpis: [
                { name: "Invoice accuracy rate", unit: "%", current: null, benchmark: 98.5, agentBenchmark: 99.5, src: "APQC", method: "Correct invoices / total invoices × 100", occurrence: "recurring", capability: "Touchless Invoicing" },
                { name: "Billing cycle time", unit: "days", current: null, benchmark: 1.5, agentBenchmark: 0.1, src: "Hackett", method: "Avg days from delivery to invoice", occurrence: "recurring", capability: "Touchless Invoicing" },
                { name: "Cost per invoice generated", unit: "$", current: null, benchmark: 3.50, agentBenchmark: 0.5, src: "APQC", method: "Total billing cost / invoices generated", occurrence: "recurring", capability: "Touchless Invoicing" },
              ], sap: [{ module: "SD-BIL", desc: "Billing document creation & output", scenario: "Automated billing triggered by goods issue/delivery confirmation. Self-billing for strategic customers." }],
                valLevers: [{ lever: "Reduce cost per invoice", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" },
                  { lever: "Improve invoice accuracy", vtype: "Tangible", vclass: "Revenue Leakage", fintype: "Revenue", stmt: "Income Statement" }],
                },
              { id: "o2c-005", l4: "8.2.2.2", label: "Transmit billing data to customers", jobs: ["Format invoice per customer preference","Transmit via EDI/email/portal","Confirm delivery receipt"], kpis: [
                { name: "E-invoicing adoption rate", unit: "%", current: null, benchmark: 75, agentBenchmark: 95, src: "Hackett", method: "Electronic invoices / total invoices × 100", occurrence: "recurring", capability: "Touchless Invoicing" },
                { name: "Invoice delivery success rate", unit: "%", current: null, benchmark: 99, agentBenchmark: 99.8, src: "APQC", method: "Successfully delivered / total sent × 100", occurrence: "recurring", capability: "Touchless Invoicing" },
              ], sap: [{ module: "SD-BIL", desc: "Electronic invoice output & EDI", scenario: "Multi-channel electronic invoicing with automatic format conversion (EDI, XML, PDF) per customer preference." }],
                valLevers: [{ lever: "Increase e-invoicing adoption", vtype: "Tangible", vclass: "Standardization", fintype: "SGA", stmt: "Income Statement" }],
                },
              { id: "o2c-006", l4: "8.2.2.3", label: "Manage billing disputes & inquiries", jobs: ["Log and classify dispute","Investigate root cause","Coordinate with internal teams","Resolve and close dispute"], kpis: [
                { name: "Dispute resolution cycle time", unit: "days", current: null, benchmark: 15, agentBenchmark: 5, src: "APQC", method: "Avg days from dispute opened to resolved", occurrence: "recurring", capability: "Smart Dispute Resolution" },
                { name: "Dispute rate", unit: "%", current: null, benchmark: 2.0, agentBenchmark: 1, src: "Hackett", method: "Disputed invoices / total invoices × 100", occurrence: "recurring", capability: "Smart Dispute Resolution" },
                { name: "Cost per dispute resolved", unit: "$", current: null, benchmark: 35, agentBenchmark: 10, src: "APQC", method: "Total dispute cost / disputes resolved", occurrence: "recurring", capability: "Smart Dispute Resolution" },
              ], sap: [{ module: "FI-AR", desc: "Dispute management & FSCM", scenario: "AI-powered dispute classification and root cause analysis. Automated routing to responsible teams with suggested resolutions." }],
                valLevers: [{ lever: "Reduce dispute rate & cycle time", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" },
                  { lever: "Reduce revenue leakage from disputes", vtype: "Tangible", vclass: "Revenue Leakage", fintype: "Revenue", stmt: "Income Statement" }],
                },
            ]
          },
          {
            l3: "8.2.3 Process Accounts Receivable", l3id: "8.2.3",
            procs: [
              { id: "o2c-007", l4: "8.2.3.1", label: "Record customer payments & apply to invoices", jobs: ["Import bank remittance data","Match payments to open invoices","Handle partial payments and deductions","Clear applied items"], kpis: [
                { name: "Cash application automation rate", unit: "%", current: null, benchmark: 85, agentBenchmark: 97, src: "APQC", method: "Auto-matched payments / total payments × 100", occurrence: "recurring", capability: "Predictive Cash Application" },
                { name: "Cash application cycle time", unit: "hours", current: null, benchmark: 4, agentBenchmark: 0.5, src: "Hackett", method: "Avg hours from payment receipt to application", occurrence: "recurring", capability: "Predictive Cash Application" },
                { name: "Unapplied cash as % of revenue", unit: "%", current: null, benchmark: 0.5, agentBenchmark: 0.1, src: "APQC", method: "Unapplied cash balance / quarterly revenue × 100", occurrence: "recurring", capability: "Predictive Cash Application" },
              ], sap: [{ module: "FI-AR", desc: "Incoming payment processing & matching", scenario: "ML-powered cash application matches incoming payments to open invoices with 95%+ accuracy. Handles partial payments, deductions, and cross-company remittances." }],
                valLevers: [{ lever: "Increase auto-match rate", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" },
                  { lever: "Reduce unapplied cash", vtype: "Tangible", vclass: "Working Capital", fintype: "SGA", stmt: "Balance Sheet" }],
                },
              { id: "o2c-008", l4: "8.2.3.2", label: "Manage & process collections", jobs: ["Generate aging reports","Execute dunning runs","Escalate overdue accounts","Negotiate payment plans"], kpis: [
                { name: "Days Sales Outstanding (DSO)", unit: "days", current: null, benchmark: 34, agentBenchmark: 28, src: "APQC", method: "AR balance / (annual revenue / 365)", occurrence: "recurring", capability: "Intelligent Collections" },
                { name: "Collections effectiveness index", unit: "%", current: null, benchmark: 82, agentBenchmark: 92, src: "Hackett", method: "(Beginning AR + credit sales - ending AR) / (beginning AR + credit sales) × 100", occurrence: "recurring", capability: "Intelligent Collections" },
                { name: "Cost per collection contact", unit: "$", current: null, benchmark: 8, agentBenchmark: 2, src: "APQC", method: "Total collections cost / collection contacts made", occurrence: "recurring", capability: "Intelligent Collections" },
                { name: "% AR > 90 days past due", unit: "%", current: null, benchmark: 5, agentBenchmark: 2, src: "Hackett", method: "AR over 90 days / total AR × 100", occurrence: "recurring", capability: "Intelligent Collections" },
              ], sap: [{ module: "FI-AR", desc: "Collections management & dunning", scenario: "AI prioritization engine ranks overdue accounts by likelihood-to-pay, dollar impact, and customer value. Auto-generates personalized dunning communications." }],
                valLevers: [{ lever: "Reduce DSO", vtype: "Tangible", vclass: "Working Capital", fintype: "SGA", stmt: "Balance Sheet" },
                  { lever: "Improve collections effectiveness", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }],
                },
              { id: "o2c-009", l4: "8.2.3.3", label: "Manage & process deductions", jobs: ["Classify deduction type","Validate against trade agreements","Research invalid deductions","Process write-off or recovery"], kpis: [
                { name: "Deduction resolution cycle time", unit: "days", current: null, benchmark: 20, agentBenchmark: 7, src: "APQC", method: "Avg days from deduction identified to resolved", occurrence: "recurring", capability: "Smart Dispute Resolution" },
                { name: "Invalid deduction recovery rate", unit: "%", current: null, benchmark: 60, agentBenchmark: 80, src: "Hackett", method: "Recovered invalid deductions / total invalid deductions × 100", occurrence: "recurring", capability: "Smart Dispute Resolution" },
                { name: "Deduction backlog value", unit: "$M", current: null, benchmark: null, agentBenchmark: null, src: "Internal", method: "Total outstanding deduction value", occurrence: "recurring", capability: "Smart Dispute Resolution" },
              ], sap: [{ module: "FI-AR", desc: "Deduction & claims management", scenario: "Automated deduction classification using ML. Pattern recognition identifies root causes across trade promotions, logistics claims, and pricing errors." }],
                valLevers: [{ lever: "Improve invalid deduction recovery", vtype: "Tangible", vclass: "Revenue Leakage", fintype: "Revenue", stmt: "Income Statement" },
                  { lever: "Reduce deduction backlog", vtype: "Tangible", vclass: "Working Capital", fintype: "Revenue", stmt: "Balance Sheet" }],
                },
              { id: "o2c-010", l4: "8.2.3.4", label: "Manage AR aging & write-offs", jobs: ["Review aging buckets","Identify write-off candidates","Process bad debt provisions","Execute approved write-offs"], kpis: [
                { name: "Write-off as % of revenue", unit: "%", current: null, benchmark: 0.15, agentBenchmark: 0.05, src: "APQC", method: "Annual write-offs / annual revenue × 100", occurrence: "recurring", capability: "Intelligent Collections" },
                { name: "Aging bucket accuracy", unit: "%", current: null, benchmark: 98, agentBenchmark: 99.5, src: "Hackett", method: "Correctly aged items / total items × 100", occurrence: "recurring", capability: "Intelligent Collections" },
              ], sap: [{ module: "FI-AR", desc: "AR aging analysis & provisioning", scenario: "Predictive models estimate expected credit losses per IFRS 9. Automated provisioning and write-off workflows." }],
                valLevers: [{ lever: "Reduce bad debt write-offs", vtype: "Tangible", vclass: "Revenue Leakage", fintype: "SGA", stmt: "Income Statement" }],
                },
            ]
          },
          {
            l3: "8.2.4 Manage & Process Customer Refunds", l3id: "8.2.4",
            procs: [
              { id: "o2c-011", l4: "8.2.4.1", label: "Process customer refunds & credits", jobs: ["Validate refund request","Create credit memo","Route for approval","Execute refund payment"], kpis: [
                { name: "Refund processing cycle time", unit: "days", current: null, benchmark: 3, agentBenchmark: 0.5, src: "APQC", method: "Avg days from refund request to payment", occurrence: "recurring", capability: "Touchless Invoicing" },
                { name: "Refund accuracy rate", unit: "%", current: null, benchmark: 99, agentBenchmark: 99.8, src: "Hackett", method: "Correct refunds / total refunds × 100", occurrence: "recurring", capability: "Touchless Invoicing" },
              ], sap: [{ module: "FI-AR", desc: "Credit memo & refund processing", scenario: "Automated refund workflow with approval routing based on amount thresholds and reason codes." }],
                valLevers: [{ lever: "Reduce refund processing time", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }],
                },
            ]
          },
        ]
      },
      {
        l2: "8.3 Manage Order Processing", l2id: "8.3",
        subs: [
          {
            l3: "8.3.1 Process Sales Orders", l3id: "8.3.1",
            procs: [
              { id: "o2c-012", l4: "8.3.1.1", label: "Receive & validate sales orders", jobs: ["Capture order from channel","Validate pricing and terms","Check customer credit status","Confirm order to customer"], kpis: [
                { name: "Order entry cycle time", unit: "minutes", current: null, benchmark: 5, agentBenchmark: 0.5, src: "APQC", method: "Avg minutes from order receipt to system entry", occurrence: "recurring", capability: "Intelligent Order Management" },
                { name: "Touchless order rate", unit: "%", current: null, benchmark: 65, agentBenchmark: 90, src: "Hackett", method: "Orders requiring zero manual intervention / total orders × 100", occurrence: "recurring", capability: "Intelligent Order Management" },
                { name: "Order accuracy rate", unit: "%", current: null, benchmark: 99.2, agentBenchmark: 99.8, src: "APQC", method: "Error-free orders / total orders × 100", occurrence: "recurring", capability: "Intelligent Order Management" },
              ], sap: [{ module: "SD-SLS", desc: "Sales order creation & validation", scenario: "Intelligent order capture from multiple channels (EDI, portal, email) with automated validation against pricing, availability, and credit rules." }],
                valLevers: [{ lever: "Increase touchless order rate", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" },
                  { lever: "Reduce order errors", vtype: "Tangible", vclass: "Standardization", fintype: "COGS", stmt: "Income Statement" }],
                },
              { id: "o2c-013", l4: "8.3.1.2", label: "Check product availability & allocate inventory", jobs: ["Run available-to-promise check","Allocate inventory to order","Manage backorder queue","Communicate availability to customer"], kpis: [
                { name: "Available-to-promise accuracy", unit: "%", current: null, benchmark: 95, agentBenchmark: 99, src: "APQC", method: "Correct ATP responses / total ATP checks × 100", occurrence: "recurring", capability: "Intelligent Order Management" },
                { name: "Order fill rate", unit: "%", current: null, benchmark: 97, agentBenchmark: 99, src: "Hackett", method: "Orders shipped complete / total orders × 100", occurrence: "recurring", capability: "Intelligent Order Management" },
              ], sap: [{ module: "SD-SLS / MM-IM", desc: "ATP check & inventory allocation", scenario: "Real-time global ATP with intelligent allocation based on customer priority, margin, and supply constraints." }],
                valLevers: [{ lever: "Improve order fill rate", vtype: "Tangible", vclass: "Revenue Leakage", fintype: "Revenue", stmt: "Income Statement" }],
                },
              { id: "o2c-014", l4: "8.3.1.3", label: "Determine pricing & apply discounts", jobs: ["Apply pricing condition records","Calculate volume and contract discounts","Validate against margin guardrails"], kpis: [
                { name: "Pricing accuracy rate", unit: "%", current: null, benchmark: 99, agentBenchmark: 99.9, src: "APQC", method: "Correctly priced orders / total orders × 100", occurrence: "recurring", capability: "Dynamic Pricing Intelligence" },
                { name: "Manual pricing overrides", unit: "%", current: null, benchmark: 3, agentBenchmark: 0.5, src: "Hackett", method: "Orders with manual price changes / total orders × 100", occurrence: "recurring", capability: "Dynamic Pricing Intelligence" },
              ], sap: [{ module: "SD-BF", desc: "Pricing conditions & discount management", scenario: "AI-powered pricing engine with dynamic discounting, customer-specific agreements, and automated rebate calculations." }],
                valLevers: [{ lever: "Reduce pricing errors & leakage", vtype: "Tangible", vclass: "Revenue Leakage", fintype: "Revenue", stmt: "Income Statement" }],
                },
              { id: "o2c-015", l4: "8.3.1.4", label: "Process order changes & cancellations", jobs: ["Receive change/cancel request","Assess impact on fulfillment","Update order in system","Notify downstream processes"], kpis: [
                { name: "Order change processing time", unit: "hours", current: null, benchmark: 2, agentBenchmark: 0.25, src: "APQC", method: "Avg hours to process order modification", occurrence: "recurring", capability: "Intelligent Order Management" },
                { name: "Cancellation rate", unit: "%", current: null, benchmark: 3, agentBenchmark: 1.5, src: "Hackett", method: "Cancelled orders / total orders × 100", occurrence: "recurring", capability: "Intelligent Order Management" },
              ], sap: [{ module: "SD-SLS", desc: "Order change management", scenario: "Self-service order modification portal with automated impact assessment on delivery, pricing, and production schedule." }],
                valLevers: [{ lever: "Reduce order cancellation rate", vtype: "Tangible", vclass: "Revenue Leakage", fintype: "Revenue", stmt: "Income Statement" }],
                },
            ]
          },
          {
            l3: "8.3.2 Manage Order Fulfillment", l3id: "8.3.2",
            procs: [
              { id: "o2c-016", l4: "8.3.2.1", label: "Pick, pack & ship customer orders", jobs: ["Generate pick list","Execute warehouse picking","Pack and label shipment","Create shipping documents"], kpis: [
                { name: "Perfect order rate", unit: "%", current: null, benchmark: 92, agentBenchmark: 97, src: "APQC", method: "Orders delivered on time, in full, damage-free, correctly documented / total orders × 100", occurrence: "recurring", capability: "Smart Fulfillment" },
                { name: "Order-to-ship cycle time", unit: "hours", current: null, benchmark: 24, agentBenchmark: 8, src: "Hackett", method: "Avg hours from order confirmation to shipment", occurrence: "recurring", capability: "Smart Fulfillment" },
                { name: "Warehouse cost per order", unit: "$", current: null, benchmark: 4.50, agentBenchmark: 2.5, src: "APQC", method: "Total warehouse cost / orders shipped", occurrence: "recurring", capability: "Smart Fulfillment" },
              ], sap: [{ module: "EWM / SD-SHP", desc: "Warehouse execution & shipping", scenario: "AI-optimized wave planning, pick-path optimization, and automated packing with real-time labor allocation." }],
                valLevers: [{ lever: "Improve perfect order rate", vtype: "Tangible", vclass: "Revenue Leakage", fintype: "Revenue", stmt: "Income Statement" },
                  { lever: "Reduce warehouse cost per order", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "COGS", stmt: "Income Statement" }],
                },
              { id: "o2c-017", l4: "8.3.2.2", label: "Manage delivery scheduling & logistics", jobs: ["Plan delivery routes","Schedule carrier pickup","Track shipment in transit","Confirm proof of delivery"], kpis: [
                { name: "On-time delivery rate", unit: "%", current: null, benchmark: 95, agentBenchmark: 98, src: "APQC", method: "Orders delivered on or before promised date / total orders × 100", occurrence: "recurring", capability: "Smart Fulfillment" },
                { name: "Freight cost as % of revenue", unit: "%", current: null, benchmark: 4.5, agentBenchmark: 3, src: "Hackett", method: "Total freight cost / net revenue × 100", occurrence: "recurring", capability: "Smart Fulfillment" },
              ], sap: [{ module: "TM / SD-SHP", desc: "Transportation management & delivery", scenario: "Dynamic route optimization with real-time traffic, capacity, and cost balancing. Predictive ETA for customer visibility." }],
                valLevers: [{ lever: "Reduce freight cost", vtype: "Tangible", vclass: "Cost Avoidance", fintype: "COGS", stmt: "Income Statement" },
                  { lever: "Improve on-time delivery", vtype: "Intangible", vclass: "Customer Satisfaction", fintype: "Revenue", stmt: "Income Statement" }],
                },
              { id: "o2c-018", l4: "8.3.2.3", label: "Process returns & reverse logistics", jobs: ["Authorize return request","Receive and inspect returned goods","Update inventory records","Issue credit or replacement"], kpis: [
                { name: "Return processing cycle time", unit: "days", current: null, benchmark: 5, agentBenchmark: 1.5, src: "APQC", method: "Avg days from return initiation to credit/replacement", occurrence: "recurring", capability: "Smart Fulfillment" },
                { name: "Return rate", unit: "%", current: null, benchmark: 8, agentBenchmark: 5, src: "Hackett", method: "Returned orders / total orders × 100", occurrence: "recurring", capability: "Smart Fulfillment" },
                { name: "Return cost per unit", unit: "$", current: null, benchmark: 12, agentBenchmark: 6, src: "APQC", method: "Total returns cost / units returned", occurrence: "recurring", capability: "Smart Fulfillment" },
              ], sap: [{ module: "SD-SLS / EWM", desc: "Returns & reverse logistics", scenario: "Automated return authorization with AI-powered reason code analysis. Predictive return forecasting for inventory planning." }],
                valLevers: [{ lever: "Reduce return processing cost", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "COGS", stmt: "Income Statement" },
                  { lever: "Reduce return rate", vtype: "Tangible", vclass: "Revenue Leakage", fintype: "Revenue", stmt: "Income Statement" }],
                },
            ]
          },
          {
            l3: "8.3.3 Manage Revenue Recognition", l3id: "8.3.3",
            procs: [
              { id: "o2c-019", l4: "8.3.3.1", label: "Recognize revenue per accounting standards", jobs: ["Identify performance obligations","Determine transaction price","Allocate price to obligations","Recognize revenue upon satisfaction"], kpis: [
                { name: "Revenue recognition automation rate", unit: "%", current: null, benchmark: 80, agentBenchmark: 95, src: "Hackett", method: "Auto-recognized revenue / total revenue × 100", occurrence: "recurring", capability: "Automated Revenue Recognition" },
                { name: "Revenue adjustments post-close", unit: "count", current: null, benchmark: 5, agentBenchmark: 1, src: "APQC", method: "Revenue adjustments made after period close", occurrence: "recurring", capability: "Automated Revenue Recognition" },
              ], sap: [{ module: "FI-AR / RAR", desc: "Revenue accounting & recognition", scenario: "Automated revenue recognition engine applies ASC 606 / IFRS 15 rules to contracts. Multi-element arrangement handling." }],
                valLevers: [{ lever: "Automate revenue recognition", vtype: "Tangible", vclass: "Standardization", fintype: "SGA", stmt: "Income Statement" }],
                },
            ]
          },
        ]
      },
      {
        l2: "8.4 Manage Customer Contracts & Pricing", l2id: "8.4",
        subs: [
          {
            l3: "8.4.1 Customer Contract Management", l3id: "8.4.1",
            procs: [
              { id: "o2c-020", l4: "8.4.1.1", label: "Create & manage customer contracts", jobs: ["Draft contract from templates","Negotiate terms and conditions","Route for legal and commercial approval","Execute and store contract"], kpis: [
                { name: "Contract creation cycle time", unit: "days", current: null, benchmark: 5, agentBenchmark: 1.5, src: "APQC", method: "Avg days from request to executed contract", occurrence: "recurring", capability: "Contract Intelligence" },
                { name: "Contract compliance rate", unit: "%", current: null, benchmark: 92, agentBenchmark: 98, src: "Hackett", method: "Contracts within compliance / total active contracts × 100", occurrence: "recurring", capability: "Contract Intelligence" },
              ], sap: [{ module: "SD-CAS", desc: "Contract & agreement management", scenario: "NLP-powered contract creation from templates with automated compliance checks. Smart clause library with risk scoring." }],
                valLevers: [{ lever: "Reduce contract cycle time", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }],
                },
              { id: "o2c-021", l4: "8.4.1.2", label: "Manage rebates & trade promotions", jobs: ["Configure rebate agreements","Track qualifying transactions","Calculate accruals and settlements","Analyze promotion effectiveness"], kpis: [
                { name: "Rebate accrual accuracy", unit: "%", current: null, benchmark: 95, agentBenchmark: 99, src: "APQC", method: "Actual rebate vs accrued / total rebates × 100", occurrence: "recurring", capability: "Trade Promotion Optimization" },
                { name: "Trade promotion ROI", unit: "%", current: null, benchmark: 115, agentBenchmark: 140, src: "Hackett", method: "Incremental profit from promotion / promotion cost × 100", occurrence: "recurring", capability: "Trade Promotion Optimization" },
                { name: "Rebate settlement cycle time", unit: "days", current: null, benchmark: 15, agentBenchmark: 5, src: "APQC", method: "Avg days from period end to rebate settlement", occurrence: "recurring", capability: "Trade Promotion Optimization" },
              ], sap: [{ module: "SD-CAS / FICO", desc: "Rebate & settlement processing", scenario: "Automated rebate calculation, accrual, and settlement. AI-driven promotion effectiveness analysis with predictive ROI scoring." }],
                valLevers: [{ lever: "Improve rebate accuracy", vtype: "Tangible", vclass: "Revenue Leakage", fintype: "Revenue", stmt: "Income Statement" },
                  { lever: "Optimize trade promotion spend", vtype: "Tangible", vclass: "Cost Avoidance", fintype: "SGA", stmt: "Income Statement" }],
                },
            ]
          },
          {
            l3: "8.4.2 Pricing & Margin Management", l3id: "8.4.2",
            procs: [
              { id: "o2c-022", l4: "8.4.2.1", label: "Manage pricing master data & conditions", jobs: ["Maintain price lists and condition records","Propagate price changes across systems","Validate against margin thresholds"], kpis: [
                { name: "Pricing master data accuracy", unit: "%", current: null, benchmark: 99, agentBenchmark: 99.9, src: "APQC", method: "Correct pricing records / total pricing records × 100", occurrence: "recurring", capability: "Dynamic Pricing Intelligence" },
                { name: "Price list update cycle time", unit: "hours", current: null, benchmark: 4, agentBenchmark: 0.5, src: "Hackett", method: "Avg hours to propagate price changes across systems", occurrence: "recurring", capability: "Dynamic Pricing Intelligence" },
              ], sap: [{ module: "SD-BF", desc: "Pricing condition maintenance", scenario: "Centralized pricing hub with automated condition record management. AI validates pricing changes against margin guardrails before activation." }],
                valLevers: [{ lever: "Eliminate pricing data errors", vtype: "Tangible", vclass: "Revenue Leakage", fintype: "Revenue", stmt: "Income Statement" }],
                },
              { id: "o2c-023", l4: "8.4.2.2", label: "Analyze & optimize margin performance", jobs: ["Run margin waterfall analysis","Identify leakage by customer and product","Model pricing scenarios","Recommend pricing actions"], kpis: [
                { name: "Gross margin by customer", unit: "%", current: null, benchmark: null, agentBenchmark: null, src: "Internal", method: "Customer gross profit / customer revenue × 100", occurrence: "recurring", capability: "Dynamic Pricing Intelligence" },
                { name: "Price realization rate", unit: "%", current: null, benchmark: 97, agentBenchmark: 99, src: "Hackett", method: "Net realized price / list price × 100", occurrence: "recurring", capability: "Dynamic Pricing Intelligence" },
              ], sap: [{ module: "CO-PA", desc: "Profitability analysis", scenario: "Real-time margin analytics by customer, product, channel with waterfall decomposition. AI identifies margin leakage patterns." }],
                valLevers: [{ lever: "Improve price realization", vtype: "Tangible", vclass: "Revenue Leakage", fintype: "Revenue", stmt: "Income Statement" }],
                },
            ]
          },
        ]
      },
      {
        l2: "8.5 Manage Cash & Treasury", l2id: "8.5",
        subs: [
          {
            l3: "8.5.1 Cash Forecasting & Management", l3id: "8.5.1",
            procs: [
              { id: "o2c-024", l4: "8.5.1.1", label: "Forecast cash receipts from customers", jobs: ["Gather AR and payment history data","Run cash receipt forecast models","Produce rolling 13-week forecast","Distribute forecast to treasury"], kpis: [
                { name: "Cash forecast accuracy (30-day)", unit: "%", current: null, benchmark: 90, agentBenchmark: 96, src: "APQC", method: "1 - |Actual - Forecast| / Actual × 100", occurrence: "recurring", capability: "Predictive Cash Management" },
                { name: "Cash forecast cycle time", unit: "hours", current: null, benchmark: 2, agentBenchmark: 0.25, src: "Hackett", method: "Avg hours to produce weekly cash forecast", occurrence: "recurring", capability: "Predictive Cash Management" },
              ], sap: [{ module: "TRM", desc: "Cash management & forecasting", scenario: "ML-based cash receipt forecasting using payment history, customer behavior, and macro signals. Daily rolling 13-week forecast." }],
                valLevers: [{ lever: "Improve cash forecast accuracy", vtype: "Tangible", vclass: "Working Capital", fintype: "SGA", stmt: "Balance Sheet" }],
                },
              { id: "o2c-025", l4: "8.5.1.2", label: "Manage bank account reconciliation", jobs: ["Import bank statements","Match transactions to GL entries","Investigate unreconciled items","Post reconciliation adjustments"], kpis: [
                { name: "Bank reconciliation automation rate", unit: "%", current: null, benchmark: 90, agentBenchmark: 98, src: "APQC", method: "Auto-reconciled items / total items × 100", occurrence: "recurring", capability: "Predictive Cash Management" },
                { name: "Reconciliation cycle time", unit: "hours", current: null, benchmark: 2, agentBenchmark: 0.25, src: "Hackett", method: "Avg hours to complete daily bank reconciliation", occurrence: "recurring", capability: "Predictive Cash Management" },
              ], sap: [{ module: "FI-BL", desc: "Bank statement processing & reconciliation", scenario: "Automated bank statement import and intelligent matching. ML handles complex multi-payment reconciliations." }],
                valLevers: [{ lever: "Automate bank reconciliation", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }],
                },
            ]
          },
        ]
      },
      {
        l2: "8.6 O2C Performance Management", l2id: "8.6",
        subs: [
          {
            l3: "8.6.1 O2C Analytics & Reporting", l3id: "8.6.1",
            procs: [
              { id: "o2c-026", l4: "8.6.1.1", label: "Monitor O2C KPIs & generate reports", jobs: ["Collect KPI data from source systems","Generate standard O2C dashboards","Highlight exceptions and anomalies","Distribute reports to stakeholders"], kpis: [
                { name: "Report generation cycle time", unit: "hours", current: null, benchmark: 1, agentBenchmark: 0.05, src: "APQC", method: "Avg hours to produce standard O2C report", occurrence: "recurring", capability: "O2C Process Intelligence" },
                { name: "KPI exception detection time", unit: "hours", current: null, benchmark: 4, agentBenchmark: 0.1, src: "Hackett", method: "Avg hours from KPI breach to alert", occurrence: "recurring", capability: "O2C Process Intelligence" },
              ], sap: [{ module: "BW/4HANA / SAC", desc: "O2C analytics & dashboarding", scenario: "Real-time O2C control tower with anomaly detection, automated root cause analysis, and predictive alerts." }],
                valLevers: [{ lever: "Reduce reporting effort", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }],
                },
              { id: "o2c-027", l4: "8.6.1.2", label: "Perform O2C process mining & optimization", jobs: ["Extract process event logs","Run process mining analysis","Identify bottlenecks and deviations","Recommend process improvements"], kpis: [
                { name: "Process conformance rate", unit: "%", current: null, benchmark: 85, agentBenchmark: 95, src: "Signavio", method: "Process instances following standard path / total instances × 100", occurrence: "recurring", capability: "O2C Process Intelligence" },
                { name: "Rework rate", unit: "%", current: null, benchmark: 5, agentBenchmark: 1.5, src: "APQC", method: "Process instances requiring rework / total instances × 100", occurrence: "recurring", capability: "O2C Process Intelligence" },
              ], sap: [{ module: "Signavio", desc: "Process mining & intelligence", scenario: "Continuous process mining identifies bottlenecks, deviations, and automation opportunities. Digital twin simulates improvement scenarios." }],
                valLevers: [{ lever: "Reduce process rework rate", vtype: "Tangible", vclass: "Standardization", fintype: "SGA", stmt: "Income Statement" }],
                },
            ]
          },
        ]
      },
    ]
  },

  // ─── RECORD TO REPORT (BROWSABLE, LIGHTER) ───
  {
    l1: "9.0 Manage Financial Resources (R2R)", l1id: "9.0", e2e: "Record to Report", color: PURPLE, icon: "◈",
    groups: [
      {
        l2: "9.1 General Accounting", l2id: "9.1",
        subs: [
          { l3: "9.1.1 Journal Entry Processing", l3id: "9.1.1", procs: [
            { id: "r2r-001", l4: "9.1.1.1", label: "Process manual & recurring journal entries", jobs: ["Prepare journal entry with supporting docs","Validate account coding and amounts","Post entry to general ledger","Archive journal entry backup"], kpis: [
              { name: "Journal entry automation rate", unit: "%", current: null, benchmark: 75, agentBenchmark: 95, src: "APQC", occurrence: "recurring", capability: "Automated Journal Processing" },
              { name: "JE error rate", unit: "%", current: null, benchmark: 0.5, agentBenchmark: 0.05, src: "Hackett", occurrence: "recurring", capability: "Automated Journal Processing" },
            ], sap: [{ module: "FI-GL", desc: "General ledger postings" }], valLevers: [{ lever: "Automate journal entries", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
            { id: "r2r-002", l4: "9.1.1.2", label: "Manage intercompany transactions & eliminations", jobs: ["Record intercompany transactions","Match intercompany balances","Generate elimination entries","Resolve intercompany discrepancies"], kpis: [
              { name: "Intercompany matching rate", unit: "%", current: null, benchmark: 95, agentBenchmark: 99.5, src: "APQC", occurrence: "recurring", capability: "Automated Journal Processing" },
            ], sap: [{ module: "FI-GL / Group Reporting", desc: "Intercompany reconciliation" }], valLevers: [{ lever: "Automate IC eliminations", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
          ]},
          { l3: "9.1.2 Account Reconciliation", l3id: "9.1.2", procs: [
            { id: "r2r-003", l4: "9.1.2.1", label: "Perform account reconciliations", jobs: ["Extract subledger and GL balances","Identify reconciling items","Investigate and resolve differences","Certify account balances"], kpis: [
              { name: "Reconciliation automation rate", unit: "%", current: null, benchmark: 70, agentBenchmark: 92, src: "APQC", occurrence: "recurring", capability: "Continuous Account Reconciliation" },
              { name: "Reconciling items aging (days)", unit: "days", current: null, benchmark: 5, agentBenchmark: 1, src: "Hackett", occurrence: "recurring", capability: "Continuous Account Reconciliation" },
            ], sap: [{ module: "FI-GL / ACDOCA", desc: "Account reconciliation & matching" }], valLevers: [{ lever: "Automate reconciliations", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
          ]},
          { l3: "9.1.3 Period-End Close", l3id: "9.1.3", procs: [
            { id: "r2r-004", l4: "9.1.3.1", label: "Execute period-end close activities", jobs: ["Run close task checklist","Execute cut-off procedures","Post closing adjustments","Verify trial balance"], kpis: [
              { name: "Days to close", unit: "days", current: null, benchmark: 4.8, agentBenchmark: 2, src: "APQC", occurrence: "recurring", capability: "Advanced Financial Close" },
              { name: "Close task automation rate", unit: "%", current: null, benchmark: 60, agentBenchmark: 85, src: "Hackett", occurrence: "recurring", capability: "Advanced Financial Close" },
            ], sap: [{ module: "FI-GL / S/4 Close Cockpit", desc: "Financial close management" }], valLevers: [{ lever: "Accelerate close cycle", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
            { id: "r2r-005", l4: "9.1.3.2", label: "Manage accruals & provisions", jobs: ["Estimate accrual amounts","Post accrual journal entries","Reverse prior period accruals","Reconcile accrual balances"], kpis: [
              { name: "Accrual reversal rate", unit: "%", current: null, benchmark: 5, agentBenchmark: 1.5, src: "APQC", occurrence: "recurring", capability: "Advanced Financial Close" },
            ], sap: [{ module: "FI-GL", desc: "Accrual engine" }], valLevers: [{ lever: "Improve accrual accuracy", vtype: "Tangible", vclass: "Standardization", fintype: "SGA", stmt: "Income Statement" }] },
          ]},
          { l3: "9.1.4 Financial Reporting & Consolidation", l3id: "9.1.4", procs: [
            { id: "r2r-006", l4: "9.1.4.1", label: "Prepare consolidated financial statements", jobs: ["Collect subsidiary trial balances","Apply consolidation rules","Process currency translation","Generate consolidated reports"], kpis: [
              { name: "Consolidation cycle time", unit: "days", current: null, benchmark: 3, agentBenchmark: 1, src: "APQC", occurrence: "recurring", capability: "Intelligent Consolidation & Reporting" },
              { name: "Manual adjustments in consolidation", unit: "count", current: null, benchmark: 10, agentBenchmark: 2, src: "Hackett", occurrence: "recurring", capability: "Intelligent Consolidation & Reporting" },
            ], sap: [{ module: "Group Reporting / BPC", desc: "Group consolidation" }], valLevers: [{ lever: "Automate consolidation", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
            { id: "r2r-007", l4: "9.1.4.2", label: "Perform management & statutory reporting", jobs: ["Prepare management reporting packages","Generate statutory financial statements","Perform variance analysis commentary","Submit regulatory filings"], kpis: [
              { name: "Report generation time", unit: "hours", current: null, benchmark: 4, agentBenchmark: 0.5, src: "APQC", occurrence: "recurring", capability: "Intelligent Consolidation & Reporting" },
            ], sap: [{ module: "SAC / BW4", desc: "Management reporting" }], valLevers: [{ lever: "Automate reporting", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
          ]},
        ]
      },
      {
        l2: "9.2 Fixed Assets", l2id: "9.2",
        subs: [
          { l3: "9.2.1 Asset Accounting", l3id: "9.2.1", procs: [
            { id: "r2r-008", l4: "9.2.1.1", label: "Manage fixed asset lifecycle", jobs: ["Capitalize new assets","Run depreciation calculations","Process asset transfers and retirements","Reconcile asset register to GL"], kpis: [
              { name: "Asset capitalization accuracy", unit: "%", current: null, benchmark: 98, agentBenchmark: 99.5, src: "APQC", occurrence: "recurring", capability: "Smart Asset Management" },
            ], sap: [{ module: "FI-AA", desc: "Asset accounting" }], valLevers: [{ lever: "Automate asset capitalization", vtype: "Tangible", vclass: "Standardization", fintype: "SGA", stmt: "Income Statement" }] },
          ]},
        ]
      },
      {
        l2: "9.3 Cost Management", l2id: "9.3",
        subs: [
          { l3: "9.3.1 Cost Allocation & Analysis", l3id: "9.3.1", procs: [
            { id: "r2r-009", l4: "9.3.1.1", label: "Perform cost allocation & product costing", jobs: ["Define cost allocation rules","Execute allocation runs","Calculate standard product costs","Analyze cost variances"], kpis: [
              { name: "Cost allocation cycle time", unit: "days", current: null, benchmark: 2, agentBenchmark: 0.25, src: "APQC", occurrence: "recurring", capability: "Automated Cost Management" },
            ], sap: [{ module: "CO-PC / CO-PA", desc: "Product costing & profitability" }], valLevers: [{ lever: "Automate cost allocation", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
          ]},
        ]
      },
      {
        l2: "9.4 Tax Management", l2id: "9.4",
        subs: [
          { l3: "9.4.1 Tax Compliance", l3id: "9.4.1", procs: [
            { id: "r2r-010", l4: "9.4.1.1", label: "Calculate & file tax returns", jobs: ["Gather tax-relevant transactions","Calculate tax provisions","Prepare and review tax returns","Submit filings to authorities"], kpis: [
              { name: "Tax filing accuracy", unit: "%", current: null, benchmark: 99.5, agentBenchmark: 99.9, src: "APQC", occurrence: "recurring", capability: "Intelligent Tax Engine" },
            ], sap: [{ module: "FI-TX / ACR", desc: "Tax determination & reporting" }], valLevers: [{ lever: "Automate tax calculations", vtype: "Tangible", vclass: "Standardization", fintype: "SGA", stmt: "Income Statement" }] },
          ]},
        ]
      },
    ]
  },

  // ─── PROCURE TO PAY (BROWSABLE, LIGHTER) ───
  {
    l1: "10.0 Acquire & Manage Suppliers (P2P)", l1id: "10.0", e2e: "Procure to Pay", color: GREEN, icon: "◉",
    groups: [
      {
        l2: "10.1 Requisition & Procurement", l2id: "10.1",
        subs: [
          { l3: "10.1.1 Purchase Requisition Processing", l3id: "10.1.1", procs: [
            { id: "p2p-001", l4: "10.1.1.1", label: "Create & approve purchase requisitions", jobs: ["Create purchase requisition","Validate budget availability","Route for approval","Convert approved requisition to PO"], kpis: [
              { name: "Requisition-to-PO cycle time", unit: "days", current: null, benchmark: 2, agentBenchmark: 0.25, src: "APQC", occurrence: "recurring", capability: "Smart Requisitioning" },
              { name: "Auto-approval rate", unit: "%", current: null, benchmark: 50, agentBenchmark: 80, src: "Hackett", occurrence: "recurring", capability: "Smart Requisitioning" },
            ], sap: [{ module: "MM-PUR", desc: "Purchase requisition management" }], valLevers: [{ lever: "Automate requisition approvals", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
          ]},
          { l3: "10.1.2 Purchase Order Management", l3id: "10.1.2", procs: [
            { id: "p2p-002", l4: "10.1.2.1", label: "Create & manage purchase orders", jobs: ["Create purchase order from requisition","Confirm order with supplier","Track PO delivery status","Manage PO changes and amendments"], kpis: [
              { name: "PO accuracy rate", unit: "%", current: null, benchmark: 98, agentBenchmark: 99.5, src: "APQC", occurrence: "recurring", capability: "Intelligent Procurement" },
              { name: "Cost per PO", unit: "$", current: null, benchmark: 25, agentBenchmark: 5, src: "Hackett", occurrence: "recurring", capability: "Intelligent Procurement" },
            ], sap: [{ module: "MM-PUR", desc: "Purchase order processing" }], valLevers: [{ lever: "Reduce cost per PO", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
            { id: "p2p-003", l4: "10.1.2.2", label: "Manage goods receipt & 3-way matching", jobs: ["Record goods receipt","Perform 3-way match","Investigate matching exceptions","Post matched entries"], kpis: [
              { name: "3-way match rate", unit: "%", current: null, benchmark: 85, agentBenchmark: 96, src: "APQC", occurrence: "recurring", capability: "Intelligent Procurement" },
              { name: "GR processing time", unit: "hours", current: null, benchmark: 4, agentBenchmark: 0.5, src: "Hackett", occurrence: "recurring", capability: "Intelligent Procurement" },
            ], sap: [{ module: "MM-IM / MM-IV", desc: "Goods receipt & invoice verification" }], valLevers: [{ lever: "Increase auto-matching rate", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
          ]},
        ]
      },
      {
        l2: "10.2 Accounts Payable", l2id: "10.2",
        subs: [
          { l3: "10.2.1 Invoice Processing", l3id: "10.2.1", procs: [
            { id: "p2p-004", l4: "10.2.1.1", label: "Receive & process supplier invoices", jobs: ["Capture invoice via OCR or EDI","Validate against purchase order","Route exceptions for resolution","Post approved invoice"], kpis: [
              { name: "Touchless invoice rate", unit: "%", current: null, benchmark: 75, agentBenchmark: 93, src: "APQC", occurrence: "recurring", capability: "Touchless Invoice Processing" },
              { name: "Cost per invoice processed", unit: "$", current: null, benchmark: 5.00, agentBenchmark: 1, src: "Hackett", occurrence: "recurring", capability: "Touchless Invoice Processing" },
              { name: "Invoice exception rate", unit: "%", current: null, benchmark: 15, agentBenchmark: 4, src: "APQC", occurrence: "recurring", capability: "Touchless Invoice Processing" },
            ], sap: [{ module: "MM-IV / FI-AP", desc: "Invoice processing & verification" }], valLevers: [{ lever: "Increase touchless processing rate", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
          ]},
          { l3: "10.2.2 Payment Processing", l3id: "10.2.2", procs: [
            { id: "p2p-005", l4: "10.2.2.1", label: "Schedule & execute supplier payments", jobs: ["Run payment proposal","Optimize payment timing for discounts","Execute payment run","Reconcile payment to bank"], kpis: [
              { name: "On-time payment rate", unit: "%", current: null, benchmark: 95, agentBenchmark: 99, src: "APQC", occurrence: "recurring", capability: "Optimized Payment Execution" },
              { name: "Early payment discount capture", unit: "%", current: null, benchmark: 70, agentBenchmark: 90, src: "Hackett", occurrence: "recurring", capability: "Optimized Payment Execution" },
              { name: "Days payable outstanding (DPO)", unit: "days", current: null, benchmark: 45, agentBenchmark: 50, src: "APQC", occurrence: "recurring", capability: "Optimized Payment Execution" },
            ], sap: [{ module: "FI-AP", desc: "Payment processing & bank comms" }], valLevers: [{ lever: "Optimize payment timing", vtype: "Tangible", vclass: "Working Capital", fintype: "COGS", stmt: "Balance Sheet" }] },
            { id: "p2p-006", l4: "10.2.2.2", label: "Manage supplier financing & dynamic discounting", jobs: ["Identify early payment candidates","Offer dynamic discount to suppliers","Process early payment transactions"], kpis: [
              { name: "Supply chain financing adoption", unit: "%", current: null, benchmark: 30, agentBenchmark: 55, src: "Hackett", occurrence: "recurring", capability: "Optimized Payment Execution" },
            ], sap: [{ module: "FSCM", desc: "Supply chain finance" }], valLevers: [{ lever: "Implement dynamic discounting", vtype: "Tangible", vclass: "Cost Avoidance", fintype: "COGS", stmt: "Income Statement" }] },
          ]},
        ]
      },
      {
        l2: "10.3 Supplier Management", l2id: "10.3",
        subs: [
          { l3: "10.3.1 Supplier Evaluation & Risk", l3id: "10.3.1", procs: [
            { id: "p2p-007", l4: "10.3.1.1", label: "Evaluate & manage supplier performance", jobs: ["Collect supplier performance data","Calculate supplier scorecards","Conduct supplier business reviews","Manage corrective action plans"], kpis: [
              { name: "Supplier scorecard coverage", unit: "%", current: null, benchmark: 80, agentBenchmark: 95, src: "APQC", occurrence: "recurring", capability: "Supplier Intelligence" },
              { name: "Strategic supplier spend coverage", unit: "%", current: null, benchmark: 75, agentBenchmark: 90, src: "Hackett", occurrence: "recurring", capability: "Supplier Intelligence" },
            ], sap: [{ module: "SLC / Ariba", desc: "Supplier lifecycle management" }], valLevers: [{ lever: "Improve supplier management coverage", vtype: "Intangible", vclass: "Risk Mitigation", fintype: "COGS", stmt: "Income Statement" }] },
          ]},
          { l3: "10.3.2 Contract Management", l3id: "10.3.2", procs: [
            { id: "p2p-008", l4: "10.3.2.1", label: "Manage supplier contracts & compliance", jobs: ["Draft and negotiate supplier contracts","Monitor contract compliance","Track contract milestones and renewals","Audit maverick spend"], kpis: [
              { name: "Contract utilization rate", unit: "%", current: null, benchmark: 80, agentBenchmark: 93, src: "APQC", occurrence: "recurring", capability: "Contract Lifecycle Management" },
            ], sap: [{ module: "Ariba / CLM", desc: "Contract lifecycle management" }], valLevers: [{ lever: "Increase contract compliance", vtype: "Tangible", vclass: "Cost Avoidance", fintype: "COGS", stmt: "Income Statement" }] },
          ]},
        ]
      },
    ]
  },
];


const KPI_MASTER_LIST = [
  // ─── Working Capital ───
  { id: "kpi-dso", name: "Days Sales Outstanding", unit: "days", category: "Working Capital", defaultBenchmark: 34, src: "APQC" },
  { id: "kpi-dpo", name: "Days Payable Outstanding", unit: "days", category: "Working Capital", defaultBenchmark: 45, src: "APQC" },
  { id: "kpi-ccc", name: "Cash Conversion Cycle", unit: "days", category: "Working Capital", defaultBenchmark: 35, src: "APQC" },
  { id: "kpi-unapplied-cash", name: "Unapplied cash as % of revenue", unit: "%", category: "Working Capital", defaultBenchmark: 0.5, src: "APQC" },
  { id: "kpi-credit-util", name: "Credit limit utilization", unit: "%", category: "Working Capital", defaultBenchmark: 65, src: "Hackett" },
  { id: "kpi-deduction-backlog", name: "Deduction backlog value", unit: "$M", category: "Working Capital", defaultBenchmark: null, src: "Internal" },
  { id: "kpi-cash-forecast", name: "Cash forecast accuracy (30-day)", unit: "%", category: "Working Capital", defaultBenchmark: 90, src: "APQC" },
  { id: "kpi-wc-ratio", name: "Working capital ratio", unit: "x", category: "Working Capital", defaultBenchmark: 1.5, src: "APQC" },
  // ─── Process Quality ───
  { id: "kpi-invoice-accuracy", name: "Invoice accuracy rate", unit: "%", category: "Process Quality", defaultBenchmark: 98.5, src: "APQC" },
  { id: "kpi-order-accuracy", name: "Order accuracy rate", unit: "%", category: "Process Quality", defaultBenchmark: 99.2, src: "APQC" },
  { id: "kpi-pricing-accuracy", name: "Pricing accuracy rate", unit: "%", category: "Process Quality", defaultBenchmark: 99, src: "APQC" },
  { id: "kpi-po-accuracy", name: "PO accuracy rate", unit: "%", category: "Process Quality", defaultBenchmark: 98, src: "APQC" },
  { id: "kpi-refund-accuracy", name: "Refund accuracy rate", unit: "%", category: "Process Quality", defaultBenchmark: 99, src: "Hackett" },
  { id: "kpi-je-error", name: "JE error rate", unit: "%", category: "Process Quality", defaultBenchmark: 0.5, src: "Hackett" },
  { id: "kpi-aging-accuracy", name: "Aging bucket accuracy", unit: "%", category: "Process Quality", defaultBenchmark: 98, src: "Hackett" },
  { id: "kpi-tax-accuracy", name: "Tax filing accuracy", unit: "%", category: "Process Quality", defaultBenchmark: 99.5, src: "APQC" },
  { id: "kpi-asset-cap-accuracy", name: "Asset capitalization accuracy", unit: "%", category: "Process Quality", defaultBenchmark: 98, src: "APQC" },
  { id: "kpi-perfect-order", name: "Perfect order rate", unit: "%", category: "Process Quality", defaultBenchmark: 92, src: "APQC" },
  { id: "kpi-pricing-master", name: "Pricing master data accuracy", unit: "%", category: "Process Quality", defaultBenchmark: 99, src: "APQC" },
  { id: "kpi-rebate-accuracy", name: "Rebate accrual accuracy", unit: "%", category: "Process Quality", defaultBenchmark: 95, src: "APQC" },
  { id: "kpi-3way-match", name: "3-way match rate", unit: "%", category: "Process Quality", defaultBenchmark: 85, src: "APQC" },
  // ─── Automation ───
  { id: "kpi-touchless-orders", name: "Touchless order rate", unit: "%", category: "Automation", defaultBenchmark: 65, src: "SAP VLM" },
  { id: "kpi-touchless-invoices", name: "Touchless invoice rate", unit: "%", category: "Automation", defaultBenchmark: 75, src: "APQC" },
  { id: "kpi-cash-app-auto", name: "Cash application automation rate", unit: "%", category: "Automation", defaultBenchmark: 85, src: "APQC" },
  { id: "kpi-je-auto", name: "Journal entry automation rate", unit: "%", category: "Automation", defaultBenchmark: 75, src: "APQC" },
  { id: "kpi-recon-auto", name: "Reconciliation automation rate", unit: "%", category: "Automation", defaultBenchmark: 70, src: "APQC" },
  { id: "kpi-close-auto", name: "Close task automation rate", unit: "%", category: "Automation", defaultBenchmark: 60, src: "Hackett" },
  { id: "kpi-bank-recon-auto", name: "Bank reconciliation automation rate", unit: "%", category: "Automation", defaultBenchmark: 90, src: "APQC" },
  { id: "kpi-rev-rec-auto", name: "Revenue recognition automation rate", unit: "%", category: "Automation", defaultBenchmark: 80, src: "Hackett" },
  { id: "kpi-einvoice", name: "E-invoicing adoption rate", unit: "%", category: "Automation", defaultBenchmark: 75, src: "Hackett" },
  { id: "kpi-auto-approval-credit", name: "Credit auto-approval rate", unit: "%", category: "Automation", defaultBenchmark: 70, src: "Hackett" },
  { id: "kpi-auto-approval-req", name: "Requisition auto-approval rate", unit: "%", category: "Automation", defaultBenchmark: 50, src: "Hackett" },
  { id: "kpi-sc-finance", name: "Supply chain financing adoption", unit: "%", category: "Automation", defaultBenchmark: 30, src: "Hackett" },
  { id: "kpi-ic-match", name: "Intercompany matching rate", unit: "%", category: "Automation", defaultBenchmark: 95, src: "APQC" },
  // ─── Cycle Time ───
  { id: "kpi-days-close", name: "Days to close", unit: "days", category: "Cycle Time", defaultBenchmark: 4.8, src: "APQC" },
  { id: "kpi-billing-cycle", name: "Billing cycle time", unit: "days", category: "Cycle Time", defaultBenchmark: 1.5, src: "Hackett" },
  { id: "kpi-dispute-cycle", name: "Dispute resolution cycle time", unit: "days", category: "Cycle Time", defaultBenchmark: 15, src: "APQC" },
  { id: "kpi-order-entry", name: "Order entry cycle time", unit: "minutes", category: "Cycle Time", defaultBenchmark: 5, src: "APQC" },
  { id: "kpi-order-ship", name: "Order-to-ship cycle time", unit: "hours", category: "Cycle Time", defaultBenchmark: 24, src: "Hackett" },
  { id: "kpi-credit-eval", name: "Credit evaluation cycle time", unit: "days", category: "Cycle Time", defaultBenchmark: 2, src: "APQC" },
  { id: "kpi-refund-cycle", name: "Refund processing cycle time", unit: "days", category: "Cycle Time", defaultBenchmark: 3, src: "APQC" },
  { id: "kpi-return-cycle", name: "Return processing cycle time", unit: "days", category: "Cycle Time", defaultBenchmark: 5, src: "APQC" },
  { id: "kpi-contract-cycle", name: "Contract creation cycle time", unit: "days", category: "Cycle Time", defaultBenchmark: 5, src: "APQC" },
  { id: "kpi-req-po-cycle", name: "Requisition-to-PO cycle time", unit: "days", category: "Cycle Time", defaultBenchmark: 2, src: "APQC" },
  { id: "kpi-consol-cycle", name: "Consolidation cycle time", unit: "days", category: "Cycle Time", defaultBenchmark: 3, src: "APQC" },
  { id: "kpi-deduction-cycle", name: "Deduction resolution cycle time", unit: "days", category: "Cycle Time", defaultBenchmark: 20, src: "APQC" },
  { id: "kpi-cost-alloc-cycle", name: "Cost allocation cycle time", unit: "days", category: "Cycle Time", defaultBenchmark: 2, src: "APQC" },
  { id: "kpi-rebate-settle", name: "Rebate settlement cycle time", unit: "days", category: "Cycle Time", defaultBenchmark: 15, src: "APQC" },
  { id: "kpi-price-update", name: "Price list update cycle time", unit: "hours", category: "Cycle Time", defaultBenchmark: 4, src: "Hackett" },
  { id: "kpi-blocked-order-time", name: "Blocked order resolution time", unit: "hours", category: "Cycle Time", defaultBenchmark: 4, src: "APQC" },
  { id: "kpi-cash-app-cycle", name: "Cash application cycle time", unit: "hours", category: "Cycle Time", defaultBenchmark: 4, src: "Hackett" },
  // ─── Cost Efficiency ───
  { id: "kpi-cost-invoice-gen", name: "Cost per invoice generated", unit: "$", category: "Cost Efficiency", defaultBenchmark: 3.50, src: "APQC" },
  { id: "kpi-cost-invoice-proc", name: "Cost per invoice processed", unit: "$", category: "Cost Efficiency", defaultBenchmark: 5.00, src: "Hackett" },
  { id: "kpi-cost-po", name: "Cost per PO", unit: "$", category: "Cost Efficiency", defaultBenchmark: 25, src: "Hackett" },
  { id: "kpi-cost-dispute", name: "Cost per dispute resolved", unit: "$", category: "Cost Efficiency", defaultBenchmark: 35, src: "APQC" },
  { id: "kpi-cost-collection", name: "Cost per collection contact", unit: "$", category: "Cost Efficiency", defaultBenchmark: 8, src: "APQC" },
  { id: "kpi-cost-return", name: "Return cost per unit", unit: "$", category: "Cost Efficiency", defaultBenchmark: 12, src: "APQC" },
  { id: "kpi-warehouse-cost", name: "Warehouse cost per order", unit: "$", category: "Cost Efficiency", defaultBenchmark: 4.50, src: "APQC" },
  { id: "kpi-freight-pct", name: "Freight cost as % of revenue", unit: "%", category: "Cost Efficiency", defaultBenchmark: 4.5, src: "Hackett" },
  { id: "kpi-finance-cost-rev", name: "Finance function cost as % of revenue", unit: "%", category: "Cost Efficiency", defaultBenchmark: 0.8, src: "APQC" },
  { id: "kpi-ap-cost-rev", name: "AP cost per $1000 disbursed", unit: "$", category: "Cost Efficiency", defaultBenchmark: 1.20, src: "Hackett" },
  { id: "kpi-ar-cost-rev", name: "AR cost per $1000 revenue", unit: "$", category: "Cost Efficiency", defaultBenchmark: 1.50, src: "APQC" },
  // ─── Revenue Leakage ───
  { id: "kpi-bad-debt", name: "Bad debt write-off rate", unit: "%", category: "Revenue Leakage", defaultBenchmark: 0.25, src: "APQC" },
  { id: "kpi-writeoff-rev", name: "Write-off as % of revenue", unit: "%", category: "Revenue Leakage", defaultBenchmark: 0.15, src: "APQC" },
  { id: "kpi-dispute-rate", name: "Dispute rate", unit: "%", category: "Revenue Leakage", defaultBenchmark: 2.0, src: "Hackett" },
  { id: "kpi-return-rate", name: "Return rate", unit: "%", category: "Revenue Leakage", defaultBenchmark: 8, src: "Hackett" },
  { id: "kpi-cancel-rate", name: "Cancellation rate", unit: "%", category: "Revenue Leakage", defaultBenchmark: 3, src: "Hackett" },
  { id: "kpi-invalid-deduction", name: "Invalid deduction recovery rate", unit: "%", category: "Revenue Leakage", defaultBenchmark: 60, src: "Hackett" },
  { id: "kpi-price-realization", name: "Price realization rate", unit: "%", category: "Revenue Leakage", defaultBenchmark: 97, src: "Hackett" },
  { id: "kpi-manual-price-override", name: "Manual pricing overrides", unit: "%", category: "Revenue Leakage", defaultBenchmark: 3, src: "Hackett" },
  { id: "kpi-promo-roi", name: "Trade promotion ROI", unit: "%", category: "Revenue Leakage", defaultBenchmark: 115, src: "Hackett" },
  // ─── Compliance ───
  { id: "kpi-contract-compliance", name: "Contract compliance rate", unit: "%", category: "Compliance", defaultBenchmark: 92, src: "Hackett" },
  { id: "kpi-contract-util", name: "Contract utilization rate", unit: "%", category: "Compliance", defaultBenchmark: 80, src: "APQC" },
  { id: "kpi-process-conformance", name: "Process conformance rate", unit: "%", category: "Compliance", defaultBenchmark: 85, src: "Signavio" },
  { id: "kpi-rework", name: "Rework rate", unit: "%", category: "Compliance", defaultBenchmark: 5, src: "APQC" },
  { id: "kpi-accrual-reversal", name: "Accrual reversal rate", unit: "%", category: "Compliance", defaultBenchmark: 5, src: "APQC" },
  { id: "kpi-credit-review", name: "Credit limit review frequency", unit: "days", category: "Compliance", defaultBenchmark: 90, src: "APQC" },
  { id: "kpi-supplier-scorecard", name: "Supplier scorecard coverage", unit: "%", category: "Compliance", defaultBenchmark: 80, src: "APQC" },
  { id: "kpi-strategic-spend", name: "Strategic supplier spend coverage", unit: "%", category: "Compliance", defaultBenchmark: 75, src: "Hackett" },
  { id: "kpi-early-discount", name: "Early payment discount capture", unit: "%", category: "Compliance", defaultBenchmark: 70, src: "Hackett" },
  { id: "kpi-ontime-payment", name: "On-time payment rate", unit: "%", category: "Compliance", defaultBenchmark: 95, src: "APQC" },
  { id: "kpi-ontime-delivery", name: "On-time delivery rate", unit: "%", category: "Compliance", defaultBenchmark: 95, src: "APQC" },
  { id: "kpi-collections-eff", name: "Collections effectiveness index", unit: "%", category: "Compliance", defaultBenchmark: 82, src: "Hackett" },
  { id: "kpi-ar-90-past-due", name: "% AR > 90 days past due", unit: "%", category: "Compliance", defaultBenchmark: 5, src: "Hackett" },
  { id: "kpi-order-fill", name: "Order fill rate", unit: "%", category: "Compliance", defaultBenchmark: 97, src: "Hackett" },
  { id: "kpi-invoice-exception", name: "Invoice exception rate", unit: "%", category: "Compliance", defaultBenchmark: 15, src: "APQC" },
  { id: "kpi-blocked-credit", name: "% orders blocked for credit", unit: "%", category: "Compliance", defaultBenchmark: 5, src: "Hackett" },
  { id: "kpi-invoice-delivery", name: "Invoice delivery success rate", unit: "%", category: "Compliance", defaultBenchmark: 99, src: "APQC" },
  { id: "kpi-atp-accuracy", name: "Available-to-promise accuracy", unit: "%", category: "Compliance", defaultBenchmark: 95, src: "APQC" },
  { id: "kpi-rev-adj-post-close", name: "Revenue adjustments post-close", unit: "count", category: "Compliance", defaultBenchmark: 5, src: "APQC" },
  { id: "kpi-manual-consol-adj", name: "Manual adjustments in consolidation", unit: "count", category: "Compliance", defaultBenchmark: 10, src: "Hackett" },
];

// Flatten all L4 processes for quick lookups
const ALL_PROCS = [];
APQC.forEach(l1 => l1.groups.forEach(g => g.subs.forEach(s => s.procs.forEach(p => {
  ALL_PROCS.push({ ...p, l1Label: l1.l1, l1id: l1.l1id, l1Color: l1.color, l1Icon: l1.icon, l2: g.l2, l2id: g.l2id, l3: s.l3, l3id: s.l3id, e2e: l1.e2e });
}))));
const PROC_MAP = {};
ALL_PROCS.forEach(p => PROC_MAP[p.id] = p);

// Blueprint → L2 lookup
const getBlueprintForL2 = (l2id, functionId = "finance") => {
  const bps = BLUEPRINTS[functionId];
  if (!bps) return null;
  return bps.find(bp => bp.apqcL2s.includes(l2id)) || null;
};

// Quartile scoring: compares current value to benchmark, direction-aware
const getQuartile = (current, benchmark, kpi) => {
  if (current == null || benchmark == null || benchmark === 0) return null;
  const higherIsBetter = kpi ? /rate|score|adoption|fill|perfect|touchless|match|auto|straight/i.test(kpi.name) : true;
  const ratio = higherIsBetter ? (current / benchmark) : (benchmark / current);
  if (ratio >= 0.95) return { label: "Top Quartile", color: GREEN, icon: "▲", score: 3 };
  if (ratio >= 0.70) return { label: "Average", color: GOLD, icon: "●", score: 2 };
  return { label: "Bottom Quartile", color: RED, icon: "▼", score: 1 };
};

/* ═══════════════════════════════════════════════════════
   DROPDOWN OPTIONS
   ═══════════════════════════════════════════════════════ */
const VALUE_TYPES = ["Tangible", "Intangible"];
const VALUE_CLASSES = ["Labor Efficiency", "Standardization", "Revenue Leakage", "Working Capital", "Cost Avoidance", "Risk Mitigation", "Customer Satisfaction", "Compliance"];
const FIN_TYPES = ["SGA", "COGS", "Revenue"];
const STMT_TYPES = ["Income Statement", "Balance Sheet"];
const SCENARIO_LEVELS = ["High", "Medium", "Low"];

/* ═══════════════════════════════════════════════════════
   DEFAULT BASELINE
   ═══════════════════════════════════════════════════════ */
const DEF_BL = { company: "Demo Company", industry: "Consumer Products", revenue: 12000, cogs: 6600, sga: 3400, da: 800, ebitda: 2800, interest: 200, taxRate: 0.25, ni: 1650, inventory: 1200, recv: 1800, pay: 1400, cash: 2200 };

/* ═══════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════ */
const fm = v => { if (!v && v !== 0) return "—"; const a = Math.abs(v), s = v < 0 ? "-" : ""; return a >= 1000 ? `${s}$${(a / 1000).toFixed(1)}B` : `${s}$${a.toFixed(0)}M`; };
const fd = v => { if (Math.abs(v) < 0.5) return "—"; const s = v >= 0 ? "+" : ""; return Math.abs(v) >= 1000 ? `${s}$${(v / 1000).toFixed(1)}B` : `${s}$${v.toFixed(0)}M`; };

/* ═══════════════════════════════════════════════════════
   QUESTIONNAIRE TEMPLATES (Step 2)
   ═══════════════════════════════════════════════════════ */
const Q_TEMPLATES = [
  { q: "How many FTEs are dedicated to this process?", type: "number" },
  { q: "What is the estimated % of rework in this process?", type: "number" },
  { q: "Are there known data quality issues? Describe.", type: "text" },
  { q: "What is the current cycle time (days)?", type: "number" },
  { q: "Is there process documentation / standard operating procedures?", type: "select", opts: ["Yes — documented & followed", "Partial — documented but not followed", "No — undocumented"] },
  { q: "Rate the level of automation (1=fully manual, 5=fully automated)", type: "number" },
  { q: "Are there compliance or audit findings related to this process?", type: "select", opts: ["Yes — material findings", "Yes — minor findings", "No findings"] },
];

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function PrismL4({ user, onLogout, assessmentId, initialData, isOwner, onBack }) {
  const [page, setPage] = useState(initialData ? "work" : "entry");
  const [mode, setMode] = useState("dark");
  const isClientRole = user?.role === "client";
  const [viewMode, setViewMode] = useState(isClientRole ? "client" : "consultant"); // consultant | client
  const [step, setStep] = useState(initialData?.lastStep || 1);

  // Scope selection (Step 1)
  const [selectedProcs, setSelectedProcs] = useState(() => new Set(initialData?.selectedProcs || []));
  const [expandedL1, setExpandedL1] = useState(new Set(["8.0"]));
  const [expandedL2, setExpandedL2] = useState(new Set(["8.2"]));
  const [expandedL3, setExpandedL3] = useState(new Set(["8.2.1"]));
  const [e2eFilter, setE2eFilter] = useState("all");
  const [procSearch, setProcSearch] = useState("");

  // Cascading scope selection
  const [scopeStage, setScopeStage] = useState(1);
  const [selectedFunction, setSelectedFunction] = useState(initialData?.selectedFunction || null);
  const [selectedBlueprints, setSelectedBlueprints] = useState(new Set());
  const [entryPath, setEntryPath] = useState(null);
  const [selectedE2Es, setSelectedE2Es] = useState(new Set());
  const [selectedL2s, setSelectedL2s] = useState(new Set());
  const [selectedL3s, setSelectedL3s] = useState(new Set());
  const [scopeView, setScopeView] = useState("guided");

  // Blueprint reconciler modal
  const [showBlueprint, setShowBlueprint] = useState(false);

  // Baseline data (Step 2)
  const [baseline, setBaseline] = useState(initialData?.baseline || DEF_BL);
  const [questAnswers, setQuestAnswers] = useState(initialData?.questAnswers || {});
  const [signavioView, setSignavioView] = useState(null);

  // Value settings (Step 3)
  const [procValues, setProcValues] = useState(initialData?.procValues || {});

  // Benchmarks (Step 4)
  const [procBenchmarks, setProcBenchmarks] = useState(initialData?.procBenchmarks || {});
  const [catalystLoading, setCatalystLoading] = useState({});
  const [catalystResults, setCatalystResults] = useState(initialData?.catalystResults || {});

  // ERP (Step 5)
  // Agent (Step 6)
  const [agentLoading, setAgentLoading] = useState({});
  const [agentResults, setAgentResults] = useState(initialData?.agentResults || {});

  // Calculations (Step 7)
  const [scenarioLevel, setScenarioLevel] = useState("Medium");
  const [savedScenarios, setSavedScenarios] = useState(initialData?.savedScenarios || []);

  // Two-track baseline data (Step 2)
  const [baselineData, setBaselineData] = useState(initialData?.baselineData || {});

  // Per-process potential categorization (Step 5 / Step 7)
  const [procScenarios, setProcScenarios] = useState(initialData?.procScenarios || {});

  // Focus
  const [focusProc, setFocusProc] = useState(null);
  const [showBaselineEditor, setShowBaselineEditor] = useState(false);

  // Questionnaire upload & process mining
  const [uploadedMining, setUploadedMining] = useState(initialData?.uploadedMining || {});

  // Paste responses modal
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState("");

  // Catalyst API key (entered by consultant, never stored)
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [catalystServer, setCatalystServer] = useState(null); // null=unknown, true=server proxy available, false=not configured

  // Auto-save state
  const saveTimer = useRef(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [saving, setSaving] = useState(false);

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState("viewer");
  const [shares, setShares] = useState([]);
  const [shareLoading, setShareLoading] = useState(false);

  const t = TH[mode];

  // Selected processes as array
  const selProcs = useMemo(() => ALL_PROCS.filter(p => selectedProcs.has(p.id)), [selectedProcs]);

  // Total stats
  const totalKPIs = useMemo(() => selProcs.reduce((s, p) => s + (p.kpis?.length || 0), 0), [selProcs]);
  const totalSAP = useMemo(() => selProcs.reduce((s, p) => s + (p.sap?.length || 0), 0), [selProcs]);

  // Toggle helpers
  const toggleSet = (setter, val) => setter(prev => { const n = new Set(prev); n.has(val) ? n.delete(val) : n.add(val); return n; });
  const selectAllInGroup = (procs) => setSelectedProcs(prev => { const n = new Set(prev); procs.forEach(p => n.add(p.id)); return n; });
  const deselectAllInGroup = (procs) => setSelectedProcs(prev => { const n = new Set(prev); procs.forEach(p => n.delete(p.id)); return n; });

  // ═══ Auto-save to server ═══
  const saveToServer = useCallback(async () => {
    if (!assessmentId) return;
    setSaving(true);
    const data = {
      baseline, selectedProcs: [...selectedProcs], selectedFunction,
      procValues, procBenchmarks, questAnswers, baselineData, procScenarios,
      catalystResults, agentResults, uploadedMining, savedScenarios, lastStep: step,
    };
    try {
      await fetch(`/api/assessments/${assessmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ data, companyName: baseline.company }),
      });
      setLastSaved(new Date());
    } catch (err) { console.error("Auto-save failed:", err); }
    setSaving(false);
  }, [assessmentId, baseline, selectedProcs, selectedFunction, procValues, procBenchmarks, questAnswers, baselineData, procScenarios, catalystResults, agentResults, uploadedMining, savedScenarios, step]);

  // Auto-save every 30 seconds when data changes
  useEffect(() => {
    if (!assessmentId) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(saveToServer, 30000);
    return () => clearTimeout(saveTimer.current);
  }, [baseline, selectedProcs, procValues, procBenchmarks, questAnswers, baselineData, procScenarios, catalystResults, agentResults, uploadedMining, savedScenarios, step]);

  // ═══ Share helpers ═══
  const fetchShares = useCallback(async () => {
    if (!assessmentId) return;
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/shares`, { credentials: "include" });
      if (res.ok) { const data = await res.json(); setShares(data.shares || []); }
    } catch {}
  }, [assessmentId]);

  const handleShare = async () => {
    if (!shareEmail.trim()) return;
    setShareLoading(true);
    try {
      await fetch(`/api/assessments/${assessmentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: shareEmail.trim(), role: shareRole }),
      });
      setShareEmail("");
      fetchShares();
    } catch {}
    setShareLoading(false);
  };

  const handleRevokeShare = async (shareId) => {
    try {
      await fetch(`/api/assessments/${assessmentId}/share/${shareId}`, { method: "DELETE", credentials: "include" });
      fetchShares();
    } catch {}
  };

  // Value computation for Step 7
  const computeValue = useCallback(() => {
    const multipliers = { High: 1.0, Medium: 0.65, Low: 0.35 };
    let totalValue = 0;
    let revImpact = 0, cogsImpact = 0, sgaImpact = 0;
    let totalAgentValue = 0;
    let agentRevImpact = 0, agentCogsImpact = 0, agentSgaImpact = 0;
    const procImpacts = [];

    selProcs.forEach(proc => {
      const vals = procValues[proc.id] || {};
      const bmarks = procBenchmarks[proc.id] || {};
      const potential = procScenarios[proc.id]?.potential || scenarioLevel;
      const addressablePct = (procScenarios[proc.id]?.addressable || 80) / 100;
      const m = multipliers[potential] * addressablePct;
      let procVal = 0;
      let procAgentVal = 0;

      (proc.kpis || []).forEach((kpi, ki) => {
        const current = vals[`kpi_current_${ki}`] ?? kpi.current;
        const bench = bmarks[`bench_${ki}`] ?? kpi.benchmark;
        const lever = proc.valLevers?.[0];
        const baseAmt = lever?.fintype === "Revenue" ? baseline.revenue :
          lever?.fintype === "COGS" ? baseline.cogs : baseline.sga;

        if (current != null && bench != null && bench !== 0) {
          const gap = Math.abs(current - bench);
          const addressable = gap * m;
          let impact;
          if (kpi.unit === "%") {
            impact = (addressable / 100) * baseAmt * 0.01;
          } else {
            const gapPct = bench !== 0 ? (addressable / Math.abs(bench)) : 0;
            impact = gapPct * baseAmt * 0.01;
          }
          procVal += impact;
          if (lever?.fintype === "Revenue") revImpact += impact;
          else if (lever?.fintype === "COGS") cogsImpact += impact;
          else sgaImpact += impact;
        }

        // Agent uplift: incremental value from ERP benchmark to agent benchmark
        const agentBench = kpi.agentBenchmark;
        const benchVal = bmarks[`bench_${ki}`] ?? kpi.benchmark;
        if (agentBench != null && benchVal != null && benchVal !== 0 && agentBench !== benchVal) {
          const agentGap = Math.abs(benchVal - agentBench);
          let agentImpact;
          if (kpi.unit === "%") {
            agentImpact = (agentGap * m / 100) * baseAmt * 0.01;
          } else {
            const agentGapPct = Math.abs(benchVal) > 0 ? (agentGap * m / Math.abs(benchVal)) : 0;
            agentImpact = agentGapPct * baseAmt * 0.01;
          }
          procAgentVal += agentImpact;
          if (lever?.fintype === "Revenue") agentRevImpact += agentImpact;
          else if (lever?.fintype === "COGS") agentCogsImpact += agentImpact;
          else agentSgaImpact += agentImpact;
        }
      });

      totalAgentValue += procAgentVal;
      procImpacts.push({ id: proc.id, label: proc.label, l4: proc.l4, value: procVal, agentValue: procAgentVal, e2e: proc.e2e, color: proc.l1Color, scenario: potential });
      totalValue += procVal;
    });

    // Working Capital calculations
    let receivablesImpact = 0, payablesImpact = 0, inventoryImpact = 0;
    const dailyRevenue = baseline.revenue / 365;
    const dailyCOGS = baseline.cogs / 365;

    selProcs.forEach(proc => {
      const vals = procValues[proc.id] || {};
      const bmarks = procBenchmarks[proc.id] || {};
      const wcPotential = procScenarios[proc.id]?.potential || scenarioLevel;
      const wcAddrPct = (procScenarios[proc.id]?.addressable || 80) / 100;
      const wcM = multipliers[wcPotential] * wcAddrPct;

      (proc.kpis || []).forEach((kpi, ki) => {
        const current = vals[`kpi_current_${ki}`] ?? kpi.current;
        const bench = bmarks[`bench_${ki}`] ?? kpi.benchmark;
        const lever = proc.valLevers?.[0];

        if (current != null && bench != null && lever?.stmt === "Balance Sheet" && lever?.vclass === "Working Capital") {
          const gap = Math.abs(current - bench) * wcM;
          const kpiLower = kpi.name.toLowerCase();

          if (kpiLower.includes("dso") || kpiLower.includes("days sales outstanding") ||
              kpiLower.includes("receivable") || kpiLower.includes("collection") ||
              kpiLower.includes("cash application") || kpiLower.includes("unapplied")) {
            if (kpi.unit === "days" || kpi.unit === "hours") {
              receivablesImpact += gap * dailyRevenue;
            } else {
              receivablesImpact += (gap / 100) * baseline.recv;
            }
          } else if (kpiLower.includes("dpo") || kpiLower.includes("payable") || kpiLower.includes("payment timing")) {
            if (kpi.unit === "days") {
              payablesImpact += gap * dailyCOGS;
            } else {
              payablesImpact += (gap / 100) * baseline.pay;
            }
          } else if (kpiLower.includes("inventory") || kpiLower.includes("dio")) {
            if (kpi.unit === "days") {
              inventoryImpact += gap * dailyCOGS;
            } else {
              inventoryImpact += (gap / 100) * baseline.inventory;
            }
          } else {
            if (kpi.unit === "days" || kpi.unit === "hours") {
              receivablesImpact += gap * dailyRevenue * 0.5;
            } else {
              receivablesImpact += (gap / 100) * baseline.recv * 0.01;
            }
          }
        }
      });
    });

    return {
      total: totalValue,
      agentTotal: totalAgentValue,
      combined: totalValue + totalAgentValue,
      impacts: procImpacts.sort((a, b) => (b.value + b.agentValue) - (a.value + a.agentValue)),
      pnl: { revImpact, cogsImpact, sgaImpact, agentRevImpact, agentCogsImpact, agentSgaImpact },
      balanceSheet: { receivablesImpact, payablesImpact, inventoryImpact,
        totalWorkingCapital: receivablesImpact + payablesImpact + inventoryImpact }
    };
  }, [selProcs, procValues, procBenchmarks, scenarioLevel, procScenarios, baseline]);

  const valResult = useMemo(() => computeValue(), [computeValue]);

  // Step completion indicators
  const stepStatus = useMemo(() => ({
    1: selectedProcs.size > 0,
    2: Object.keys(questAnswers).length > 0 || Object.keys(uploadedMining).length > 0 || Object.keys(baselineData).length > 0,
    3: Object.keys(procValues).length > 0,
    4: Object.keys(procBenchmarks).length > 0 || Object.keys(catalystResults).length > 0 || Object.keys(agentResults).length > 0,
    5: valResult.total > 0,
    6: valResult.total > 0,
  }), [selectedProcs, questAnswers, uploadedMining, baselineData, procValues, procBenchmarks, catalystResults, agentResults, valResult]);

  // Catalyst API call — tries server proxy first, falls back to browser-side key
  const callCatalyst = async (procId, prompt, resultSetter, loadingSetter) => {
    loadingSetter(prev => ({ ...prev, [procId]: true }));
    try {
      // Try server proxy first (API key stays server-side)
      const proxyRes = await fetch("/api/catalyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const proxyData = await proxyRes.json();

      if (proxyRes.ok && proxyData.result) {
        setCatalystServer(true);
        resultSetter(prev => ({ ...prev, [procId]: proxyData.result }));
        loadingSetter(prev => ({ ...prev, [procId]: false }));
        return;
      }

      // Server not configured — fall back to browser-side key
      if (proxyData.error === "Catalyst not configured on server") {
        setCatalystServer(false);
      }
    } catch (_) {
      // Server unreachable (e.g. dev mode without server) — fall back
      setCatalystServer(false);
    }

    // Fallback: direct browser call with user-provided API key
    if (!apiKey) { setShowApiKeyInput(true); loadingSetter(prev => ({ ...prev, [procId]: false })); return; }
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        })
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`API ${response.status}: ${err.slice(0, 200)}`);
      }
      const data = await response.json();
      const text = data.content?.map(i => i.text || "").join("\n") || "No response";
      resultSetter(prev => ({ ...prev, [procId]: text }));
    } catch (err) {
      resultSetter(prev => ({ ...prev, [procId]: `Catalyst error: ${err.message}` }));
    }
    loadingSetter(prev => ({ ...prev, [procId]: false }));
  };

  // ═══ Questionnaire Export — Professional HTML Document ═══
  const generateQuestionnaireDoc = () => {
    const now = new Date().toISOString().split("T")[0];
    const fnObj = FUNCTIONS.find(f => f.id === (selectedFunction || "finance"));
    const fnName = fnObj?.name || "Finance";
    const fnDesc = fnObj?.desc || "";

    // Group selected procs by E2E
    const e2eGroups = {};
    selProcs.forEach(proc => {
      if (!e2eGroups[proc.e2e]) e2eGroups[proc.e2e] = [];
      e2eGroups[proc.e2e].push(proc);
    });

    // Efficiency questions
    const effQ = [
      { q: "How many FTEs work on this process?", hint: "Full-time equivalents dedicated to this process" },
      { q: "What percentage of time is spent on rework or corrections?", hint: "Estimate % of effort on rework, corrections, exceptions" },
      { q: "What is the average cycle time?", hint: "Specify days or hours. E.g., 5 days, 4 hours" },
      { q: "What percentage of the process is currently automated?", hint: "% of steps handled without manual intervention" },
      { q: "What is the current error/exception rate?", hint: "% of transactions requiring manual correction" },
      { q: "What is the primary bottleneck?", hint: "Manual data entry / Approvals / System integration / Reconciliation / Other" },
      { q: "What is the transaction volume per period?", hint: "Specify daily, weekly, or monthly volume" },
    ];
    // Leakage questions
    const leakQ = [
      { q: "Is the data granular enough for effective decision-making?", hint: "Yes / Partially / No" },
      { q: "What is the reporting frequency?", hint: "Real-time / Daily / Weekly / Monthly / Quarterly" },
      { q: "Are there known data quality issues?", hint: "None / Minor / Significant / Critical" },
      { q: "What percentage of decisions rely on manual data gathering?", hint: "Estimate %" },
      { q: "Is there a single source of truth for this process data?", hint: "Yes / Partially / No" },
      { q: "What is the estimated revenue or cost leakage from data gaps?", hint: "None / <1% / 1-3% / 3-5% / >5%" },
    ];

    const qRow = (items) => items.map((item, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#FAFAF8'}">
        <td style="padding:10px 14px;border:1px solid #E0DDD6;font-size:12px;color:#333;width:40%">${item.q}</td>
        <td style="padding:10px 14px;border:1px solid #E0DDD6;min-width:160px">&nbsp;</td>
        <td style="padding:10px 14px;border:1px solid #E0DDD6;font-size:10px;color:#999;font-style:italic;width:25%">${item.hint}</td>
      </tr>`).join("");

    // Build per-process sections
    const processSections = Object.entries(e2eGroups).map(([e2eName, procs], gi) => {
      const procsHtml = procs.map(proc => {
        const bp = getBlueprintForL2(proc.l2id);
        const jobs = proc.jobs || [];
        const saps = (proc.sap || []).map(s => s.module).join(", ");
        const kpiRows = (proc.kpis || []).map((kpi, ki) => `
          <tr style="background:${ki % 2 === 0 ? '#fff' : '#FAFAF8'}">
            <td style="padding:8px 12px;border:1px solid #E0DDD6;font-size:12px">${kpi.name}</td>
            <td style="padding:8px 12px;border:1px solid #E0DDD6;min-width:90px;text-align:center">&nbsp;</td>
            <td style="padding:8px 12px;border:1px solid #E0DDD6;text-align:center;font-size:11px;color:#888">${kpi.unit}</td>
            <td style="padding:8px 12px;border:1px solid #E0DDD6;text-align:center;font-size:11px;color:#7CB9A8">${kpi.benchmark ?? "—"} ${kpi.unit}</td>
            <td style="padding:8px 12px;border:1px solid #E0DDD6;min-width:100px">&nbsp;</td>
          </tr>`).join("");

        return `
        <div style="margin:28px 0;page-break-inside:avoid">
          <div style="background:#111110;padding:14px 20px;border-radius:8px 8px 0 0;display:flex;justify-content:space-between;align-items:center">
            <div>
              <span style="font-family:monospace;font-size:11px;color:#888;margin-right:8px">${proc.l4}</span>
              <span style="font-size:16px;font-weight:600;color:#EEEAE4">${proc.label}</span>
            </div>
            <div style="display:flex;gap:6px;align-items:center">
              ${bp ? `<span style="font-size:9px;padding:2px 8px;border-radius:4px;background:${bp.color}25;color:${bp.color};font-weight:600">${bp.name}</span>` : ""}
              ${saps ? `<span style="font-size:9px;padding:2px 8px;border-radius:4px;background:#7BA7CC25;color:#7BA7CC;font-weight:600">${saps}</span>` : ""}
            </div>
          </div>
          <div style="border:1px solid #E0DDD6;border-top:none;padding:16px 20px;border-radius:0 0 8px 8px">

            <div style="font-size:11px;color:#888;margin-bottom:6px">
              <strong>L2:</strong> ${proc.l2} &nbsp;|&nbsp; <strong>L3:</strong> ${proc.l3}
            </div>

            ${jobs.length > 0 ? `
            <div style="margin:10px 0 16px">
              <div style="font-size:10px;color:#D4A853;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Key Activities</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px">
                ${jobs.map(j => `<span style="font-size:11px;padding:4px 10px;background:#FAFAF8;border:1px solid #E0DDD6;border-radius:6px;color:#444">${j}</span>`).join("")}
              </div>
            </div>` : ""}

            <div style="margin:16px 0 8px;font-size:12px;font-weight:700;color:#7BA7CC;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #7BA7CC;padding-bottom:4px">Section A — Process Efficiency</div>
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
              <thead><tr style="background:#F5F3EE">
                <th style="padding:8px 14px;border:1px solid #E0DDD6;text-align:left;font-size:11px;color:#888;font-weight:600">Question</th>
                <th style="padding:8px 14px;border:1px solid #E0DDD6;text-align:left;font-size:11px;color:#888;font-weight:600">Your Answer</th>
                <th style="padding:8px 14px;border:1px solid #E0DDD6;text-align:left;font-size:11px;color:#888;font-weight:600">Notes / Context</th>
              </tr></thead>
              <tbody>${qRow(effQ)}</tbody>
            </table>

            <div style="margin:16px 0 8px;font-size:12px;font-weight:700;color:#D4A853;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #D4A853;padding-bottom:4px">Section B — Data-Driven Leakage</div>
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
              <thead><tr style="background:#F5F3EE">
                <th style="padding:8px 14px;border:1px solid #E0DDD6;text-align:left;font-size:11px;color:#888;font-weight:600">Question</th>
                <th style="padding:8px 14px;border:1px solid #E0DDD6;text-align:left;font-size:11px;color:#888;font-weight:600">Your Answer</th>
                <th style="padding:8px 14px;border:1px solid #E0DDD6;text-align:left;font-size:11px;color:#888;font-weight:600">Notes / Context</th>
              </tr></thead>
              <tbody>${qRow(leakQ)}</tbody>
            </table>

            ${kpiRows ? `
            <div style="margin:16px 0 8px;font-size:12px;font-weight:700;color:#7CB9A8;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #7CB9A8;padding-bottom:4px">Section C — KPI Baselines</div>
            <table style="width:100%;border-collapse:collapse">
              <thead><tr style="background:#F5F3EE">
                <th style="padding:8px 12px;border:1px solid #E0DDD6;text-align:left;font-size:11px;color:#888;font-weight:600">KPI Name</th>
                <th style="padding:8px 12px;border:1px solid #E0DDD6;text-align:center;font-size:11px;color:#888;font-weight:600">Current Value</th>
                <th style="padding:8px 12px;border:1px solid #E0DDD6;text-align:center;font-size:11px;color:#888;font-weight:600">Unit</th>
                <th style="padding:8px 12px;border:1px solid #E0DDD6;text-align:center;font-size:11px;color:#888;font-weight:600">Reference Benchmark</th>
                <th style="padding:8px 12px;border:1px solid #E0DDD6;text-align:left;font-size:11px;color:#888;font-weight:600">Notes</th>
              </tr></thead>
              <tbody>${kpiRows}</tbody>
            </table>` : ""}
          </div>
        </div>`;
      }).join("");

      return `
      <div style="page-break-before:${gi > 0 ? 'always' : 'auto'}">
        <div style="background:linear-gradient(135deg,#111110,#1A1A18);padding:16px 24px;border-radius:10px;margin:32px 0 8px">
          <span style="font-size:20px;font-weight:600;color:#EEEAE4;font-family:'Playfair Display',serif">${e2eName}</span>
          <span style="font-size:12px;color:#888;margin-left:12px">${procs.length} process${procs.length > 1 ? "es" : ""} in scope</span>
        </div>
        ${procsHtml}
      </div>`;
    }).join("");

    // Glossary terms
    const glossary = [
      ["DSO", "Days Sales Outstanding — average days to collect payment after a sale"],
      ["DPO", "Days Payable Outstanding — average days to pay suppliers"],
      ["FTE", "Full-Time Equivalent — standardized measure of workforce capacity"],
      ["APQC", "American Productivity & Quality Center — process benchmarking framework"],
      ["E2E", "End-to-End — complete process flow from trigger to outcome"],
      ["SGA", "Selling, General & Administrative expenses"],
      ["COGS", "Cost of Goods Sold"],
      ["EBITDA", "Earnings Before Interest, Taxes, Depreciation & Amortization"],
      ["KPI", "Key Performance Indicator"],
      ["SSOT", "Single Source of Truth — unified authoritative data source"],
      ["EDI", "Electronic Data Interchange"],
      ["3-Way Match", "Matching purchase order, goods receipt, and invoice"],
    ];

    // Appendix: all processes in scope
    const appendixRows = selProcs.map((p, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#FAFAF8'}">
        <td style="padding:6px 12px;border:1px solid #E0DDD6;font-family:monospace;font-size:11px;color:#888">${p.l4}</td>
        <td style="padding:6px 12px;border:1px solid #E0DDD6;font-size:12px">${p.label}</td>
        <td style="padding:6px 12px;border:1px solid #E0DDD6;font-size:11px;color:#888">${p.e2e}</td>
        <td style="padding:6px 12px;border:1px solid #E0DDD6;font-size:11px;color:#888">${p.l2}</td>
        <td style="padding:6px 12px;border:1px solid #E0DDD6;font-size:11px;color:#888">${(p.kpis || []).length}</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Process Assessment Questionnaire — ${baseline.company}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; color: #333; background: #fff; line-height: 1.5; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
    .page-break { page-break-before: always; }
    table { page-break-inside: avoid; }
  }
  @page { margin: 1.5cm; size: A4; }
  table { border-collapse: collapse; width: 100%; }
  td, th { vertical-align: top; }
</style>
</head>
<body>

<!-- ═══ COVER PAGE ═══ -->
<div style="min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;background:linear-gradient(180deg,#111110 0%,#1A1A18 100%);padding:60px 40px;page-break-after:always">
  <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:4px;margin-bottom:24px">humaninthelead.ai</div>
  <div style="font-size:42px;font-family:'Playfair Display',serif;color:#EEEAE4;font-weight:400;letter-spacing:-1px;margin-bottom:8px">Process Assessment<br/>Questionnaire</div>
  <div style="width:80px;height:2px;background:#D4A853;margin:20px auto"></div>
  <div style="font-size:20px;color:#D4A853;font-weight:500;margin-bottom:32px">${baseline.company}</div>
  <div style="font-size:14px;color:#B8B0A4;margin-bottom:4px">Function: <strong style="color:#D4A853">${fnName}</strong></div>
  <div style="font-size:13px;color:#888;margin-bottom:4px">${fnDesc}</div>
  <div style="font-size:13px;color:#888;margin-bottom:40px">Date: ${now}</div>
  <div style="font-size:13px;color:#B8B0A4">Prepared by <strong style="color:#EEEAE4">humaninthelead.ai</strong></div>
  <div style="margin-top:60px;padding:12px 24px;border:1px solid #D4A85344;border-radius:8px">
    <div style="font-size:10px;color:#D4A853;text-transform:uppercase;letter-spacing:2px;font-weight:600">Confidential — For Internal Use Only</div>
  </div>
  <div style="margin-top:auto;padding-top:40px;font-size:10px;color:#555">${selProcs.length} processes in scope &nbsp;·&nbsp; ${selProcs.reduce((s, p) => s + (p.kpis?.length || 0), 0)} KPIs &nbsp;·&nbsp; PrismL4 Bottom-Up Value Engine</div>
</div>

<!-- ═══ INSTRUCTIONS ═══ -->
<div style="max-width:800px;margin:0 auto;padding:40px 32px;page-break-after:always">
  <div style="font-size:28px;font-family:'Playfair Display',serif;color:#111;margin-bottom:24px">Instructions</div>
  <div style="font-size:14px;color:#444;line-height:1.8;margin-bottom:24px">
    This questionnaire is designed to gather detailed information about your current process performance.
    It supports PrismL4's bottom-up value identification methodology — working from individual APQC L4 processes
    upward to calculate financial impact.
  </div>
  <div style="background:#FAFAF8;border:1px solid #E0DDD6;border-radius:10px;padding:20px 24px;margin-bottom:24px">
    <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:12px">How to Complete</div>
    <ol style="font-size:13px;color:#444;line-height:2;padding-left:20px">
      <li>Share the relevant process sections with your <strong>L3/L4 process owners</strong></li>
      <li>Each process has two assessment tracks:<br/>
        <span style="color:#7BA7CC;font-weight:600">Section A — Process Efficiency:</span> FTEs, rework, cycle time, automation, errors, bottlenecks, volume<br/>
        <span style="color:#D4A853;font-weight:600">Section B — Data-Driven Leakage:</span> data granularity, reporting frequency, quality, manual decisions, SSOT, leakage
      </li>
      <li><span style="color:#7CB9A8;font-weight:600">Section C — KPI Baselines</span> contains pre-loaded benchmark KPIs. Fill in your <strong>current values</strong></li>
      <li>Return the completed questionnaire to your assessment lead</li>
    </ol>
  </div>
  <div style="background:#D4A85310;border-left:3px solid #D4A853;padding:14px 20px;border-radius:0 8px 8px 0;margin-bottom:24px">
    <div style="font-size:12px;color:#D4A853;font-weight:700;margin-bottom:4px">Tip</div>
    <div style="font-size:13px;color:#555">You can print this document (Ctrl+P → Save as PDF) or open it in Microsoft Word. Tables are formatted for easy data entry.</div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div style="background:#FAFAF8;border:1px solid #E0DDD6;border-radius:8px;padding:14px 18px;text-align:center">
      <div style="font-size:24px;font-family:'Playfair Display',serif;color:#D4A853">${selProcs.length}</div>
      <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px">Processes</div>
    </div>
    <div style="background:#FAFAF8;border:1px solid #E0DDD6;border-radius:8px;padding:14px 18px;text-align:center">
      <div style="font-size:24px;font-family:'Playfair Display',serif;color:#7CB9A8">${selProcs.reduce((s, p) => s + (p.kpis?.length || 0), 0)}</div>
      <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px">KPIs to Baseline</div>
    </div>
  </div>
</div>

<!-- ═══ PROCESS SECTIONS ═══ -->
<div style="max-width:800px;margin:0 auto;padding:0 32px 40px">
  ${processSections}
</div>

<!-- ═══ APPENDIX ═══ -->
<div style="max-width:800px;margin:0 auto;padding:40px 32px;page-break-before:always">
  <div style="font-size:28px;font-family:'Playfair Display',serif;color:#111;margin-bottom:24px">Appendix</div>

  <div style="font-size:16px;font-weight:600;color:#111;margin-bottom:12px">A. Processes in Scope</div>
  <table style="margin-bottom:32px">
    <thead><tr style="background:#F5F3EE">
      <th style="padding:8px 12px;border:1px solid #E0DDD6;text-align:left;font-size:11px;color:#888;font-weight:600">APQC Code</th>
      <th style="padding:8px 12px;border:1px solid #E0DDD6;text-align:left;font-size:11px;color:#888;font-weight:600">Process</th>
      <th style="padding:8px 12px;border:1px solid #E0DDD6;text-align:left;font-size:11px;color:#888;font-weight:600">E2E Flow</th>
      <th style="padding:8px 12px;border:1px solid #E0DDD6;text-align:left;font-size:11px;color:#888;font-weight:600">L2 Group</th>
      <th style="padding:8px 12px;border:1px solid #E0DDD6;text-align:center;font-size:11px;color:#888;font-weight:600">KPIs</th>
    </tr></thead>
    <tbody>${appendixRows}</tbody>
  </table>

  <div style="font-size:16px;font-weight:600;color:#111;margin-bottom:12px">B. Glossary</div>
  <table>
    <tbody>
      ${glossary.map(([term, def], i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#FAFAF8'}">
        <td style="padding:6px 12px;border:1px solid #E0DDD6;font-size:12px;font-weight:700;color:#111;width:120px">${term}</td>
        <td style="padding:6px 12px;border:1px solid #E0DDD6;font-size:12px;color:#555">${def}</td>
      </tr>`).join("")}
    </tbody>
  </table>
</div>

<div style="text-align:center;padding:20px;font-size:10px;color:#888;border-top:1px solid #E0DDD6;margin-top:40px">
  Generated by PrismL4 — humaninthelead.ai &nbsp;·&nbsp; ${now}
</div>

</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${baseline.company.replace(/\s+/g, "_")}_Questionnaire_${now}.html`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // ═══ Questionnaire Upload (triggers process mining) ═══
  const handleQuestionnaireUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split("\n").map(line => {
        const result = [];
        let current = "", inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          if (line[i] === '"') { if (inQuotes && line[i + 1] === '"') { current += '"'; i++; } else { inQuotes = !inQuotes; } }
          else if (line[i] === "," && !inQuotes) { result.push(current.trim()); current = ""; }
          else { current += line[i]; }
        }
        result.push(current.trim());
        return result;
      }).filter(r => r.length > 1);
      if (lines.length < 2) return;
      const headers = lines[0];
      const qStartIdx = 4; // after Process ID, APQC Code, Process Label, E2E
      const miningStartIdx = qStartIdx + Q_TEMPLATES.length;
      const newAnswers = { ...questAnswers };
      const newMining = { ...uploadedMining };
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i];
        const procId = row[0];
        if (!procId || !PROC_MAP[procId]) continue;
        // Import questionnaire answers
        Q_TEMPLATES.forEach((_, qi) => {
          const val = row[qStartIdx + qi];
          if (val) newAnswers[`${procId}_q${qi}`] = val;
        });
        // Import mining data
        const variants = row[miningStartIdx];
        const conformance = row[miningStartIdx + 1];
        const cycleTime = row[miningStartIdx + 2];
        const rework = row[miningStartIdx + 3];
        if (variants || conformance || cycleTime || rework) {
          newMining[procId] = {
            variants: variants ? parseInt(variants) || variants : null,
            conformance: conformance ? parseFloat(conformance) || conformance : null,
            cycleTime: cycleTime ? parseFloat(cycleTime) || cycleTime : null,
            rework: rework ? parseFloat(rework) || rework : null,
          };
        }
      }
      setQuestAnswers(newAnswers);
      setUploadedMining(newMining);
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  // ═══ Paste Responses Handler ═══
  const handlePasteResponses = () => {
    if (!pasteText.trim()) return;
    const newAnswers = { ...baselineData };
    const lines = pasteText.split("\n").map(l => l.trim()).filter(Boolean);
    let currentProcId = null;
    let currentSection = null; // "a" or "b"
    const effKeys = ["ftes", "rework", "cycleTime", "automation", "errorRate", "bottleneck", "volume"];
    const leakKeys = ["granularity", "reportFreq", "dataQuality", "manualPct", "ssot", "leakage"];
    let qIndex = 0;

    for (const line of lines) {
      // Detect process by APQC code
      const procMatch = line.match(/^(\d+\.\d+\.\d+\.\d+)/);
      if (procMatch) {
        const proc = ALL_PROCS.find(p => p.l4 === procMatch[1]);
        if (proc && selectedProcs.has(proc.id)) {
          currentProcId = proc.id;
          qIndex = 0;
          currentSection = null;
        }
        continue;
      }
      // Detect section headers
      if (/section\s*a|process\s*efficiency/i.test(line)) { currentSection = "a"; qIndex = 0; continue; }
      if (/section\s*b|data.driven\s*leakage/i.test(line)) { currentSection = "b"; qIndex = 0; continue; }
      // Skip header rows
      if (/^question/i.test(line) || /^kpi\s*name/i.test(line) || /^-{3,}/.test(line)) continue;
      // Parse tab or pipe-delimited answer lines
      if (currentProcId && currentSection) {
        const parts = line.split(/\t|\|/).map(s => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
          const answer = parts[1];
          if (currentSection === "a" && qIndex < effKeys.length) {
            newAnswers[`${currentProcId}_a_${effKeys[qIndex]}`] = answer;
          } else if (currentSection === "b" && qIndex < leakKeys.length) {
            newAnswers[`${currentProcId}_b_${leakKeys[qIndex]}`] = answer;
          }
          qIndex++;
        }
      }
    }
    setBaselineData(newAnswers);
    setShowPasteModal(false);
    setPasteText("");
  };

  // ═══ Phase 0 Report Generator ═══
  const generatePhase0Report = () => {
    const now = new Date().toISOString().split("T")[0];
    const processRows = selProcs.map(proc => {
      const answers = Q_TEMPLATES.map((qt, qi) => {
        const val = questAnswers[`${proc.id}_q${qi}`];
        return val ? `<tr><td style="padding:4px 8px;color:#888;font-size:12px">${qt.q}</td><td style="padding:4px 8px;font-size:12px">${val}</td></tr>` : "";
      }).join("");
      const mining = uploadedMining[proc.id];
      const miningHtml = mining ? `<div style="margin:8px 0;padding:8px;background:#f8f4ff;border-radius:6px;font-size:12px">
        <strong style="color:#C4A1D4">Process Mining:</strong>
        ${mining.variants ? `Variants: ${mining.variants}` : ""} ${mining.conformance ? `| Conformance: ${mining.conformance}%` : ""} ${mining.cycleTime ? `| Cycle Time: ${mining.cycleTime} days` : ""} ${mining.rework ? `| Rework: ${mining.rework}%` : ""}
      </div>` : "";
      const benchmarks = (proc.kpis || []).map((kpi, ki) => {
        const current = procValues[proc.id]?.[`kpi_current_${ki}`] ?? kpi.current;
        const bench = procBenchmarks[proc.id]?.[`bench_${ki}`] ?? kpi.benchmark;
        const q = getQuartile(current, bench, kpi);
        const qBadge = q ? `<span style="font-size:10px;padding:1px 6px;border-radius:3px;background:${q.color}20;color:${q.color};font-weight:700">${q.icon} ${q.label}</span>` : "";
        const agentB = kpi.agentBenchmark;
        return `<tr>
          <td style="padding:4px 8px;font-size:12px">${kpi.name}</td>
          <td style="padding:4px 8px;font-size:12px;text-align:center">${current ?? "—"} ${kpi.unit}</td>
          <td style="padding:4px 8px;font-size:12px;text-align:center;color:#D4A853">${bench ?? "—"} ${kpi.unit}</td>
          <td style="padding:4px 8px;font-size:12px;text-align:center;color:#7CB9A8">${agentB != null ? agentB + " " + kpi.unit : "—"}</td>
          <td style="padding:4px 8px;font-size:12px;text-align:center">${kpi.src}</td>
          <td style="padding:4px 8px;font-size:12px;text-align:center">${qBadge}</td>
        </tr>`;
      }).join("");
      const sapHtml = (proc.sap || []).map(s =>
        `<div style="margin:4px 0;padding:6px 8px;background:#f0f4ff;border-radius:4px;font-size:12px"><strong style="color:#7BA7CC">${s.module}</strong> — ${s.desc}${s.scenario ? `<br/><em>${s.scenario}</em>` : ""}</div>`
      ).join("");
      const agentHtml = agentResults[proc.id] ? `<div style="margin:8px 0;padding:10px;background:#fdf8ef;border:1px solid #D4A85322;border-radius:8px;font-size:12px;white-space:pre-wrap"><strong style="color:#D4A853">AI Agent Scenario</strong><br/>${agentResults[proc.id]}</div>` : "";
      const impact = valResult.impacts.find(i => i.id === proc.id);
      // Build baseline analysis HTML
      const pid = proc.id;
      const effParts = [];
      if (baselineData[pid + "_a_ftes"]) effParts.push("FTEs: " + baselineData[pid + "_a_ftes"]);
      if (baselineData[pid + "_a_rework"]) effParts.push("Rework: " + baselineData[pid + "_a_rework"] + "%");
      if (baselineData[pid + "_a_cycleTime"]) effParts.push("Cycle: " + baselineData[pid + "_a_cycleTime"] + " " + (baselineData[pid + "_a_cycleTimeUnit"] || "days"));
      if (baselineData[pid + "_a_automation"]) effParts.push("Auto: " + baselineData[pid + "_a_automation"] + "%");
      if (baselineData[pid + "_a_errorRate"]) effParts.push("Errors: " + baselineData[pid + "_a_errorRate"] + "%");
      if (baselineData[pid + "_a_bottleneck"]) effParts.push("Bottleneck: " + baselineData[pid + "_a_bottleneck"]);
      const leakParts = [];
      if (baselineData[pid + "_b_granularity"]) leakParts.push("Granularity: " + baselineData[pid + "_b_granularity"]);
      if (baselineData[pid + "_b_dataQuality"]) leakParts.push("Quality: " + baselineData[pid + "_b_dataQuality"]);
      if (baselineData[pid + "_b_ssot"]) leakParts.push("SSOT: " + baselineData[pid + "_b_ssot"]);
      if (baselineData[pid + "_b_leakage"]) leakParts.push("Leakage: " + baselineData[pid + "_b_leakage"]);
      const baselineHtml = (effParts.length > 0 || leakParts.length > 0) ? '<div style="margin:8px 0;display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
        (effParts.length > 0 ? '<div style="padding:8px;background:#f0faf6;border-left:3px solid #7CB9A8;border-radius:6px;font-size:11px"><strong style="color:#7CB9A8">Process Efficiency</strong><br/>' + effParts.join(" · ") + '</div>' : "") +
        (leakParts.length > 0 ? '<div style="padding:8px;background:#fdf8ef;border-left:3px solid #D4A853;border-radius:6px;font-size:11px"><strong style="color:#D4A853">Data-Driven Leakage</strong><br/>' + leakParts.join(" · ") + '</div>' : "") +
        '</div>' : "";
      return `<div style="margin:20px 0;padding:16px;border:1px solid #ddd;border-radius:10px;border-left:4px solid ${proc.l1Color}">
        <h3 style="margin:0 0 4px;font-size:16px">${proc.l4} — ${proc.label}</h3>
        <div style="font-size:12px;color:#888;margin-bottom:8px">${proc.e2e}${impact?.value > 0 ? ` · ERP: $${impact.value.toFixed(1)}M` : ""}${impact?.agentValue > 0 ? ` · Agent: $${impact.agentValue.toFixed(1)}M` : ""}${(impact?.value > 0 || impact?.agentValue > 0) ? ` · Total: $${((impact?.value || 0) + (impact?.agentValue || 0)).toFixed(1)}M` : ""}</div>
        ${baselineHtml}
        ${answers ? `<table style="width:100%;border-collapse:collapse;margin:8px 0"><tr style="background:#f5f5f5"><th style="text-align:left;padding:4px 8px;font-size:11px">Question</th><th style="text-align:left;padding:4px 8px;font-size:11px">Response</th></tr>${answers}</table>` : ""}
        ${miningHtml}
        ${benchmarks ? `<table style="width:100%;border-collapse:collapse;margin:8px 0"><tr style="background:#f5f5f5"><th style="text-align:left;padding:4px 8px;font-size:11px">KPI</th><th style="text-align:center;padding:4px 8px;font-size:11px">Current</th><th style="text-align:center;padding:4px 8px;font-size:11px">ERP Benchmark</th><th style="text-align:center;padding:4px 8px;font-size:11px">Agent Benchmark</th><th style="text-align:center;padding:4px 8px;font-size:11px">Source</th><th style="text-align:center;padding:4px 8px;font-size:11px">Quartile</th></tr>${benchmarks}</table>` : ""}
        ${sapHtml}
        ${agentHtml}
      </div>`;
    }).join("");
    const { revImpact, cogsImpact, sgaImpact } = valResult.pnl;
    const totalImpact = revImpact + cogsImpact + sgaImpact;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Phase 0 Report — ${baseline.company}</title>
    <style>body{font-family:'DM Sans',Helvetica,Arial,sans-serif;max-width:900px;margin:0 auto;padding:40px;color:#1a1a18;line-height:1.6}
    h1{font-family:'Playfair Display',Georgia,serif;font-size:32px;margin-bottom:4px}
    h2{font-family:'Playfair Display',Georgia,serif;font-size:22px;color:#D4A853;margin-top:36px;border-bottom:2px solid #D4A85333;padding-bottom:6px}
    .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0}
    .kpi-box{text-align:center;padding:14px;border-radius:10px;border:1px solid #ddd}
    .kpi-box .value{font-size:24px;font-family:'Playfair Display',Georgia,serif;font-weight:600}
    .kpi-box .label{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-top:4px}
    table{width:100%;border-collapse:collapse}th,td{padding:6px 10px;border-bottom:1px solid #eee;text-align:left;font-size:13px}
    th{background:#f9f7f3;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#888}
    .pnl-impact{font-weight:700;color:#7CB9A8}.pnl-neg{color:#D48A8A}
    @media print{body{padding:20px}.kpi-grid{grid-template-columns:repeat(2,1fr)}}</style></head>
    <body>
    <div style="text-align:center;margin-bottom:40px">
      <div style="font-size:12px;color:#888;letter-spacing:3px;text-transform:uppercase">humaninthelead.ai</div>
      <h1>Phase 0 Report</h1>
      <div style="font-size:18px;color:#D4A853;font-weight:500">${baseline.company}</div>
      <div style="font-size:13px;color:#888;margin-top:4px">${baseline.industry}${selectedFunction ? ` · ${FUNCTIONS.find(f => f.id === selectedFunction)?.name || ""} Function` : ""} · Generated ${now} · PrismL4</div>
    </div>

    <h2>1. Executive Summary</h2>
    <div class="kpi-grid">
      <div class="kpi-box"><div class="value" style="color:#D4A853">${totalImpact > 0 ? `$${totalImpact.toFixed(0)}M` : "—"}</div><div class="label">ERP Value</div></div>
      <div class="kpi-box"><div class="value" style="color:#7CB9A8">${valResult.agentTotal > 0 ? `$${valResult.agentTotal.toFixed(0)}M` : "—"}</div><div class="label">Agent Uplift</div></div>
      <div class="kpi-box"><div class="value" style="color:#1a1a18;font-size:28px">${valResult.combined > 0 ? `$${valResult.combined.toFixed(0)}M` : "—"}</div><div class="label">Combined Value</div></div>
      <div class="kpi-box"><div class="value" style="color:#C4A1D4">${scenarioLevel}</div><div class="label">Scenario</div></div>
    </div>

    ${(() => {
      const bpAreas = entryPath === "blueprint" ? (BLUEPRINTS[selectedFunction] || []).filter(bp => selectedBlueprints.has(bp.id)) : [];
      if (bpAreas.length === 0) return "";
      return `<h2>1b. Blueprint Scope</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:16px 0">
        ${bpAreas.map(bp => `<div style="padding:12px;border-radius:8px;border-left:3px solid ${bp.color};background:${bp.color}10">
          <div style="font-size:14px;font-weight:600;color:${bp.color}">${bp.name}</div>
          <div style="font-size:11px;color:#888;margin-top:4px">${bp.desc}</div>
          <div style="font-size:10px;color:#aaa;margin-top:6px">APQC: ${bp.apqcL2s.join(", ")}</div>
        </div>`).join("")}
      </div>`;
    })()}

    <h2>2. Company Baseline</h2>
    <table>
      <tr><th>Metric</th><th style="text-align:right">Value</th></tr>
      ${[["Revenue", baseline.revenue], ["COGS", baseline.cogs], ["SG&A", baseline.sga], ["EBITDA", baseline.ebitda],
        ["Accounts Receivable", baseline.recv], ["Accounts Payable", baseline.pay], ["Inventory", baseline.inventory]]
        .map(([l, v]) => `<tr><td>${l}</td><td style="text-align:right;font-family:monospace">$${v?.toLocaleString()}M</td></tr>`).join("")}
    </table>

    <h2>3. P&L Impact Summary (${scenarioLevel} Scenario)</h2>
    <table>
      <tr><th>Line Item</th><th style="text-align:right">Baseline</th><th style="text-align:right">ERP Impact</th><th style="text-align:right">Agent Impact</th><th style="text-align:right">Combined</th><th style="text-align:right">Improved</th></tr>
      ${(() => {
        const aRev = valResult.pnl.agentRevImpact || 0;
        const aCogs = valResult.pnl.agentCogsImpact || 0;
        const aSga = valResult.pnl.agentSgaImpact || 0;
        return [
          ["Revenue", baseline.revenue, revImpact, aRev],
          ["COGS", baseline.cogs, -cogsImpact, -aCogs],
          ["Gross Profit", baseline.revenue - baseline.cogs, revImpact + cogsImpact, aRev + aCogs],
          ["SG&A", baseline.sga, -sgaImpact, -aSga],
          ["EBITDA", baseline.ebitda, totalImpact, aRev + aCogs + aSga],
        ].map(([l, base, imp, agent]) => `<tr${l === "EBITDA" ? ' style="background:#fdf8ef;font-weight:700"' : ""}>
          <td>${l}</td>
          <td style="text-align:right;font-family:monospace">$${base?.toLocaleString()}M</td>
          <td style="text-align:right;font-family:monospace;color:#D4A853">${imp !== 0 ? (imp > 0 ? "+" : "") + "$" + imp.toFixed(1) + "M" : "—"}</td>
          <td style="text-align:right;font-family:monospace;color:#7CB9A8">${agent !== 0 ? (agent > 0 ? "+" : "") + "$" + agent.toFixed(1) + "M" : "—"}</td>
          <td style="text-align:right;font-family:monospace;font-weight:600">${(imp + agent) !== 0 ? (imp + agent > 0 ? "+" : "") + "$" + (imp + agent).toFixed(1) + "M" : "—"}</td>
          <td style="text-align:right;font-family:monospace">$${(base + imp + agent).toLocaleString()}M</td>
        </tr>`).join("");
      })()}
    </table>

    ${valResult.balanceSheet.totalWorkingCapital > 0 ? `
    <h2>Working Capital Impact</h2>
    <table>
      <thead><tr><th>Line Item</th><th style="text-align:right">Current ($M)</th><th style="text-align:right">Improvement</th><th style="text-align:right">Improved ($M)</th></tr></thead>
      <tbody>
        <tr><td>Accounts Receivable</td><td style="text-align:right;font-family:monospace">$${baseline.recv.toFixed(0)}M</td><td style="text-align:right;font-family:monospace;color:#7CB9A8">-$${valResult.balanceSheet.receivablesImpact.toFixed(1)}M</td><td style="text-align:right;font-family:monospace">$${(baseline.recv - valResult.balanceSheet.receivablesImpact).toFixed(0)}M</td></tr>
        <tr><td>Inventory</td><td style="text-align:right;font-family:monospace">$${baseline.inventory.toFixed(0)}M</td><td style="text-align:right;font-family:monospace;color:#7CB9A8">-$${valResult.balanceSheet.inventoryImpact.toFixed(1)}M</td><td style="text-align:right;font-family:monospace">$${(baseline.inventory - valResult.balanceSheet.inventoryImpact).toFixed(0)}M</td></tr>
        <tr><td>Accounts Payable</td><td style="text-align:right;font-family:monospace">$${baseline.pay.toFixed(0)}M</td><td style="text-align:right;font-family:monospace;color:#7BA7CC">+$${valResult.balanceSheet.payablesImpact.toFixed(1)}M</td><td style="text-align:right;font-family:monospace">$${(baseline.pay + valResult.balanceSheet.payablesImpact).toFixed(0)}M</td></tr>
        <tr style="font-weight:700;background:#fdf8ef"><td style="color:#D4A853">Net Working Capital Freed</td><td colspan="3" style="text-align:right;color:#D4A853;font-family:'Playfair Display',Georgia,serif;font-size:18px">$${valResult.balanceSheet.totalWorkingCapital.toFixed(1)}M</td></tr>
      </tbody>
    </table>` : ""}

    <h2>${valResult.balanceSheet.totalWorkingCapital > 0 ? "5" : "4"}. Process-Level Analysis</h2>
    ${processRows}

    <div style="margin-top:40px;padding-top:16px;border-top:2px solid #eee;text-align:center;font-size:11px;color:#aaa">
      Generated by PrismL4 · Bottom-Up Value Identification Engine · humaninthelead.ai
    </div>
    </body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${baseline.company.replace(/\s+/g, "_")}_Phase0_Report_${now}.html`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // ═══ JSON Session Export (for PPTX generator) ═══
  const exportSessionJSON = () => {
    const sessionData = {
      meta: {
        company: baseline.company,
        industry: baseline.industry,
        exportDate: new Date().toISOString(),
        scenarioLevel,
        processCount: selProcs.length,
        businessFunction: selectedFunction,
        functionName: FUNCTIONS.find(f => f.id === selectedFunction)?.name || null,
        blueprintAreas: entryPath === "blueprint" ? (BLUEPRINTS[selectedFunction] || []).filter(bp => selectedBlueprints.has(bp.id)).map(bp => ({ id: bp.id, name: bp.name, apqcL2s: bp.apqcL2s })) : [],
      },
      baseline,
      processes: selProcs.map(proc => {
        const vals = procValues[proc.id] || {};
        const bmarks = procBenchmarks[proc.id] || {};
        const answers = Q_TEMPLATES.map((qt, qi) => ({
          question: qt.q,
          answer: questAnswers[`${proc.id}_q${qi}`] || null,
        }));
        const mining = uploadedMining[proc.id] || null;
        return {
          id: proc.id,
          l4: proc.l4,
          label: proc.label,
          e2e: proc.e2e,
          l1: proc.l1Label,
          l2: proc.l2,
          l3: proc.l3,
          kpis: (proc.kpis || []).map((kpi, ki) => ({
            name: kpi.name,
            unit: kpi.unit,
            current: vals[`kpi_current_${ki}`] ?? kpi.current,
            benchmark: bmarks[`bench_${ki}`] ?? kpi.benchmark,
            agentBenchmark: kpi.agentBenchmark ?? null,
            source: kpi.src,
            method: kpi.method,
          })),
          jobs: proc.jobs || [],
          occurrence: proc.kpis?.[0]?.occurrence || null,
          capability: proc.kpis?.[0]?.capability || null,
          sap: proc.sap || [],
          valLevers: proc.valLevers || [],
          questionnaire: answers,
          mining,
          baselineData: {
            efficiency: {
              ftes: baselineData[`${proc.id}_a_ftes`] || null,
              rework: baselineData[`${proc.id}_a_rework`] || null,
              cycleTime: baselineData[`${proc.id}_a_cycleTime`] || null,
              cycleTimeUnit: baselineData[`${proc.id}_a_cycleTimeUnit`] || null,
              automation: baselineData[`${proc.id}_a_automation`] || null,
              errorRate: baselineData[`${proc.id}_a_errorRate`] || null,
              bottleneck: baselineData[`${proc.id}_a_bottleneck`] || null,
              volume: baselineData[`${proc.id}_a_volume`] || null,
              volumePeriod: baselineData[`${proc.id}_a_volumePeriod`] || null,
            },
            leakage: {
              granularity: baselineData[`${proc.id}_b_granularity`] || null,
              reportFreq: baselineData[`${proc.id}_b_reportFreq`] || null,
              dataQuality: baselineData[`${proc.id}_b_dataQuality`] || null,
              manualPct: baselineData[`${proc.id}_b_manualPct`] || null,
              ssot: baselineData[`${proc.id}_b_ssot`] || null,
              leakage: baselineData[`${proc.id}_b_leakage`] || null,
            },
          },
          catalystBenchmarks: catalystResults[proc.id] || null,
          aiAgent: agentResults[proc.id] || null,
        };
      }),
      valuation: {
        erpTotal: valResult.total,
        agentTotal: valResult.agentTotal,
        combinedTotal: valResult.combined,
        scenarioLevel,
        pnl: valResult.pnl,
        balanceSheet: valResult.balanceSheet,
        impacts: valResult.impacts,
      },
      savedScenarios,
    };
    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${baseline.company.replace(/\s+/g, "_")}_phase0_data.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // ═══ Styles ═══
  const btnPrimary = { background: GOLD, color: "#111", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: FONT };
  const btnSecondary = { background: "none", border: `1px solid ${t.bdr}`, borderRadius: 10, padding: "12px 28px", color: t.tx2, cursor: "pointer", fontSize: 15, fontFamily: FONT };
  const cardStyle = { background: t.card, border: `1px solid ${t.bdr}`, borderRadius: 12, padding: 16 };
  const labelStyle = { fontSize: 11, color: t.mut, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginBottom: 6 };
  const stepHeader = (num, title) => (
    <div style={{ marginBottom: 20 }}>
      <div style={labelStyle}>Step {num} of 6</div>
      <div style={{ fontSize: 26, fontFamily: SERIF, color: t.tx }}>{title}</div>
    </div>
  );

  // ═══════════════════════════════════════════════════
  // ENTRY PAGE
  // ═══════════════════════════════════════════════════
  if (page === "entry") return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, padding: 20 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center", maxWidth: 600 }}>
        <div style={{ fontSize: 12, color: t.mut, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16 }}>humaninthelead.ai</div>
        <div style={{ fontSize: 52, fontFamily: SERIF, color: t.tx, fontWeight: 400, letterSpacing: "-1px", marginBottom: 4 }}>PrismL4</div>
        <div style={{ fontSize: 18, color: GOLD, fontWeight: 500, marginBottom: 8 }}>Bottom-Up Value Identification Engine</div>
        <div style={{ fontSize: 14, color: t.tx2, lineHeight: 1.6, marginBottom: 24, maxWidth: 440, margin: "0 auto 24px" }}>
          Process-up value tool. Start from APQC L4 processes, attach KPIs, set benchmarks, map SAP modules, generate AI agent scenarios, and calculate financial impact.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28, maxWidth: 440, margin: "0 auto 28px" }}>
          {[
            { v: ALL_PROCS.length, l: "L4 Processes" },
            { v: ALL_PROCS.reduce((s, p) => s + (p.kpis?.length || 0), 0), l: "KPIs" },
            { v: "Live", l: "Catalyst AI" },
          ].map((s, i) => (
            <div key={i} style={{ ...cardStyle, textAlign: "center", padding: "14px 10px" }}>
              <div style={{ fontSize: 22, fontFamily: SERIF, color: GOLD, fontWeight: 500 }}>{s.v}</div>
              <div style={{ fontSize: 11, color: t.mut, textTransform: "uppercase", letterSpacing: ".5px" }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 10, flexWrap: "wrap" }}>
          {APQC.map(l1 => (
            <span key={l1.l1id} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, background: l1.color + "15", color: l1.color, fontWeight: 600 }}>
              {l1.icon} {l1.e2e}
            </span>
          ))}
        </div>

        {/* Function Card Grid */}
        <div style={{ fontSize: 11, color: t.mut, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, textAlign: "center", marginTop: 20, marginBottom: 10 }}>Select Function</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24, maxWidth: 440, margin: "0 auto 24px" }}>
          {FUNCTIONS.map(fn => (
            <div key={fn.id} onClick={() => fn.active && setSelectedFunction(fn.id)} style={{
              ...cardStyle, textAlign: "center", padding: "14px 10px", cursor: fn.active ? "pointer" : "default",
              opacity: fn.active ? 1 : 0.45,
              border: `1px solid ${selectedFunction === fn.id ? fn.color : t.bdr}`,
              background: selectedFunction === fn.id ? fn.color + "08" : t.card,
              transition: "all 0.2s",
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{fn.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: fn.active ? fn.color : t.mut }}>{fn.name}</div>
              <div style={{ fontSize: 9, color: t.mut, marginTop: 2 }}>{fn.desc}</div>
              {!fn.active && <div style={{ fontSize: 8, color: t.sub, marginTop: 4, fontStyle: "italic" }}>Coming Soon</div>}
              {fn.active && <div style={{ fontSize: 8, color: GREEN, marginTop: 4, fontWeight: 600 }}>{fn.status} · {APQC.filter(l1 => fn.apqcL1s.some(id => l1.l1id === id)).reduce((s, l1) => s + l1.groups.reduce((s2, g) => s2 + g.subs.reduce((s3, sub) => s3 + sub.procs.length, 0), 0), 0)} processes</div>}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 24, marginTop: 24 }}>
          <button onClick={() => { if (selectedFunction) { setPage("work"); setStep(1); setViewMode("consultant"); } }} style={{ ...btnPrimary, opacity: selectedFunction ? 1 : 0.4, cursor: selectedFunction ? "pointer" : "default" }} disabled={!selectedFunction}>
            {selectedFunction ? "Begin Assessment" : "Select a Function"}
          </button>
          <button onClick={() => { if (selectedFunction) { setPage("work"); setStep(1); setViewMode("client"); } }} style={{ ...btnSecondary, opacity: selectedFunction ? 1 : 0.4, cursor: selectedFunction ? "pointer" : "default" }} disabled={!selectedFunction}>
            Client View
          </button>
        </div>
        <button onClick={() => setMode(mode === "dark" ? "light" : "dark")} style={{ background: "none", border: "none", color: t.mut, cursor: "pointer", fontSize: 12, fontFamily: FONT }}>
          {mode === "dark" ? "☀ Light" : "◐ Dark"}
        </button>
        <div style={{ marginTop: 40, fontSize: 11, color: t.sub }}>Successor to Prism · Built by Christian Spetz</div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════
  // WORKSPACE
  // ═══════════════════════════════════════════════════
  const steps = [
    { n: 1, l: "Input" }, { n: 2, l: "Baseline" }, { n: 3, l: "Value Setting" },
    { n: 4, l: "Benchmark" }, { n: 5, l: "Value Calc" }, { n: 6, l: "Action Plan" }
  ];

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.tx, fontFamily: FONT, display: "flex", flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* ─── HEADER ─── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 24px", borderBottom: `1px solid ${t.bdr}`, background: mode === "dark" ? "#131312" : "#EFEBE3", flexShrink: 0, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18, fontFamily: SERIF, color: GOLD, fontWeight: 500, cursor: "pointer" }} onClick={() => setPage("entry")}>PrismL4</span>
          {selectedFunction && (() => {
            const fn = FUNCTIONS.find(f => f.id === selectedFunction);
            return fn ? <>
              <div style={{ height: 14, width: 1, background: t.bdr }} />
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: fn.color + "15", color: fn.color, fontWeight: 700 }}>{fn.icon} {fn.name}</span>
            </> : null;
          })()}
          <div style={{ height: 14, width: 1, background: t.bdr }} />
          <span onClick={() => setShowBaselineEditor(!showBaselineEditor)} style={{ fontSize: 13, color: t.tx2, fontWeight: 500, cursor: "pointer" }}>{baseline.company} ✎</span>
          {/* Save status */}
          {assessmentId && (
            <>
              <div style={{ height: 14, width: 1, background: t.bdr }} />
              {saving ? (
                <span style={{ fontSize: 10, color: GOLD }}>Saving...</span>
              ) : lastSaved ? (
                <span style={{ fontSize: 10, color: GREEN, cursor: "pointer" }} onClick={saveToServer} title="Click to save now">
                  Saved {Math.round((Date.now() - lastSaved.getTime()) / 60000) || "<1"}m ago
                </span>
              ) : (
                <span style={{ fontSize: 10, color: t.mut, cursor: "pointer" }} onClick={saveToServer}>Save Now</span>
              )}
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: viewMode === "consultant" ? GOLD + "20" : BLUE + "20", color: viewMode === "consultant" ? GOLD : BLUE, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
            {viewMode}
          </span>
          <span style={{ fontSize: 12, color: t.mut }}>{selectedProcs.size} proc</span>
          <button onClick={() => setShowApiKeyInput(!showApiKeyInput)} style={{ background: "none", border: `1px solid ${apiKey || catalystServer ? GREEN + "44" : t.bdr}`, borderRadius: 6, padding: "3px 10px", color: apiKey || catalystServer ? GREEN : t.mut, cursor: "pointer", fontSize: 11, fontFamily: FONT }}>
            {catalystServer ? "⚡ Catalyst" : apiKey ? "⚡ Catalyst" : "⚡ Set API Key"}
          </button>
          {isOwner && assessmentId && (
            <button onClick={() => { setShowShareModal(true); fetchShares(); }} style={{ background: "none", border: `1px solid ${PURPLE}44`, borderRadius: 6, padding: "3px 10px", color: PURPLE, cursor: "pointer", fontSize: 11, fontFamily: FONT, fontWeight: 600 }}>
              Share
            </button>
          )}
          {!isClientRole && <button onClick={() => setViewMode(viewMode === "consultant" ? "client" : "consultant")} style={{ background: "none", border: `1px solid ${t.bdr}`, borderRadius: 6, padding: "3px 10px", color: t.tx2, cursor: "pointer", fontSize: 11, fontFamily: FONT }}>
            ↔ {viewMode === "consultant" ? "Client" : "Consultant"}
          </button>}
          {!isClientRole && <button onClick={() => setMode(mode === "dark" ? "light" : "dark")} style={{ background: "none", border: `1px solid ${t.bdr}`, borderRadius: 6, padding: "3px 10px", color: t.mut, cursor: "pointer", fontSize: 11, fontFamily: FONT }}>
            {mode === "dark" ? "☀" : "◐"}
          </button>}
          {user && (
            <>
              <div style={{ height: 14, width: 1, background: t.bdr }} />
              <span style={{ fontSize: 10, color: t.tx2 }}>{user.name}</span>
              <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: user.role === "admin" ? GOLD + "20" : user.role === "consultant" ? GREEN + "20" : BLUE + "20", color: user.role === "admin" ? GOLD : user.role === "consultant" ? GREEN : BLUE, fontWeight: 600 }}>{user.role}</span>
              {onBack && (
                <button onClick={() => { saveToServer(); onBack(); }} style={{ background: "none", border: `1px solid ${t.bdr}`, borderRadius: 6, padding: "3px 10px", color: t.tx2, cursor: "pointer", fontSize: 10, fontFamily: FONT }}>
                  Assessments
                </button>
              )}
              {onLogout && (
                <button onClick={onLogout} style={{ background: "none", border: `1px solid ${RED}33`, borderRadius: 6, padding: "3px 10px", color: RED, cursor: "pointer", fontSize: 10, fontFamily: FONT }}>
                  Logout
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ─── BASELINE EDITOR ─── */}
      {showBaselineEditor && viewMode === "consultant" && (
        <div style={{ background: t.bg, borderBottom: `1px solid ${t.bdr}`, padding: "14px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: GOLD, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Company Financials</span>
            <button onClick={() => setShowBaselineEditor(false)} style={{ background: "none", border: "none", color: t.mut, cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
            {[
              { k: "company", l: "Company", type: "text" },
              { k: "industry", l: "Industry", type: "text" },
              { k: "revenue", l: "Revenue ($M)", type: "number" },
              { k: "cogs", l: "COGS ($M)", type: "number" },
              { k: "sga", l: "SG&A ($M)", type: "number" },
              { k: "ebitda", l: "EBITDA ($M)", type: "number" },
              { k: "recv", l: "Receivables ($M)", type: "number" },
              { k: "pay", l: "Payables ($M)", type: "number" },
              { k: "inventory", l: "Inventory ($M)", type: "number" },
            ].map(f => (
              <div key={f.k}>
                <div style={{ fontSize: 9, color: t.mut, textTransform: "uppercase", marginBottom: 2 }}>{f.l}</div>
                <input type={f.type} value={baseline[f.k] ?? ""} onChange={e => setBaseline(prev => ({ ...prev, [f.k]: f.type === "number" ? (parseFloat(e.target.value) || 0) : e.target.value }))}
                  style={{ width: "100%", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 4, padding: "5px 8px", color: t.tx, fontFamily: f.type === "number" ? "monospace" : FONT, fontSize: 12 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── API KEY INPUT (for Catalyst) ─── */}
      {showApiKeyInput && viewMode === "consultant" && (
        <div style={{ background: t.bg, borderBottom: `1px solid ${GOLD}33`, padding: "10px 24px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: GOLD, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Catalyst API</span>
          {catalystServer === true ? (
            <>
              <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>Server-configured API — no key needed</span>
              <button onClick={() => setShowApiKeyInput(false)} style={{ fontSize: 11, padding: "4px 14px", borderRadius: 6, background: GREEN + "20", border: `1px solid ${GREEN}44`, color: GREEN, cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}>
                ✓ OK
              </button>
            </>
          ) : (
            <>
              <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-ant-..."
                style={{ flex: 1, maxWidth: 400, background: t.card, border: `1px solid ${t.bdr}`, borderRadius: 6, padding: "6px 10px", color: t.tx, fontFamily: "monospace", fontSize: 12 }} />
              <button onClick={() => setShowApiKeyInput(false)} style={{ fontSize: 11, padding: "4px 14px", borderRadius: 6, background: apiKey ? GREEN + "20" : t.card, border: `1px solid ${apiKey ? GREEN + "44" : t.bdr}`, color: apiKey ? GREEN : t.mut, cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}>
                {apiKey ? "✓ Set" : "Close"}
              </button>
              <span style={{ fontSize: 10, color: t.mut }}>Key stays in memory only — never stored or transmitted except to Anthropic API.</span>
            </>
          )}
        </div>
      )}

      {/* ─── SHARE MODAL ─── */}
      {showShareModal && assessmentId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setShowShareModal(false)}>
          <div style={{ background: t.card, border: `1px solid ${t.bdr}`, borderRadius: 16, padding: "28px", maxWidth: 440, width: "100%" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontFamily: SERIF, color: t.tx }}>Share Assessment</span>
              <button onClick={() => setShowShareModal(false)} style={{ background: "none", border: "none", color: t.mut, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input value={shareEmail} onChange={e => setShareEmail(e.target.value)} placeholder="email@example.com"
                onKeyDown={e => e.key === "Enter" && handleShare()}
                style={{ flex: 1, padding: "8px 12px", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 6, color: t.tx, fontFamily: FONT, fontSize: 13, outline: "none" }} />
              <select value={shareRole} onChange={e => setShareRole(e.target.value)}
                style={{ padding: "8px 10px", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 6, color: t.tx, fontFamily: FONT, fontSize: 12 }}>
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
              <button onClick={handleShare} disabled={shareLoading || !shareEmail.trim()}
                style={{ padding: "8px 16px", borderRadius: 6, background: PURPLE, border: "none", color: "#fff", fontFamily: FONT, fontWeight: 600, fontSize: 12, cursor: shareLoading ? "wait" : "pointer", opacity: shareEmail.trim() ? 1 : 0.4 }}>
                Share
              </button>
            </div>

            <button onClick={() => { navigator.clipboard.writeText(window.location.href); }}
              style={{ width: "100%", padding: "8px", borderRadius: 6, background: t.bg, border: `1px solid ${t.bdr}`, color: t.tx2, fontFamily: FONT, fontSize: 11, cursor: "pointer", marginBottom: 16 }}>
              Copy Link
            </button>

            {shares.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: t.mut, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Current Shares</div>
                {shares.map(s => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${t.bdr}` }}>
                    <div>
                      <span style={{ fontSize: 12, color: t.tx }}>{s.shared_with_email}</span>
                      <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, marginLeft: 8, background: s.role === "editor" ? GREEN + "20" : BLUE + "20", color: s.role === "editor" ? GREEN : BLUE, fontWeight: 600, textTransform: "uppercase" }}>{s.role}</span>
                    </div>
                    <button onClick={() => handleRevokeShare(s.id)}
                      style={{ background: "none", border: "none", color: RED, cursor: "pointer", fontSize: 11, fontFamily: FONT }}>
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── HERO BAR ─── */}
      <div style={{ background: `linear-gradient(90deg,${GOLD}10,transparent)`, borderBottom: `1px solid ${GOLD}22`, padding: "6px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, flexWrap: "wrap", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <div><span style={{ fontSize: 10, color: GOLD, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginRight: 4 }}>Processes</span><span style={{ fontSize: 18, fontFamily: SERIF, color: GOLD }}>{selectedProcs.size}</span></div>
          <div style={{ height: 16, width: 1, background: t.bdr }} />
          <div><span style={{ fontSize: 10, color: GREEN, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginRight: 4 }}>KPIs</span><span style={{ fontSize: 18, fontFamily: SERIF, color: GREEN }}>{totalKPIs}</span></div>
          <div style={{ height: 16, width: 1, background: t.bdr }} />
          <div><span style={{ fontSize: 10, color: BLUE, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginRight: 4 }}>SAP</span><span style={{ fontSize: 18, fontFamily: SERIF, color: BLUE }}>{totalSAP}</span></div>
          {valResult.total > 0 && <>
            <div style={{ height: 16, width: 1, background: t.bdr }} />
            <div><span style={{ fontSize: 10, color: GOLD, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginRight: 4 }}>Value</span><span style={{ fontSize: 18, fontFamily: SERIF, color: GOLD }}>{fd(valResult.total)}</span></div>
          </>}
          {valResult.balanceSheet?.totalWorkingCapital > 0 && <>
            <div style={{ height: 16, width: 1, background: t.bdr }} />
            <div><span style={{ fontSize: 10, color: GREEN, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginRight: 4 }}>WC Freed</span><span style={{ fontSize: 18, fontFamily: SERIF, color: GREEN }}>{fm(valResult.balanceSheet.totalWorkingCapital)}</span></div>
          </>}
        </div>
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {steps.map(s => (
            <button key={s.n} onClick={() => setStep(s.n)} style={{
              background: step === s.n ? GOLD : "none",
              color: step === s.n ? "#111" : t.tx2,
              border: step === s.n ? "none" : `1px solid ${t.bdr}`,
              borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 11, fontWeight: step === s.n ? 700 : 500, fontFamily: FONT,
              position: "relative",
            }}>
              {s.n}. {s.l}
              {stepStatus[s.n] && step !== s.n && (
                <span style={{
                  position: "absolute", top: -2, right: -2,
                  width: 6, height: 6, borderRadius: "50%",
                  background: GREEN, display: "block",
                }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>

        {/* ═══════════════════════════════════════════════
            STEP 1 — Browse APQC L1→L4, Select Scope
           ═══════════════════════════════════════════════ */}
        {step === 1 && (
          <div>
            {stepHeader(1, "Process Scope Selection")}
            <div style={{ fontSize: 13, color: t.tx2, marginBottom: 16 }}>Browse the APQC hierarchy and select L4 processes to include in scope. {viewMode === "consultant" ? "Configure with client." : "Review selected scope."}</div>

            {/* Scope View Toggle */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setScopeView("guided")} style={{ fontSize: 11, padding: "5px 14px", borderRadius: 6, background: scopeView === "guided" ? GOLD + "20" : "none", border: `1px solid ${scopeView === "guided" ? GOLD + "44" : t.bdr}`, color: scopeView === "guided" ? GOLD : t.tx2, cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}>Guided Flow</button>
                <button onClick={() => setScopeView("tree")} style={{ fontSize: 11, padding: "5px 14px", borderRadius: 6, background: scopeView === "tree" ? GOLD + "20" : "none", border: `1px solid ${scopeView === "tree" ? GOLD + "44" : t.bdr}`, color: scopeView === "tree" ? GOLD : t.tx2, cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}>Tree View</button>
              </div>
              {selectedProcs.size > 0 && <span style={{ fontSize: 11, color: GREEN, fontWeight: 600 }}>{selectedProcs.size} processes selected</span>}
            </div>

            {/* ─── GUIDED SCOPE FLOW ─── */}
            {scopeView === "guided" && (
              <div>
                {/* Breadcrumb */}
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
                  {[
                    { s: 1, l: "Function" },
                    { s: 2, l: entryPath === "blueprint" ? "Blueprint" : "E2E" },
                    ...(entryPath !== "blueprint" ? [{ s: 3, l: "L2 Groups" }] : []),
                    { s: 4, l: "L3 Subs" },
                    { s: 5, l: "L4 Processes" },
                    { s: 6, l: "Review" },
                  ].map((bc, i) => (
                    <span key={bc.s} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      {i > 0 && <span style={{ color: t.sub, fontSize: 11 }}>›</span>}
                      <span onClick={() => bc.s < scopeStage && setScopeStage(bc.s)} style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: 6,
                        background: scopeStage === bc.s ? GOLD + "20" : scopeStage > bc.s ? GREEN + "10" : "none",
                        border: `1px solid ${scopeStage === bc.s ? GOLD + "44" : scopeStage > bc.s ? GREEN + "22" : t.bdr}`,
                        color: scopeStage === bc.s ? GOLD : scopeStage > bc.s ? GREEN : t.sub,
                        cursor: bc.s < scopeStage ? "pointer" : "default",
                        fontWeight: scopeStage === bc.s ? 700 : 500, fontFamily: FONT,
                      }}>{bc.l}</span>
                    </span>
                  ))}
                </div>

                {/* Stage 1 — Function */}
                {scopeStage === 1 && (
                  <div>
                    <div style={labelStyle}>Select Business Function</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                      {FUNCTIONS.map(fn => (
                        <div key={fn.id} onClick={() => { if (fn.active) { setSelectedFunction(fn.id); setScopeStage(2); } }} style={{
                          ...cardStyle, textAlign: "center", padding: "20px 14px",
                          cursor: fn.active ? "pointer" : "default", opacity: fn.active ? 1 : 0.4,
                          border: `1px solid ${fn.active ? fn.color + "33" : t.bdr}`, transition: "all 0.15s",
                        }}>
                          <div style={{ fontSize: 24, marginBottom: 6 }}>{fn.icon}</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: fn.active ? fn.color : t.sub }}>{fn.name}</div>
                          {!fn.active && <div style={{ fontSize: 10, color: t.sub, marginTop: 4 }}>Coming Soon</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stage 2 — Entry Point */}
                {scopeStage === 2 && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={labelStyle}>Choose Entry Point</div>
                      <button onClick={() => { setScopeStage(1); setEntryPath(null); setSelectedE2Es(new Set()); setSelectedBlueprints(new Set()); }} style={{ fontSize: 11, color: t.tx2, background: "none", border: "none", cursor: "pointer", fontFamily: FONT }}>← Back</button>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                      <button onClick={() => setEntryPath("e2e")} style={{
                        flex: 1, padding: "14px 16px", borderRadius: 10, textAlign: "left",
                        background: entryPath === "e2e" ? BLUE + "10" : t.card,
                        border: `1px solid ${entryPath === "e2e" ? BLUE + "44" : t.bdr}`,
                        cursor: "pointer", fontFamily: FONT,
                      }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: entryPath === "e2e" ? BLUE : t.tx }}>Browse by E2E Process</div>
                        <div style={{ fontSize: 11, color: t.tx2, marginTop: 4 }}>Select end-to-end processes, then drill into L2 groups</div>
                      </button>
                      <button onClick={() => setEntryPath("blueprint")} style={{
                        flex: 1, padding: "14px 16px", borderRadius: 10, textAlign: "left",
                        background: entryPath === "blueprint" ? GOLD + "10" : t.card,
                        border: `1px solid ${entryPath === "blueprint" ? GOLD + "44" : t.bdr}`,
                        cursor: "pointer", fontFamily: FONT,
                      }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: entryPath === "blueprint" ? GOLD : t.tx }}>Start from Blueprint</div>
                        <div style={{ fontSize: 11, color: t.tx2, marginTop: 4 }}>Select blueprint areas that auto-map to APQC groups</div>
                      </button>
                    </div>

                    {/* E2E Path */}
                    {entryPath === "e2e" && (
                      <div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
                          {APQC.map(l1 => {
                            const sel = selectedE2Es.has(l1.e2e);
                            return (
                              <div key={l1.e2e} onClick={() => toggleSet(setSelectedE2Es, l1.e2e)} style={{
                                ...cardStyle, padding: "14px 16px", cursor: "pointer",
                                background: sel ? l1.color + "10" : t.card,
                                border: `1px solid ${sel ? l1.color + "44" : t.bdr}`,
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontSize: 20, color: l1.color }}>{l1.icon}</span>
                                  <div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: sel ? l1.color : t.tx }}>{l1.e2e}</div>
                                    <div style={{ fontSize: 11, color: t.mut }}>{l1.groups.length} L2 groups · {l1.groups.reduce((s, g) => s + g.subs.reduce((ss, sub) => ss + sub.procs.length, 0), 0)} processes</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                          <button onClick={() => setShowBlueprint(true)} style={{ fontSize: 11, padding: "6px 16px", borderRadius: 8, background: GOLD + "15", border: `1px solid ${GOLD}33`, color: GOLD, cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}>
                            Import from Blueprint
                          </button>
                          {selectedE2Es.size > 0 && <button onClick={() => setScopeStage(3)} style={btnPrimary}>Next — Select L2 Groups →</button>}
                        </div>
                      </div>
                    )}

                    {/* Blueprint Path */}
                    {entryPath === "blueprint" && (
                      <div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 16 }}>
                          {(BLUEPRINTS[selectedFunction] || []).map(bp => {
                            const sel = selectedBlueprints.has(bp.id);
                            return (
                              <div key={bp.id} onClick={() => toggleSet(setSelectedBlueprints, bp.id)} style={{
                                ...cardStyle, padding: "14px 16px", cursor: "pointer",
                                background: sel ? bp.color + "10" : t.card,
                                border: `1px solid ${sel ? bp.color + "44" : t.bdr}`,
                                borderLeft: `3px solid ${bp.color}`,
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <div style={{ width: 20, height: 20, borderRadius: 5, background: sel ? bp.color : "transparent", border: sel ? "none" : `1px solid ${t.bdr}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: sel ? "#111" : t.mut, fontWeight: 700, flexShrink: 0 }}>{sel ? "✓" : ""}</div>
                                  <div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: sel ? bp.color : t.tx }}>{bp.name}</div>
                                    <div style={{ fontSize: 11, color: t.tx2, marginTop: 2 }}>{bp.desc}</div>
                                    <div style={{ fontSize: 10, color: t.mut, marginTop: 4 }}>Maps to: {bp.apqcL2s.join(", ")}</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {selectedBlueprints.size > 0 && <div style={{ textAlign: "right" }}><button onClick={() => {
                          const bps = BLUEPRINTS[selectedFunction] || [];
                          const l2Set = new Set();
                          bps.filter(bp => selectedBlueprints.has(bp.id)).forEach(bp => bp.apqcL2s.forEach(id => l2Set.add(id)));
                          setSelectedL2s(l2Set);
                          setScopeStage(4);
                        }} style={btnPrimary}>Next — Select L3 Sub-Groups →</button></div>}
                      </div>
                    )}
                  </div>
                )}

                {/* Stage 3 — L2 Groups */}
                {scopeStage === 3 && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={labelStyle}>Select L2 Process Groups</div>
                      <button onClick={() => setScopeStage(2)} style={{ fontSize: 11, color: t.tx2, background: "none", border: "none", cursor: "pointer", fontFamily: FONT }}>← Back</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 16 }}>
                      {(() => {
                        const items = [];
                        APQC.forEach(l1 => {
                          if (!selectedE2Es.has(l1.e2e)) return;
                          l1.groups.forEach(g => {
                            const l3Count = g.subs.length;
                            const l4Count = g.subs.reduce((s, sub) => s + sub.procs.length, 0);
                            const bp = getBlueprintForL2(g.l2id, selectedFunction);
                            const sel = selectedL2s.has(g.l2id);
                            items.push(
                              <div key={g.l2id} onClick={() => toggleSet(setSelectedL2s, g.l2id)} style={{
                                ...cardStyle, padding: "14px 16px", cursor: "pointer",
                                background: sel ? l1.color + "10" : t.card,
                                border: `1px solid ${sel ? l1.color + "44" : t.bdr}`,
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <div style={{ width: 20, height: 20, borderRadius: 5, background: sel ? l1.color : "transparent", border: sel ? "none" : `1px solid ${t.bdr}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: sel ? "#111" : t.mut, fontWeight: 700, flexShrink: 0 }}>{sel ? "✓" : ""}</div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: sel ? l1.color : t.tx }}>{g.l2}</div>
                                    <div style={{ fontSize: 11, color: t.mut }}>{l3Count} L3 subs · {l4Count} processes</div>
                                  </div>
                                  {bp && <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, background: bp.color + "20", color: bp.color }}>{bp.name}</span>}
                                </div>
                              </div>
                            );
                          });
                        });
                        return items;
                      })()}
                    </div>
                    {selectedL2s.size > 0 && <div style={{ textAlign: "right" }}><button onClick={() => setScopeStage(4)} style={btnPrimary}>Next — Select L3 Sub-Groups →</button></div>}
                  </div>
                )}

                {/* Stage 4 — L3 Sub-Groups */}
                {scopeStage === 4 && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={labelStyle}>Select L3 Sub-Groups</div>
                      <button onClick={() => setScopeStage(entryPath === "blueprint" ? 2 : 3)} style={{ fontSize: 11, color: t.tx2, background: "none", border: "none", cursor: "pointer", fontFamily: FONT }}>← Back</button>
                    </div>
                    <div style={{ display: "grid", gap: 6, marginBottom: 16 }}>
                      {(() => {
                        const items = [];
                        APQC.forEach(l1 => {
                          l1.groups.forEach(g => {
                            if (!selectedL2s.has(g.l2id)) return;
                            const allInGroup = g.subs.map(s => s.l3id);
                            const allGroupSel = allInGroup.every(id => selectedL3s.has(id));
                            items.push(
                              <div key={g.l2id + "-hdr"} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: items.length > 0 ? 12 : 0, marginBottom: 4 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: l1.color }}>{g.l2}</span>
                                <button onClick={() => {
                                  setSelectedL3s(prev => {
                                    const n = new Set(prev);
                                    if (allGroupSel) allInGroup.forEach(id => n.delete(id));
                                    else allInGroup.forEach(id => n.add(id));
                                    return n;
                                  });
                                }} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: allGroupSel ? GREEN + "20" : "none", border: `1px solid ${allGroupSel ? GREEN + "44" : t.bdr}`, color: allGroupSel ? GREEN : t.mut, cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}>
                                  {allGroupSel ? "Deselect All" : "Select All"}
                                </button>
                              </div>
                            );
                            g.subs.forEach(sub => {
                              const sel = selectedL3s.has(sub.l3id);
                              items.push(
                                <div key={sub.l3id} onClick={() => toggleSet(setSelectedL3s, sub.l3id)} style={{
                                  ...cardStyle, padding: "10px 14px", cursor: "pointer",
                                  background: sel ? l1.color + "08" : t.card,
                                  border: `1px solid ${sel ? l1.color + "33" : t.bdr}`,
                                  borderLeft: `3px solid ${sel ? l1.color : "transparent"}`,
                                }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 18, height: 18, borderRadius: 4, background: sel ? l1.color : "transparent", border: sel ? "none" : `1px solid ${t.bdr}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: sel ? "#111" : t.mut, fontWeight: 700, flexShrink: 0 }}>{sel ? "✓" : ""}</div>
                                    <span style={{ fontSize: 12, fontWeight: 500, color: sel ? t.tx : t.tx2, flex: 1 }}>{sub.l3}</span>
                                    <span style={{ fontSize: 10, color: t.mut }}>{sub.procs.length} processes</span>
                                  </div>
                                </div>
                              );
                            });
                          });
                        });
                        return items;
                      })()}
                    </div>
                    {selectedL3s.size > 0 && <div style={{ textAlign: "right" }}><button onClick={() => setScopeStage(5)} style={btnPrimary}>Next — Select L4 Processes →</button></div>}
                  </div>
                )}

                {/* Stage 5 — L4 Processes */}
                {scopeStage === 5 && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={labelStyle}>Select L4 Processes</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button onClick={() => {
                          const ids = [];
                          APQC.forEach(l1 => l1.groups.forEach(g => g.subs.forEach(sub => {
                            if (!selectedL3s.has(sub.l3id)) return;
                            sub.procs.forEach(p => ids.push(p.id));
                          })));
                          setSelectedProcs(prev => { const n = new Set(prev); ids.forEach(id => n.add(id)); return n; });
                        }} style={{ fontSize: 10, padding: "4px 12px", borderRadius: 6, background: GREEN + "15", border: `1px solid ${GREEN}33`, color: GREEN, cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}>Select All</button>
                        <button onClick={() => setScopeStage(4)} style={{ fontSize: 11, color: t.tx2, background: "none", border: "none", cursor: "pointer", fontFamily: FONT }}>← Back</button>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 16 }}>
                      {(() => {
                        const items = [];
                        APQC.forEach(l1 => l1.groups.forEach(g => g.subs.forEach(sub => {
                          if (!selectedL3s.has(sub.l3id)) return;
                          sub.procs.forEach(proc => {
                            const sel = selectedProcs.has(proc.id);
                            const bp = getBlueprintForL2(g.l2id, selectedFunction);
                            items.push(
                              <div key={proc.id} onClick={() => viewMode === "consultant" && toggleSet(setSelectedProcs, proc.id)} style={{
                                ...cardStyle, padding: "12px 14px",
                                cursor: viewMode === "consultant" ? "pointer" : "default",
                                background: sel ? l1.color + "08" : t.card,
                                border: `1px solid ${sel ? l1.color + "44" : t.bdr}`,
                                borderLeft: `3px solid ${sel ? l1.color : "transparent"}`,
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                  <div style={{ width: 20, height: 20, borderRadius: 5, background: sel ? l1.color : "transparent", border: sel ? "none" : `1px solid ${t.bdr}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: sel ? "#111" : t.mut, fontWeight: 700, flexShrink: 0 }}>{sel ? "✓" : ""}</div>
                                  <span style={{ fontSize: 10, fontFamily: "monospace", color: t.mut }}>{proc.l4}</span>
                                  <span style={{ fontSize: 13, fontWeight: 600, color: sel ? t.tx : t.tx2, flex: 1 }}>{proc.label}</span>
                                </div>
                                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginLeft: 28 }}>
                                  {proc.kpis?.length > 0 && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: GREEN + "15", color: GREEN, fontWeight: 600 }}>{proc.kpis.length} KPIs</span>}
                                  {proc.sap?.[0] && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: BLUE + "15", color: BLUE, fontWeight: 600 }}>{proc.sap[0].module}</span>}
                                  {proc.valLevers?.[0] && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: ORANGE + "15", color: ORANGE }}>{proc.valLevers[0].vclass}</span>}
                                  {bp && <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, background: bp.color + "20", color: bp.color }}>{bp.name}</span>}
                                </div>
                                {proc.jobs?.length > 0 && (
                                  <div style={{ marginLeft: 28, marginTop: 4, fontSize: 10, color: t.mut }}>
                                    {proc.jobs.slice(0, 2).map((j, ji) => <span key={ji} style={{ marginRight: 8 }}>• {j}</span>)}
                                    {proc.jobs.length > 2 && <span style={{ color: t.sub }}>+{proc.jobs.length - 2} more</span>}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })));
                        return items;
                      })()}
                    </div>
                    {selectedProcs.size > 0 && <div style={{ textAlign: "right" }}><button onClick={() => setScopeStage(6)} style={btnPrimary}>Review Selection →</button></div>}
                  </div>
                )}

                {/* Stage 6 — Review */}
                {scopeStage === 6 && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={labelStyle}>Review Selected Scope</div>
                      <button onClick={() => setScopeStage(5)} style={{ fontSize: 11, color: t.tx2, background: "none", border: "none", cursor: "pointer", fontFamily: FONT }}>← Back</button>
                    </div>
                    <div style={{ fontSize: 12, color: t.tx2, marginBottom: 16 }}>{selectedProcs.size} processes selected across {new Set(selProcs.map(p => p.e2e)).size} E2E streams</div>
                    {(() => {
                      const byE2E = {};
                      selProcs.forEach(p => { if (!byE2E[p.e2e]) byE2E[p.e2e] = []; byE2E[p.e2e].push(p); });
                      return Object.entries(byE2E).map(([e2e, procs]) => (
                        <div key={e2e} style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: procs[0].l1Color, marginBottom: 6 }}>{procs[0].l1Icon} {e2e} ({procs.length})</div>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                            <thead><tr>
                              {["APQC", "Process", "KPIs", "SAP Module"].map((h, i) => (
                                <th key={i} style={{ padding: "4px 8px", borderBottom: `1px solid ${t.bdr}`, textAlign: "left", color: t.mut, fontWeight: 600, fontSize: 10 }}>{h}</th>
                              ))}
                            </tr></thead>
                            <tbody>
                              {procs.map(p => (
                                <tr key={p.id}>
                                  <td style={{ padding: "4px 8px", borderBottom: `1px solid ${t.bdr}30`, fontFamily: "monospace", fontSize: 10, color: t.mut }}>{p.l4}</td>
                                  <td style={{ padding: "4px 8px", borderBottom: `1px solid ${t.bdr}30`, color: t.tx }}>{p.label}</td>
                                  <td style={{ padding: "4px 8px", borderBottom: `1px solid ${t.bdr}30` }}>
                                    <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: GREEN + "15", color: GREEN, fontWeight: 600 }}>{p.kpis?.length || 0}</span>
                                  </td>
                                  <td style={{ padding: "4px 8px", borderBottom: `1px solid ${t.bdr}30` }}>
                                    {p.sap?.[0] && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: BLUE + "15", color: BLUE, fontWeight: 600 }}>{p.sap[0].module}</span>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ));
                    })()}
                    <div style={{ textAlign: "right", marginTop: 16 }}>
                      <button onClick={() => setStep(2)} style={btnPrimary}>Confirm Scope — Baseline Research →</button>
                    </div>
                  </div>
                )}

                {/* BlueprintReconciler Modal */}
                {showBlueprint && (
                  <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: t.card, border: `1px solid ${t.bdr}`, borderRadius: 16, padding: 24, maxWidth: 700, width: "90%", maxHeight: "80vh", overflowY: "auto" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div style={{ fontSize: 18, fontFamily: SERIF, color: GOLD }}>Blueprint Reconciler</div>
                        <button onClick={() => setShowBlueprint(false)} style={{ background: "none", border: "none", color: t.mut, cursor: "pointer", fontSize: 20 }}>×</button>
                      </div>
                      <Suspense fallback={<div style={{ padding: 20, textAlign: "center", color: t.mut }}>Loading...</div>}>
                        <BlueprintReconciler
                          blueprints={BLUEPRINTS[selectedFunction] || []}
                          apqc={APQC}
                          selectedFunction={selectedFunction}
                          onConfirm={(matchedProcIds) => {
                            setSelectedProcs(prev => { const n = new Set(prev); matchedProcIds.forEach(id => n.add(id)); return n; });
                            setShowBlueprint(false);
                          }}
                          theme={t}
                        />
                      </Suspense>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── TREE VIEW ─── */}
            {scopeView === "tree" && <>
            {/* E2E Filter */}
            <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
              <button onClick={() => setE2eFilter("all")} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, background: e2eFilter === "all" ? GOLD + "20" : "none", border: `1px solid ${e2eFilter === "all" ? GOLD + "44" : t.bdr}`, color: e2eFilter === "all" ? GOLD : t.tx2, cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}>All</button>
              {APQC.map(l1 => (
                <button key={l1.e2e} onClick={() => setE2eFilter(l1.e2e)} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, background: e2eFilter === l1.e2e ? l1.color + "20" : "none", border: `1px solid ${e2eFilter === l1.e2e ? l1.color + "44" : t.bdr}`, color: e2eFilter === l1.e2e ? l1.color : t.tx2, cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}>
                  {l1.icon} {l1.e2e}
                </button>
              ))}
            </div>

            {/* Process Search */}
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                value={procSearch}
                onChange={e => setProcSearch(e.target.value)}
                placeholder="Search processes, KPIs, APQC codes..."
                style={{
                  width: "100%", padding: "8px 14px", background: t.card,
                  border: `1px solid ${procSearch ? GOLD + "44" : t.bdr}`,
                  borderRadius: 8, color: t.tx, fontSize: 13, fontFamily: FONT,
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>

            {/* Tree */}
            {(() => {
              const searchLower = procSearch.toLowerCase();
              const matchesSearch = (proc, sub, group) => {
                if (!procSearch) return true;
                return proc.label.toLowerCase().includes(searchLower) ||
                  proc.l4.toLowerCase().includes(searchLower) ||
                  (sub?.l3 || "").toLowerCase().includes(searchLower) ||
                  (group?.l2 || "").toLowerCase().includes(searchLower);
              };
              const isSearching = procSearch.length > 0;

              return APQC.filter(l1 => e2eFilter === "all" || l1.e2e === e2eFilter).map(l1 => {
                // When searching, check if any procs in this L1 match
                if (isSearching) {
                  const hasMatch = l1.groups.some(g => g.subs.some(s => s.procs.some(p => matchesSearch(p, s, g))));
                  if (!hasMatch) return null;
                }
                const l1Open = isSearching || expandedL1.has(l1.l1id);
                const allL4 = []; l1.groups.forEach(g => g.subs.forEach(s => s.procs.forEach(p => allL4.push(p.id))));
                const selCount = allL4.filter(id => selectedProcs.has(id)).length;

                return (
                  <div key={l1.l1id} style={{ marginBottom: 8 }}>
                    {/* L1 */}
                    <div onClick={() => toggleSet(setExpandedL1, l1.l1id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: l1Open ? l1.color + "08" : t.card, border: `1px solid ${l1Open ? l1.color + "33" : t.bdr}`, borderRadius: 10, cursor: "pointer", transition: "all 0.15s" }}>
                      <span style={{ fontSize: 16, color: l1.color }}>{l1.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: t.tx, flex: 1 }}>{l1.l1}</span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: l1.color + "15", color: l1.color, fontWeight: 600 }}>{l1.e2e}</span>
                      <span style={{ fontSize: 12, color: selCount > 0 ? GREEN : t.mut, fontWeight: 600 }}>{selCount}/{allL4.length}</span>
                      <span style={{ fontSize: 12, color: t.mut }}>{l1Open ? "▾" : "▸"}</span>
                    </div>

                    {l1Open && l1.groups.map(group => {
                      if (isSearching) {
                        const hasMatch = group.subs.some(s => s.procs.some(p => matchesSearch(p, s, group)));
                        if (!hasMatch) return null;
                      }
                      const g2Open = isSearching || expandedL2.has(group.l2id);
                      return (
                        <div key={group.l2id} style={{ marginLeft: 20, marginTop: 4 }}>
                          {/* L2 */}
                          <div onClick={() => toggleSet(setExpandedL2, group.l2id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: g2Open ? t.hover : "transparent", borderRadius: 8, cursor: "pointer" }}>
                            <span style={{ fontSize: 11, color: l1.color, fontWeight: 700 }}>L2</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: t.tx, flex: 1 }}>{group.l2}</span>
                            <span style={{ fontSize: 11, color: t.mut }}>{g2Open ? "▾" : "▸"}</span>
                          </div>

                          {g2Open && group.subs.map(sub => {
                            const filteredProcs = isSearching ? sub.procs.filter(p => matchesSearch(p, sub, group)) : sub.procs;
                            if (isSearching && filteredProcs.length === 0) return null;
                            const s3Open = isSearching || expandedL3.has(sub.l3id);
                            const allInSub = sub.procs.map(p => p.id);
                            const allSelected = allInSub.every(id => selectedProcs.has(id));
                            return (
                              <div key={sub.l3id} style={{ marginLeft: 20, marginTop: 2 }}>
                                {/* L3 */}
                                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px" }}>
                                  <div onClick={() => toggleSet(setExpandedL3, sub.l3id)} style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, cursor: "pointer" }}>
                                    <span style={{ fontSize: 10, color: GOLD, fontWeight: 700 }}>L3</span>
                                    <span style={{ fontSize: 12, fontWeight: 500, color: t.tx2 }}>{sub.l3}</span>
                                    <span style={{ fontSize: 11, color: t.mut }}>{s3Open ? "▾" : "▸"}</span>
                                  </div>
                                  {viewMode === "consultant" && (
                                    <button onClick={() => allSelected ? deselectAllInGroup(sub.procs) : selectAllInGroup(sub.procs)} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: allSelected ? GREEN + "20" : "none", border: `1px solid ${allSelected ? GREEN + "44" : t.bdr}`, color: allSelected ? GREEN : t.mut, cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}>
                                      {allSelected ? "Deselect All" : "Select All"}
                                    </button>
                                  )}
                                </div>

                                {s3Open && (
                                  <div style={{ marginLeft: 20, display: "grid", gridTemplateColumns: "1fr", gap: 3, marginBottom: 6 }}>
                                    {filteredProcs.map(proc => {
                                      const sel = selectedProcs.has(proc.id);
                                      return (
                                        <div key={proc.id} onClick={() => viewMode === "consultant" && toggleSet(setSelectedProcs, proc.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: sel ? l1.color + "08" : "transparent", borderRadius: 6, borderLeft: sel ? `3px solid ${l1.color}` : `3px solid transparent`, transition: "all 0.12s", cursor: viewMode === "consultant" ? "pointer" : "default" }}>
                                          <div style={{
                                            width: 20, height: 20, borderRadius: 5,
                                            background: sel ? l1.color : "transparent",
                                            border: sel ? "none" : `1px solid ${t.bdr}`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 11, color: sel ? "#111" : t.mut, fontWeight: 700,
                                            flexShrink: 0
                                          }}>{sel ? "✓" : ""}</div>
                                          <span style={{ fontSize: 10, fontFamily: "monospace", color: t.mut, minWidth: 60 }}>{proc.l4}</span>
                                          <span style={{ fontSize: 12, color: sel ? t.tx : t.tx2, flex: 1, fontWeight: sel ? 500 : 400 }}>{proc.label}</span>
                                          <span style={{ fontSize: 10, color: t.mut }}>{proc.kpis?.length || 0} KPIs</span>
                                          {proc.sap?.[0] && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: BLUE + "15", color: BLUE, fontWeight: 600 }}>{proc.sap[0].module}</span>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              });
            })()}
            </>}

            <div style={{ textAlign: "right", marginTop: 20 }}>
              <button onClick={() => setStep(2)} disabled={selectedProcs.size === 0} style={{ ...btnPrimary, opacity: selectedProcs.size > 0 ? 1 : 0.4 }}>Baseline Research →</button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            STEP 2 — Baseline Research (Guided Sub-Flow)
           ═══════════════════════════════════════════════ */}
        {step === 2 && (
          <div>
            {stepHeader(2, "Baseline Research")}
            <div style={{ fontSize: 13, color: t.tx2, marginBottom: 20 }}>
              {viewMode === "consultant"
                ? "Collect baseline data from process owners through questionnaires, manual entry, and process mining evidence."
                : "Review baseline data collected from questionnaires and process mining."
              }
            </div>

            {/* Paste Responses Modal */}
            {showPasteModal && (
              <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowPasteModal(false)}>
                <div onClick={e => e.stopPropagation()} style={{ background: t.card, border: `1px solid ${t.bdr}`, borderRadius: 16, padding: 24, width: "90%", maxWidth: 700, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: t.tx }}>Paste Questionnaire Responses</div>
                      <div style={{ fontSize: 11, color: t.mut, marginTop: 4 }}>Paste the completed questionnaire text below. The parser will match responses to processes by APQC code.</div>
                    </div>
                    <button onClick={() => setShowPasteModal(false)} style={{ background: "none", border: "none", color: t.mut, cursor: "pointer", fontSize: 20 }}>×</button>
                  </div>
                  <div style={{ fontSize: 10, color: t.mut, marginBottom: 8, padding: "8px 12px", background: BLUE + "08", border: `1px solid ${BLUE}22`, borderRadius: 8 }}>
                    <strong style={{ color: BLUE }}>Expected format:</strong> Each process section should start with its APQC code (e.g. 8.2.1.1). Use tab or pipe (|) to separate question and answer on each line.
                  </div>
                  <textarea value={pasteText} onChange={e => setPasteText(e.target.value)} placeholder={"8.2.1.1 — Manage Accounts Payable\nSection A — Process Efficiency\nFTEs on this process\t12\nRework %\t8\n...\nSection B — Data-Driven Leakage\nReporting granularity (1-5)\t3\n..."} style={{ flex: 1, minHeight: 300, padding: 12, borderRadius: 10, border: `1px solid ${t.bdr}`, background: t.bg, color: t.tx, fontFamily: "monospace", fontSize: 12, resize: "vertical" }} />
                  <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                    <button onClick={() => setShowPasteModal(false)} style={{ fontSize: 12, padding: "8px 20px", borderRadius: 8, background: "transparent", border: `1px solid ${t.bdr}`, color: t.tx2, cursor: "pointer", fontFamily: FONT }}>Cancel</button>
                    <button onClick={() => { handlePasteResponses(); setShowPasteModal(false); setPasteText(""); }} style={{ fontSize: 12, padding: "8px 20px", borderRadius: 8, background: BLUE, border: "none", color: "#fff", cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}>Import Responses</button>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Sub-step ① — Download Questionnaire ─── */}
            {(() => {
              const questDownloaded = sessionStorage.getItem("quest_downloaded") === "true";
              const e2eNames = [...new Set(selProcs.map(p => p.e2e))].join(", ");
              return (
                <div style={{ marginBottom: 16, padding: 20, background: t.card, border: `1px solid ${questDownloaded ? GREEN + "44" : GREEN + "22"}`, borderLeft: `4px solid ${GREEN}`, borderRadius: 12, opacity: questDownloaded ? 0.85 : 1 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ fontSize: 28, fontFamily: SERIF, color: GREEN, fontWeight: 700, lineHeight: 1 }}>①</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: t.tx, marginBottom: 4 }}>Download Questionnaire</div>
                      <div style={{ fontSize: 12, color: t.tx2, lineHeight: 1.6, marginBottom: 10 }}>Professional questionnaire with Process Efficiency and Data-Driven Leakage questions for each selected process. Send to your L2/L3 process owners.</div>
                      <div style={{ fontSize: 11, color: t.mut, marginBottom: 10 }}>Covers <strong style={{ color: GREEN }}>{selProcs.length}</strong> processes across <strong style={{ color: GREEN }}>{e2eNames}</strong></div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button onClick={() => { generateQuestionnaireDoc(); sessionStorage.setItem("quest_downloaded", "true"); }} style={{ fontSize: 13, padding: "8px 20px", borderRadius: 8, background: GREEN, border: "none", color: "#111", cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}>
                          ↓ Download Questionnaire
                        </button>
                        {questDownloaded && <span style={{ fontSize: 11, color: GREEN, fontWeight: 600 }}>✓ Downloaded</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ─── Sub-step ② — Upload / Enter Responses ─── */}
            {(() => {
              const procsWithBaseline = selProcs.filter(p => Object.keys(baselineData).some(k => k.startsWith(p.id))).length;
              const procsWithAnswers = selProcs.filter(p => Object.keys(questAnswers).some(k => k.startsWith(p.id))).length;
              const dataCount = procsWithBaseline + procsWithAnswers;
              const hasData = dataCount > 0;
              return (
                <div style={{ marginBottom: 16, padding: 20, background: t.card, border: `1px solid ${hasData ? GOLD + "44" : GOLD + "22"}`, borderLeft: `4px solid ${GOLD}`, borderRadius: 12, opacity: hasData ? 0.85 : 1 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ fontSize: 28, fontFamily: SERIF, color: GOLD, fontWeight: 700, lineHeight: 1 }}>②</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: t.tx, marginBottom: 4 }}>Collect & Upload Responses</div>
                      <div style={{ fontSize: 12, color: t.tx2, lineHeight: 1.6, marginBottom: 10 }}>When process owners return the completed questionnaire, upload their responses here. You can also enter data manually per process below.</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
                        <label style={{ fontSize: 12, padding: "8px 16px", borderRadius: 8, background: GOLD + "15", border: `1px solid ${GOLD}33`, color: GOLD, cursor: "pointer", fontFamily: FONT, fontWeight: 600, display: "inline-block" }}>
                          ↑ Upload Responses (CSV)
                          <input type="file" accept=".csv" onChange={handleQuestionnaireUpload} style={{ display: "none" }} />
                        </label>
                        <button onClick={() => setShowPasteModal(true)} style={{ fontSize: 12, padding: "8px 16px", borderRadius: 8, background: BLUE + "15", border: `1px solid ${BLUE}33`, color: BLUE, cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}>
                          ⎘ Paste Responses
                        </button>
                        <button onClick={() => setFocusProc(focusProc ? null : selProcs[0]?.id || null)} style={{ fontSize: 12, padding: "8px 16px", borderRadius: 8, background: t.bg, border: `1px solid ${t.bdr}`, color: t.tx2, cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}>
                          ⌨ Enter Manually
                        </button>
                        <span onClick={() => setStep(3)} style={{ fontSize: 11, color: t.mut, fontStyle: "italic", cursor: "pointer", marginLeft: 4 }}>Skip for now →</span>
                      </div>
                      {hasData && <span style={{ fontSize: 11, color: GREEN, fontWeight: 600 }}>✓ Data received for {dataCount} processes</span>}
                    </div>
                  </div>

                  {/* Inline manual entry — process selector + panels */}
                  {focusProc && (
                    <div style={{ marginTop: 16, paddingLeft: 44 }}>
                      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
                        {selProcs.map(proc => (
                          <button key={proc.id} onClick={() => setFocusProc(proc.id)} style={{
                            fontSize: 10, padding: "4px 10px", borderRadius: 6,
                            background: focusProc === proc.id ? proc.l1Color + "20" : "transparent",
                            border: `1px solid ${focusProc === proc.id ? proc.l1Color + "44" : t.bdr}`,
                            color: focusProc === proc.id ? proc.l1Color : t.tx2,
                            cursor: "pointer", fontFamily: FONT, fontWeight: focusProc === proc.id ? 700 : 400,
                          }}>
                            {proc.l4} {proc.label.length > 25 ? proc.label.slice(0, 25) + "…" : proc.label}
                            {Object.keys(baselineData).some(k => k.startsWith(proc.id)) && <span style={{ marginLeft: 4, color: GREEN }}>✓</span>}
                          </button>
                        ))}
                      </div>
                      <div style={{ fontSize: 10, color: t.mut, marginBottom: 8 }}>{selProcs.filter(p => Object.keys(baselineData).some(k => k.startsWith(p.id))).length} of {selProcs.length} processes have baseline data</div>

                      {PROC_MAP[focusProc] && (
                        <div style={{ ...cardStyle, maxHeight: 500, overflowY: "auto" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <div>
                              <div style={{ fontSize: 10, fontFamily: "monospace", color: t.mut }}>{PROC_MAP[focusProc].l4}</div>
                              <div style={{ fontSize: 16, fontWeight: 600, color: t.tx }}>{PROC_MAP[focusProc].label}</div>
                            </div>
                            <button onClick={() => setFocusProc(null)} style={{ background: "none", border: "none", color: t.mut, cursor: "pointer", fontSize: 16 }}>×</button>
                          </div>

                          {/* Panel A: Process Efficiency */}
                          <div style={{ padding: 12, background: GREEN + "08", border: `1px solid ${GREEN}22`, borderLeft: `3px solid ${GREEN}`, borderRadius: 10, marginBottom: 12 }}>
                            <div style={{ fontSize: 11, color: GREEN, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>A — Process Efficiency</div>
                            {[
                              { key: "ftes", q: "FTEs on this process", type: "number", placeholder: "e.g. 12" },
                              { key: "rework", q: "Rework/corrections %", type: "number", placeholder: "e.g. 15", unit: "%" },
                              { key: "cycleTime", q: "Average cycle time", type: "numberWithUnit", placeholder: "e.g. 5", unitKey: "cycleTimeUnit", unitOpts: ["days", "hours"] },
                              { key: "automation", q: "Automation level %", type: "number", placeholder: "e.g. 30", unit: "%" },
                              { key: "errorRate", q: "Error/exception rate %", type: "number", placeholder: "e.g. 8", unit: "%" },
                              { key: "bottleneck", q: "Primary bottleneck", type: "select", opts: ["Manual data entry", "Approvals", "System integration", "Reconciliation", "Other"] },
                              { key: "volume", q: "Volume per period", type: "numberWithUnit", placeholder: "e.g. 5000", unitKey: "volumePeriod", unitOpts: ["daily", "weekly", "monthly"] },
                            ].map(item => (
                              <div key={item.key} style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: 11, color: t.tx2, marginBottom: 3 }}>{item.q}</div>
                                {item.type === "select" ? (
                                  <select value={baselineData[`${focusProc}_a_${item.key}`] || ""} onChange={e => setBaselineData(p => ({ ...p, [`${focusProc}_a_${item.key}`]: e.target.value }))}
                                    style={{ width: "100%", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 6, padding: "6px 10px", color: t.tx, fontFamily: FONT, fontSize: 12, boxSizing: "border-box" }}>
                                    <option value="">Select...</option>
                                    {item.opts.map(o => <option key={o} value={o}>{o}</option>)}
                                  </select>
                                ) : item.type === "numberWithUnit" ? (
                                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="number" value={baselineData[`${focusProc}_a_${item.key}`] || ""} onChange={e => setBaselineData(p => ({ ...p, [`${focusProc}_a_${item.key}`]: e.target.value }))}
                                      placeholder={item.placeholder}
                                      style={{ flex: 1, background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 6, padding: "6px 10px", color: t.tx, fontFamily: FONT, fontSize: 12, boxSizing: "border-box" }} />
                                    <select value={baselineData[`${focusProc}_a_${item.unitKey}`] || item.unitOpts[0]} onChange={e => setBaselineData(p => ({ ...p, [`${focusProc}_a_${item.unitKey}`]: e.target.value }))}
                                      style={{ background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 6, padding: "6px 8px", color: t.tx, fontFamily: FONT, fontSize: 11 }}>
                                      {item.unitOpts.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                  </div>
                                ) : (
                                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="number" value={baselineData[`${focusProc}_a_${item.key}`] || ""} onChange={e => setBaselineData(p => ({ ...p, [`${focusProc}_a_${item.key}`]: e.target.value }))}
                                      placeholder={item.placeholder}
                                      style={{ flex: 1, background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 6, padding: "6px 10px", color: t.tx, fontFamily: FONT, fontSize: 12, boxSizing: "border-box" }} />
                                    {item.unit && <span style={{ fontSize: 10, color: t.mut }}>{item.unit}</span>}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Panel B: Data-Driven Leakage */}
                          <div style={{ padding: 12, background: GOLD + "08", border: `1px solid ${GOLD}22`, borderLeft: `3px solid ${GOLD}`, borderRadius: 10, marginBottom: 12 }}>
                            <div style={{ fontSize: 11, color: GOLD, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>B — Data-Driven Leakage</div>
                            {[
                              { key: "granularity", q: "Data granularity sufficient?", type: "select", opts: ["Yes", "Partially", "No"] },
                              { key: "reportFreq", q: "Reporting frequency", type: "select", opts: ["Real-time", "Daily", "Weekly", "Monthly", "Quarterly"] },
                              { key: "dataQuality", q: "Data quality issues", type: "select", opts: ["None", "Minor", "Significant", "Critical"] },
                              { key: "manualPct", q: "Manual data gathering %", type: "number", placeholder: "e.g. 60", unit: "%" },
                              { key: "ssot", q: "Single source of truth?", type: "select", opts: ["Yes", "Partially", "No"] },
                              { key: "leakage", q: "Estimated leakage", type: "select", opts: ["None", "<1%", "1-3%", "3-5%", ">5%"] },
                            ].map(item => (
                              <div key={item.key} style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: 11, color: t.tx2, marginBottom: 3 }}>{item.q}</div>
                                {item.type === "select" ? (
                                  <select value={baselineData[`${focusProc}_b_${item.key}`] || ""} onChange={e => setBaselineData(p => ({ ...p, [`${focusProc}_b_${item.key}`]: e.target.value }))}
                                    style={{ width: "100%", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 6, padding: "6px 10px", color: t.tx, fontFamily: FONT, fontSize: 12, boxSizing: "border-box" }}>
                                    <option value="">Select...</option>
                                    {item.opts.map(o => <option key={o} value={o}>{o}</option>)}
                                  </select>
                                ) : (
                                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="number" value={baselineData[`${focusProc}_b_${item.key}`] || ""} onChange={e => setBaselineData(p => ({ ...p, [`${focusProc}_b_${item.key}`]: e.target.value }))}
                                      placeholder={item.placeholder}
                                      style={{ flex: 1, background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 6, padding: "6px 10px", color: t.tx, fontFamily: FONT, fontSize: 12, boxSizing: "border-box" }} />
                                    {item.unit && <span style={{ fontSize: 10, color: t.mut }}>{item.unit}</span>}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* MiningLinker */}
                          {uploadedMining[focusProc] && baselineData[`${focusProc}_a_ftes`] && (
                            <Suspense fallback={null}>
                              <MiningLinker procId={focusProc} proc={PROC_MAP[focusProc]} miningData={uploadedMining[focusProc]} baselineData={baselineData} theme={t} />
                            </Suspense>
                          )}

                          {/* Additional Notes */}
                          <details style={{ marginBottom: 12 }}>
                            <summary style={{ ...labelStyle, cursor: "pointer", userSelect: "none" }}>Additional Notes (Questionnaire)</summary>
                            <div style={{ marginTop: 8 }}>
                              {Q_TEMPLATES.map((qt, qi) => (
                                <div key={qi} style={{ marginBottom: 10 }}>
                                  <div style={{ fontSize: 12, color: t.tx2, marginBottom: 4 }}>{qt.q}</div>
                                  {qt.type === "text" ? (
                                    <textarea value={questAnswers[`${focusProc}_q${qi}`] || ""} onChange={e => setQuestAnswers(p => ({ ...p, [`${focusProc}_q${qi}`]: e.target.value }))}
                                      placeholder="Enter response..." rows={2}
                                      style={{ width: "100%", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 6, padding: "6px 10px", color: t.tx, fontFamily: FONT, fontSize: 12, resize: "vertical", boxSizing: "border-box" }} />
                                  ) : qt.type === "select" ? (
                                    <select value={questAnswers[`${focusProc}_q${qi}`] || ""} onChange={e => setQuestAnswers(p => ({ ...p, [`${focusProc}_q${qi}`]: e.target.value }))}
                                      style={{ width: "100%", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 6, padding: "6px 10px", color: t.tx, fontFamily: FONT, fontSize: 12, boxSizing: "border-box" }}>
                                      <option value="">Select...</option>
                                      {qt.opts.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                  ) : (
                                    <input type="number" value={questAnswers[`${focusProc}_q${qi}`] || ""} onChange={e => setQuestAnswers(p => ({ ...p, [`${focusProc}_q${qi}`]: e.target.value }))}
                                      placeholder="0" style={{ width: "100%", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 6, padding: "6px 10px", color: t.tx, fontFamily: FONT, fontSize: 12, boxSizing: "border-box" }} />
                                  )}
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ─── Sub-step ③ — Process Mining Evidence ─── */}
            {(() => {
              const miningCount = Object.keys(uploadedMining).filter(k => selProcs.some(p => p.id === k)).length;
              const hasMining = miningCount > 0;
              return (
                <div style={{ marginBottom: 16, padding: 20, background: t.card, border: `1px solid ${hasMining ? PURPLE + "44" : PURPLE + "22"}`, borderLeft: `4px solid ${PURPLE}`, borderRadius: 12, opacity: hasMining ? 0.85 : 1 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ fontSize: 28, fontFamily: SERIF, color: PURPLE, fontWeight: 700, lineHeight: 1 }}>③</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: t.tx, marginBottom: 4 }}>Process Mining Evidence</div>
                      <div style={{ fontSize: 12, color: t.tx2, lineHeight: 1.6, marginBottom: 10 }}>Connect Signavio process mining data to reinforce baseline findings. Mining evidence validates reported inefficiencies.</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
                        <label style={{ fontSize: 12, padding: "8px 16px", borderRadius: 8, background: PURPLE + "15", border: `1px solid ${PURPLE}33`, color: PURPLE, cursor: "pointer", fontFamily: FONT, fontWeight: 600, display: "inline-block" }}>
                          ↑ Upload Mining Data (CSV)
                          <input type="file" accept=".csv" onChange={(e) => {
                            const file = e.target.files[0]; if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              const lines = evt.target.result.split("\n").map(l => l.trim()).filter(Boolean);
                              const header = lines[0].toLowerCase();
                              if (!header.includes("process")) return;
                              const newMining = { ...uploadedMining };
                              lines.slice(1).forEach(line => {
                                const cols = line.split(",");
                                const procCode = cols[0]?.trim();
                                const proc = selProcs.find(p => p.l4 === procCode || p.id === procCode);
                                if (proc) {
                                  newMining[proc.id] = {
                                    variants: parseInt(cols[1]) || null,
                                    conformance: parseFloat(cols[2]) || null,
                                    cycleTime: parseFloat(cols[3]) || null,
                                    rework: parseFloat(cols[4]) || null,
                                  };
                                }
                              });
                              setUploadedMining(newMining);
                            };
                            reader.readAsText(file);
                          }} style={{ display: "none" }} />
                        </label>
                        <button onClick={() => setSignavioView(signavioView ? null : selProcs[0]?.id || null)} style={{ fontSize: 12, padding: "8px 16px", borderRadius: 8, background: t.bg, border: `1px solid ${t.bdr}`, color: t.tx2, cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}>
                          ⌨ Enter Mining Data
                        </button>
                        <span onClick={() => setStep(3)} style={{ fontSize: 11, color: t.mut, fontStyle: "italic", cursor: "pointer", marginLeft: 4 }}>Skip for now →</span>
                      </div>
                      {hasMining && <span style={{ fontSize: 11, color: GREEN, fontWeight: 600 }}>✓ Mining data for {miningCount} processes</span>}
                    </div>
                  </div>

                  {/* Inline mining entry */}
                  {signavioView && (
                    <div style={{ marginTop: 16, paddingLeft: 44 }}>
                      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
                        {selProcs.map(proc => (
                          <button key={proc.id} onClick={() => setSignavioView(proc.id)} style={{
                            fontSize: 10, padding: "4px 10px", borderRadius: 6,
                            background: signavioView === proc.id ? PURPLE + "20" : "transparent",
                            border: `1px solid ${signavioView === proc.id ? PURPLE + "44" : t.bdr}`,
                            color: signavioView === proc.id ? PURPLE : t.tx2,
                            cursor: "pointer", fontFamily: FONT, fontWeight: signavioView === proc.id ? 700 : 400,
                          }}>
                            {proc.l4}
                            {uploadedMining[proc.id] && <span style={{ marginLeft: 4, color: GREEN }}>✓</span>}
                          </button>
                        ))}
                      </div>
                      {PROC_MAP[signavioView] && (
                        <div style={{ ...cardStyle }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: t.tx, marginBottom: 12 }}>{PROC_MAP[signavioView]?.label}</div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            {[
                              { key: "variants", label: "Variants Discovered", type: "number", placeholder: "e.g. 15" },
                              { key: "conformance", label: "Conformance Rate (%)", type: "number", placeholder: "e.g. 78" },
                              { key: "cycleTime", label: "Avg Cycle Time (days)", type: "number", placeholder: "e.g. 4.5" },
                              { key: "rework", label: "Rework Loops (%)", type: "number", placeholder: "e.g. 12" },
                            ].map(f => (
                              <div key={f.key}>
                                <div style={{ fontSize: 10, color: t.mut, marginBottom: 2 }}>{f.label}</div>
                                <input type="number" value={uploadedMining[signavioView]?.[f.key] ?? ""} onChange={e => {
                                  const v = parseFloat(e.target.value) || null;
                                  setUploadedMining(p => ({ ...p, [signavioView]: { ...(p[signavioView] || {}), [f.key]: v } }));
                                }} placeholder={f.placeholder}
                                  style={{ width: "100%", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 6, padding: "6px 10px", color: t.tx, fontFamily: "monospace", fontSize: 12, boxSizing: "border-box" }} />
                              </div>
                            ))}
                          </div>
                          {/* MiningLinker comparison */}
                          {uploadedMining[signavioView] && baselineData[`${signavioView}_a_ftes`] && (
                            <div style={{ marginTop: 12 }}>
                              <Suspense fallback={null}>
                                <MiningLinker procId={signavioView} proc={PROC_MAP[signavioView]} miningData={uploadedMining[signavioView]} baselineData={baselineData} theme={t} />
                              </Suspense>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <button onClick={() => setStep(1)} style={btnSecondary}>← Input</button>
              <button onClick={() => setStep(3)} style={btnPrimary}>Value Setting →</button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            STEP 3 — Value Setting
           ═══════════════════════════════════════════════ */}
        {step === 3 && (
          <div>
            {stepHeader(3, "Value Setting")}
            <div style={{ fontSize: 13, color: t.tx2, marginBottom: 20 }}>Attach value levers and KPIs to each L4 process. Set value type, classification, financial type, and statement type.</div>

            <div style={{ display: "grid", gap: 8 }}>
              {selProcs.map(proc => {
                const vals = procValues[proc.id] || {};
                const setVal = (key, val) => setProcValues(prev => ({ ...prev, [proc.id]: { ...(prev[proc.id] || {}), [key]: val } }));
                return (
                  <div key={proc.id} style={{ ...cardStyle, borderLeft: `3px solid ${proc.l1Color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div>
                        <span style={{ fontSize: 10, fontFamily: "monospace", color: t.mut, marginRight: 6 }}>{proc.l4}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: t.tx }}>{proc.label}</span>
                      </div>
                      <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: proc.l1Color + "15", color: proc.l1Color, fontWeight: 600 }}>{proc.e2e}</span>
                      {(() => { const _bp = getBlueprintForL2(proc.l2id); return _bp && <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, background: _bp.color + "20", color: _bp.color }}>{_bp.name}</span>; })()}
                    </div>

                    {/* Value Levers */}
                    {(proc.valLevers || []).map((lv, li) => (
                      <div key={li} style={{ padding: "8px 10px", background: t.bg, borderRadius: 8, marginBottom: 6, border: `1px solid ${t.bdr}` }}>
                        <div style={{ fontSize: 12, color: t.tx, fontWeight: 500, marginBottom: 6 }}>{lv.lever}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
                          {[
                            { l: "Value Type", k: `vtype_${li}`, opts: VALUE_TYPES, def: lv.vtype },
                            { l: "Classification", k: `vclass_${li}`, opts: VALUE_CLASSES, def: lv.vclass },
                            { l: "Financial Type", k: `fintype_${li}`, opts: FIN_TYPES, def: lv.fintype },
                            { l: "Statement", k: `stmt_${li}`, opts: STMT_TYPES, def: lv.stmt },
                          ].map(dd => (
                            <div key={dd.k}>
                              <div style={{ fontSize: 9, color: t.mut, textTransform: "uppercase", marginBottom: 2 }}>{dd.l}</div>
                              <select value={vals[dd.k] || dd.def || ""} onChange={e => setVal(dd.k, e.target.value)}
                                disabled={viewMode === "client"}
                                style={{ width: "100%", background: t.card, border: `1px solid ${t.bdr}`, borderRadius: 4, padding: "4px 6px", color: t.tx, fontFamily: FONT, fontSize: 11 }}>
                                {dd.opts.map(o => <option key={o} value={o}>{o}</option>)}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* KPI Baselines */}
                    <div style={{ ...labelStyle, marginTop: 8, fontSize: 10 }}>KPI Baselines</div>
                    <div style={{ display: "grid", gap: 4 }}>
                      {(proc.kpis || []).map((kpi, ki) => (
                        <div key={ki} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                          <span style={{ fontSize: 12, color: t.tx2, flex: 1 }}>{kpi.name}</span>
                          <input type="number" placeholder="Current" value={vals[`kpi_current_${ki}`] ?? ""} onChange={e => setVal(`kpi_current_${ki}`, parseFloat(e.target.value) || null)}
                            disabled={viewMode === "client"}
                            style={{ width: 80, background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 4, padding: "3px 6px", color: t.tx, fontFamily: "monospace", fontSize: 12, textAlign: "right" }} />
                          <span style={{ fontSize: 10, color: t.mut, minWidth: 30 }}>{kpi.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <button onClick={() => setStep(2)} style={btnSecondary}>← Baseline</button>
              <button onClick={() => setStep(4)} style={btnPrimary}>Benchmark →</button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            STEP 4 — Benchmark (Merged: KPIs + SAP + AI Agents)
           ═══════════════════════════════════════════════ */}
        {step === 4 && (
          <div>
            {stepHeader(4, "Benchmark & Assessment")}
            <div style={{ fontSize: 13, color: t.tx2, marginBottom: 16 }}>Multi-source benchmarks, SAP S/4HANA module mappings, and AI agent assessments per process.</div>

            {/* Module summary badges */}
            {(() => {
              const modules = {};
              selProcs.forEach(p => (p.sap || []).forEach(s => { if (!modules[s.module]) modules[s.module] = []; modules[s.module].push(p.label); }));
              return Object.keys(modules).length > 0 ? (
                <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                  {Object.entries(modules).map(([mod, procs]) => (
                    <div key={mod} style={{ padding: "4px 10px", background: BLUE + "10", border: `1px solid ${BLUE}22`, borderRadius: 6 }}>
                      <span style={{ fontSize: 11, color: BLUE, fontWeight: 700 }}>{mod}</span>
                      <span style={{ fontSize: 9, color: t.mut, marginLeft: 4 }}>{procs.length}</span>
                    </div>
                  ))}
                </div>
              ) : null;
            })()}

            <div style={{ display: "grid", gap: 12 }}>
              {selProcs.map(proc => {
                const bmarks = procBenchmarks[proc.id] || {};
                const setBmark = (key, val) => setProcBenchmarks(prev => ({ ...prev, [proc.id]: { ...(prev[proc.id] || {}), [key]: val } }));
                const vals = procValues[proc.id] || {};
                const potential = procScenarios[proc.id]?.potential || scenarioLevel;
                const m = { High: 1.0, Medium: 0.65, Low: 0.35 }[potential] * ((procScenarios[proc.id]?.addressable || 80) / 100);
                let procErpVal = 0, procAgentVal = 0;
                const kpiRows = (proc.kpis || []).map((kpi, ki) => {
                  const current = vals[`kpi_current_${ki}`] ?? kpi.current;
                  const bench = bmarks[`bench_${ki}`] ?? kpi.benchmark;
                  const agentBench = kpi.agentBenchmark;
                  const lever = proc.valLevers?.[0];
                  const baseAmt = lever?.fintype === "Revenue" ? baseline.revenue : lever?.fintype === "COGS" ? baseline.cogs : baseline.sga;
                  let erpImpact = 0, agentImpact = 0;
                  if (current != null && bench != null && bench !== 0) {
                    const gap = Math.abs(current - bench) * m;
                    erpImpact = kpi.unit === "%" ? (gap / 100) * baseAmt * 0.01 : (bench !== 0 ? (gap / Math.abs(bench)) : 0) * baseAmt * 0.01;
                  }
                  if (agentBench != null && bench != null && bench !== 0 && agentBench !== bench) {
                    const agentGap = Math.abs(bench - agentBench) * m;
                    agentImpact = kpi.unit === "%" ? (agentGap / 100) * baseAmt * 0.01 : (Math.abs(bench) > 0 ? (agentGap / Math.abs(bench)) : 0) * baseAmt * 0.01;
                  }
                  procErpVal += erpImpact;
                  procAgentVal += agentImpact;
                  return { kpi, ki, current, bench, agentBench, erpImpact, agentImpact };
                });

                // Tab state per process — default "benchmarks"
                const procTab = procScenarios[proc.id]?._tab || "benchmarks";
                const setTab = (tab) => setProcScenarios(prev => ({ ...prev, [proc.id]: { ...(prev[proc.id] || {}), _tab: tab } }));

                return (
                  <div key={proc.id} style={{ ...cardStyle, borderLeft: `3px solid ${proc.l1Color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div>
                        <span style={{ fontSize: 10, fontFamily: "monospace", color: t.mut, marginRight: 6 }}>{proc.l4}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: t.tx }}>{proc.label}</span>
                        {(() => { const _bp = getBlueprintForL2(proc.l2id); return _bp && <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, background: _bp.color + "20", color: _bp.color, marginLeft: 4 }}>{_bp.name}</span>; })()}
                      </div>
                      <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: proc.l1Color + "15", color: proc.l1Color, fontWeight: 600 }}>{proc.e2e}</span>
                    </div>

                    {/* Section Tabs */}
                    <div style={{ display: "flex", gap: 2, marginBottom: 12, borderBottom: `1px solid ${t.bdr}` }}>
                      {[
                        { key: "benchmarks", label: "Benchmarks", color: GREEN },
                        { key: "sap", label: "SAP", color: BLUE },
                        { key: "agents", label: "AI Agents", color: GOLD },
                      ].map(tab => (
                        <button key={tab.key} onClick={() => setTab(tab.key)} style={{
                          fontSize: 11, padding: "6px 14px", fontWeight: procTab === tab.key ? 700 : 500,
                          background: procTab === tab.key ? tab.color + "12" : "transparent",
                          borderBottom: procTab === tab.key ? `2px solid ${tab.color}` : "2px solid transparent",
                          border: "none", borderBottomStyle: "solid", borderBottomWidth: 2,
                          borderBottomColor: procTab === tab.key ? tab.color : "transparent",
                          color: procTab === tab.key ? tab.color : t.tx2,
                          cursor: "pointer", fontFamily: FONT,
                        }}>{tab.label}</button>
                      ))}
                    </div>

                    {/* Section A: Benchmarks & Quartile Scoring */}
                    {procTab === "benchmarks" && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                          <button onClick={() => callCatalyst(proc.id,
                            `You are a benchmarking expert for ${baseline.industry} companies. For the process "${proc.label}" (APQC ${proc.l4}), provide TWO sections:\n\nSECTION 1 — TRADITIONAL BENCHMARKS\nProvide 3-5 specific benchmark suggestions from published sources. Include: KPI name, benchmark value with unit, source/year, and brief calculation methodology.\n\nSECTION 2 — AI AGENT IMPACT BENCHMARKS\nFor this same process, what efficiency gains have AI agents achieved? Include: agent type, % efficiency improvement, source/case study. Be specific and quantitative.`,
                            setCatalystResults, setCatalystLoading
                          )} disabled={catalystLoading[proc.id]}
                            style={{ fontSize: 10, padding: "4px 12px", borderRadius: 6, background: GOLD + "15", border: `1px solid ${GOLD}33`, color: GOLD, cursor: catalystLoading[proc.id] ? "wait" : "pointer", fontFamily: FONT, fontWeight: 600 }}>
                            {catalystLoading[proc.id] ? "⟳ Loading..." : "⚡ Catalyst"}
                          </button>
                        </div>
                        <div style={{ display: "grid", gap: 10 }}>
                          {(proc.kpis || []).map((kpi, ki) => {
                            const currentVal = vals[`kpi_current_${ki}`] ?? kpi.current;
                            const selectedSource = bmarks[`src_${ki}`] || "primary";
                            const seed = (proc.id + ki).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
                            const jitter = (n) => +(((seed * (n + 1) * 9301 + 49297) % 233280) / 233280 * 0.3 + 0.85).toFixed(1);
                            const sources = [
                              { key: "primary", label: kpi.src || "APQC", value: kpi.benchmark },
                              { key: "sapvlm", label: "SAP VLM", value: kpi.benchmark ? +(kpi.benchmark * jitter(1)).toFixed(1) : null },
                              { key: "hackett", label: "Hackett", value: kpi.benchmark ? +(kpi.benchmark * jitter(2)).toFixed(1) : null },
                              { key: "custom", label: "Custom", value: bmarks[`bench_custom_${ki}`] ?? null },
                            ];
                            const activeBench = selectedSource === "custom" ? (bmarks[`bench_custom_${ki}`] ?? null) : sources.find(s => s.key === selectedSource)?.value ?? kpi.benchmark;
                            const gap = currentVal != null && activeBench != null ? Math.abs(currentVal - activeBench) : null;
                            const quartile = getQuartile(currentVal, activeBench, kpi);
                            return (
                              <div key={ki} style={{ padding: "10px 12px", background: t.bg, borderRadius: 8, border: `1px solid ${t.bdr}` }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                  <div>
                                    <div style={{ fontSize: 13, color: t.tx, fontWeight: 500 }}>{kpi.name} <span style={{ fontSize: 10, color: t.mut }}>({kpi.unit})</span></div>
                                    <div style={{ fontSize: 10, color: t.mut }}>{kpi.method || ""}</div>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {gap != null && <span style={{ fontSize: 14, fontFamily: "monospace", color: gap > 0 ? RED : GREEN, fontWeight: 700 }}>Gap: {gap.toFixed(1)}</span>}
                                    {quartile && <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: quartile.color + "20", color: quartile.color, fontWeight: 700 }}>{quartile.icon} {quartile.label}</span>}
                                  </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                  <span style={{ fontSize: 10, color: t.mut, minWidth: 50 }}>Current:</span>
                                  <span style={{ fontSize: 14, fontFamily: "monospace", color: currentVal != null ? t.tx : t.sub }}>{currentVal ?? "—"} <span style={{ fontSize: 9, color: t.mut }}>{kpi.unit}</span></span>
                                </div>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                                  <thead><tr>
                                    {["", "Source", "Value", "Unit"].map((h, i) => (
                                      <th key={i} style={{ padding: "3px 6px", borderBottom: `1px solid ${t.bdr}40`, textAlign: i === 2 ? "right" : "left", color: t.mut, fontWeight: 600, fontSize: 10 }}>{h}</th>
                                    ))}
                                  </tr></thead>
                                  <tbody>
                                    {sources.map(src => (
                                      <tr key={src.key} style={{ background: selectedSource === src.key ? (src.key === "primary" ? GREEN : GOLD) + "08" : "transparent" }}>
                                        <td style={{ padding: "4px 6px", borderBottom: `1px solid ${t.bdr}20`, width: 30 }}>
                                          <input type="radio" name={`src_${proc.id}_${ki}`} checked={selectedSource === src.key}
                                            onChange={() => { setBmark(`src_${ki}`, src.key); const val = src.key === "custom" ? (bmarks[`bench_custom_${ki}`] ?? null) : src.value; if (val != null) setBmark(`bench_${ki}`, val); }}
                                            style={{ accentColor: GREEN, cursor: "pointer" }} />
                                        </td>
                                        <td style={{ padding: "4px 6px", borderBottom: `1px solid ${t.bdr}20`, color: selectedSource === src.key ? t.tx : t.tx2, fontWeight: selectedSource === src.key ? 600 : 400 }}>{src.label}</td>
                                        <td style={{ padding: "4px 6px", borderBottom: `1px solid ${t.bdr}20`, textAlign: "right", fontFamily: "monospace" }}>
                                          {src.key === "custom" ? (
                                            <input type="number" value={bmarks[`bench_custom_${ki}`] ?? ""} onChange={e => { const v = parseFloat(e.target.value) || null; setBmark(`bench_custom_${ki}`, v); if (selectedSource === "custom") setBmark(`bench_${ki}`, v); }}
                                              placeholder="—" style={{ width: 60, background: t.card, border: `1px solid ${GOLD}33`, borderRadius: 4, padding: "2px 4px", color: GOLD, fontFamily: "monospace", fontSize: 12, textAlign: "center" }} />
                                          ) : (
                                            <span style={{ color: selectedSource === src.key ? GREEN : t.mut }}>{src.value ?? "—"}</span>
                                          )}
                                        </td>
                                        <td style={{ padding: "4px 6px", borderBottom: `1px solid ${t.bdr}20`, color: t.mut, fontSize: 10 }}>{kpi.unit}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          })}
                        </div>
                        {catalystResults[proc.id] && (
                          <div style={{ marginTop: 10, padding: 12, background: GOLD + "08", border: `1px solid ${GOLD}22`, borderRadius: 8 }}>
                            <div style={{ fontSize: 10, color: GOLD, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>⚡ Catalyst — Benchmarks & Agent Impact</div>
                            <div style={{ fontSize: 12, color: t.tx2, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{catalystResults[proc.id]}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Section B: SAP S/4HANA Optimization */}
                    {procTab === "sap" && (
                      <div>
                        {(proc.sap || []).length > 0 ? (proc.sap || []).map((sap, si) => (
                          <div key={si} style={{ padding: "10px 12px", background: t.bg, borderRadius: 8, border: `1px solid ${BLUE}15`, marginBottom: 4 }}>
                            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                              <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: BLUE + "18", color: BLUE, fontWeight: 700 }}>{sap.module}</span>
                              <span style={{ fontSize: 12, color: t.tx2 }}>{sap.desc}</span>
                            </div>
                            {sap.scenario && <div style={{ fontSize: 12, color: t.tx2, lineHeight: 1.5, fontStyle: "italic" }}>{sap.scenario}</div>}
                          </div>
                        )) : (
                          <div style={{ padding: 20, textAlign: "center", color: t.mut, border: `2px dashed ${t.bdr}`, borderRadius: 10 }}>No SAP modules mapped for this process</div>
                        )}
                      </div>
                    )}

                    {/* Section C: AI Agent Assessment */}
                    {procTab === "agents" && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                          <button onClick={() => callCatalyst(proc.id,
                            `You are an AI transformation consultant for ${baseline.industry} companies. For the process "${proc.label}" (APQC ${proc.l4}), provide a detailed AI agent assessment:\n\n1. AGENT NAME & TYPE\n2. WHAT IT DOES — Specific actions\n3. QUANTITATIVE IMPACT — Labor efficiency, cycle time, error reduction with numbers\n4. PUBLISHED CASE STUDIES — 2-3 real deployments\n5. IMPLEMENTATION — Complexity, timeline, prerequisites\n\nBe specific and quantitative.`,
                            setAgentResults, setAgentLoading
                          )} disabled={agentLoading[proc.id]}
                            style={{ fontSize: 11, padding: "6px 16px", borderRadius: 8, background: GOLD, border: "none", color: "#111", cursor: agentLoading[proc.id] ? "wait" : "pointer", fontFamily: FONT, fontWeight: 600 }}>
                            {agentLoading[proc.id] ? "⟳ Generating..." : "⚡ Generate Agent"}
                          </button>
                        </div>

                        {/* Three-column KPI comparison */}
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 12 }}>
                          <thead><tr>
                            {["KPI", "Today", "With S/4HANA", "With S/4 + Agent", "Agent Delta"].map((h, i) => (
                              <th key={i} style={{ padding: "5px 8px", borderBottom: `2px solid ${t.bdr}`, textAlign: i === 0 ? "left" : "right", color: t.mut, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: ".5px" }}>{h}</th>
                            ))}
                          </tr></thead>
                          <tbody>
                            {kpiRows.map(({ kpi, ki, current, bench, agentBench, agentImpact }) => {
                              const todayColor = (current != null && bench != null) ? (Math.abs(current - bench) / Math.abs(bench) > 0.35 ? RED : Math.abs(current - bench) / Math.abs(bench) > 0.1 ? GOLD : GREEN) : t.mut;
                              return (
                                <tr key={ki}>
                                  <td style={{ padding: "4px 8px", borderBottom: `1px solid ${t.bdr}40`, color: t.tx2, fontSize: 11 }}>{kpi.name} <span style={{ color: t.sub, fontSize: 9 }}>({kpi.unit})</span></td>
                                  <td style={{ padding: "4px 8px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", color: todayColor, fontWeight: 600 }}>{current != null ? current : "—"}</td>
                                  <td style={{ padding: "4px 8px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", color: GOLD }}>{bench != null ? bench : "—"}</td>
                                  <td style={{ padding: "4px 8px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", color: GREEN, fontWeight: 600 }}>{agentBench != null ? agentBench : "—"}</td>
                                  <td style={{ padding: "4px 8px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", color: agentImpact > 0 ? GREEN : t.sub, fontSize: 11 }}>{agentImpact > 0 ? `+$${agentImpact.toFixed(1)}M` : "—"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {/* Value summary */}
                        <div style={{ display: "flex", gap: 16, padding: "8px 0", borderTop: `1px solid ${t.bdr}`, marginBottom: 10 }}>
                          <span style={{ fontSize: 12, fontWeight: 600 }}><span style={{ color: GOLD }}>ERP Value:</span> <span style={{ fontFamily: "monospace", color: GOLD }}>{procErpVal > 0 ? `$${procErpVal.toFixed(1)}M` : "—"}</span></span>
                          <span style={{ fontSize: 12, fontWeight: 600 }}><span style={{ color: GREEN }}>Agent Uplift:</span> <span style={{ fontFamily: "monospace", color: GREEN }}>{procAgentVal > 0 ? `$${procAgentVal.toFixed(1)}M` : "—"}</span></span>
                          <span style={{ fontSize: 12, fontWeight: 700 }}><span style={{ color: t.tx }}>Total:</span> <span style={{ fontFamily: "monospace", color: t.tx }}>{(procErpVal + procAgentVal) > 0 ? `$${(procErpVal + procAgentVal).toFixed(1)}M` : "—"}</span></span>
                        </div>

                        {agentResults[proc.id] ? (
                          <div style={{ padding: 14, background: GOLD + "08", border: `1px solid ${GOLD}22`, borderRadius: 10 }}>
                            <div style={{ fontSize: 10, color: GOLD, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>⚡ AI Agent Scenario</div>
                            <div style={{ fontSize: 12, color: t.tx2, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{agentResults[proc.id]}</div>
                          </div>
                        ) : (
                          <div style={{ padding: 16, border: `2px dashed ${t.bdr}`, borderRadius: 10, textAlign: "center" }}>
                            <div style={{ fontSize: 12, color: t.mut }}>Click "Generate Agent" to have Catalyst describe an AI agent for this process</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <button onClick={() => setStep(3)} style={btnSecondary}>← Value Setting</button>
              <button onClick={() => setStep(5)} style={btnPrimary}>Value Calculation →</button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            STEP 5 — Value Calculation
           ═══════════════════════════════════════════════ */}
        {step === 5 && (
          <div>
            {stepHeader(5, "Value Calculation")}
            <div style={{ fontSize: 13, color: t.tx2, marginBottom: 20 }}>Baseline vs benchmark gap → addressable value → scenario rollup.</div>

            {/* Scenario selector — "Set All" convenience */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: t.mut }}>Set All:</span>
              {SCENARIO_LEVELS.map(lvl => (
                <button key={lvl} onClick={() => {
                  setScenarioLevel(lvl);
                  setProcScenarios(prev => {
                    const updated = { ...prev };
                    selProcs.forEach(p => { updated[p.id] = { ...(updated[p.id] || {}), potential: lvl }; });
                    return updated;
                  });
                }} style={{
                  fontSize: 12, padding: "6px 16px", borderRadius: 8,
                  background: scenarioLevel === lvl ? (lvl === "High" ? GREEN + "20" : lvl === "Medium" ? GOLD + "20" : ORANGE + "20") : "none",
                  border: `1px solid ${scenarioLevel === lvl ? (lvl === "High" ? GREEN : lvl === "Medium" ? GOLD : ORANGE) + "44" : t.bdr}`,
                  color: scenarioLevel === lvl ? (lvl === "High" ? GREEN : lvl === "Medium" ? GOLD : ORANGE) : t.tx2,
                  cursor: "pointer", fontFamily: FONT, fontWeight: 600
                }}>{lvl} ({lvl === "High" ? "100%" : lvl === "Medium" ? "65%" : "35%"})</button>
              ))}
              <div style={{ flex: 1 }} />
              <button onClick={() => {
                const name = prompt("Scenario name:", `${scenarioLevel} Scenario`);
                if (name) setSavedScenarios(p => [...p, { name, level: scenarioLevel, value: valResult.total, count: selProcs.length }]);
              }} style={{ ...btnPrimary, padding: "8px 20px", fontSize: 13 }}>Save Scenario</button>
            </div>

            {/* Summary KPIs — ERP / Agent / Combined split */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
              {[
                { l: "ERP Value", v: fd(valResult.total), c: GOLD },
                { l: "Agent Uplift", v: fd(valResult.agentTotal), c: GREEN },
                { l: "Combined", v: fd(valResult.combined), c: "#FFFFFF", large: true },
                { l: "Scenario", v: scenarioLevel, c: scenarioLevel === "High" ? GREEN : scenarioLevel === "Medium" ? GOLD : ORANGE },
              ].map(k => (
                <div key={k.l} style={{ background: `${k.c}0C`, border: `1px solid ${k.c}22`, borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: k.c, textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 600, marginBottom: 4 }}>{k.l}</div>
                  <div style={{ fontSize: k.large ? 28 : 22, fontFamily: SERIF, color: k.c, fontWeight: k.large ? 700 : 400 }}>{k.v}</div>
                </div>
              ))}
            </div>

            {/* Value by E2E */}
            <div style={labelStyle}>Value by End-to-End Process</div>
            {(() => {
              const e2eData = {};
              valResult.impacts.forEach(imp => {
                if (!e2eData[imp.e2e]) e2eData[imp.e2e] = 0;
                e2eData[imp.e2e] += imp.value;
              });
              const chartData = Object.entries(e2eData).map(([name, value]) => ({ name, value: Math.round(value * 10) / 10 })).filter(d => d.value > 0);
              return chartData.length > 0 ? (
                <div style={{ height: 220, marginBottom: 24 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 40 }} barSize={48}>
                      <XAxis dataKey="name" tick={{ fill: t.tx2, fontSize: 11 }} angle={-15} textAnchor="end" axisLine={{ stroke: t.bdr }} tickLine={false} />
                      <YAxis tick={{ fill: t.mut, fontSize: 11, fontFamily: "monospace" }} axisLine={{ stroke: t.bdr }} tickLine={false} tickFormatter={v => `$${v}M`} />
                      <Tooltip contentStyle={{ background: t.card, border: `1px solid ${t.bdr}`, borderRadius: 8, fontSize: 13, color: t.tx }} formatter={v => [`$${v}M`, "Value"]} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {chartData.map((d, i) => <Cell key={i} fill={[BLUE, PURPLE, GREEN, GOLD][i % 4]} fillOpacity={0.75} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ padding: 20, textAlign: "center", color: t.mut, marginBottom: 24, border: `2px dashed ${t.bdr}`, borderRadius: 10 }}>
                  Enter current KPI values in Step 3 to see value calculations
                </div>
              );
            })()}

            {/* P&L Impact Summary */}
            <div style={labelStyle}>P&L Impact Summary</div>
            {(() => {
              const { revImpact, cogsImpact, sgaImpact, agentRevImpact, agentCogsImpact, agentSgaImpact } = valResult.pnl;
              return (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 24 }}>
                  <thead><tr>{["Line Item", "Baseline", "ERP Impact", "Agent Impact", "Combined", "Improved"].map((h, i) => (
                    <th key={i} style={{ padding: "8px 12px", borderBottom: `2px solid ${t.bdr}`, textAlign: i === 0 ? "left" : "right", color: t.mut, fontWeight: 600, fontSize: 12 }}>{h}</th>
                  ))}</tr></thead>
                  <tbody>
                    {[
                      { l: "Revenue", base: baseline.revenue, imp: revImpact, agent: agentRevImpact || 0 },
                      { l: "COGS", base: baseline.cogs, imp: -cogsImpact, agent: -(agentCogsImpact || 0) },
                      { l: "Gross Profit", base: baseline.revenue - baseline.cogs, imp: revImpact + cogsImpact, agent: (agentRevImpact || 0) + (agentCogsImpact || 0) },
                      { l: "SG&A", base: baseline.sga, imp: -sgaImpact, agent: -(agentSgaImpact || 0) },
                      { l: "EBITDA", base: baseline.ebitda, imp: revImpact + cogsImpact + sgaImpact, agent: (agentRevImpact || 0) + (agentCogsImpact || 0) + (agentSgaImpact || 0) },
                    ].map(row => (
                      <tr key={row.l} style={{ background: row.l === "EBITDA" ? GOLD + "08" : "transparent" }}>
                        <td style={{ padding: "6px 12px", borderBottom: `1px solid ${t.bdr}40`, color: row.l === "EBITDA" ? GOLD : t.tx2, fontWeight: row.l === "EBITDA" ? 700 : 400 }}>{row.l}</td>
                        <td style={{ padding: "6px 12px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", fontSize: 13, color: t.mut }}>{fm(row.base)}</td>
                        <td style={{ padding: "6px 12px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", fontSize: 13, color: row.imp > 0 ? GOLD : row.imp < 0 ? GOLD : t.sub, fontWeight: 600 }}>{row.imp !== 0 ? fd(row.imp) : "—"}</td>
                        <td style={{ padding: "6px 12px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", fontSize: 13, color: row.agent > 0 ? GREEN : row.agent < 0 ? GREEN : t.sub, fontWeight: 600 }}>{row.agent !== 0 ? fd(row.agent) : "—"}</td>
                        <td style={{ padding: "6px 12px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", fontSize: 13, color: (row.imp + row.agent) !== 0 ? t.tx : t.sub, fontWeight: 600 }}>{(row.imp + row.agent) !== 0 ? fd(row.imp + row.agent) : "—"}</td>
                        <td style={{ padding: "6px 12px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", fontSize: 13, color: row.l === "EBITDA" ? GOLD : t.tx, fontWeight: row.l === "EBITDA" ? 700 : 500 }}>{fm(row.base + row.imp + row.agent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}

            {/* Balance Sheet / Working Capital Impact */}
            {valResult.balanceSheet.totalWorkingCapital > 0 && (
              <>
                <div style={labelStyle}>Working Capital Impact</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 24 }}>
                  <thead><tr>
                    {["Line Item", "Current ($M)", "Improvement", "Improved ($M)"].map((h, i) => (
                      <th key={i} style={{ padding: "8px 12px", borderBottom: `2px solid ${t.bdr}`, textAlign: i === 0 ? "left" : "right", color: t.mut, fontWeight: 600, fontSize: 12 }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {[
                      { l: "Accounts Receivable", base: baseline.recv, imp: -valResult.balanceSheet.receivablesImpact, c: GREEN },
                      { l: "Inventory", base: baseline.inventory, imp: -valResult.balanceSheet.inventoryImpact, c: GREEN },
                      { l: "Accounts Payable", base: baseline.pay, imp: valResult.balanceSheet.payablesImpact, c: BLUE },
                      { l: "Net Working Capital",
                        base: baseline.recv + baseline.inventory - baseline.pay,
                        imp: -(valResult.balanceSheet.receivablesImpact + valResult.balanceSheet.inventoryImpact - valResult.balanceSheet.payablesImpact),
                        c: GOLD },
                    ].map(row => (
                      <tr key={row.l} style={{ background: row.l === "Net Working Capital" ? GOLD + "08" : "transparent" }}>
                        <td style={{ padding: "6px 12px", borderBottom: `1px solid ${t.bdr}40`, color: row.l === "Net Working Capital" ? GOLD : t.tx2, fontWeight: row.l === "Net Working Capital" ? 700 : 400 }}>{row.l}</td>
                        <td style={{ padding: "6px 12px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", fontSize: 13, color: t.mut }}>{fm(row.base)}</td>
                        <td style={{ padding: "6px 12px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", fontSize: 13, color: GREEN, fontWeight: 600 }}>{row.imp !== 0 ? fd(row.imp) : "—"}</td>
                        <td style={{ padding: "6px 12px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", fontSize: 13, color: row.l === "Net Working Capital" ? GOLD : t.tx, fontWeight: row.l === "Net Working Capital" ? 700 : 500 }}>{fm(row.base + row.imp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {/* Process-level impact table */}
            <div style={labelStyle}>Value by L4 Process</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 24 }}>
              <thead><tr>{["APQC L4", "Process", "E2E", "Scenario", "Score", "ERP ($M)", "Agent ($M)", "Total ($M)"].map((h, i) => (
                <th key={i} style={{ padding: "6px 10px", borderBottom: `2px solid ${t.bdr}`, textAlign: i >= 5 ? "right" : "left", color: t.mut, fontWeight: 600, fontSize: 12 }}>{h}</th>
              ))}</tr></thead>
              <tbody>
                {valResult.impacts.filter(i => i.value > 0).map((imp, idx) => {
                  // Compute average quartile score for this process
                  const proc = PROC_MAP[imp.id];
                  const vals = procValues[imp.id] || {};
                  const bmarks = procBenchmarks[imp.id] || {};
                  let scoreSum = 0, scoreCount = 0;
                  (proc?.kpis || []).forEach((kpi, ki) => {
                    const current = vals[`kpi_current_${ki}`] ?? kpi.current;
                    const bench = bmarks[`bench_${ki}`] ?? kpi.benchmark;
                    const q = getQuartile(current, bench, kpi);
                    if (q) { scoreSum += q.score; scoreCount++; }
                  });
                  const avgScore = scoreCount > 0 ? scoreSum / scoreCount : null;
                  const scoreLabel = avgScore ? (avgScore >= 2.5 ? "Top" : avgScore >= 1.5 ? "Avg" : "Low") : null;
                  const scoreColor = avgScore ? (avgScore >= 2.5 ? GREEN : avgScore >= 1.5 ? GOLD : RED) : t.mut;
                  const lvl = imp.scenario || scenarioLevel;
                  const lvlColor = lvl === "High" ? GREEN : lvl === "Medium" ? GOLD : ORANGE;

                  return (
                    <tr key={idx}>
                      <td style={{ padding: "5px 10px", borderBottom: `1px solid ${t.bdr}40`, fontFamily: "monospace", fontSize: 11, color: t.mut }}>{imp.l4}</td>
                      <td style={{ padding: "5px 10px", borderBottom: `1px solid ${t.bdr}40`, color: t.tx }}>{imp.label}</td>
                      <td style={{ padding: "5px 10px", borderBottom: `1px solid ${t.bdr}40` }}>
                        <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: imp.color + "15", color: imp.color, fontWeight: 600 }}>{imp.e2e}</span>
                      </td>
                      <td style={{ padding: "5px 10px", borderBottom: `1px solid ${t.bdr}40` }}>
                        <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: lvlColor + "15", color: lvlColor, fontWeight: 600 }}>{lvl}</span>
                      </td>
                      <td style={{ padding: "5px 10px", borderBottom: `1px solid ${t.bdr}40` }}>
                        {scoreLabel ? <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: scoreColor + "15", color: scoreColor, fontWeight: 600 }}>{scoreLabel}</span> : <span style={{ fontSize: 10, color: t.sub }}>—</span>}
                      </td>
                      <td style={{ padding: "5px 10px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", color: GOLD, fontWeight: 700 }}>{fd(imp.value)}</td>
                      <td style={{ padding: "5px 10px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", color: GREEN, fontWeight: 600 }}>{imp.agentValue > 0 ? fd(imp.agentValue) : "—"}</td>
                      <td style={{ padding: "5px 10px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", color: t.tx, fontWeight: 700 }}>{fd(imp.value + (imp.agentValue || 0))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <button onClick={() => setStep(4)} style={btnSecondary}>← Benchmark</button>
              <button onClick={() => setStep(6)} style={btnPrimary}>Action Plan →</button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            STEP 6 — Phase 0 Action Plan
           ═══════════════════════════════════════════════ */}
        {step === 6 && (
          <div>
            {stepHeader(6, "Phase 0 Action Plan")}
            <div style={{ fontSize: 13, color: t.tx2, marginBottom: 20 }}>Assessment complete. Download deliverables, share with stakeholders, and define next steps.</div>

            {/* Hero Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 28 }}>
              {[
                { l: "Combined Value", v: fd(valResult.combined), c: "#FFFFFF", large: true },
                { l: "ERP Value", v: fd(valResult.total), c: GOLD },
                { l: "Agent Uplift", v: fd(valResult.agentTotal), c: GREEN },
                { l: "Processes", v: selProcs.length, c: BLUE },
                { l: "KPIs Assessed", v: totalKPIs, c: PURPLE },
              ].map(k => (
                <div key={k.l} style={{ background: `${k.c}0C`, border: `1px solid ${k.c}22`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: k.c, textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 600, marginBottom: 4 }}>{k.l}</div>
                  <div style={{ fontSize: k.large ? 28 : 22, fontFamily: SERIF, color: k.c, fontWeight: k.large ? 700 : 400 }}>{k.v}</div>
                </div>
              ))}
            </div>

            {/* Downloads — Three Cards */}
            <div style={labelStyle}>Deliverables</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
              <div style={{ ...cardStyle, textAlign: "center", padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.tx, marginBottom: 6 }}>Phase 0 Report</div>
                <div style={{ fontSize: 11, color: t.tx2, lineHeight: 1.5, marginBottom: 14 }}>Comprehensive assessment report with baseline analysis, benchmarks, and value calculations</div>
                <button onClick={generatePhase0Report} style={{ ...btnPrimary, padding: "10px 24px", fontSize: 13, width: "100%" }}>
                  ↓ Download Report
                </button>
              </div>
              <div style={{ ...cardStyle, textAlign: "center", padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.tx, marginBottom: 6 }}>Executive Deck</div>
                <div style={{ fontSize: 11, color: t.tx2, lineHeight: 1.5, marginBottom: 14 }}>Board-ready presentation with ERP vs Agent value split and process deep dives</div>
                <button onClick={() => generatePPTX({ baseline, selProcs, valResult, scenarioLevel, procValues, procBenchmarks, agentResults, baselineData, selectedFunction, totalKPIs, FUNCTIONS, PROC_MAP, getQuartile })} style={{ ...btnPrimary, padding: "10px 24px", fontSize: 13, width: "100%", background: BLUE }}>
                  ↓ Download PPTX
                </button>
              </div>
              <div style={{ ...cardStyle, textAlign: "center", padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.tx, marginBottom: 6 }}>Data Export</div>
                <div style={{ fontSize: 11, color: t.tx2, lineHeight: 1.5, marginBottom: 14 }}>Raw assessment data for further analysis or integration with other tools</div>
                <button onClick={exportSessionJSON} style={{ ...btnSecondary, padding: "10px 24px", fontSize: 13, width: "100%" }}>
                  ↓ Export JSON
                </button>
              </div>
            </div>

            {/* Share Section */}
            {assessmentId && isOwner && (
              <>
                <div style={labelStyle}>Share Assessment</div>
                <div style={{ ...cardStyle, marginBottom: 24, padding: 20 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <input value={shareEmail} onChange={e => setShareEmail(e.target.value)} placeholder="email@example.com"
                      onKeyDown={e => e.key === "Enter" && handleShare()}
                      style={{ flex: 1, padding: "10px 12px", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 8, color: t.tx, fontFamily: FONT, fontSize: 13, outline: "none" }} />
                    <select value={shareRole} onChange={e => setShareRole(e.target.value)}
                      style={{ padding: "10px", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 8, color: t.tx, fontFamily: FONT, fontSize: 12 }}>
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                    <button onClick={handleShare} disabled={shareLoading || !shareEmail.trim()}
                      style={{ padding: "10px 20px", borderRadius: 8, background: PURPLE, border: "none", color: "#fff", fontFamily: FONT, fontWeight: 600, fontSize: 13, cursor: shareLoading ? "wait" : "pointer", opacity: shareEmail.trim() ? 1 : 0.4 }}>
                      Share
                    </button>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(window.location.href); }}
                    style={{ padding: "8px 16px", borderRadius: 6, background: t.bg, border: `1px solid ${t.bdr}`, color: t.tx2, fontFamily: FONT, fontSize: 11, cursor: "pointer" }}>
                    Copy Assessment Link
                  </button>
                </div>
              </>
            )}

            {/* Next Steps — Auto-generated */}
            <div style={labelStyle}>Recommended Next Steps</div>
            <div style={{ ...cardStyle, padding: 20, marginBottom: 24 }}>
              {(() => {
                const topE2E = (() => { const e2eVals = {}; valResult.impacts.forEach(i => { e2eVals[i.e2e] = (e2eVals[i.e2e] || 0) + i.value; }); const sorted = Object.entries(e2eVals).sort((a, b) => b[1] - a[1]); return sorted[0]; })();
                const topAgent = valResult.impacts.filter(i => (i.agentValue || 0) > 0).sort((a, b) => (b.agentValue || 0) - (a.agentValue || 0))[0];
                const bottomQuartile = (() => { let count = 0; selProcs.forEach(p => { (p.kpis || []).forEach((kpi, ki) => { const current = procValues[p.id]?.[`kpi_current_${ki}`] ?? kpi.current; const bench = procBenchmarks[p.id]?.[`bench_${ki}`] ?? kpi.benchmark; const q = getQuartile(current, bench, kpi); if (q && q.score < 1.5) count++; }); }); return count; })();
                const leastData = selProcs.filter(p => !Object.keys(baselineData).some(k => k.startsWith(p.id))).length;

                const steps = [];
                if (topE2E) steps.push({ n: 1, text: `Prioritize ${topE2E[0]} — $${topE2E[1].toFixed(1)}M addressable value`, c: GOLD });
                if (topAgent) steps.push({ n: steps.length + 1, text: `Deploy AI agents for ${topAgent.label} — $${topAgent.agentValue.toFixed(1)}M incremental uplift`, c: GREEN });
                if (bottomQuartile > 0) steps.push({ n: steps.length + 1, text: `Address ${bottomQuartile} Bottom Quartile KPIs to close performance gaps`, c: RED });
                if (leastData > 0) steps.push({ n: steps.length + 1, text: `Deep-dive baseline for ${leastData} processes with missing data`, c: PURPLE });
                steps.push({ n: steps.length + 1, text: "Initiate Phase 1 detailed design and implementation roadmap", c: BLUE });

                return (
                  <div style={{ display: "grid", gap: 8 }}>
                    {steps.map(s => (
                      <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: s.c + "08", border: `1px solid ${s.c}22`, borderRadius: 8 }}>
                        <span style={{ fontSize: 16, fontFamily: SERIF, color: s.c, fontWeight: 700, minWidth: 24 }}>{s.n}.</span>
                        <span style={{ fontSize: 13, color: t.tx, lineHeight: 1.5 }}>{s.text}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Saved Scenarios */}
            {savedScenarios.length > 0 && (
              <>
                <div style={labelStyle}>Saved Scenarios</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 8, marginBottom: 20 }}>
                  {savedScenarios.map((sc, i) => (
                    <div key={i} style={{ ...cardStyle, textAlign: "center" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: t.tx }}>{sc.name}</div>
                      <div style={{ fontSize: 22, fontFamily: SERIF, color: GOLD, margin: "6px 0" }}>{fd(sc.value)}</div>
                      <div style={{ fontSize: 11, color: t.mut }}>{sc.count} processes · {sc.level}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <button onClick={() => setStep(5)} style={btnSecondary}>← Value Calculation</button>
            </div>
          </div>
        )}

      </div>

      {/* ─── FOOTER ─── */}
      <div style={{ borderTop: `1px solid ${t.bdr}`, background: mode === "dark" ? "#131312" : "#EFEBE3", padding: "6px 24px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, color: t.mut, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>PrismL4</span>
        <div style={{ height: 10, width: 1, background: t.bdr }} />
        <span style={{ fontSize: 10, color: t.sub }}>Bottom-Up Value Identification Engine</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: t.sub }}>humaninthelead.ai</span>
      </div>
    </div>
  );
}
