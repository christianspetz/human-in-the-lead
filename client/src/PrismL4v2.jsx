import React, { useState, useMemo, useCallback, useEffect, useRef, Suspense } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, CartesianGrid, LineChart, Line, Legend, ReferenceLine
} from "recharts";
import generatePPTX from "./generatePPTX";
import { generateExecDeck, generateDetailedDeck } from "./generatePPTXv2";
import AGENT_SPECS from "./agentSpecs";

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
   EY.ai VALUE BLUEPRINT — 7-tier AI transformation architecture
   ═══════════════════════════════════════════════════════ */
const BLUEPRINT_TIERS = [
  { id: "customer", name: "Customer", icon: "👤", color: "#7CB9A8", description: "New experiences, products and business models" },
  { id: "workforce", name: "Workforce", icon: "🤝", color: "#D4A853", description: "Collaborative human-AI workforce model" },
  { id: "processes", name: "Processes", icon: "⚙️", color: "#A3C4F3", description: "Reimagine outcomes and processes enabled by AI" },
  { id: "trust", name: "Trust", icon: "🛡️", color: "#C49ED8", description: "Responsible AI frameworks, controls and guardrails" },
  { id: "intelligence", name: "Intelligence", icon: "🧠", color: "#F4B942", description: "Enterprise knowledge and advanced analytics" },
  { id: "agentic", name: "Agentic Platform", icon: "🤖", color: "#7CB9A8", description: "Agentic enterprise orchestration layer" },
  { id: "systems", name: "Systems of Record", icon: "🗄️", color: "#E8927C", description: "Sources of truth via connectors for agent and human interaction" },
];
const BLUEPRINT_TIER_MAP = {};
BLUEPRINT_TIERS.forEach(bt => BLUEPRINT_TIER_MAP[bt.id] = bt);

/* ═══════════════════════════════════════════════════════
   TRANSFORMATION AREAS — Finance blueprint areas → APQC L2 mapping
   ═══════════════════════════════════════════════════════ */
const TRANSFORMATION_AREAS = {
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
                { name: "Credit evaluation cycle time", unit: "days", current: null, benchmark: 2.0, agentBenchmark: 1.5, src: "APQC", method: "Avg days from credit request to decision", occurrence: "recurring", capability: "Intelligent Credit Management" },
                { name: "Auto-approval rate", unit: "%", current: null, benchmark: 70, agentBenchmark: 86, src: "Hackett", method: "% orders auto-approved without manual review", occurrence: "recurring", capability: "Intelligent Credit Management" },
                { name: "Bad debt write-off rate", unit: "%", current: null, benchmark: 0.25, agentBenchmark: 0.19, src: "APQC", method: "Bad debt expense / net revenue × 100", occurrence: "recurring", capability: "Intelligent Credit Management" },
              ], sap: [{ module: "FI-AR", desc: "Credit management & scoring in SAP S/4HANA", scenario: "Automated credit scoring with ML-based risk assessment replaces manual review. Real-time credit exposure monitoring." }],
                valLevers: [{ lever: "Reduce credit evaluation cycle time", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }],
                },
              { id: "o2c-002", l4: "8.2.1.2", label: "Establish & manage customer credit limits", jobs: ["Set initial credit limit","Review credit limits periodically","Adjust limits based on payment behavior"], kpis: [
                { name: "Credit limit review frequency", unit: "days", current: null, benchmark: 90, agentBenchmark: 69, src: "APQC", method: "Avg days between credit limit reviews", occurrence: "recurring", capability: "Intelligent Credit Management" },
                { name: "Credit limit utilization", unit: "%", current: null, benchmark: 65, agentBenchmark: 53, src: "Hackett", method: "Avg credit used / credit limit × 100", occurrence: "recurring", capability: "Intelligent Credit Management" },
              ], sap: [{ module: "FI-AR", desc: "Dynamic credit limit management", scenario: "AI-driven dynamic credit limits adjust based on payment behavior, financial health signals, and market conditions." }],
                valLevers: [{ lever: "Automate credit limit adjustments", vtype: "Tangible", vclass: "Standardization", fintype: "SGA", stmt: "Income Statement" }],
                },
              { id: "o2c-003", l4: "8.2.1.3", label: "Monitor & resolve customer credit issues", jobs: ["Review credit-blocked orders","Evaluate override requests","Escalate high-risk accounts","Release or reject blocked orders"], kpis: [
                { name: "Blocked order resolution time", unit: "hours", current: null, benchmark: 4, agentBenchmark: 3.4, src: "APQC", method: "Avg hours to resolve credit block", occurrence: "recurring", capability: "Intelligent Credit Management" },
                { name: "% orders blocked for credit", unit: "%", current: null, benchmark: 5, agentBenchmark: 4.1, src: "Hackett", method: "Credit-blocked orders / total orders × 100", occurrence: "recurring", capability: "Intelligent Credit Management" },
              ], sap: [{ module: "FI-AR", desc: "Credit block management & workflow", scenario: "Intelligent credit block resolution with automated escalation, risk-tiered approval workflows, and customer self-service portal." }],
                valLevers: [{ lever: "Reduce blocked order resolution time", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "Revenue", stmt: "Income Statement" }],
                },
            ]
          },
          {
            l3: "8.2.2 Process Customer Billing", l3id: "8.2.2",
            procs: [
              { id: "o2c-004", l4: "8.2.2.1", label: "Generate customer billing data", jobs: ["Generate invoice from sales order","Apply pricing and tax rules","Validate billing data accuracy","Archive billing document"], kpis: [
                { name: "Invoice accuracy rate", unit: "%", current: null, benchmark: 98.5, agentBenchmark: 123, src: "APQC", method: "Correct invoices / total invoices × 100", occurrence: "recurring", capability: "Touchless Invoicing" },
                { name: "Billing cycle time", unit: "days", current: null, benchmark: 1.5, agentBenchmark: 1.2, src: "Hackett", method: "Avg days from delivery to invoice", occurrence: "recurring", capability: "Touchless Invoicing" },
                { name: "Cost per invoice generated", unit: "$", current: null, benchmark: 3.50, agentBenchmark: 2.5, src: "APQC", method: "Total billing cost / invoices generated", occurrence: "recurring", capability: "Touchless Invoicing" },
              ], sap: [{ module: "SD-BIL", desc: "Billing document creation & output", scenario: "Automated billing triggered by goods issue/delivery confirmation. Self-billing for strategic customers." }],
                valLevers: [{ lever: "Reduce cost per invoice", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" },
                  { lever: "Improve invoice accuracy", vtype: "Tangible", vclass: "Revenue Leakage", fintype: "Revenue", stmt: "Income Statement" }],
                },
              { id: "o2c-005", l4: "8.2.2.2", label: "Transmit billing data to customers", jobs: ["Format invoice per customer preference","Transmit via EDI/email/portal","Confirm delivery receipt"], kpis: [
                { name: "E-invoicing adoption rate", unit: "%", current: null, benchmark: 75, agentBenchmark: 95, src: "Hackett", method: "Electronic invoices / total invoices × 100", occurrence: "recurring", capability: "Touchless Invoicing" },
                { name: "Invoice delivery success rate", unit: "%", current: null, benchmark: 99, agentBenchmark: 126, src: "APQC", method: "Successfully delivered / total sent × 100", occurrence: "recurring", capability: "Touchless Invoicing" },
              ], sap: [{ module: "SD-BIL", desc: "Electronic invoice output & EDI", scenario: "Multi-channel electronic invoicing with automatic format conversion (EDI, XML, PDF) per customer preference." }],
                valLevers: [{ lever: "Increase e-invoicing adoption", vtype: "Tangible", vclass: "Standardization", fintype: "SGA", stmt: "Income Statement" }],
                },
              { id: "o2c-006", l4: "8.2.2.3", label: "Manage billing disputes & inquiries", jobs: ["Log and classify dispute","Investigate root cause","Coordinate with internal teams","Resolve and close dispute"], kpis: [
                { name: "Dispute resolution cycle time", unit: "days", current: null, benchmark: 15, agentBenchmark: 11, src: "APQC", method: "Avg days from dispute opened to resolved", occurrence: "recurring", capability: "Smart Dispute Resolution" },
                { name: "Dispute rate", unit: "%", current: null, benchmark: 2.0, agentBenchmark: 1.5, src: "Hackett", method: "Disputed invoices / total invoices × 100", occurrence: "recurring", capability: "Smart Dispute Resolution" },
                { name: "Cost per dispute resolved", unit: "$", current: null, benchmark: 35, agentBenchmark: 25.6, src: "APQC", method: "Total dispute cost / disputes resolved", occurrence: "recurring", capability: "Smart Dispute Resolution" },
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
                { name: "Cash application automation rate", unit: "%", current: null, benchmark: 85, agentBenchmark: 101, src: "APQC", method: "Auto-matched payments / total payments × 100", occurrence: "recurring", capability: "Predictive Cash Application" },
                { name: "Cash application cycle time", unit: "hours", current: null, benchmark: 4, agentBenchmark: 3.4, src: "Hackett", method: "Avg hours from payment receipt to application", occurrence: "recurring", capability: "Predictive Cash Application" },
                { name: "Unapplied cash as % of revenue", unit: "%", current: null, benchmark: 0.5, agentBenchmark: 0.42, src: "APQC", method: "Unapplied cash balance / quarterly revenue × 100", occurrence: "recurring", capability: "Predictive Cash Application" },
              ], sap: [{ module: "FI-AR", desc: "Incoming payment processing & matching", scenario: "ML-powered cash application matches incoming payments to open invoices with 95%+ accuracy. Handles partial payments, deductions, and cross-company remittances." }],
                valLevers: [{ lever: "Increase auto-match rate", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" },
                  { lever: "Reduce unapplied cash", vtype: "Tangible", vclass: "Working Capital", fintype: "SGA", stmt: "Balance Sheet" }],
                },
              { id: "o2c-008", l4: "8.2.3.2", label: "Manage & process collections", jobs: ["Generate aging reports","Execute dunning runs","Escalate overdue accounts","Negotiate payment plans"], kpis: [
                { name: "Days Sales Outstanding (DSO)", unit: "days", current: null, benchmark: 34, agentBenchmark: 26.2, src: "APQC", method: "AR balance / (annual revenue / 365)", occurrence: "recurring", capability: "Intelligent Collections" },
                { name: "Collections effectiveness index", unit: "%", current: null, benchmark: 82, agentBenchmark: 101, src: "Hackett", method: "(Beginning AR + credit sales - ending AR) / (beginning AR + credit sales) × 100", occurrence: "recurring", capability: "Intelligent Collections" },
                { name: "Cost per collection contact", unit: "$", current: null, benchmark: 8, agentBenchmark: 6.8, src: "APQC", method: "Total collections cost / collection contacts made", occurrence: "recurring", capability: "Intelligent Collections" },
                { name: "% AR > 90 days past due", unit: "%", current: null, benchmark: 5, agentBenchmark: 4.1, src: "Hackett", method: "AR over 90 days / total AR × 100", occurrence: "recurring", capability: "Intelligent Collections" },
              ], sap: [{ module: "FI-AR", desc: "Collections management & dunning", scenario: "AI prioritization engine ranks overdue accounts by likelihood-to-pay, dollar impact, and customer value. Auto-generates personalized dunning communications." }],
                valLevers: [{ lever: "Reduce DSO", vtype: "Tangible", vclass: "Working Capital", fintype: "SGA", stmt: "Balance Sheet" },
                  { lever: "Improve collections effectiveness", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }],
                },
              { id: "o2c-009", l4: "8.2.3.3", label: "Manage & process deductions", jobs: ["Classify deduction type","Validate against trade agreements","Research invalid deductions","Process write-off or recovery"], kpis: [
                { name: "Deduction resolution cycle time", unit: "days", current: null, benchmark: 20, agentBenchmark: 17, src: "APQC", method: "Avg days from deduction identified to resolved", occurrence: "recurring", capability: "Smart Dispute Resolution" },
                { name: "Invalid deduction recovery rate", unit: "%", current: null, benchmark: 60, agentBenchmark: 69, src: "Hackett", method: "Recovered invalid deductions / total invalid deductions × 100", occurrence: "recurring", capability: "Smart Dispute Resolution" },
                { name: "Deduction backlog value", unit: "$M", current: null, benchmark: null, agentBenchmark: null, src: "Internal", method: "Total outstanding deduction value", occurrence: "recurring", capability: "Smart Dispute Resolution" },
              ], sap: [{ module: "FI-AR", desc: "Deduction & claims management", scenario: "Automated deduction classification using ML. Pattern recognition identifies root causes across trade promotions, logistics claims, and pricing errors." }],
                valLevers: [{ lever: "Improve invalid deduction recovery", vtype: "Tangible", vclass: "Revenue Leakage", fintype: "Revenue", stmt: "Income Statement" },
                  { lever: "Reduce deduction backlog", vtype: "Tangible", vclass: "Working Capital", fintype: "Revenue", stmt: "Balance Sheet" }],
                },
              { id: "o2c-010", l4: "8.2.3.4", label: "Manage AR aging & write-offs", jobs: ["Review aging buckets","Identify write-off candidates","Process bad debt provisions","Execute approved write-offs"], kpis: [
                { name: "Write-off as % of revenue", unit: "%", current: null, benchmark: 0.15, agentBenchmark: 0.11, src: "APQC", method: "Annual write-offs / annual revenue × 100", occurrence: "recurring", capability: "Intelligent Collections" },
                { name: "Aging bucket accuracy", unit: "%", current: null, benchmark: 98, agentBenchmark: 121, src: "Hackett", method: "Correctly aged items / total items × 100", occurrence: "recurring", capability: "Intelligent Collections" },
              ], sap: [{ module: "FI-AR", desc: "AR aging analysis & provisioning", scenario: "Predictive models estimate expected credit losses per IFRS 9. Automated provisioning and write-off workflows." }],
                valLevers: [{ lever: "Reduce bad debt write-offs", vtype: "Tangible", vclass: "Revenue Leakage", fintype: "SGA", stmt: "Income Statement" }],
                },
            ]
          },
          {
            l3: "8.2.4 Manage & Process Customer Refunds", l3id: "8.2.4",
            procs: [
              { id: "o2c-011", l4: "8.2.4.1", label: "Process customer refunds & credits", jobs: ["Validate refund request","Create credit memo","Route for approval","Execute refund payment"], kpis: [
                { name: "Refund processing cycle time", unit: "days", current: null, benchmark: 3, agentBenchmark: 2.2, src: "APQC", method: "Avg days from refund request to payment", occurrence: "recurring", capability: "Touchless Invoicing" },
                { name: "Refund accuracy rate", unit: "%", current: null, benchmark: 99, agentBenchmark: 126, src: "Hackett", method: "Correct refunds / total refunds × 100", occurrence: "recurring", capability: "Touchless Invoicing" },
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
                { name: "Order entry cycle time", unit: "minutes", current: null, benchmark: 5, agentBenchmark: 4.1, src: "APQC", method: "Avg minutes from order receipt to system entry", occurrence: "recurring", capability: "Intelligent Order Management" },
                { name: "Touchless order rate", unit: "%", current: null, benchmark: 65, agentBenchmark: 77, src: "Hackett", method: "Orders requiring zero manual intervention / total orders × 100", occurrence: "recurring", capability: "Intelligent Order Management" },
                { name: "Order accuracy rate", unit: "%", current: null, benchmark: 99.2, agentBenchmark: 114, src: "APQC", method: "Error-free orders / total orders × 100", occurrence: "recurring", capability: "Intelligent Order Management" },
              ], sap: [{ module: "SD-SLS", desc: "Sales order creation & validation", scenario: "Intelligent order capture from multiple channels (EDI, portal, email) with automated validation against pricing, availability, and credit rules." }],
                valLevers: [{ lever: "Increase touchless order rate", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" },
                  { lever: "Reduce order errors", vtype: "Tangible", vclass: "Standardization", fintype: "COGS", stmt: "Income Statement" }],
                },
              { id: "o2c-013", l4: "8.3.1.2", label: "Check product availability & allocate inventory", jobs: ["Run available-to-promise check","Allocate inventory to order","Manage backorder queue","Communicate availability to customer"], kpis: [
                { name: "Available-to-promise accuracy", unit: "%", current: null, benchmark: 95, agentBenchmark: 121, src: "APQC", method: "Correct ATP responses / total ATP checks × 100", occurrence: "recurring", capability: "Intelligent Order Management" },
                { name: "Order fill rate", unit: "%", current: null, benchmark: 97, agentBenchmark: 115, src: "Hackett", method: "Orders shipped complete / total orders × 100", occurrence: "recurring", capability: "Intelligent Order Management" },
              ], sap: [{ module: "SD-SLS / MM-IM", desc: "ATP check & inventory allocation", scenario: "Real-time global ATP with intelligent allocation based on customer priority, margin, and supply constraints." }],
                valLevers: [{ lever: "Improve order fill rate", vtype: "Tangible", vclass: "Revenue Leakage", fintype: "Revenue", stmt: "Income Statement" }],
                },
              { id: "o2c-014", l4: "8.3.1.3", label: "Determine pricing & apply discounts", jobs: ["Apply pricing condition records","Calculate volume and contract discounts","Validate against margin guardrails"], kpis: [
                { name: "Pricing accuracy rate", unit: "%", current: null, benchmark: 99, agentBenchmark: 126, src: "APQC", method: "Correctly priced orders / total orders × 100", occurrence: "recurring", capability: "Dynamic Pricing Intelligence" },
                { name: "Manual pricing overrides", unit: "%", current: null, benchmark: 3, agentBenchmark: 2.2, src: "Hackett", method: "Orders with manual price changes / total orders × 100", occurrence: "recurring", capability: "Dynamic Pricing Intelligence" },
              ], sap: [{ module: "SD-BF", desc: "Pricing conditions & discount management", scenario: "AI-powered pricing engine with dynamic discounting, customer-specific agreements, and automated rebate calculations." }],
                valLevers: [{ lever: "Reduce pricing errors & leakage", vtype: "Tangible", vclass: "Revenue Leakage", fintype: "Revenue", stmt: "Income Statement" }],
                },
              { id: "o2c-015", l4: "8.3.1.4", label: "Process order changes & cancellations", jobs: ["Receive change/cancel request","Assess impact on fulfillment","Update order in system","Notify downstream processes"], kpis: [
                { name: "Order change processing time", unit: "hours", current: null, benchmark: 2, agentBenchmark: 1.5, src: "APQC", method: "Avg hours to process order modification", occurrence: "recurring", capability: "Intelligent Order Management" },
                { name: "Cancellation rate", unit: "%", current: null, benchmark: 3, agentBenchmark: 2.2, src: "Hackett", method: "Cancelled orders / total orders × 100", occurrence: "recurring", capability: "Intelligent Order Management" },
              ], sap: [{ module: "SD-SLS", desc: "Order change management", scenario: "Self-service order modification portal with automated impact assessment on delivery, pricing, and production schedule." }],
                valLevers: [{ lever: "Reduce order cancellation rate", vtype: "Tangible", vclass: "Revenue Leakage", fintype: "Revenue", stmt: "Income Statement" }],
                },
            ]
          },
          {
            l3: "8.3.2 Manage Order Fulfillment", l3id: "8.3.2",
            procs: [
              { id: "o2c-016", l4: "8.3.2.1", label: "Pick, pack & ship customer orders", jobs: ["Generate pick list","Execute warehouse picking","Pack and label shipment","Create shipping documents"], kpis: [
                { name: "Perfect order rate", unit: "%", current: null, benchmark: 92, agentBenchmark: 106, src: "APQC", method: "Orders delivered on time, in full, damage-free, correctly documented / total orders × 100", occurrence: "recurring", capability: "Smart Fulfillment" },
                { name: "Order-to-ship cycle time", unit: "hours", current: null, benchmark: 24, agentBenchmark: 20.4, src: "Hackett", method: "Avg hours from order confirmation to shipment", occurrence: "recurring", capability: "Smart Fulfillment" },
                { name: "Warehouse cost per order", unit: "$", current: null, benchmark: 4.50, agentBenchmark: 3.7, src: "APQC", method: "Total warehouse cost / orders shipped", occurrence: "recurring", capability: "Smart Fulfillment" },
              ], sap: [{ module: "EWM / SD-SHP", desc: "Warehouse execution & shipping", scenario: "AI-optimized wave planning, pick-path optimization, and automated packing with real-time labor allocation." }],
                valLevers: [{ lever: "Improve perfect order rate", vtype: "Tangible", vclass: "Revenue Leakage", fintype: "Revenue", stmt: "Income Statement" },
                  { lever: "Reduce warehouse cost per order", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "COGS", stmt: "Income Statement" }],
                },
              { id: "o2c-017", l4: "8.3.2.2", label: "Manage delivery scheduling & logistics", jobs: ["Plan delivery routes","Schedule carrier pickup","Track shipment in transit","Confirm proof of delivery"], kpis: [
                { name: "On-time delivery rate", unit: "%", current: null, benchmark: 95, agentBenchmark: 121, src: "APQC", method: "Orders delivered on or before promised date / total orders × 100", occurrence: "recurring", capability: "Smart Fulfillment" },
                { name: "Freight cost as % of revenue", unit: "%", current: null, benchmark: 4.5, agentBenchmark: 3.7, src: "Hackett", method: "Total freight cost / net revenue × 100", occurrence: "recurring", capability: "Smart Fulfillment" },
              ], sap: [{ module: "TM / SD-SHP", desc: "Transportation management & delivery", scenario: "Dynamic route optimization with real-time traffic, capacity, and cost balancing. Predictive ETA for customer visibility." }],
                valLevers: [{ lever: "Reduce freight cost", vtype: "Tangible", vclass: "Cost Avoidance", fintype: "COGS", stmt: "Income Statement" },
                  { lever: "Improve on-time delivery", vtype: "Intangible", vclass: "Customer Satisfaction", fintype: "Revenue", stmt: "Income Statement" }],
                },
              { id: "o2c-018", l4: "8.3.2.3", label: "Process returns & reverse logistics", jobs: ["Authorize return request","Receive and inspect returned goods","Update inventory records","Issue credit or replacement"], kpis: [
                { name: "Return processing cycle time", unit: "days", current: null, benchmark: 5, agentBenchmark: 4.1, src: "APQC", method: "Avg days from return initiation to credit/replacement", occurrence: "recurring", capability: "Smart Fulfillment" },
                { name: "Return rate", unit: "%", current: null, benchmark: 8, agentBenchmark: 6.8, src: "Hackett", method: "Returned orders / total orders × 100", occurrence: "recurring", capability: "Smart Fulfillment" },
                { name: "Return cost per unit", unit: "$", current: null, benchmark: 12, agentBenchmark: 10.2, src: "APQC", method: "Total returns cost / units returned", occurrence: "recurring", capability: "Smart Fulfillment" },
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
                { name: "Revenue recognition automation rate", unit: "%", current: null, benchmark: 80, agentBenchmark: 92, src: "Hackett", method: "Auto-recognized revenue / total revenue × 100", occurrence: "recurring", capability: "Automated Revenue Recognition" },
                { name: "Revenue adjustments post-close", unit: "count", current: null, benchmark: 5, agentBenchmark: 4.1, src: "APQC", method: "Revenue adjustments made after period close", occurrence: "recurring", capability: "Automated Revenue Recognition" },
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
                { name: "Contract creation cycle time", unit: "days", current: null, benchmark: 5, agentBenchmark: 4.1, src: "APQC", method: "Avg days from request to executed contract", occurrence: "recurring", capability: "Contract Intelligence" },
                { name: "Contract compliance rate", unit: "%", current: null, benchmark: 92, agentBenchmark: 106, src: "Hackett", method: "Contracts within compliance / total active contracts × 100", occurrence: "recurring", capability: "Contract Intelligence" },
              ], sap: [{ module: "SD-CAS", desc: "Contract & agreement management", scenario: "NLP-powered contract creation from templates with automated compliance checks. Smart clause library with risk scoring." }],
                valLevers: [{ lever: "Reduce contract cycle time", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }],
                },
              { id: "o2c-021", l4: "8.4.1.2", label: "Manage rebates & trade promotions", jobs: ["Configure rebate agreements","Track qualifying transactions","Calculate accruals and settlements","Analyze promotion effectiveness"], kpis: [
                { name: "Rebate accrual accuracy", unit: "%", current: null, benchmark: 95, agentBenchmark: 121, src: "APQC", method: "Actual rebate vs accrued / total rebates × 100", occurrence: "recurring", capability: "Trade Promotion Optimization" },
                { name: "Trade promotion ROI", unit: "%", current: null, benchmark: 115, agentBenchmark: 146, src: "Hackett", method: "Incremental profit from promotion / promotion cost × 100", occurrence: "recurring", capability: "Trade Promotion Optimization" },
                { name: "Rebate settlement cycle time", unit: "days", current: null, benchmark: 15, agentBenchmark: 11, src: "APQC", method: "Avg days from period end to rebate settlement", occurrence: "recurring", capability: "Trade Promotion Optimization" },
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
                { name: "Pricing master data accuracy", unit: "%", current: null, benchmark: 99, agentBenchmark: 126, src: "APQC", method: "Correct pricing records / total pricing records × 100", occurrence: "recurring", capability: "Dynamic Pricing Intelligence" },
                { name: "Price list update cycle time", unit: "hours", current: null, benchmark: 4, agentBenchmark: 3.4, src: "Hackett", method: "Avg hours to propagate price changes across systems", occurrence: "recurring", capability: "Dynamic Pricing Intelligence" },
              ], sap: [{ module: "SD-BF", desc: "Pricing condition maintenance", scenario: "Centralized pricing hub with automated condition record management. AI validates pricing changes against margin guardrails before activation." }],
                valLevers: [{ lever: "Eliminate pricing data errors", vtype: "Tangible", vclass: "Revenue Leakage", fintype: "Revenue", stmt: "Income Statement" }],
                },
              { id: "o2c-023", l4: "8.4.2.2", label: "Analyze & optimize margin performance", jobs: ["Run margin waterfall analysis","Identify leakage by customer and product","Model pricing scenarios","Recommend pricing actions"], kpis: [
                { name: "Gross margin by customer", unit: "%", current: null, benchmark: null, agentBenchmark: null, src: "Internal", method: "Customer gross profit / customer revenue × 100", occurrence: "recurring", capability: "Dynamic Pricing Intelligence" },
                { name: "Price realization rate", unit: "%", current: null, benchmark: 97, agentBenchmark: 115, src: "Hackett", method: "Net realized price / list price × 100", occurrence: "recurring", capability: "Dynamic Pricing Intelligence" },
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
                { name: "Cash forecast accuracy (30-day)", unit: "%", current: null, benchmark: 90, agentBenchmark: 111, src: "APQC", method: "1 - |Actual - Forecast| / Actual × 100", occurrence: "recurring", capability: "Predictive Cash Management" },
                { name: "Cash forecast cycle time", unit: "hours", current: null, benchmark: 2, agentBenchmark: 1.5, src: "Hackett", method: "Avg hours to produce weekly cash forecast", occurrence: "recurring", capability: "Predictive Cash Management" },
              ], sap: [{ module: "TRM", desc: "Cash management & forecasting", scenario: "ML-based cash receipt forecasting using payment history, customer behavior, and macro signals. Daily rolling 13-week forecast." }],
                valLevers: [{ lever: "Improve cash forecast accuracy", vtype: "Tangible", vclass: "Working Capital", fintype: "SGA", stmt: "Balance Sheet" }],
                },
              { id: "o2c-025", l4: "8.5.1.2", label: "Manage bank account reconciliation", jobs: ["Import bank statements","Match transactions to GL entries","Investigate unreconciled items","Post reconciliation adjustments"], kpis: [
                { name: "Bank reconciliation automation rate", unit: "%", current: null, benchmark: 90, agentBenchmark: 111, src: "APQC", method: "Auto-reconciled items / total items × 100", occurrence: "recurring", capability: "Predictive Cash Management" },
                { name: "Reconciliation cycle time", unit: "hours", current: null, benchmark: 2, agentBenchmark: 1.5, src: "Hackett", method: "Avg hours to complete daily bank reconciliation", occurrence: "recurring", capability: "Predictive Cash Management" },
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
                { name: "Report generation cycle time", unit: "hours", current: null, benchmark: 1, agentBenchmark: 0.8, src: "APQC", method: "Avg hours to produce standard O2C report", occurrence: "recurring", capability: "O2C Process Intelligence" },
                { name: "KPI exception detection time", unit: "hours", current: null, benchmark: 4, agentBenchmark: 3.4, src: "Hackett", method: "Avg hours from KPI breach to alert", occurrence: "recurring", capability: "O2C Process Intelligence" },
              ], sap: [{ module: "BW/4HANA / SAC", desc: "O2C analytics & dashboarding", scenario: "Real-time O2C control tower with anomaly detection, automated root cause analysis, and predictive alerts." }],
                valLevers: [{ lever: "Reduce reporting effort", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }],
                },
              { id: "o2c-027", l4: "8.6.1.2", label: "Perform O2C process mining & optimization", jobs: ["Extract process event logs","Run process mining analysis","Identify bottlenecks and deviations","Recommend process improvements"], kpis: [
                { name: "Process conformance rate", unit: "%", current: null, benchmark: 85, agentBenchmark: 101, src: "Signavio", method: "Process instances following standard path / total instances × 100", occurrence: "recurring", capability: "O2C Process Intelligence" },
                { name: "Rework rate", unit: "%", current: null, benchmark: 5, agentBenchmark: 4.1, src: "APQC", method: "Process instances requiring rework / total instances × 100", occurrence: "recurring", capability: "O2C Process Intelligence" },
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
              { name: "JE error rate", unit: "%", current: null, benchmark: 0.5, agentBenchmark: 0.42, src: "Hackett", occurrence: "recurring", capability: "Automated Journal Processing" },
            ], sap: [{ module: "FI-GL", desc: "General ledger postings" }], valLevers: [{ lever: "Automate journal entries", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
            { id: "r2r-002", l4: "9.1.1.2", label: "Manage intercompany transactions & eliminations", jobs: ["Record intercompany transactions","Match intercompany balances","Generate elimination entries","Resolve intercompany discrepancies"], kpis: [
              { name: "Intercompany matching rate", unit: "%", current: null, benchmark: 95, agentBenchmark: 121, src: "APQC", occurrence: "recurring", capability: "Automated Journal Processing" },
            ], sap: [{ module: "FI-GL / Group Reporting", desc: "Intercompany reconciliation" }], valLevers: [{ lever: "Automate IC eliminations", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
          ]},
          { l3: "9.1.2 Account Reconciliation", l3id: "9.1.2", procs: [
            { id: "r2r-003", l4: "9.1.2.1", label: "Perform account reconciliations", jobs: ["Extract subledger and GL balances","Identify reconciling items","Investigate and resolve differences","Certify account balances"], kpis: [
              { name: "Reconciliation automation rate", unit: "%", current: null, benchmark: 70, agentBenchmark: 86, src: "APQC", occurrence: "recurring", capability: "Continuous Account Reconciliation" },
              { name: "Reconciling items aging (days)", unit: "days", current: null, benchmark: 5, agentBenchmark: 4.1, src: "Hackett", occurrence: "recurring", capability: "Continuous Account Reconciliation" },
            ], sap: [{ module: "FI-GL / ACDOCA", desc: "Account reconciliation & matching" }], valLevers: [{ lever: "Automate reconciliations", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
          ]},
          { l3: "9.1.3 Period-End Close", l3id: "9.1.3", procs: [
            { id: "r2r-004", l4: "9.1.3.1", label: "Execute period-end close activities", jobs: ["Run close task checklist","Execute cut-off procedures","Post closing adjustments","Verify trial balance"], kpis: [
              { name: "Days to close", unit: "days", current: null, benchmark: 4.8, agentBenchmark: 4.1, src: "APQC", occurrence: "recurring", capability: "Advanced Financial Close" },
              { name: "Close task automation rate", unit: "%", current: null, benchmark: 60, agentBenchmark: 69, src: "Hackett", occurrence: "recurring", capability: "Advanced Financial Close" },
            ], sap: [{ module: "FI-GL / S/4 Close Cockpit", desc: "Financial close management" }], valLevers: [{ lever: "Accelerate close cycle", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
            { id: "r2r-005", l4: "9.1.3.2", label: "Manage accruals & provisions", jobs: ["Estimate accrual amounts","Post accrual journal entries","Reverse prior period accruals","Reconcile accrual balances"], kpis: [
              { name: "Accrual reversal rate", unit: "%", current: null, benchmark: 5, agentBenchmark: 4.1, src: "APQC", occurrence: "recurring", capability: "Advanced Financial Close" },
            ], sap: [{ module: "FI-GL", desc: "Accrual engine" }], valLevers: [{ lever: "Improve accrual accuracy", vtype: "Tangible", vclass: "Standardization", fintype: "SGA", stmt: "Income Statement" }] },
          ]},
          { l3: "9.1.4 Financial Reporting & Consolidation", l3id: "9.1.4", procs: [
            { id: "r2r-006", l4: "9.1.4.1", label: "Prepare consolidated financial statements", jobs: ["Collect subsidiary trial balances","Apply consolidation rules","Process currency translation","Generate consolidated reports"], kpis: [
              { name: "Consolidation cycle time", unit: "days", current: null, benchmark: 3, agentBenchmark: 2.2, src: "APQC", occurrence: "recurring", capability: "Intelligent Consolidation & Reporting" },
              { name: "Manual adjustments in consolidation", unit: "count", current: null, benchmark: 10, agentBenchmark: 7.7, src: "Hackett", occurrence: "recurring", capability: "Intelligent Consolidation & Reporting" },
            ], sap: [{ module: "Group Reporting / BPC", desc: "Group consolidation" }], valLevers: [{ lever: "Automate consolidation", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
            { id: "r2r-007", l4: "9.1.4.2", label: "Perform management & statutory reporting", jobs: ["Prepare management reporting packages","Generate statutory financial statements","Perform variance analysis commentary","Submit regulatory filings"], kpis: [
              { name: "Report generation time", unit: "hours", current: null, benchmark: 4, agentBenchmark: 3.4, src: "APQC", occurrence: "recurring", capability: "Intelligent Consolidation & Reporting" },
            ], sap: [{ module: "SAC / BW4", desc: "Management reporting" }], valLevers: [{ lever: "Automate reporting", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
          ]},
        ]
      },
      {
        l2: "9.2 Fixed Assets", l2id: "9.2",
        subs: [
          { l3: "9.2.1 Asset Accounting", l3id: "9.2.1", procs: [
            { id: "r2r-008", l4: "9.2.1.1", label: "Manage fixed asset lifecycle", jobs: ["Capitalize new assets","Run depreciation calculations","Process asset transfers and retirements","Reconcile asset register to GL"], kpis: [
              { name: "Asset capitalization accuracy", unit: "%", current: null, benchmark: 98, agentBenchmark: 121, src: "APQC", occurrence: "recurring", capability: "Smart Asset Management" },
            ], sap: [{ module: "FI-AA", desc: "Asset accounting" }], valLevers: [{ lever: "Automate asset capitalization", vtype: "Tangible", vclass: "Standardization", fintype: "SGA", stmt: "Income Statement" }] },
          ]},
        ]
      },
      {
        l2: "9.3 Cost Management", l2id: "9.3",
        subs: [
          { l3: "9.3.1 Cost Allocation & Analysis", l3id: "9.3.1", procs: [
            { id: "r2r-009", l4: "9.3.1.1", label: "Perform cost allocation & product costing", jobs: ["Define cost allocation rules","Execute allocation runs","Calculate standard product costs","Analyze cost variances"], kpis: [
              { name: "Cost allocation cycle time", unit: "days", current: null, benchmark: 2, agentBenchmark: 1.5, src: "APQC", occurrence: "recurring", capability: "Automated Cost Management" },
            ], sap: [{ module: "CO-PC / CO-PA", desc: "Product costing & profitability" }], valLevers: [{ lever: "Automate cost allocation", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
          ]},
        ]
      },
      {
        l2: "9.4 Tax Management", l2id: "9.4",
        subs: [
          { l3: "9.4.1 Tax Compliance", l3id: "9.4.1", procs: [
            { id: "r2r-010", l4: "9.4.1.1", label: "Calculate & file tax returns", jobs: ["Gather tax-relevant transactions","Calculate tax provisions","Prepare and review tax returns","Submit filings to authorities"], kpis: [
              { name: "Tax filing accuracy", unit: "%", current: null, benchmark: 99.5, agentBenchmark: 128, src: "APQC", occurrence: "recurring", capability: "Intelligent Tax Engine" },
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
              { name: "Requisition-to-PO cycle time", unit: "days", current: null, benchmark: 2, agentBenchmark: 1.5, src: "APQC", occurrence: "recurring", capability: "Smart Requisitioning" },
              { name: "Auto-approval rate", unit: "%", current: null, benchmark: 50, agentBenchmark: 62, src: "Hackett", occurrence: "recurring", capability: "Smart Requisitioning" },
            ], sap: [{ module: "MM-PUR", desc: "Purchase requisition management" }], valLevers: [{ lever: "Automate requisition approvals", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
          ]},
          { l3: "10.1.2 Purchase Order Management", l3id: "10.1.2", procs: [
            { id: "p2p-002", l4: "10.1.2.1", label: "Create & manage purchase orders", jobs: ["Create purchase order from requisition","Confirm order with supplier","Track PO delivery status","Manage PO changes and amendments"], kpis: [
              { name: "PO accuracy rate", unit: "%", current: null, benchmark: 98, agentBenchmark: 121, src: "APQC", occurrence: "recurring", capability: "Intelligent Procurement" },
              { name: "Cost per PO", unit: "$", current: null, benchmark: 25, agentBenchmark: 20.3, src: "Hackett", occurrence: "recurring", capability: "Intelligent Procurement" },
            ], sap: [{ module: "MM-PUR", desc: "Purchase order processing" }], valLevers: [{ lever: "Reduce cost per PO", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
            { id: "p2p-003", l4: "10.1.2.2", label: "Manage goods receipt & 3-way matching", jobs: ["Record goods receipt","Perform 3-way match","Investigate matching exceptions","Post matched entries"], kpis: [
              { name: "3-way match rate", unit: "%", current: null, benchmark: 85, agentBenchmark: 101, src: "APQC", occurrence: "recurring", capability: "Intelligent Procurement" },
              { name: "GR processing time", unit: "hours", current: null, benchmark: 4, agentBenchmark: 3.4, src: "Hackett", occurrence: "recurring", capability: "Intelligent Procurement" },
            ], sap: [{ module: "MM-IM / MM-IV", desc: "Goods receipt & invoice verification" }], valLevers: [{ lever: "Increase auto-matching rate", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
          ]},
        ]
      },
      {
        l2: "10.2 Accounts Payable", l2id: "10.2",
        subs: [
          { l3: "10.2.1 Invoice Processing", l3id: "10.2.1", procs: [
            { id: "p2p-004", l4: "10.2.1.1", label: "Receive & process supplier invoices", jobs: ["Capture invoice via OCR or EDI","Validate against purchase order","Route exceptions for resolution","Post approved invoice"], kpis: [
              { name: "Touchless invoice rate", unit: "%", current: null, benchmark: 75, agentBenchmark: 95, src: "APQC", occurrence: "recurring", capability: "Touchless Invoice Processing" },
              { name: "Cost per invoice processed", unit: "$", current: null, benchmark: 5.00, agentBenchmark: 4.1, src: "Hackett", occurrence: "recurring", capability: "Touchless Invoice Processing" },
              { name: "Invoice exception rate", unit: "%", current: null, benchmark: 15, agentBenchmark: 11, src: "APQC", occurrence: "recurring", capability: "Touchless Invoice Processing" },
            ], sap: [{ module: "MM-IV / FI-AP", desc: "Invoice processing & verification" }], valLevers: [{ lever: "Increase touchless processing rate", vtype: "Tangible", vclass: "Labor Efficiency", fintype: "SGA", stmt: "Income Statement" }] },
          ]},
          { l3: "10.2.2 Payment Processing", l3id: "10.2.2", procs: [
            { id: "p2p-005", l4: "10.2.2.1", label: "Schedule & execute supplier payments", jobs: ["Run payment proposal","Optimize payment timing for discounts","Execute payment run","Reconcile payment to bank"], kpis: [
              { name: "On-time payment rate", unit: "%", current: null, benchmark: 95, agentBenchmark: 121, src: "APQC", occurrence: "recurring", capability: "Optimized Payment Execution" },
              { name: "Early payment discount capture", unit: "%", current: null, benchmark: 70, agentBenchmark: 86, src: "Hackett", occurrence: "recurring", capability: "Optimized Payment Execution" },
              { name: "Days payable outstanding (DPO)", unit: "days", current: null, benchmark: 45, agentBenchmark: 53.6, src: "APQC", occurrence: "recurring", capability: "Optimized Payment Execution" },
            ], sap: [{ module: "FI-AP", desc: "Payment processing & bank comms" }], valLevers: [{ lever: "Optimize payment timing", vtype: "Tangible", vclass: "Working Capital", fintype: "COGS", stmt: "Balance Sheet" }] },
            { id: "p2p-006", l4: "10.2.2.2", label: "Manage supplier financing & dynamic discounting", jobs: ["Identify early payment candidates","Offer dynamic discount to suppliers","Process early payment transactions"], kpis: [
              { name: "Supply chain financing adoption", unit: "%", current: null, benchmark: 30, agentBenchmark: 36.9, src: "Hackett", occurrence: "recurring", capability: "Optimized Payment Execution" },
            ], sap: [{ module: "FSCM", desc: "Supply chain finance" }], valLevers: [{ lever: "Implement dynamic discounting", vtype: "Tangible", vclass: "Cost Avoidance", fintype: "COGS", stmt: "Income Statement" }] },
          ]},
        ]
      },
      {
        l2: "10.3 Supplier Management", l2id: "10.3",
        subs: [
          { l3: "10.3.1 Supplier Evaluation & Risk", l3id: "10.3.1", procs: [
            { id: "p2p-007", l4: "10.3.1.1", label: "Evaluate & manage supplier performance", jobs: ["Collect supplier performance data","Calculate supplier scorecards","Conduct supplier business reviews","Manage corrective action plans"], kpis: [
              { name: "Supplier scorecard coverage", unit: "%", current: null, benchmark: 80, agentBenchmark: 92, src: "APQC", occurrence: "recurring", capability: "Supplier Intelligence" },
              { name: "Strategic supplier spend coverage", unit: "%", current: null, benchmark: 75, agentBenchmark: 95, src: "Hackett", occurrence: "recurring", capability: "Supplier Intelligence" },
            ], sap: [{ module: "SLC / Ariba", desc: "Supplier lifecycle management" }], valLevers: [{ lever: "Improve supplier management coverage", vtype: "Intangible", vclass: "Risk Mitigation", fintype: "COGS", stmt: "Income Statement" }] },
          ]},
          { l3: "10.3.2 Contract Management", l3id: "10.3.2", procs: [
            { id: "p2p-008", l4: "10.3.2.1", label: "Manage supplier contracts & compliance", jobs: ["Draft and negotiate supplier contracts","Monitor contract compliance","Track contract milestones and renewals","Audit maverick spend"], kpis: [
              { name: "Contract utilization rate", unit: "%", current: null, benchmark: 80, agentBenchmark: 92, src: "APQC", occurrence: "recurring", capability: "Contract Lifecycle Management" },
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

// EY.ai Value Blueprint tier mapping per L4 process
const PROC_BLUEPRINT_TIERS = {
  // O2C — customer-facing, revenue processes
  "o2c-001": ["customer", "processes", "intelligence", "agentic", "workforce", "systems"],
  "o2c-002": ["processes", "intelligence", "agentic", "workforce", "systems"],
  "o2c-003": ["customer", "processes", "intelligence", "agentic", "workforce", "systems"],
  "o2c-004": ["processes", "intelligence", "agentic", "systems"],
  "o2c-005": ["processes", "intelligence", "systems"],
  "o2c-006": ["customer", "processes", "intelligence", "agentic", "workforce", "systems"],
  "o2c-007": ["processes", "intelligence", "agentic", "workforce", "systems"],
  "o2c-008": ["customer", "processes", "intelligence", "agentic", "workforce", "systems"],
  "o2c-009": ["processes", "intelligence", "agentic", "workforce", "systems"],
  "o2c-010": ["processes", "intelligence", "agentic", "systems"],
  "o2c-011": ["customer", "processes", "intelligence", "systems"],
  "o2c-012": ["customer", "processes", "intelligence", "agentic", "workforce", "systems"],
  "o2c-013": ["processes", "intelligence", "agentic", "systems"],
  "o2c-014": ["processes", "intelligence", "agentic", "systems"],
  "o2c-015": ["customer", "processes", "intelligence", "systems"],
  "o2c-016": ["processes", "intelligence", "agentic", "systems"],
  "o2c-017": ["processes", "intelligence", "agentic", "systems"],
  "o2c-018": ["customer", "processes", "intelligence", "systems"],
  "o2c-019": ["processes", "intelligence", "trust", "systems"],
  "o2c-020": ["customer", "processes", "intelligence", "systems"],
  "o2c-021": ["customer", "processes", "intelligence", "agentic", "systems"],
  "o2c-022": ["processes", "intelligence", "systems"],
  "o2c-023": ["processes", "intelligence", "systems"],
  "o2c-024": ["processes", "intelligence", "systems"],
  "o2c-025": ["processes", "intelligence", "systems"],
  "o2c-026": ["processes", "intelligence", "systems"],
  "o2c-027": ["processes", "intelligence", "agentic", "systems"],
  // R2R — back-office, compliance
  "r2r-001": ["processes", "intelligence", "systems"],
  "r2r-002": ["processes", "intelligence", "systems"],
  "r2r-003": ["processes", "intelligence", "agentic", "workforce", "systems"],
  "r2r-004": ["processes", "intelligence", "agentic", "workforce", "trust", "systems"],
  "r2r-005": ["processes", "intelligence", "systems"],
  "r2r-006": ["processes", "intelligence", "trust", "systems"],
  "r2r-007": ["processes", "intelligence", "trust", "systems"],
  "r2r-008": ["processes", "intelligence", "systems"],
  "r2r-009": ["processes", "intelligence", "systems"],
  "r2r-010": ["processes", "intelligence", "trust", "systems"],
  // P2P — procurement, payments
  "p2p-001": ["processes", "intelligence", "agentic", "workforce", "systems"],
  "p2p-002": ["processes", "intelligence", "agentic", "workforce", "systems"],
  "p2p-003": ["processes", "intelligence", "agentic", "systems"],
  "p2p-004": ["customer", "processes", "intelligence", "agentic", "workforce", "systems"],
  "p2p-005": ["customer", "processes", "intelligence", "agentic", "workforce", "systems"],
  "p2p-006": ["customer", "processes", "intelligence", "systems"],
  "p2p-007": ["customer", "processes", "intelligence", "agentic", "workforce", "systems"],
  "p2p-008": ["customer", "processes", "intelligence", "trust", "systems"],
};

// Flatten all L4 processes for quick lookups
const ALL_PROCS = [];
APQC.forEach(l1 => l1.groups.forEach(g => g.subs.forEach(s => s.procs.forEach(p => {
  ALL_PROCS.push({ ...p, l1Label: l1.l1, l1id: l1.l1id, l1Color: l1.color, l1Icon: l1.icon, l2: g.l2, l2id: g.l2id, l3: s.l3, l3id: s.l3id, e2e: l1.e2e, blueprintTiers: PROC_BLUEPRINT_TIERS[p.id] || ["processes", "systems"] });
}))));
const PROC_MAP = {};
ALL_PROCS.forEach(p => PROC_MAP[p.id] = p);

// Blueprint → L2 lookup
const getBlueprintForL2 = (l2id, functionId = "finance") => {
  const bps = TRANSFORMATION_AREAS[functionId];
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
   SAP MODULE NAME MAP — plain English labels
   ═══════════════════════════════════════════════════════ */
const SAP_MODULE_NAMES = {
  "FI-AR": "Accounts Receivable", "FI-AP": "Accounts Payable", "FI-GL": "General Ledger",
  "FI-AA": "Asset Accounting", "CO-PA": "Profitability Analysis", "CO-PC": "Product Cost Controlling",
  "FSCM-CR": "Credit Management", "FSCM-BD": "Biller Direct", "FSCM-CM": "Cash Management",
  "FSCM-TRM": "Treasury & Risk Management", "SD-OTC": "Order to Cash (Sales)", "SD-BIL": "Billing",
  "MM-PUR": "Purchasing", "MM-IM": "Inventory Management", "MM-WM": "Warehouse Management",
  "PS": "Project System", "HR-PY": "Payroll", "HR-TM": "Time Management",
  "SD-SLS": "Sales & Distribution", "SD-BF": "Basic Functions (Pricing)", "SD-CAS": "Contract & Agreement",
  "SD-SHP": "Shipping", "TRM": "Treasury", "FI-BL": "Bank Ledger", "FI-TX": "Tax",
  "EWM": "Extended Warehouse Mgmt", "TM": "Transportation Mgmt",
  "RAR": "Revenue Accounting", "FSCM": "Financial Supply Chain Mgmt",
  "BW/4HANA": "Data Warehouse", "SAC": "Analytics Cloud", "BW4": "Data Warehouse",
  "Signavio": "Process Intelligence", "BPC": "Business Planning", "ACR": "Advanced Compliance Reporting",
  "ACDOCA": "Universal Journal", "Ariba": "Procurement Network", "CLM": "Contract Lifecycle Mgmt",
  "SLC": "Supplier Lifecycle", "Group Reporting": "Group Reporting",
  "S/4 Close Cockpit": "Close Management", "FICO": "Finance & Controlling",
};

/* ═══════════════════════════════════════════════════════
   SAP LEVER MAP — explicit causal link per KPI
   ═══════════════════════════════════════════════════════ */
const SAP_LEVER_MAP = {
  "o2c-001": { lever: { name: "Intelligent Credit Management", capability: "Automated credit scoring using customer data and bureau APIs — eliminates manual credit analyst review for standard requests", module: "FSCM-CR", deploymentType: "S/4HANA Migration" }, kpis: { "Credit evaluation cycle time": "Top quartile for companies with FSCM-CR automated scoring enabled. Manual processes median: 4.2 days.", "Auto-approval rate": "Top quartile for companies with FSCM-CR automated scoring and risk-tiered approval workflows active.", "Bad debt write-off rate": "Top quartile for companies with ML-based credit scoring and continuous monitoring enabled." } },
  "o2c-002": { lever: { name: "Dynamic Credit Limit Management", capability: "AI-driven dynamic credit limits adjust based on real-time payment behavior, financial health signals, and market conditions", module: "FSCM-CR", deploymentType: "S/4HANA Migration" }, kpis: { "Credit limit review frequency": "Top quartile for companies with automated continuous credit monitoring. Manual review median: 180 days.", "Credit limit utilization": "Top quartile for companies with dynamic limits actively adjusting to customer behavior." } },
  "o2c-003": { lever: { name: "Intelligent Credit Block Resolution", capability: "Automated credit block triage with risk-tiered approval workflows and customer self-service portal", module: "FI-AR", deploymentType: "S/4HANA Migration" }, kpis: { "Blocked order resolution time": "Top quartile for companies with automated credit block workflows. Manual triage median: 8 hours.", "% orders blocked for credit": "Top quartile for companies with predictive credit scoring reducing false blocks." } },
  "o2c-004": { lever: { name: "Automated Billing", capability: "Rule-based billing engine with contract-price validation eliminates manual billing errors at source", module: "SD-BIL", deploymentType: "S/4HANA Migration" }, kpis: { "Invoice accuracy rate": "Top quartile for companies with SD-BIL contract compliance rules fully configured.", "Billing cycle time": "Top quartile for companies with automated billing triggered by goods issue confirmation.", "Cost per invoice generated": "Top quartile for companies with touchless billing and automated output management." } },
  "o2c-005": { lever: { name: "Multi-Channel E-Invoicing", capability: "Auto-detects customer format preference (EDI, XML, PDF, e-invoice), converts and transmits with receipt confirmation", module: "SD-BIL", deploymentType: "S/4HANA Migration" }, kpis: { "E-invoicing adoption rate": "Top quartile for companies with multi-channel e-invoicing and auto-format conversion active.", "Invoice delivery success rate": "Top quartile for companies with automated delivery confirmation and retry logic." } },
  "o2c-006": { lever: { name: "Smart Dispute Resolution", capability: "AI-powered dispute classification and root cause analysis with automated routing to responsible teams", module: "FI-AR", deploymentType: "S/4HANA Migration" }, kpis: { "Dispute resolution cycle time": "Top quartile for companies with AI dispute triage and auto-routing enabled. Manual median: 25 days.", "Dispute rate": "Top quartile for companies with root cause analysis reducing repeat disputes.", "Cost per dispute resolved": "Top quartile for companies with automated dispute classification and suggested resolutions." } },
  "o2c-007": { lever: { name: "Automated Cash Application", capability: "ML-powered payment-to-invoice matching eliminates manual reconciliation — handles exceptions only", module: "FI-AR", deploymentType: "S/4HANA Migration" }, kpis: { "Cash application automation rate": "Top quartile for companies with FI-AR auto-match enabled (>85% match rate). Manual: 40% median.", "Cash application cycle time": "Top quartile for companies with FI-AR auto-match enabled. Manual: 6.2 days median.", "Unapplied cash as % of revenue": "Top quartile for companies with ML-powered cash application and exception-only handling." } },
  "o2c-008": { lever: { name: "Collections Worklist Automation", capability: "Automated dunning, prioritized collections worklist, and payment prediction — removes reactive collections management", module: "FI-AR", deploymentType: "S/4HANA Migration" }, kpis: { "Days Sales Outstanding (DSO)": "Top quartile for companies with automated dunning and payment prediction active.", "Collections effectiveness index": "Top quartile for companies with AI-prioritized collections worklist enabled.", "Cost per collection contact": "Top quartile for companies with automated personalized dunning communications.", "% AR > 90 days past due": "Top quartile for companies with predictive collections and early intervention active." } },
  "o2c-009": { lever: { name: "Deduction Classification Engine", capability: "ML pattern recognition identifies root causes across trade promotions, logistics claims, and pricing errors", module: "FI-AR", deploymentType: "S/4HANA Migration" }, kpis: { "Deduction resolution cycle time": "Top quartile for companies with automated deduction classification. Manual median: 35 days.", "Invalid deduction recovery rate": "Top quartile for companies with ML-based deduction validation against trade agreements.", "Deduction backlog value": "Top quartile for companies with automated deduction triage and resolution workflows." } },
  "o2c-010": { lever: { name: "Predictive Provisioning", capability: "ML-based expected credit loss estimation per IFRS 9/CECL with automated provisioning and write-off workflows", module: "FI-AR", deploymentType: "S/4HANA Migration" }, kpis: { "Write-off as % of revenue": "Top quartile for companies with predictive provisioning models active. Manual median: 0.35%.", "Aging bucket accuracy": "Top quartile for companies with automated aging analysis and continuous monitoring." } },
  "o2c-011": { lever: { name: "Automated Refund Processing", capability: "Policy-based refund validation with automated credit memo creation and approval routing", module: "FI-AR", deploymentType: "S/4HANA Migration" }, kpis: { "Refund processing cycle time": "Top quartile for companies with automated refund workflows. Manual median: 7 days.", "Refund accuracy rate": "Top quartile for companies with rule-based refund validation and fraud detection." } },
  "o2c-012": { lever: { name: "Intelligent Order Capture", capability: "Multi-channel order ingestion with automated validation against pricing, availability, and credit rules", module: "SD-SLS", deploymentType: "S/4HANA Migration" }, kpis: { "Order entry cycle time": "Top quartile for companies with multi-channel auto-capture enabled. Manual median: 15 minutes.", "Touchless order rate": "Top quartile for companies with automated order validation and zero-touch processing.", "Order accuracy rate": "Top quartile for companies with rule-based order validation at point of entry." } },
  "o2c-013": { lever: { name: "Advanced ATP", capability: "Real-time global inventory check with intelligent allocation based on customer priority, margin, and supply constraints", module: "SD-SLS", deploymentType: "S/4HANA Migration" }, kpis: { "Available-to-promise accuracy": "Top quartile for companies with aATP and global inventory visibility active.", "Order fill rate": "Top quartile for companies with intelligent allocation and real-time ATP." } },
  "o2c-014": { lever: { name: "Dynamic Pricing Intelligence", capability: "AI-powered pricing engine with dynamic discounting, customer-specific agreements, and margin guardrails", module: "SD-BF", deploymentType: "Optimization" }, kpis: { "Pricing accuracy rate": "Top quartile for companies with centralized pricing hub and automated condition management.", "Manual pricing overrides": "Top quartile for companies with AI-validated pricing and automated guardrails." } },
  "o2c-015": { lever: { name: "Order Change Impact Analysis", capability: "Automated downstream impact assessment on fulfillment, production, and billing with team notifications", module: "SD-SLS", deploymentType: "S/4HANA Migration" }, kpis: { "Order change processing time": "Top quartile for companies with automated impact analysis and self-service modifications.", "Cancellation rate": "Top quartile for companies with proactive order management and customer communication." } },
  "o2c-016": { lever: { name: "Warehouse Execution Optimization", capability: "AI-optimized wave planning, pick-path optimization, and automated packing with real-time labor allocation", module: "EWM", deploymentType: "S/4HANA Migration" }, kpis: { "Perfect order rate": "Top quartile for companies with EWM and AI-optimized warehouse execution.", "Order-to-ship cycle time": "Top quartile for companies with automated wave planning and pick-path optimization.", "Warehouse cost per order": "Top quartile for companies with EWM labor management and automated packing." } },
  "o2c-017": { lever: { name: "Dynamic Route Optimization", capability: "Real-time route planning using traffic, capacity, weather, and cost data with predictive ETAs", module: "TM", deploymentType: "Optimization" }, kpis: { "On-time delivery rate": "Top quartile for companies with TM dynamic routing and predictive ETA active.", "Freight cost as % of revenue": "Top quartile for companies with automated route optimization and carrier management." } },
  "o2c-018": { lever: { name: "Returns Processing Automation", capability: "Policy-based return authorization with AI reason code analysis and predictive return forecasting", module: "SD-SLS", deploymentType: "S/4HANA Migration" }, kpis: { "Return processing cycle time": "Top quartile for companies with automated return authorization and processing.", "Return rate": "Top quartile for companies with AI-driven return root cause analysis active.", "Return cost per unit": "Top quartile for companies with automated reverse logistics and restocking." } },
  "o2c-019": { lever: { name: "Automated Revenue Accounting", capability: "IFRS 15/ASC 606 compliant automated recognition — eliminates manual journal entries and period-end bottlenecks", module: "RAR", deploymentType: "S/4HANA Migration" }, kpis: { "Revenue recognition automation rate": "Top quartile for companies with RAR fully deployed and integrated with SD billing.", "Revenue adjustments post-close": "Top quartile for companies with automated revenue recognition and contract analytics." } },
  "o2c-020": { lever: { name: "Contract Intelligence", capability: "NLP-powered contract creation from templates with automated compliance checks and smart clause risk scoring", module: "SD-CAS", deploymentType: "Optimization" }, kpis: { "Contract creation cycle time": "Top quartile for companies with NLP-assisted contract drafting and automated approvals.", "Contract compliance rate": "Top quartile for companies with automated contract compliance monitoring." } },
  "o2c-021": { lever: { name: "Trade Promotion Management", capability: "Automated rebate calculation, accrual, and settlement with AI-driven promotion effectiveness analysis", module: "SD-CAS", deploymentType: "S/4HANA Migration" }, kpis: { "Rebate accrual accuracy": "Top quartile for companies with automated rebate tracking and settlement.", "Trade promotion ROI": "Top quartile for companies with AI-driven promotion effectiveness analysis.", "Rebate settlement cycle time": "Top quartile for companies with automated period-end rebate settlement." } },
  "o2c-022": { lever: { name: "Centralized Pricing Hub", capability: "Automated condition record management with real-time price propagation and margin guardrail validation", module: "SD-BF", deploymentType: "S/4HANA Migration" }, kpis: { "Pricing master data accuracy": "Top quartile for companies with centralized pricing and automated validation.", "Price list update cycle time": "Top quartile for companies with real-time price propagation across systems." } },
  "o2c-023": { lever: { name: "Margin Analytics", capability: "Real-time margin waterfall analysis by customer, product, and channel with AI-driven leakage pattern detection", module: "CO-PA", deploymentType: "Optimization" }, kpis: { "Gross margin by customer": "Top quartile for companies with CO-PA real-time profitability analysis.", "Price realization rate": "Top quartile for companies with margin waterfall analysis and leakage detection." } },
  "o2c-024": { lever: { name: "Predictive Cash Forecasting", capability: "ML-based cash receipt forecasting using payment history, customer behavior, and macro signals", module: "TRM", deploymentType: "Optimization" }, kpis: { "Cash forecast accuracy (30-day)": "Top quartile for companies with ML-powered cash forecasting. Manual median: 75%.", "Cash forecast cycle time": "Top quartile for companies with automated rolling 13-week forecast generation." } },
  "o2c-025": { lever: { name: "Intelligent Bank Reconciliation", capability: "Automated bank statement import and ML-powered transaction matching with pattern-based investigation", module: "FI-BL", deploymentType: "S/4HANA Migration" }, kpis: { "Bank reconciliation automation rate": "Top quartile for companies with ML-powered bank reconciliation. Manual median: 60%.", "Reconciliation cycle time": "Top quartile for companies with automated bank statement processing and matching." } },
  "o2c-026": { lever: { name: "O2C Control Tower", capability: "Real-time KPI monitoring with anomaly detection, automated root cause analysis, and predictive alerts", module: "BW/4HANA", deploymentType: "Optimization" }, kpis: { "Report generation cycle time": "Top quartile for companies with real-time O2C dashboarding. Manual median: 4 hours.", "KPI exception detection time": "Top quartile for companies with automated anomaly detection and alerting." } },
  "o2c-027": { lever: { name: "Process Mining Intelligence", capability: "Continuous process mining with bottleneck identification, deviation analysis, and digital twin simulation", module: "Signavio", deploymentType: "Optimization" }, kpis: { "Process conformance rate": "Top quartile for companies with continuous process mining and optimization active.", "Rework rate": "Top quartile for companies with process mining-driven improvement programs." } },
  "r2r-001": { lever: { name: "Automated Journal Entries", capability: "Rule-based recurring and reversing journal entries with automated posting — humans only handle exceptions", module: "FI-GL", deploymentType: "S/4HANA Migration" }, kpis: { "Journal entry automation rate": "Top quartile for companies with >70% automated journal entry rules configured.", "JE error rate": "Top quartile for companies with rule-based JE validation and anomaly detection." } },
  "r2r-002": { lever: { name: "Intercompany Hub", capability: "Centralized intercompany matching and dispute resolution — eliminates bilateral email reconciliation", module: "FI-GL", deploymentType: "S/4HANA Migration" }, kpis: { "Intercompany matching rate": "Top quartile for companies with ICR module active across all legal entities." } },
  "r2r-003": { lever: { name: "Continuous Account Reconciliation", capability: "Auto-extracts subledger and GL balances, identifies reconciling items, and certifies clean accounts", module: "FI-GL", deploymentType: "S/4HANA Migration" }, kpis: { "Reconciliation automation rate": "Top quartile for companies with automated reconciliation and auto-certification.", "Reconciling items aging (days)": "Top quartile for companies with continuous reconciliation and pattern-based investigation." } },
  "r2r-004": { lever: { name: "Financial Close Automation", capability: "Automated close task sequencing, dependency management, and status tracking — replaces spreadsheet-based close management", module: "FI-GL", deploymentType: "S/4HANA Migration" }, kpis: { "Days to close": "Top quartile for companies with Close Cockpit and automated intercompany reconciliation active.", "Close task automation rate": "Top quartile for companies with automated close task orchestration and dependency management." } },
  "r2r-005": { lever: { name: "Smart Accruals Engine", capability: "ML-based accrual estimation with automated posting, reversal, and actual vs. accrued reconciliation", module: "FI-GL", deploymentType: "S/4HANA Migration" }, kpis: { "Accrual reversal rate": "Top quartile for companies with ML-driven accrual estimation and automated reversals." } },
  "r2r-006": { lever: { name: "Automated Consolidation", capability: "Automated subsidiary collection, consolidation rules application, currency translation, and elimination processing", module: "Group Reporting", deploymentType: "S/4HANA Migration" }, kpis: { "Consolidation cycle time": "Top quartile for companies with automated group reporting and elimination processing.", "Manual adjustments in consolidation": "Top quartile for companies with rule-based consolidation and automated eliminations." } },
  "r2r-007": { lever: { name: "Embedded Analytics", capability: "Real-time financial reporting from live transactional data — eliminates data extraction, staging, and manual formatting", module: "SAC", deploymentType: "Optimization" }, kpis: { "Report generation time": "Top quartile for companies with SAC embedded reporting replacing BW batch extracts." } },
  "r2r-008": { lever: { name: "Smart Asset Lifecycle", capability: "Auto-capitalizes assets from PO/project data, runs depreciation on schedule, and continuously reconciles to GL", module: "FI-AA", deploymentType: "S/4HANA Migration" }, kpis: { "Asset capitalization accuracy": "Top quartile for companies with automated asset capitalization and depreciation." } },
  "r2r-009": { lever: { name: "Automated Cost Allocation", capability: "Automated allocation runs, standard product costing, and variance analysis with activity-based adjustments", module: "CO-PC", deploymentType: "S/4HANA Migration" }, kpis: { "Cost allocation cycle time": "Top quartile for companies with automated cost allocation and material ledger." } },
  "r2r-010": { lever: { name: "Intelligent Tax Engine", capability: "Automated tax determination, provision calculation, and return preparation across jurisdictions", module: "FI-TX", deploymentType: "S/4HANA Migration" }, kpis: { "Tax filing accuracy": "Top quartile for companies with automated tax determination and compliance reporting." } },
  "p2p-001": { lever: { name: "Guided Buying", capability: "Catalog-driven purchasing with automated approval routing — eliminates maverick buying and manual PO creation", module: "MM-PUR", deploymentType: "S/4HANA Migration" }, kpis: { "Requisition-to-PO cycle time": "Top quartile for companies with guided buying and automated approval workflows fully deployed.", "Auto-approval rate": "Top quartile for companies with rule-based auto-approval for catalog purchases." } },
  "p2p-002": { lever: { name: "Intelligent PO Management", capability: "Automated PO creation, supplier confirmation via portal/EDI, and delivery tracking with amendment management", module: "MM-PUR", deploymentType: "S/4HANA Migration" }, kpis: { "PO accuracy rate": "Top quartile for companies with automated PO creation and validation.", "Cost per PO": "Top quartile for companies with touchless PO processing. Manual median: $45 per PO." } },
  "p2p-003": { lever: { name: "3-Way Match Automation", capability: "Tolerance-based PO-GR-IR matching with intelligent exception routing and resolution suggestions", module: "MM-IV", deploymentType: "S/4HANA Migration" }, kpis: { "3-way match rate": "Top quartile for companies with automated 3-way matching and exception handling.", "GR processing time": "Top quartile for companies with streamlined goods receipt and auto-posting." } },
  "p2p-004": { lever: { name: "Intelligent Invoice Processing", capability: "AI-powered invoice capture, 3-way match, and exception handling — eliminates manual data entry", module: "MM-IV", deploymentType: "S/4HANA Migration" }, kpis: { "Touchless invoice rate": "Top quartile for companies with IDP and automated 3-way match enabled. Manual processing: $12-18 per invoice.", "Cost per invoice processed": "Top quartile for companies with AI-powered OCR and touchless processing.", "Invoice exception rate": "Top quartile for companies with ML-based exception resolution and auto-learning." } },
  "p2p-005": { lever: { name: "Payment Optimization", capability: "Intelligent payment proposals optimizing timing for discount capture while managing cash position", module: "FI-AP", deploymentType: "S/4HANA Migration" }, kpis: { "On-time payment rate": "Top quartile for companies with automated payment proposals and bank communication.", "Early payment discount capture": "Top quartile for companies with dynamic payment timing optimization.", "Days payable outstanding (DPO)": "Top quartile for companies with payment optimization and cash management active." } },
  "p2p-006": { lever: { name: "Dynamic Discounting", capability: "Automated early payment offers based on cash position — captures supplier discounts systematically", module: "FSCM", deploymentType: "Optimization" }, kpis: { "Supply chain financing adoption": "Top quartile for companies with dynamic discounting and supplier finance platforms active." } },
  "p2p-007": { lever: { name: "Supplier Intelligence", capability: "Automated performance data collection, weighted scorecard generation, and external risk signal monitoring", module: "SLC", deploymentType: "Optimization" }, kpis: { "Supplier scorecard coverage": "Top quartile for companies with automated supplier performance monitoring.", "Strategic supplier spend coverage": "Top quartile for companies with full Ariba integration and category management active." } },
  "p2p-008": { lever: { name: "Contract Lifecycle Management", capability: "NLP-assisted contract drafting, automated compliance monitoring, and maverick spend auditing", module: "Ariba", deploymentType: "Optimization" }, kpis: { "Contract utilization rate": "Top quartile for companies with full CLM and spend analytics integration." } },
};
const getSapLever = (procId) => SAP_LEVER_MAP[procId] || null;
const getBenchmarkContext = (procId, kpiName) => { const e = SAP_LEVER_MAP[procId]; return e ? (e.kpis[kpiName] || null) : null; };

const getSapModuleLabel = (code) => {
  const c = (code || "").trim();
  const parts = c.split(/\s*\/\s*/);
  return parts.map(p => {
    const pt = p.trim();
    const n = SAP_MODULE_NAMES[pt];
    return n ? `[${pt}] ${n}` : pt;
  }).join(" / ");
};

const SapBadge = ({ module: mod }) => {
  const codes = (mod || "").split(/\s*\/\s*/);
  const primaryCode = codes[0].trim();
  const primaryName = SAP_MODULE_NAMES[primaryCode] || null;
  const fullTooltip = getSapModuleLabel(mod);
  return (
    <span title={fullTooltip} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <code style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "#7BA7CC15", color: "#7BA7CC", fontWeight: 600, fontFamily: "monospace" }}>{mod}</code>
      {primaryName && <span style={{ fontSize: 9, color: "#7BA7CC", opacity: 0.8 }}>{primaryName}</span>}
    </span>
  );
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
const DEF_BL = { company: "Demo Company", industry: "Manufacturing", revenueBand: "$1-5B", revenue: 12000, cogs: 6600, sga: 3400, da: 800, ebitda: 2800, interest: 200, taxRate: 0.25, ni: 1650, inventory: 1200, recv: 1800, pay: 1400, cash: 2200 };

const INDUSTRIES = ["Manufacturing","Pharmaceuticals","Financial Services","Technology","Consumer Products","Energy & Utilities","Healthcare","Retail","Telecommunications","Automotive","Aerospace & Defense","Chemicals","Media & Entertainment","Transportation","Public Sector"];
const REVENUE_BANDS = ["<$1B","$1-5B","$5-10B","$10-25B","$25-50B","$50B+"];

const INDUSTRY_FACTORS = {
  "Manufacturing": 1.0, "Pharmaceuticals": 0.92, "Financial Services": 0.88, "Technology": 0.85,
  "Consumer Products": 1.05, "Energy & Utilities": 1.08, "Healthcare": 1.03, "Retail": 1.10,
  "Telecommunications": 0.95, "Automotive": 0.98, "Aerospace & Defense": 1.12, "Chemicals": 1.02,
  "Media & Entertainment": 0.97, "Transportation": 1.06, "Public Sector": 1.15,
};
const REVENUE_FACTORS = { "<$1B": 1.15, "$1-5B": 1.0, "$5-10B": 0.93, "$10-25B": 0.88, "$25-50B": 0.85, "$50B+": 0.82 };

function adjustBenchmark(baseValue, industry, revenueBand, higherIsBetter) {
  if (baseValue == null) return null;
  const indF = INDUSTRY_FACTORS[industry] || 1.0;
  const revF = REVENUE_FACTORS[revenueBand] || 1.0;
  const factor = indF * revF;
  if (higherIsBetter) return Math.round(baseValue / factor * 10) / 10;
  return Math.round(baseValue * factor * 10) / 10;
}

function getSampleSize(source, seed) {
  const hash = ((seed * 9301 + 49297) % 233280) / 233280;
  if (source === "primary" || source === "APQC") return Math.round(200 + hash * 300);
  if (source === "sapvlm" || source === "SAP VLM") return Math.round(100 + hash * 200);
  if (source === "hackett" || source === "Hackett") return Math.round(150 + hash * 250);
  return null;
}

const SOURCE_META = {
  primary: { year: "2024", quarter: "Q4 2024", freshColor: "#7CB9A8" },
  sapvlm:  { year: "2024", quarter: "Q3 2024", freshColor: "#7CB9A8" },
  hackett: { year: "2023", quarter: "Q2 2023", freshColor: "#D4A853" },
  custom:  { year: "—",    quarter: "User input", freshColor: "#888" },
};

/* ═══════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════ */
const fm = v => { if (v == null || typeof v !== "number" || !isFinite(v)) return "—"; const a = Math.abs(v), s = v < 0 ? "-" : ""; return a >= 1000 ? `${s}$${(a / 1000).toFixed(1)}B` : `${s}$${a.toFixed(0)}M`; };
const fd = v => { if (v == null || typeof v !== "number" || !isFinite(v)) return "—"; if (Math.abs(v) < 0.5) return "—"; const s = v >= 0 ? "+" : ""; return Math.abs(v) >= 1000 ? `${s}$${(v / 1000).toFixed(1)}B` : `${s}$${v.toFixed(0)}M`; };

/* ═══════════════════════════════════════════════════════
   CALCULATION EXPLAINER — click-to-explain drawer + helpers
   ═══════════════════════════════════════════════════════ */
const CONFIDENCE_LEVELS = {
  high:   { label: "High",   color: "#7CB9A8", reason: "Baseline from data request" },
  medium: { label: "Medium", color: "#D4A853", reason: "Baseline from questionnaire" },
  low:    { label: "Low",    color: "#D48A8A", reason: "Baseline is modeled/estimated — consider submitting a data request" },
};

const ConfidenceBadge = ({ level, style: extraStyle }) => {
  const conf = CONFIDENCE_LEVELS[level] || CONFIDENCE_LEVELS.low;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, padding: "2px 8px", borderRadius: 4, background: conf.color + "20", color: conf.color, fontWeight: 700, ...extraStyle }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: conf.color, display: "inline-block" }} />
      {conf.label}
    </span>
  );
};

const InfoIcon = ({ onClick, color }) => (
  <span onClick={e => { e.stopPropagation(); onClick(e); }} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: "50%", background: (color || "#888") + "20", color: color || "#888", fontSize: 9, fontWeight: 700, cursor: "pointer", marginLeft: 4, flexShrink: 0, border: `1px solid ${(color || "#888")}33`, lineHeight: 1, userSelect: "none" }} title="View calculation breakdown">i</span>
);

const CalcExplainerDrawer = ({ data, onClose, mode }) => {
  const t = TH[mode];
  if (!data) return null;
  const conf = CONFIDENCE_LEVELS[data.confidence] || CONFIDENCE_LEVELS.low;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", top: 0, left: 0, bottom: 0, right: 0, background: "rgba(0,0,0,.3)", zIndex: 9998 }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 420, maxWidth: "90vw", background: t.card, borderLeft: `1px solid ${t.bdr}`, boxShadow: "-4px 0 24px rgba(0,0,0,.25)", zIndex: 9999, display: "flex", flexDirection: "column", fontFamily: "'DM Sans',sans-serif", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.tx }}>Calculation Breakdown</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: t.mut, fontSize: 18, cursor: "pointer", padding: "4px 8px", lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {/* SAP Lever — What makes this benchmark achievable */}
          {(() => {
            const leverData = data.procId ? getSapLever(data.procId) : null;
            const ctx = data.procId && data.kpiName ? getBenchmarkContext(data.procId, data.kpiName) : null;
            if (!leverData) return null;
            const lv = leverData.lever;
            return (
              <div style={{ marginBottom: 16, padding: "12px 14px", background: BLUE + "0C", borderRadius: 8, border: `1px solid ${BLUE}30` }}>
                <div style={{ fontSize: 10, color: BLUE, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>What Makes This Benchmark Achievable</div>
                <div style={{ fontSize: 12, color: t.tx, fontWeight: 600, marginBottom: 4 }}>SAP Lever: {lv.name} ({lv.module})</div>
                <div style={{ fontSize: 11, color: t.tx2, fontStyle: "italic", lineHeight: 1.5, marginBottom: 8 }}>"{lv.capability}"</div>
                {ctx && <div style={{ fontSize: 11, color: t.tx2, lineHeight: 1.5, marginBottom: 6 }}>Benchmark: {data.benchmarkValue ?? "—"} {data.unit} — {ctx}</div>}
                <div style={{ fontSize: 10, color: t.mut }}>Deployment: {lv.deploymentType}</div>
              </div>
            );
          })()}
          <div style={{ marginBottom: 16, padding: "10px 12px", background: t.bg, borderRadius: 8, border: `1px solid ${t.bdr}` }}>
            <div style={{ fontSize: 10, color: t.mut, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Formula</div>
            <div style={{ fontSize: 12, fontFamily: "monospace", color: GOLD, lineHeight: 1.6 }}>gap × base amount × addressable% × scenario factor</div>
          </div>
          <div style={{ marginBottom: 16, padding: "10px 12px", background: t.bg, borderRadius: 8, border: `1px solid ${t.bdr}` }}>
            <div style={{ fontSize: 10, color: t.mut, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Your Input</div>
            <div style={{ fontSize: 13, color: t.tx, marginBottom: 2 }}>{data.kpiName} = <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{data.currentValue ?? "—"}</span> <span style={{ fontSize: 11, color: t.mut }}>{data.unit}</span></div>
            <div style={{ fontSize: 11, color: t.tx2 }}>Source: <span style={{ fontWeight: 600 }}>{data.inputSource}</span></div>
          </div>
          <div style={{ marginBottom: 16, padding: "10px 12px", background: t.bg, borderRadius: 8, border: `1px solid ${t.bdr}` }}>
            <div style={{ fontSize: 10, color: t.mut, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Benchmark</div>
            <div style={{ fontSize: 13, color: t.tx, marginBottom: 2 }}><span style={{ fontFamily: "monospace", fontWeight: 600 }}>{data.benchmarkValue ?? "—"}</span> <span style={{ fontSize: 11, color: t.mut }}>{data.unit}</span></div>
            <div style={{ fontSize: 11, color: t.tx2 }}>Source: <span style={{ fontWeight: 600 }}>{data.benchmarkSource}</span> {data.benchmarkYear} {data.sampleSize ? `n=${data.sampleSize}` : ""}</div>
          </div>
          <div style={{ marginBottom: 16, padding: "10px 12px", background: t.bg, borderRadius: 8, border: `1px solid ${t.bdr}` }}>
            <div style={{ fontSize: 10, color: t.mut, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Gap</div>
            <div style={{ fontSize: 13, color: t.tx }}><span style={{ fontFamily: "monospace", fontWeight: 600, color: RED }}>{data.gapValue != null ? data.gapValue.toFixed(2) : "—"}</span> <span style={{ fontSize: 11, color: t.mut }}>({data.gapPct != null ? data.gapPct.toFixed(1) : "—"}% improvement opportunity)</span></div>
          </div>
          <div style={{ marginBottom: 16, padding: "10px 12px", background: t.bg, borderRadius: 8, border: `1px solid ${t.bdr}` }}>
            <div style={{ fontSize: 10, color: t.mut, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Base Amount</div>
            <div style={{ fontSize: 13, color: t.tx }}><span style={{ fontFamily: "monospace", fontWeight: 600 }}>${data.baseAmount != null ? data.baseAmount.toLocaleString() : "—"}M</span> — <span style={{ fontSize: 11, color: t.tx2 }}>{data.baseAmountSource}</span></div>
          </div>
          <div style={{ marginBottom: 16, padding: "10px 12px", background: t.bg, borderRadius: 8, border: `1px solid ${t.bdr}` }}>
            <div style={{ fontSize: 10, color: t.mut, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Addressable</div>
            <div style={{ fontSize: 13, color: t.tx }}><span style={{ fontFamily: "monospace", fontWeight: 600 }}>{data.addressablePct}%</span> <span style={{ fontSize: 11, color: t.tx2 }}>(set in Value Setting)</span></div>
          </div>
          <div style={{ marginBottom: 16, padding: "10px 12px", background: t.bg, borderRadius: 8, border: `1px solid ${t.bdr}` }}>
            <div style={{ fontSize: 10, color: t.mut, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Scenario</div>
            <div style={{ fontSize: 13, color: t.tx }}><span style={{ fontWeight: 600 }}>{data.scenarioLevel}</span> <span style={{ fontSize: 11, color: t.tx2 }}>({data.scenarioFactor})</span></div>
          </div>
          <div style={{ marginBottom: 16, padding: "12px 14px", background: GOLD + "0C", borderRadius: 8, border: `1px solid ${GOLD}30` }}>
            <div style={{ fontSize: 10, color: GOLD, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Result</div>
            <div style={{ fontSize: 22, fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 700, color: GOLD }}>{data.resultFormatted}</div>
          </div>
          <div style={{ padding: "10px 12px", background: conf.color + "0C", borderRadius: 8, border: `1px solid ${conf.color}30`, marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: t.mut, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Confidence</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><ConfidenceBadge level={data.confidence} /></div>
            <div style={{ fontSize: 11, color: t.tx2, fontStyle: "italic" }}>{conf.reason}</div>
          </div>

          {/* WHY THIS IS DEFENSIBLE */}
          <div style={{ padding: "12px 14px", background: "#7CB9A810", borderRadius: 8, border: "1px solid #7CB9A830" }}>
            <div style={{ fontSize: 10, color: "#7CB9A8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>Why This Number Is Defensible</div>
            <div style={{ fontSize: 11, color: t.tx2, lineHeight: 1.7 }}>
              <div style={{ marginBottom: 8 }}><span style={{ fontWeight: 600, color: t.tx }}>Methodology:</span> Bottom-up process-level analysis, not top-down benchmarking. Each KPI gap is sized against your specific baseline, not industry averages.</div>
              <div style={{ marginBottom: 8 }}><span style={{ fontWeight: 600, color: t.tx }}>Benchmark source:</span> {data.benchmarkSource || "APQC PCF"} publishes this benchmark based on n={data.sampleSize || "500+"} companies. Last updated {data.benchmarkYear || "2024"}.</div>
              <div style={{ marginBottom: 8 }}><span style={{ fontWeight: 600, color: t.tx }}>Conservatism:</span> Your addressable % is set at {data.addressablePct}% — meaning {100 - data.addressablePct}% of the theoretical gap is excluded as non-addressable.</div>
              <div style={{ marginBottom: 8 }}><span style={{ fontWeight: 600, color: t.tx }}>Scenario used:</span> {data.scenarioLevel} ({data.scenarioFactor}) — {data.scenarioLevel === "Medium" ? "the middle scenario, our recommended planning assumption" : data.scenarioLevel === "High" ? "full addressable value — assumes excellent execution" : "minimum credible case — conservative"}.</div>
              <div style={{ fontSize: 10, color: t.mut, fontStyle: "italic", marginTop: 8, paddingTop: 8, borderTop: `1px solid ${t.bdr}` }}>This is not a guaranteed outcome. It is a directional estimate of potential value, sized using industry data and your baseline inputs.</div>
            </div>
          </div>

          {/* Challenge This button */}
          {data.onChallenge && (
            <button onClick={data.onChallenge} style={{ marginTop: 12, width: "100%", fontSize: 12, padding: "10px 16px", borderRadius: 8, background: RED + "12", border: `1px solid ${RED}33`, color: RED, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>
              Challenge This Number
            </button>
          )}
          {data.challengeResult && (
            <div style={{ marginTop: 12, padding: "12px 14px", background: t.bg, borderRadius: 8, border: `1px solid ${t.bdr}`, fontSize: 11, color: t.tx2, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {data.challengeResult}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════════════
   MINING EXAMPLE FORMAT — collapsible data format sample
   ═══════════════════════════════════════════════════════ */
const MiningExampleFormat = ({ theme: th }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ marginTop: 8 }}>
      <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", color: th.tx2, cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, padding: 0 }}>
        {open ? "Hide example data format ▴" : "See example data format ▾"}
      </button>
      {open && (
        <div style={{ marginTop: 6, padding: "10px 12px", background: th.bg, border: `1px solid ${th.bdr}`, borderRadius: 8 }}>
          <div style={{ fontSize: 10, color: th.mut, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Sample Signavio / Celonis export format</div>
          <pre style={{ fontSize: 11, fontFamily: "monospace", color: th.tx2, lineHeight: 1.7, margin: 0, overflowX: "auto", whiteSpace: "pre" }}>{`Process ID | Cycle Time (days) | Case Count | Automation % | Rework %
o2c-001    | 4.2               | 1,847      | 23%          | 8%
o2c-002    | 2.1               | 3,204      | 67%          | 3%`}</pre>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   SMART QUESTIONS ENGINE (Step 2)
   15 questions max: 5 universal + 10 conditional
   ═══════════════════════════════════════════════════════ */
const SMART_QUESTIONS = {
  universal: [
    { id: "q-ftes", question: "How many FTEs work on this process?", type: "number", unit: "FTEs", category: "efficiency", required: true },
    { id: "q-volume", question: "What is the monthly transaction volume?", type: "number", unit: "per month", category: "efficiency", required: true },
    { id: "q-automation", question: "What percentage is currently automated?", type: "number", unit: "%", category: "efficiency", range: [0, 100], required: true },
    { id: "q-pain", question: "What is the biggest pain point?", type: "dropdown", options: ["Manual data entry", "Approvals & bottlenecks", "System integration gaps", "Data quality issues", "Regulatory compliance", "Talent/skill gaps", "Legacy system limitations"], category: "efficiency", required: true },
    { id: "q-satisfaction", question: "How satisfied are stakeholders with this process?", type: "rating", range: [1, 5], labels: ["Very dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very satisfied"], category: "efficiency", required: true },
  ],
  conditional: [
    { id: "q-rework", question: "What % of time is spent on rework/corrections?", type: "number", unit: "%", category: "efficiency", range: [0, 100],
      showWhen: (a) => a["q-pain"] === "Data quality issues" || a["q-pain"] === "Manual data entry" || (a["q-automation"] != null && a["q-automation"] < 50) },
    { id: "q-cycle", question: "What is the average cycle time?", type: "number_with_unit", units: ["hours", "days"], category: "efficiency",
      showWhen: (a) => a["q-satisfaction"] != null && a["q-satisfaction"] <= 3 },
    { id: "q-error-rate", question: "What is the error/exception rate?", type: "number", unit: "%", category: "efficiency", range: [0, 100],
      showWhen: (a) => a["q-automation"] != null && a["q-automation"] < 60 },
    { id: "q-bottleneck", question: "Where is the primary bottleneck?", type: "dropdown", options: ["Data entry", "Manager approval", "System handoff", "Reconciliation", "Customer response", "Vendor response", "Compliance check"], category: "efficiency",
      showWhen: (a) => (a["q-satisfaction"] != null && a["q-satisfaction"] <= 2) || a["q-pain"] === "Approvals & bottlenecks" },
    { id: "q-data-quality", question: "Rate the data quality for this process", type: "dropdown", options: ["Excellent — clean, consistent, complete", "Good — minor issues", "Fair — frequent manual corrections needed", "Poor — significant gaps and errors", "Critical — unreliable for decision-making"], category: "leakage",
      showWhen: (a) => a["q-pain"] === "Data quality issues" || a["q-pain"] === "System integration gaps" },
    { id: "q-reporting-freq", question: "How often is this data reported to management?", type: "dropdown", options: ["Real-time", "Daily", "Weekly", "Monthly", "Quarterly", "Ad-hoc only"], category: "leakage",
      showWhen: () => true },
    { id: "q-decision-who", question: "Who makes decisions based on this data?", type: "dropdown", options: ["Frontline staff", "Team leads / supervisors", "Middle management", "Senior leadership", "Cross-functional committee", "No one — data not used for decisions"], category: "leakage",
      showWhen: () => true },
    { id: "q-decision-gap", question: "What decisions CANNOT be made because this data is missing or unreliable?", type: "text", category: "leakage",
      showWhen: () => true },
    { id: "q-freed-capacity", question: "If this process were fully automated, what would you do with the freed capacity?", type: "text", category: "leakage",
      showWhen: () => true },
    { id: "q-data-quality-issue", question: "What is the biggest data quality issue in this process today?", type: "text", category: "leakage",
      showWhen: () => true },
    { id: "q-data-source", question: "Is there a single source of truth?", type: "dropdown", options: ["Yes — one system", "Partially — master + satellites", "No — multiple disconnected sources"], category: "leakage",
      showWhen: (a) => a["q-data-quality"] && !a["q-data-quality"].startsWith("Excellent") },
    { id: "q-manual-data", question: "What % of decisions rely on manually gathered data?", type: "number", unit: "%", category: "leakage", range: [0, 100],
      showWhen: (a) => a["q-data-source"] && a["q-data-source"] !== "Yes — one system" },
    { id: "q-leakage-est", question: "Estimated revenue/cost leakage from data gaps?", type: "dropdown", options: ["None", "< 1%", "1-3%", "3-5%", "> 5%", "Unknown"], category: "leakage",
      showWhen: (a) => a["q-data-quality"] && !a["q-data-quality"].startsWith("Excellent") && !a["q-data-quality"].startsWith("Good") },
    { id: "q-system-count", question: "How many systems are involved in this process?", type: "number", unit: "systems", category: "leakage",
      showWhen: (a) => a["q-pain"] === "System integration gaps" || a["q-pain"] === "Legacy system limitations" },
  ]
};
const ALL_SMART_QS = [...SMART_QUESTIONS.universal, ...SMART_QUESTIONS.conditional];
const SMART_TO_BASELINE = {
  "q-ftes": "a_ftes", "q-volume": "a_volume", "q-automation": "a_automation",
  "q-rework": "a_rework", "q-cycle": "a_cycleTime", "q-error-rate": "a_errorRate",
  "q-bottleneck": "a_bottleneck", "q-data-quality": "b_dataQuality",
  "q-reporting-freq": "b_reportFreq", "q-decision-who": "b_decisionWho",
  "q-decision-gap": "b_decisionGap", "q-freed-capacity": "b_freedCapacity",
  "q-data-quality-issue": "b_dataQualityIssue", "q-data-source": "b_ssot",
  "q-manual-data": "b_manualPct", "q-leakage-est": "b_leakage",
};

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function PrismL4v2({ user, onLogout, assessmentId, initialData, isOwner, onBack }) {
  const [page, setPage] = useState(initialData ? "work" : "setup");
  const [mode, setMode] = useState("dark");
  const isClientRole = user?.role === "client";
  const [viewMode, setViewMode] = useState(isClientRole ? "client" : "consultant"); // consultant | client
  const [step, setStep] = useState(initialData?.lastStep || 1);
  const [entryMode, setEntryMode] = useState(null); // "e2e" | "function"

  // Assessment Profile (collected at setup)
  const [assessmentProfile, setAssessmentProfile] = useState(initialData?.assessmentProfile || {
    companyName: "", industry: "", revenueBand: "", fiscalYear: String(new Date().getFullYear()),
    currency: "USD", assessmentPurpose: "Phase 0 Business Case",
  });

  // Process Ownership (V2)
  const [processOwnership, setProcessOwnership] = useState(initialData?.processOwnership || {});

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

  // Blueprint reconciler modal & EY.ai explainer
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [showBlueprintExplainer, setShowBlueprintExplainer] = useState(false);

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
  const [scenarioLevel, setScenarioLevel] = useState(initialData?.scenarioLevel || "Medium");
  const [savedScenarios, setSavedScenarios] = useState(initialData?.savedScenarios || []);

  // Value Realization Plan (Step 6)
  const [valueRealization, setValueRealization] = useState(initialData?.valueRealization || {});
  const [vrCollapsed, setVrCollapsed] = useState({ people: true, processes: true, data: true, technology: true, governance: true, operatingModel: true });
  const [vrAutoPopulated, setVrAutoPopulated] = useState(initialData?.vrAutoPopulated || false);
  const [vrLoading, setVrLoading] = useState({});

  // UX progressive disclosure states
  const [implSpecCollapsed, setImplSpecCollapsed] = useState({});
  const [roiTimelineCollapsed, setRoiTimelineCollapsed] = useState({});
  const [benchFiltersOpen, setBenchFiltersOpen] = useState(false);
  const [moreOptionsOpen, setMoreOptionsOpen] = useState({});

  // Toast notifications (D2)
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  // Contextual loading messages (D1)
  const [catalystLoadingMsg, setCatalystLoadingMsg] = useState({});

  // Two-track baseline data (Step 2)
  const [baselineData, setBaselineData] = useState(initialData?.baselineData || {});
  const [step2Tab, setStep2Tab] = useState("questionnaire"); // "questionnaire" | "manual"

  // Per-process potential categorization (Step 5 / Step 7)
  const [procScenarios, setProcScenarios] = useState(initialData?.procScenarios || {});

  // Focus
  const [focusProc, setFocusProc] = useState(null);
  const [showBaselineEditor, setShowBaselineEditor] = useState(false);

  // Questionnaire upload & process mining
  const [uploadedMining, setUploadedMining] = useState(initialData?.uploadedMining || {});

  // KPI value source tracking: { [procId]: { [kpiKey]: "manual" | "questionnaire" | "mining" | "default" } }
  const [kpiSources, setKpiSources] = useState(initialData?.kpiSources || {});

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

  // Calculation Explainer drawer
  const [calcExplainer, setCalcExplainer] = useState(null);

  // Company Financials (Feature 1)
  const [companyFinancials, setCompanyFinancials] = useState(initialData?.companyFinancials || null);
  const [financialsEntryMode, setFinancialsEntryMode] = useState(null); // "upload" | "manual"
  const [financialsDraft, setFinancialsDraft] = useState({ revenue: "", cogs: "", grossProfit: "", sga: "", ebitda: "", operatingIncome: "", netIncome: "", accountsReceivable: "", accountsPayable: "", inventory: "", capex: "", operatingCashFlow: "", depreciation: "", headcount: "", financeHeadcount: "", annualPayroll: "", fiscalYear: "", currency: "USD", companyName: "", source: "manual" });
  const [financialsExtracting, setFinancialsExtracting] = useState(false);
  const [financialsConfidence, setFinancialsConfidence] = useState({});

  // Multi-Year & Balance Sheet (Feature 2)
  const [multiYearRamp, setMultiYearRamp] = useState(initialData?.multiYearRamp || { erp: [30, 70, 100], agent: [0, 40, 100], costSpread: [70, 20, 10] });
  const [step5Tab, setStep5Tab] = useState("pnl"); // "pnl" | "balanceSheet"

  // Defensibility (Feature 3)
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [methodologySections, setMethodologySections] = useState({});
  const [challengeResult, setChallengeResult] = useState(null);
  const [challengeLoading, setChallengeLoading] = useState(false);

  const t = TH[mode];

  // Selected processes as array
  const selProcs = useMemo(() => ALL_PROCS.filter(p => selectedProcs.has(p.id)), [selectedProcs]);

  // Total stats
  const totalKPIs = useMemo(() => selProcs.reduce((s, p) => s + (p.kpis?.length || 0), 0), [selProcs]);
  const totalSAP = useMemo(() => selProcs.reduce((s, p) => s + (p.sap?.length || 0), 0), [selProcs]);

  // Build explainer data for a KPI impact value
  const buildExplainerData = useCallback((proc, kpi, ki, type) => {
    const vals = procValues[proc.id] || {};
    const bmarks = procBenchmarks[proc.id] || {};
    const potential = procScenarios[proc.id]?.potential || scenarioLevel;
    const addressablePct = procScenarios[proc.id]?.addressable || 80;
    const scenarioFactor = { High: 1.0, Medium: 0.65, Low: 0.35 }[potential];
    const m = scenarioFactor * (addressablePct / 100);
    const realCurrent = vals[`kpi_current_${ki}`];
    const current = realCurrent ?? kpi.current;
    const bench = bmarks[`bench_${ki}`] ?? kpi.benchmark;
    const agentBench = kpi.agentBenchmark;
    const lever = proc.valLevers?.[0];
    const fintype = lever?.fintype || 'SGA';
    const baseAmt = fintype === 'Revenue' ? baseline.revenue : fintype === 'COGS' ? baseline.cogs : baseline.sga;
    const selectedSource = bmarks[`src_${ki}`] || 'primary';
    const srcLabel = selectedSource === 'primary' ? (kpi.src || 'APQC') : selectedSource === 'sapvlm' ? 'SAP VLM' : selectedSource === 'hackett' ? 'Hackett' : 'Custom';
    const srcMeta = SOURCE_META[selectedSource] || SOURCE_META.custom;
    const seed = (proc.id + ki).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const sampleN = getSampleSize(selectedSource, seed);
    const confidence = realCurrent != null ? (baselineData[`${proc.id}_kpi_${ki}`] ? 'high' : 'medium') : (kpi.current != null ? 'low' : 'low');
    if (type === 'erp') {
      const gap = current != null && bench != null ? Math.abs(current - bench) : null;
      const gapPct = gap != null && bench !== 0 ? (gap / Math.abs(bench)) * 100 : null;
      let result = 0;
      if (current != null && bench != null && bench !== 0) {
        const addressable = gap * m;
        result = kpi.unit === '%' ? (addressable / 100) * baseAmt * 0.01 : (bench !== 0 ? (addressable / Math.abs(bench)) : 0) * baseAmt * 0.01;
      }
      return { procId: proc.id, kpiName: kpi.name, unit: kpi.unit, currentValue: current, benchmarkValue: bench, inputSource: realCurrent != null ? 'Questionnaire' : kpi.current != null ? 'Modeled estimate' : 'Not provided', benchmarkSource: srcLabel, benchmarkYear: srcMeta.year, sampleSize: sampleN, gapValue: gap, gapPct, baseAmount: baseAmt, baseAmountSource: fintype + ' from financial baseline', addressablePct, scenarioLevel: potential, scenarioFactor, resultFormatted: result > 0 ? (result < 1 ? '$' + Math.round(result * 1000) + 'K' : '$' + result.toFixed(1) + 'M') : '$0', confidence };
    }
    // Agent type
    if (type === 'agent') {
      const agentGap = current != null && agentBench != null ? Math.abs(current - agentBench) : null;
      const agentGapPct = agentGap != null && agentBench !== 0 ? (agentGap / Math.abs(agentBench)) * 100 : null;
      let agentResult = 0;
      if (current != null && agentBench != null && agentBench !== 0) {
        const addressable = agentGap * m;
        agentResult = kpi.unit === '%' ? (addressable / 100) * baseAmt * 0.01 : (agentBench !== 0 ? (addressable / Math.abs(agentBench)) : 0) * baseAmt * 0.01;
      }
      return { procId: proc.id, kpiName: kpi.name, unit: kpi.unit, currentValue: current, benchmarkValue: agentBench, inputSource: realCurrent != null ? 'Questionnaire' : kpi.current != null ? 'Modeled estimate' : 'Not provided', benchmarkSource: 'AI Agent benchmark', benchmarkYear: '2024', sampleSize: null, gapValue: agentGap, gapPct: agentGapPct, baseAmount: baseAmt, baseAmountSource: fintype + ' from financial baseline', addressablePct, scenarioLevel: potential, scenarioFactor, resultFormatted: agentResult > 0 ? (agentResult < 1 ? '$' + Math.round(agentResult * 1000) + 'K' : '$' + agentResult.toFixed(1) + 'M') : '$0', confidence };
    }
    return null;
  }, [procValues, procBenchmarks, procScenarios, scenarioLevel, baseline, baselineData]);

  // Challenge a value calculation via Catalyst
  const challengeCalcValue = useCallback(async (explainerData) => {
    setChallengeLoading(true);
    const prompt = `A CFO is skeptical of this value estimate: ${explainerData.kpiName}, ${explainerData.resultFormatted} impact.
The calculation is: gap of ${explainerData.gapValue?.toFixed(2) || "—"} ${explainerData.unit} x $${explainerData.baseAmount}M base x ${explainerData.addressablePct}% addressable x ${explainerData.scenarioLevel} scenario factor (${explainerData.scenarioFactor}).
Benchmark source: ${explainerData.benchmarkSource}, n=${explainerData.sampleSize || "unknown"}, ${explainerData.benchmarkYear || "2024"}.

Play devil's advocate. Give 3 legitimate challenges a CFO might raise, then give 3 counter-arguments that defend the number. Be specific, not generic. Format as:

CHALLENGES:
1. ...
2. ...
3. ...

DEFENSES:
1. ...
2. ...
3. ...

WHAT WOULD MAKE THIS UNASSAILABLE:
...`;
    try {
      const proxyRes = await fetch("/api/catalyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      let text = "";
      if (proxyRes.ok) {
        const proxyData = await proxyRes.json();
        text = proxyData.result || "";
      } else if (apiKey) {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
          body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, messages: [{ role: "user", content: prompt }] }),
        });
        const data = await response.json();
        text = data.content?.map(i => i.text || "").join("\n") || "No response";
      } else {
        text = "Configure API key or server proxy to use Challenge feature.";
      }
      setChallengeResult(text);
      // Update the drawer with challenge result
      setCalcExplainer(prev => prev ? { ...prev, challengeResult: text } : null);
    } catch (err) {
      setChallengeResult(`Error: ${err.message}`);
    }
    setChallengeLoading(false);
  }, [apiKey]);

  // Toggle helpers
  const toggleSet = (setter, val) => setter(prev => { const n = new Set(prev); n.has(val) ? n.delete(val) : n.add(val); return n; });
  const selectAllInGroup = (procs) => setSelectedProcs(prev => { const n = new Set(prev); procs.forEach(p => n.add(p.id)); return n; });
  const deselectAllInGroup = (procs) => setSelectedProcs(prev => { const n = new Set(prev); procs.forEach(p => n.delete(p.id)); return n; });

  // ═══ Smart Question Helpers ═══
  const getSmartAnswers = useCallback((procId) => {
    const answers = {};
    ALL_SMART_QS.forEach(q => {
      const raw = questAnswers[`${procId}_${q.id}`];
      if (raw !== undefined && raw !== "" && raw !== null) {
        answers[q.id] = (q.type === "number" || q.type === "number_with_unit" || q.type === "rating") ? parseFloat(raw) : raw;
      }
    });
    return answers;
  }, [questAnswers]);

  const getVisibleQuestions = useCallback((procId) => {
    const answers = getSmartAnswers(procId);
    const visible = [...SMART_QUESTIONS.universal];
    SMART_QUESTIONS.conditional.forEach(q => {
      try { if (q.showWhen(answers)) visible.push(q); } catch (_) { /* skip */ }
    });
    return visible;
  }, [getSmartAnswers]);

  const setSmartAnswer = useCallback((procId, qId, value) => {
    setQuestAnswers(prev => ({ ...prev, [`${procId}_${qId}`]: value }));
    const bk = SMART_TO_BASELINE[qId];
    if (bk) setBaselineData(prev => ({ ...prev, [`${procId}_${bk}`]: value }));
    if (qId === "q-volume") setBaselineData(prev => ({ ...prev, [`${procId}_a_volumePeriod`]: "monthly" }));
    // Sync relevant questionnaire answers into KPI current values
    const numVal = parseFloat(value);
    if (!isNaN(numVal)) {
      const proc = PROC_MAP[procId];
      if (proc?.kpis) {
        proc.kpis.forEach((kpi, ki) => {
          const kn = kpi.name.toLowerCase();
          const shouldSync =
            (qId === "q-automation" && (/auto|touchless|straight.?through|stp|no.?touch/i.test(kpi.name)) && kpi.unit === "%") ||
            (qId === "q-error-rate" && (/error|exception/i.test(kpi.name)) && kpi.unit === "%") ||
            (qId === "q-rework" && (/rework/i.test(kpi.name)) && kpi.unit === "%") ||
            (qId === "q-cycle" && (/cycle time|resolution time|processing time|turnaround/i.test(kpi.name)) && (kpi.unit === "days" || kpi.unit === "hours"));
          if (shouldSync) {
            setProcValues(prev => {
              const existing = prev[procId]?.[`kpi_current_${ki}`];
              if (existing != null) return prev; // don't overwrite manual entry
              return { ...prev, [procId]: { ...(prev[procId] || {}), [`kpi_current_${ki}`]: numVal } };
            });
            setKpiSources(prev => {
              const existing = prev[procId]?.[`kpi_current_${ki}`];
              if (existing && existing !== "default") return prev;
              return { ...prev, [procId]: { ...(prev[procId] || {}), [`kpi_current_${ki}`]: "questionnaire" } };
            });
          }
        });
      }
    }
  }, []);

  const setSmartUnit = useCallback((procId, qId, unit) => {
    setQuestAnswers(prev => ({ ...prev, [`${procId}_${qId}-unit`]: unit }));
    if (qId === "q-cycle") setBaselineData(prev => ({ ...prev, [`${procId}_a_cycleTimeUnit`]: unit }));
  }, []);

  const getValidationWarnings = useCallback((procId) => {
    const a = getSmartAnswers(procId);
    const warnings = {};
    if (a["q-ftes"] === 0 && a["q-automation"] != null && a["q-automation"] < 100)
      warnings["q-ftes"] = "0 FTEs with less than full automation — is this correct?";
    if (a["q-ftes"] > 500)
      warnings["q-ftes"] = "Very high FTE count — is this for the entire department?";
    if (a["q-automation"] > 90 && a["q-satisfaction"] != null && a["q-satisfaction"] <= 2)
      warnings["q-automation"] = "High automation but low satisfaction — quality issues?";
    if (a["q-rework"] > 50)
      warnings["q-rework"] = "Over 50% rework is unusual — please verify";
    if (a["q-volume"] === 0)
      warnings["q-volume"] = "Zero volume — is this process active?";
    return warnings;
  }, [getSmartAnswers]);

  const getSmartSummary = useCallback((procId) => {
    const a = getSmartAnswers(procId);
    if (a["q-ftes"] == null && a["q-volume"] == null) return null;
    const parts = [];
    if (a["q-ftes"] != null && a["q-volume"] != null)
      parts.push(`This process has ${a["q-ftes"]} FTEs processing ${a["q-volume"].toLocaleString()} transactions/month with ${a["q-automation"] ?? "?"}% automation.`);
    if (a["q-pain"]) parts.push(`The primary pain point is ${a["q-pain"].toLowerCase()}.`);
    if (a["q-satisfaction"] != null) parts.push(`Stakeholder satisfaction is ${a["q-satisfaction"]}/5.`);
    if (a["q-rework"] > 20) parts.push(`High rework rate (${a["q-rework"]}%) suggests significant quality issues.`);
    if (a["q-data-quality"] && (a["q-data-quality"].startsWith("Poor") || a["q-data-quality"].startsWith("Critical")))
      parts.push("Data quality is a critical concern — process mining recommended.");
    if (a["q-manual-data"] > 50) parts.push("Over half of decisions rely on manual data gathering — automation opportunity.");
    if (a["q-cycle"] != null) {
      const unit = questAnswers[`${procId}_q-cycle-unit`] || "days";
      parts.push(`Cycle time of ${a["q-cycle"]} ${unit} may indicate bottlenecks.`);
    }
    return parts.join(" ");
  }, [getSmartAnswers, questAnswers]);

  // ═══ Auto-save to server ═══
  const saveToServer = useCallback(async () => {
    if (!assessmentId) return;
    setSaving(true);
    const data = {
      baseline, selectedProcs: [...selectedProcs], selectedFunction,
      procValues, procBenchmarks, questAnswers, baselineData, procScenarios,
      catalystResults, agentResults, uploadedMining, savedScenarios, valueRealization,
      companyFinancials, multiYearRamp, assessmentProfile, kpiSources,
      processOwnership, vrAutoPopulated, scenarioLevel, lastStep: step,
    };
    try {
      await fetch(`/api/assessments/${assessmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ data, companyName: assessmentProfile.companyName || baseline.company }),
      });
      setLastSaved(new Date());
      showToast("Project saved");
    } catch (err) { console.error("Auto-save failed:", err); }
    setSaving(false);
  }, [assessmentId, baseline, selectedProcs, selectedFunction, procValues, procBenchmarks, questAnswers, baselineData, procScenarios, catalystResults, agentResults, uploadedMining, savedScenarios, valueRealization, companyFinancials, multiYearRamp, assessmentProfile, processOwnership, vrAutoPopulated, scenarioLevel, step, showToast]);

  // Auto-save every 30 seconds when data changes
  useEffect(() => {
    if (!assessmentId) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(saveToServer, 30000);
    return () => clearTimeout(saveTimer.current);
  }, [baseline, selectedProcs, procValues, procBenchmarks, questAnswers, baselineData, procScenarios, catalystResults, agentResults, uploadedMining, savedScenarios, valueRealization, companyFinancials, multiYearRamp, assessmentProfile, processOwnership, vrAutoPopulated, scenarioLevel, step]);

  // Auto-save when user advances a step
  const prevStepRef = useRef(step);
  useEffect(() => {
    if (step !== prevStepRef.current) {
      prevStepRef.current = step;
      saveToServer();
    }
  }, [step, saveToServer]);

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

  // Effective financials: use companyFinancials if loaded, else baseline estimates
  const effectiveFinancials = useMemo(() => {
    if (companyFinancials) {
      return {
        revenue: companyFinancials.revenue || baseline.revenue || 0,
        cogs: companyFinancials.cogs || baseline.cogs || 0,
        sga: companyFinancials.sga || baseline.sga || 0,
        ebitda: companyFinancials.ebitda || baseline.ebitda || 0,
        annualPayroll: companyFinancials.annualPayroll || null,
        headcount: companyFinancials.headcount || null,
        financeHeadcount: companyFinancials.financeHeadcount || null,
        source: "P&L Upload",
        anchored: true,
      };
    }
    return { revenue: baseline.revenue || 0, cogs: baseline.cogs || 0, sga: baseline.sga || 0, ebitda: baseline.ebitda || 0, source: "Revenue band estimate", anchored: false };
  }, [companyFinancials, baseline]);

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
        const baseAmt = lever?.fintype === "Revenue" ? effectiveFinancials.revenue :
          lever?.fintype === "COGS" ? effectiveFinancials.cogs : effectiveFinancials.sga;

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
    const dailyRevenue = (effectiveFinancials.revenue || 0) / 365;
    const dailyCOGS = (effectiveFinancials.cogs || 0) / 365;

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
  }, [selProcs, procValues, procBenchmarks, scenarioLevel, procScenarios, baseline, effectiveFinancials]);

  const valResult = useMemo(() => computeValue(), [computeValue]);

  // Auto-populate procValues from KPI defaults when entering Step 3 or 5
  // This ensures baseline values from Step 2 (and KPI defaults) pre-fill Step 3
  useEffect(() => {
    if (step === 3 || step === 5) {
      setProcValues(prev => {
        let updated = { ...prev };
        let changed = false;
        selProcs.forEach(proc => {
          (proc.kpis || []).forEach((kpi, ki) => {
            const key = `kpi_current_${ki}`;
            const existing = updated[proc.id]?.[key];
            if (existing == null && kpi.current != null) {
              updated = { ...updated, [proc.id]: { ...(updated[proc.id] || {}), [key]: kpi.current } };
              changed = true;
            }
          });
        });
        return changed ? updated : prev;
      });
    }
  }, [step, selProcs]);

  // Step completion indicators
  const stepStatus = useMemo(() => ({
    1: selectedProcs.size > 0,
    2: Object.keys(questAnswers).length > 0 || Object.keys(uploadedMining).length > 0 || Object.keys(baselineData).length > 0,
    3: Object.keys(procValues).length > 0,
    4: Object.keys(procBenchmarks).length > 0 || Object.keys(catalystResults).length > 0 || Object.keys(agentResults).length > 0,
    5: valResult.total > 0,
    6: valResult.total > 0,
    7: valResult.total > 0,
  }), [selectedProcs, questAnswers, uploadedMining, baselineData, procValues, procBenchmarks, catalystResults, agentResults, valResult]);

  // Catalyst API call — tries server proxy first, falls back to browser-side key
  const callCatalyst = async (procId, prompt, resultSetter, loadingSetter) => {
    loadingSetter(prev => ({ ...prev, [procId]: true }));
    const procLabel = selProcs.find(p => p.id === procId)?.label || procId;
    setCatalystLoadingMsg(prev => ({ ...prev, [procId]: `Analyzing ${procLabel} benchmark data...` }));
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
        setCatalystLoadingMsg(prev => { const n = { ...prev }; delete n[procId]; return n; });
        showToast(`Benchmark analysis complete for ${procLabel}`);
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
    if (!apiKey) { setShowApiKeyInput(true); loadingSetter(prev => ({ ...prev, [procId]: false })); setCatalystLoadingMsg(prev => { const n = { ...prev }; delete n[procId]; return n; }); return; }
    setCatalystLoadingMsg(prev => ({ ...prev, [procId]: `Generating implementation specification for ${procLabel}...` }));
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
      showToast(`Benchmark analysis complete for ${procLabel}`);
    } catch (err) {
      resultSetter(prev => ({ ...prev, [procId]: `Catalyst error: ${err.message}` }));
    }
    loadingSetter(prev => ({ ...prev, [procId]: false }));
    setCatalystLoadingMsg(prev => { const n = { ...prev }; delete n[procId]; return n; });
  };

  // ═══ VRP Auto-Populate via Catalyst ═══
  const VRP_DIMS = ["people", "processes", "data", "technology", "governance", "operatingModel"];
  const VRP_DIM_LABELS = { people: "People", processes: "Processes", data: "Data", technology: "Technology", governance: "Governance", operatingModel: "Operating Model" };

  const companyName = assessmentProfile.companyName || baseline.company || "Demo Company";

  const autoPopulateVRP = useCallback(async () => {
    if (vrAutoPopulated) return;
    setVrAutoPopulated(true);

    const context = `Assessment context:
- Processes assessed: ${selProcs.map(p => p.label).join(", ")}
- Total ERP value: $${valResult.total?.toFixed(1) || "0"}M
- Total Agent uplift: $${valResult.agentTotal?.toFixed(1) || "0"}M
- Top KPI improvements: ${valResult.impacts?.slice(0, 5).map(i => i.label).join(", ") || "None"}
- Agent types identified: ${selProcs.filter(p => AGENT_SPECS[p.id]).map(p => AGENT_SPECS[p.id].agentType + " (" + p.label + ")").slice(0, 5).join(", ") || "None"}
- Company: ${companyName}, Industry: ${assessmentProfile.industry || baseline.industry}, Revenue band: ${assessmentProfile.revenueBand || baseline.revenueBand}`;

    const callForDim = async (dimKey) => {
      const dimLabel = VRP_DIM_LABELS[dimKey];
      setVrLoading(prev => ({ ...prev, [dimKey]: true }));
      const sysPrompt = `You are a transformation impact analyst. Based on the following SAP S/4HANA Phase 0 assessment data, generate concise, specific impacts for the ${dimLabel} dimension. Be concrete — name specific roles, systems, processes. Return as JSON: { "keyPoints": ["string"], "actions": ["string"], "timeline": "string", "complexity": "Low"|"Medium"|"High" }`;
      const userPrompt = `${context}\n\nGenerate impacts for: ${dimLabel}`;
      const fullPrompt = `System: ${sysPrompt}\n\nUser: ${userPrompt}`;

      try {
        let result = null;
        // Try server proxy first
        try {
          const proxyRes = await fetch("/api/catalyst", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: fullPrompt }),
          });
          const proxyData = await proxyRes.json();
          if (proxyRes.ok && proxyData.result) {
            result = proxyData.result;
          }
        } catch (_) {}

        // Fallback: direct browser call
        if (!result && apiKey) {
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
              max_tokens: 1000,
              messages: [{ role: "user", content: fullPrompt }],
            })
          });
          if (response.ok) {
            const data = await response.json();
            result = data.content?.map(i => i.text || "").join("\n") || null;
          }
        }

        if (result) {
          // Try to parse JSON from result
          try {
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              const dimData = {};
              // Map parsed data to VRP fields based on dimension
              if (dimKey === "people") {
                if (parsed.keyPoints) dimData.roleChanges = parsed.keyPoints.join("\n");
                if (parsed.actions) dimData.skillsRequired = parsed.actions.slice(0, 5);
              } else if (dimKey === "processes") {
                if (parsed.keyPoints) dimData.processesRedesigned = parsed.keyPoints;
                if (parsed.actions) dimData.automationCandidates = parsed.actions;
              } else if (dimKey === "data") {
                if (parsed.keyPoints) dimData.dataGaps = parsed.keyPoints.join("\n");
                if (parsed.actions) dimData.governanceNeeds = parsed.actions.join("\n");
              } else if (dimKey === "technology") {
                if (parsed.keyPoints) dimData.integrationNeeds = parsed.keyPoints.join("\n");
                if (parsed.actions) dimData.itInfrastructure = parsed.actions.join("\n");
              } else if (dimKey === "governance") {
                if (parsed.keyPoints) dimData.decisionRights = parsed.keyPoints.join("\n");
                if (parsed.actions) dimData.ownershipModel = parsed.actions.join("\n");
              } else if (dimKey === "operatingModel") {
                if (parsed.keyPoints) dimData.structuralChanges = parsed.keyPoints.join("\n");
                if (parsed.actions) dimData.reportingChanges = parsed.actions.join("\n");
              }
              setValueRealization(prev => ({ ...prev, [dimKey]: { ...(prev[dimKey] || {}), ...dimData } }));
            }
          } catch (_) {
            // If JSON parse fails, store as text in first field
            const fieldMap = { people: "roleChanges", processes: "processesRedesigned", data: "dataGaps", technology: "integrationNeeds", governance: "decisionRights", operatingModel: "structuralChanges" };
            const field = fieldMap[dimKey];
            if (field) setValueRealization(prev => ({ ...prev, [dimKey]: { ...(prev[dimKey] || {}), [field]: result } }));
          }
        }
      } catch (err) {
        console.error(`VRP auto-populate error for ${dimKey}:`, err);
      }
      setVrLoading(prev => ({ ...prev, [dimKey]: false }));
    };

    // Fire all 6 in parallel
    await Promise.allSettled(VRP_DIMS.map(callForDim));
  }, [vrAutoPopulated, selProcs, valResult, companyName, assessmentProfile, baseline, apiKey]);

  // Auto-populate VRP on first open of Step 6
  useEffect(() => {
    if (step === 6 && !vrAutoPopulated && selProcs.length > 0) {
      autoPopulateVRP();
    }
  }, [step, vrAutoPopulated, selProcs.length]);

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

    // Smart questions grouped by category
    const smartEffQ = [...SMART_QUESTIONS.universal, ...SMART_QUESTIONS.conditional].filter(q => q.category === "efficiency");
    const smartLeakQ = SMART_QUESTIONS.conditional.filter(q => q.category === "leakage");

    const qHint = (q) => {
      if (q.options) return q.options.join(" / ");
      if (q.type === "rating") return q.labels.join(" / ");
      if (q.type === "text") return "Free text";
      if (q.unit) return `Enter ${q.unit}` + (q.range ? ` (${q.range[0]}-${q.range[1]})` : "");
      if (q.type === "number_with_unit") return `Enter number (${q.units.join(" or ")})`;
      return "";
    };

    const qRow = (items, isConditional) => items.map((q, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#FAFAF8'}">
        <td style="padding:10px 14px;border:1px solid #E0DDD6;font-size:12px;color:#333;width:40%">${q.question}${(!q.required && isConditional) ? ' <em style="color:#999;font-size:10px">(If applicable)</em>' : ""}</td>
        <td style="padding:10px 14px;border:1px solid #E0DDD6;min-width:160px">&nbsp;</td>
        <td style="padding:10px 14px;border:1px solid #E0DDD6;font-size:10px;color:#999;font-style:italic;width:25%">${qHint(q)}</td>
      </tr>`).join("");

    // Build per-process sections
    const processSections = Object.entries(e2eGroups).map(([e2eName, procs], gi) => {
      const procsHtml = procs.map(proc => {
        const bp = getBlueprintForL2(proc.l2id);
        const jobs = proc.jobs || [];
        const saps = (proc.sap || []).map(s => getSapModuleLabel(s.module)).join(", ");
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

            ${(() => { const lv = getSapLever(proc.id); return lv ? `
            <div style="margin:10px 0 16px;padding:10px 14px;background:#7BA7CC08;border-left:3px solid #7BA7CC;border-radius:6px">
              <div style="font-size:10px;color:#7BA7CC;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Relevant SAP Capability Being Assessed</div>
              <div style="font-size:13px;font-weight:600;color:#333">${lv.lever.name} <span style="font-size:10px;font-family:monospace;color:#7BA7CC;margin-left:4px">(${lv.lever.module})</span></div>
              <div style="font-size:11px;color:#666;font-style:italic;margin-top:2px">${lv.lever.capability}</div>
            </div>` : ""; })()}

            ${jobs.length > 0 ? `
            <div style="margin:10px 0 16px">
              <div style="font-size:10px;color:#D4A853;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Key Activities</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px">
                ${jobs.map(j => `<span style="font-size:11px;padding:4px 10px;background:#FAFAF8;border:1px solid #E0DDD6;border-radius:6px;color:#444">${j}</span>`).join("")}
              </div>
            </div>` : ""}

            <div style="margin:16px 0 8px;font-size:12px;font-weight:700;color:#7CB9A8;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #7CB9A8;padding-bottom:4px">Section A — Process Efficiency</div>
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
              <thead><tr style="background:#F5F3EE">
                <th style="padding:8px 14px;border:1px solid #E0DDD6;text-align:left;font-size:11px;color:#888;font-weight:600">Question</th>
                <th style="padding:8px 14px;border:1px solid #E0DDD6;text-align:left;font-size:11px;color:#888;font-weight:600">Your Answer</th>
                <th style="padding:8px 14px;border:1px solid #E0DDD6;text-align:left;font-size:11px;color:#888;font-weight:600">Notes / Context</th>
              </tr></thead>
              <tbody>${qRow(smartEffQ, true)}</tbody>
            </table>

            ${smartLeakQ.length > 0 ? `<div style="margin:16px 0 8px;font-size:12px;font-weight:700;color:#D4A853;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #D4A853;padding-bottom:4px">Section B — Data-Driven Leakage</div>
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
              <thead><tr style="background:#F5F3EE">
                <th style="padding:8px 14px;border:1px solid #E0DDD6;text-align:left;font-size:11px;color:#888;font-weight:600">Question</th>
                <th style="padding:8px 14px;border:1px solid #E0DDD6;text-align:left;font-size:11px;color:#888;font-weight:600">Your Answer</th>
                <th style="padding:8px 14px;border:1px solid #E0DDD6;text-align:left;font-size:11px;color:#888;font-weight:600">Notes / Context</th>
              </tr></thead>
              <tbody>${qRow(smartLeakQ, true)}</tbody>
            </table>` : ""}

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
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #fff !important; color: #000 !important; }
    .no-print, nav, button, [role="navigation"] { display: none !important; }
    .page-break { page-break-before: always; }
    table { page-break-inside: avoid; }
    div[style*="page-break-inside:avoid"] { page-break-inside: avoid; }
    div[style*="page-break-before"] { page-break-before: always; }
    @page { margin: 1.5cm; size: A4; }
    body::after { content: "${baseline.company || "Company"} | " attr(data-date) " | Confidential"; position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 9px; color: #999; padding: 8px; border-top: 1px solid #ddd; }
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
        <span style="color:#7CB9A8;font-weight:600">Section A — Process Efficiency:</span> FTEs, volume, automation, pain points, satisfaction, plus conditional follow-ups<br/>
        <span style="color:#D4A853;font-weight:600">Section B — Data-Driven Leakage:</span> data quality, reporting, source of truth, manual data %, leakage estimate (if applicable)
      </li>
      <li>Questions marked <em>"If applicable"</em> may not apply — answer only if relevant to your process</li>
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
      const miningStartIdx = qStartIdx + ALL_SMART_QS.length;
      const newAnswers = { ...questAnswers };
      const newBaseline = { ...baselineData };
      const newMining = { ...uploadedMining };
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i];
        const procId = row[0];
        if (!procId || !PROC_MAP[procId]) continue;
        // Import smart question answers
        ALL_SMART_QS.forEach((q, qi) => {
          const val = row[qStartIdx + qi];
          if (val) {
            newAnswers[`${procId}_${q.id}`] = val;
            const bk = SMART_TO_BASELINE[q.id];
            if (bk) newBaseline[`${procId}_${bk}`] = val;
          }
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
      setBaselineData(newBaseline);
      setUploadedMining(newMining);

      // Sync questionnaire answers into procValues (mimics setSmartAnswer KPI sync)
      const newProcVals = {};
      const newSources = {};
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i];
        const procId = row[0];
        if (!procId || !PROC_MAP[procId]) continue;
        const proc = PROC_MAP[procId];
        if (!proc?.kpis) continue;
        ALL_SMART_QS.forEach((q, qi) => {
          const val = row[qStartIdx + qi];
          if (!val) return;
          const numVal = parseFloat(val);
          if (isNaN(numVal)) return;
          proc.kpis.forEach((kpi, ki) => {
            const shouldSync =
              (q.id === "q-automation" && (/auto|touchless|straight.?through|stp|no.?touch/i.test(kpi.name)) && kpi.unit === "%") ||
              (q.id === "q-error-rate" && (/error|exception/i.test(kpi.name)) && kpi.unit === "%") ||
              (q.id === "q-rework" && (/rework/i.test(kpi.name)) && kpi.unit === "%") ||
              (q.id === "q-cycle" && (/cycle time|resolution time|processing time|turnaround/i.test(kpi.name)) && (kpi.unit === "days" || kpi.unit === "hours"));
            if (shouldSync) {
              if (!newProcVals[procId]) newProcVals[procId] = {};
              if (!newSources[procId]) newSources[procId] = {};
              newProcVals[procId][`kpi_current_${ki}`] = numVal;
              newSources[procId][`kpi_current_${ki}`] = "questionnaire";
            }
          });
        });
        // Also sync mining data into procValues
        const mData = newMining[procId];
        if (mData) {
          proc.kpis.forEach((kpi, ki) => {
            const kn = kpi.name.toLowerCase();
            let mVal = null;
            if (mData.conformance != null && /conformance/i.test(kpi.name) && kpi.unit === "%") mVal = mData.conformance;
            else if (mData.cycleTime != null && /cycle time|processing time|turnaround/i.test(kpi.name) && (kpi.unit === "days" || kpi.unit === "hours")) mVal = mData.cycleTime;
            else if (mData.rework != null && /rework/i.test(kpi.name) && kpi.unit === "%") mVal = mData.rework;
            if (mVal != null) {
              if (!newProcVals[procId]) newProcVals[procId] = {};
              if (!newSources[procId]) newSources[procId] = {};
              newProcVals[procId][`kpi_current_${ki}`] = mVal;
              newSources[procId][`kpi_current_${ki}`] = "mining";
            }
          });
        }
      }
      if (Object.keys(newProcVals).length > 0) {
        setProcValues(prev => {
          let updated = { ...prev };
          Object.entries(newProcVals).forEach(([procId, vals]) => {
            Object.entries(vals).forEach(([key, val]) => {
              if (updated[procId]?.[key] == null) {
                updated = { ...updated, [procId]: { ...(updated[procId] || {}), [key]: val } };
              }
            });
          });
          return updated;
        });
        setKpiSources(prev => {
          let updated = { ...prev };
          Object.entries(newSources).forEach(([procId, srcs]) => {
            Object.entries(srcs).forEach(([key, src]) => {
              if (!updated[procId]?.[key] || updated[procId][key] === "default") {
                updated = { ...updated, [procId]: { ...(updated[procId] || {}), [key]: src } };
              }
            });
          });
          return updated;
        });
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  // ═══ Paste Responses Handler ═══
  const handlePasteResponses = () => {
    if (!pasteText.trim()) return;
    const newBaseline = { ...baselineData };
    const newQA = { ...questAnswers };
    const lines = pasteText.split("\n").map(l => l.trim()).filter(Boolean);
    let currentProcId = null;
    let currentSection = null; // "a" or "b"
    const effQIds = ALL_SMART_QS.filter(q => q.category === "efficiency").map(q => q.id);
    const leakQIds = ALL_SMART_QS.filter(q => q.category === "leakage").map(q => q.id);
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
          const qIds = currentSection === "a" ? effQIds : leakQIds;
          if (qIndex < qIds.length) {
            const qId = qIds[qIndex];
            newQA[`${currentProcId}_${qId}`] = answer;
            const bk = SMART_TO_BASELINE[qId];
            if (bk) newBaseline[`${currentProcId}_${bk}`] = answer;
          }
          qIndex++;
        }
      }
    }
    setBaselineData(newBaseline);
    setQuestAnswers(newQA);
    // Sync pasted questionnaire answers into procValues
    setProcValues(prev => {
      let updated = { ...prev };
      Object.keys(newQA).forEach(qaKey => {
        const match = qaKey.match(/^(.+)_(q-.+)$/);
        if (!match) return;
        const [, procId, qId] = match;
        const numVal = parseFloat(newQA[qaKey]);
        if (isNaN(numVal)) return;
        const proc = PROC_MAP[procId];
        if (!proc?.kpis) return;
        proc.kpis.forEach((kpi, ki) => {
          const shouldSync =
            (qId === "q-automation" && (/auto|touchless|straight.?through|stp|no.?touch/i.test(kpi.name)) && kpi.unit === "%") ||
            (qId === "q-error-rate" && (/error|exception/i.test(kpi.name)) && kpi.unit === "%") ||
            (qId === "q-rework" && (/rework/i.test(kpi.name)) && kpi.unit === "%") ||
            (qId === "q-cycle" && (/cycle time|resolution time|processing time|turnaround/i.test(kpi.name)) && (kpi.unit === "days" || kpi.unit === "hours"));
          if (shouldSync && updated[procId]?.[`kpi_current_${ki}`] == null) {
            updated = { ...updated, [procId]: { ...(updated[procId] || {}), [`kpi_current_${ki}`]: numVal } };
            setKpiSources(p => ({ ...p, [procId]: { ...(p[procId] || {}), [`kpi_current_${ki}`]: "questionnaire" } }));
          }
        });
      });
      return updated;
    });
    setShowPasteModal(false);
    setPasteText("");
  };

  // ═══ Phase 0 Report Generator ═══
  const generatePhase0Report = () => {
    const now = new Date().toISOString().split("T")[0];
    const processRows = selProcs.map(proc => {
      const answers = ALL_SMART_QS.map(q => {
        const val = questAnswers[`${proc.id}_${q.id}`];
        return val ? `<tr><td style="padding:4px 8px;color:#888;font-size:12px">${q.question}</td><td style="padding:4px 8px;font-size:12px">${val}</td></tr>` : "";
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
        `<div style="margin:4px 0;padding:6px 8px;background:#f0f4ff;border-radius:4px;font-size:12px"><code style="background:#7BA7CC15;padding:1px 5px;border-radius:3px;color:#7BA7CC;font-weight:600">${s.module}</code> <span style="color:#7BA7CC;opacity:.8;font-size:11px">${SAP_MODULE_NAMES[s.module.split(/\s*\/\s*/)[0].trim()] || ""}</span> — ${s.desc}${s.scenario ? `<br/><em>${s.scenario}</em>` : ""}</div>`
      ).join("");
      const agentHtml = agentResults[proc.id] ? `<div style="margin:8px 0;padding:10px;background:#fdf8ef;border:1px solid #D4A85322;border-radius:8px;font-size:12px;white-space:pre-wrap"><strong style="color:#D4A853">AI Agent Scenario</strong><br/>${agentResults[proc.id]}</div>` : "";

      const specObj = AGENT_SPECS[proc.id];
      const specHtml = specObj ? '<div style="margin:8px 0;padding:12px;background:#f8f6ff;border:1px solid #C4A1D422;border-radius:8px;font-size:12px">' +
        '<strong style="color:#C4A1D4">Implementation Specification</strong>' +
        '<div style="margin:6px 0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">' +
        '<div><span style="color:#888;font-size:10px">Type:</span> <strong>' + specObj.agentType + '</strong></div>' +
        '<div><span style="color:#888;font-size:10px">Effort:</span> <strong>' + specObj.effort + '</strong></div>' +
        '<div><span style="color:#888;font-size:10px">Feasibility:</span> <strong style="color:' + (specObj.feasibility >= 80 ? '#7CB9A8' : specObj.feasibility >= 60 ? '#D4A853' : '#D4A07A') + '">' + specObj.feasibility + '/100</strong></div>' +
        '<div><span style="color:#888;font-size:10px">Timeline:</span> <strong>' + specObj.implMonths + ' months</strong></div>' +
        '<div><span style="color:#888;font-size:10px">Cost:</span> <strong>$' + specObj.implCost + 'K</strong></div>' +
        '<div><span style="color:#888;font-size:10px">Payback:</span> <strong>' + specObj.paybackMonths + ' months</strong></div>' +
        '</div>' +
        '<div style="font-size:11px;color:#555;margin:4px 0">' + specObj.description + '</div>' +
        '<div style="margin-top:6px"><span style="color:#888;font-size:10px">Prerequisites:</span> ' + specObj.prerequisites.join(' · ') + '</div>' +
        '<div style="margin-top:4px"><span style="color:#888;font-size:10px">Risk Factors:</span> ' + specObj.riskFactors.join(' · ') + '</div>' +
        '<div style="margin-top:4px"><span style="color:#888;font-size:10px">Tech Stack:</span> ' + specObj.techStack.join(' · ') + '</div>' +
        '</div>' : "";      const impact = valResult.impacts.find(i => i.id === proc.id);
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
        ${specHtml}
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
      const bpAreas = entryPath === "blueprint" ? (TRANSFORMATION_AREAS[selectedFunction] || []).filter(bp => selectedBlueprints.has(bp.id)) : [];
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

    ${(() => {
      const secNum = valResult.balanceSheet.totalWorkingCapital > 0 ? "5" : "4";
      const tierCounts = {};
      BLUEPRINT_TIERS.forEach(bt => tierCounts[bt.id] = 0);
      selProcs.forEach(p => (p.blueprintTiers || []).forEach(tid => { tierCounts[tid] = (tierCounts[tid] || 0) + 1; }));
      const coveredCount = BLUEPRINT_TIERS.filter(bt => tierCounts[bt.id] > 0).length;
      const missing = BLUEPRINT_TIERS.filter(bt => tierCounts[bt.id] === 0).map(bt => bt.name);
      return `<h2>${secNum}. EY.ai Value Blueprint Alignment</h2>
      <p style="font-size:13px;color:#555;margin-bottom:12px">Assessment covers <strong style="color:#D4A853">${coveredCount} of 7</strong> tiers across ${selProcs.length} processes</p>
      <table>
        <thead><tr><th>Tier</th><th>Description</th><th style="text-align:center">Processes</th></tr></thead>
        <tbody>
          ${BLUEPRINT_TIERS.map(bt => `<tr style="${tierCounts[bt.id] === 0 ? "opacity:0.4" : ""}">
            <td style="font-weight:600;color:${bt.color}">${bt.icon} ${bt.name}</td>
            <td style="font-size:12px">${bt.description}</td>
            <td style="text-align:center;font-weight:700">${tierCounts[bt.id]}</td>
          </tr>`).join("")}
        </tbody>
      </table>
      ${missing.length > 0 ? `<p style="font-size:11px;color:#888;margin-top:8px;font-style:italic">Consider expanding scope to address: ${missing.join(", ")}</p>` : ""}`;
    })()}

    <h2>${valResult.balanceSheet.totalWorkingCapital > 0 ? "6" : "5"}. Process-Level Analysis</h2>
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
        blueprintAreas: entryPath === "blueprint" ? (TRANSFORMATION_AREAS[selectedFunction] || []).filter(bp => selectedBlueprints.has(bp.id)).map(bp => ({ id: bp.id, name: bp.name, apqcL2s: bp.apqcL2s })) : [],
      },
      baseline,
      processes: selProcs.map(proc => {
        const vals = procValues[proc.id] || {};
        const bmarks = procBenchmarks[proc.id] || {};
        const answers = ALL_SMART_QS.map(q => ({
          id: q.id,
          question: q.question,
          answer: questAnswers[`${proc.id}_${q.id}`] || null,
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
              decisionWho: baselineData[`${proc.id}_b_decisionWho`] || null,
              decisionGap: baselineData[`${proc.id}_b_decisionGap`] || null,
              freedCapacity: baselineData[`${proc.id}_b_freedCapacity`] || null,
              dataQualityIssue: baselineData[`${proc.id}_b_dataQualityIssue`] || null,
              dataQuality: baselineData[`${proc.id}_b_dataQuality`] || null,
              manualPct: baselineData[`${proc.id}_b_manualPct`] || null,
              ssot: baselineData[`${proc.id}_b_ssot`] || null,
              leakage: baselineData[`${proc.id}_b_leakage`] || null,
            },
          },
          catalystBenchmarks: catalystResults[proc.id] || null,
          aiAgent: agentResults[proc.id] || null,
          agentSpec: AGENT_SPECS[proc.id] || null,
          blueprintTiers: proc.blueprintTiers || [],
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
      valueRealization,
      blueprintTiers: BLUEPRINT_TIERS,
      blueprintCoverage: (() => {
        const cov = {};
        BLUEPRINT_TIERS.forEach(bt => cov[bt.id] = 0);
        selProcs.forEach(p => (p.blueprintTiers || []).forEach(tid => { cov[tid] = (cov[tid] || 0) + 1; }));
        return cov;
      })(),
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
  const stepHeader = (num, title, desc) => (
    <div style={{ marginBottom: 20 }}>
      <div style={labelStyle}>Step {num} of 7</div>
      <div style={{ fontSize: 26, fontFamily: SERIF, color: t.tx }}>{title}</div>
      {desc && <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{desc}</div>}
    </div>
  );

  // ═══════════════════════════════════════════════════
  // V2: CHOOSE PAGE — Dual Entry Point
  // ═══════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════
  // ASSESSMENT SETUP PAGE
  // ═══════════════════════════════════════════════════
  const INDUSTRIES = ["Manufacturing", "Retail", "Financial Services", "Healthcare", "Technology", "Energy & Utilities", "Telecommunications", "Consumer Goods", "Pharmaceuticals", "Automotive", "Aerospace & Defense", "Mining & Metals", "Media & Entertainment", "Transportation & Logistics", "Professional Services"];
  const REVENUE_BANDS = ["<$500M", "$500M-$1B", "$1-5B", "$5-10B", "$10-25B", "$25B+"];
  const FISCAL_YEARS = [String(new Date().getFullYear() - 1), String(new Date().getFullYear()), String(new Date().getFullYear() + 1)];
  const CURRENCIES = ["USD", "EUR", "GBP", "CHF", "JPY", "AUD", "CAD", "SGD", "HKD", "SEK"];
  const PURPOSES = ["Phase 0 Business Case", "Workshop Demo", "Internal Review"];

  if (page === "setup") return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, padding: 20 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 520, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 12, color: t.mut, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16 }}>humaninthelead.ai</div>
          <div style={{ fontSize: 42, fontFamily: SERIF, color: t.tx, fontWeight: 400, letterSpacing: "-1px", marginBottom: 4 }}>Assessment Setup</div>
          <div style={{ fontSize: 14, color: t.tx2, lineHeight: 1.6 }}>Set up the assessment context. Takes about 60 seconds.</div>
        </div>
        <div style={{ ...cardStyle, padding: 28 }}>
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: t.tx2, fontWeight: 600, marginBottom: 4 }}>Company Name *</div>
              <input value={assessmentProfile.companyName} onChange={e => setAssessmentProfile(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Enter company name" style={{ width: "100%", padding: "10px 12px", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 8, color: t.tx, fontFamily: FONT, fontSize: 14, outline: "none" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: t.tx2, fontWeight: 600, marginBottom: 4 }}>Industry *</div>
                <select value={assessmentProfile.industry} onChange={e => setAssessmentProfile(prev => ({ ...prev, industry: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 8, color: assessmentProfile.industry ? t.tx : t.mut, fontFamily: FONT, fontSize: 13 }}>
                  <option value="">Select industry</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 11, color: t.tx2, fontWeight: 600, marginBottom: 4 }}>Revenue Band *</div>
                <select value={assessmentProfile.revenueBand} onChange={e => setAssessmentProfile(prev => ({ ...prev, revenueBand: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 8, color: assessmentProfile.revenueBand ? t.tx : t.mut, fontFamily: FONT, fontSize: 13 }}>
                  <option value="">Select band</option>
                  {REVENUE_BANDS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: t.tx2, fontWeight: 600, marginBottom: 4 }}>Fiscal Year *</div>
                <select value={assessmentProfile.fiscalYear} onChange={e => setAssessmentProfile(prev => ({ ...prev, fiscalYear: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 8, color: t.tx, fontFamily: FONT, fontSize: 13 }}>
                  {FISCAL_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 11, color: t.tx2, fontWeight: 600, marginBottom: 4 }}>Currency</div>
                <select value={assessmentProfile.currency} onChange={e => setAssessmentProfile(prev => ({ ...prev, currency: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 8, color: t.tx, fontFamily: FONT, fontSize: 13 }}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 11, color: t.tx2, fontWeight: 600, marginBottom: 4 }}>Purpose</div>
                <select value={assessmentProfile.assessmentPurpose} onChange={e => setAssessmentProfile(prev => ({ ...prev, assessmentPurpose: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 8, color: t.tx, fontFamily: FONT, fontSize: 13 }}>
                  {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              if (!assessmentProfile.companyName.trim() || !assessmentProfile.industry || !assessmentProfile.revenueBand) return;
              // Sync to baseline
              setBaseline(prev => ({ ...prev, company: assessmentProfile.companyName.trim(), industry: assessmentProfile.industry, revenueBand: assessmentProfile.revenueBand }));
              setPage("choose");
            }}
            disabled={!assessmentProfile.companyName.trim() || !assessmentProfile.industry || !assessmentProfile.revenueBand}
            style={{ ...btnPrimary, width: "100%", marginTop: 20, padding: "14px 24px", fontSize: 15, opacity: (!assessmentProfile.companyName.trim() || !assessmentProfile.industry || !assessmentProfile.revenueBand) ? 0.4 : 1 }}>
            Continue
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={() => setMode(mode === "dark" ? "light" : "dark")} style={{ background: "none", border: "none", color: t.mut, cursor: "pointer", fontSize: 12, fontFamily: FONT }}>
            {mode === "dark" ? "☀ Light" : "◐ Dark"}
          </button>
        </div>
      </div>
    </div>
  );

  if (page === "choose") return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, padding: 20 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center", maxWidth: 700 }}>
        <div style={{ fontSize: 12, color: t.mut, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16 }}>humaninthelead.ai</div>
        <div style={{ fontSize: 52, fontFamily: SERIF, color: t.tx, fontWeight: 400, letterSpacing: "-1px", marginBottom: 4 }}>PrismL4</div>
        <div style={{ fontSize: 18, color: GOLD, fontWeight: 500, marginBottom: 8 }}>Bottom-Up Value Identification Engine</div>
        <div style={{ fontSize: 14, color: t.tx2, lineHeight: 1.6, marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
          Choose how you want to enter the assessment. Both paths lead to the same 7-step workflow.
        </div>
        <div style={{ fontSize: 11, color: t.mut, marginBottom: 16 }}>{ALL_PROCS.length} L4 processes across Order to Cash, Record to Report, Procure to Pay</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, maxWidth: 600, margin: "0 auto 32px" }}>
          {/* Start E2E Card */}
          <div
            onClick={() => { setEntryMode("e2e"); setSelectedFunction("finance"); setPage("work"); setStep(1); setViewMode("consultant"); }}
            style={{
              ...cardStyle, padding: "16px 24px", cursor: "pointer",
              border: `1px solid ${GOLD}44`, transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 16,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.background = GOLD + "08"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = GOLD + "44"; e.currentTarget.style.background = t.card; }}
          >
            <div style={{ fontSize: 28, flexShrink: 0 }}>⚡</div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: 16, fontFamily: SERIF, color: GOLD, fontWeight: 600 }}>Start E2E</div>
              <div style={{ fontSize: 12, color: t.tx2 }}>Full APQC process map — browse and select across all E2E streams</div>
            </div>
            <div style={{ fontSize: 18, color: GOLD, flexShrink: 0 }}>→</div>
          </div>

          {/* Start by Function Card */}
          <div
            onClick={() => { setEntryMode("function"); setPage("entry"); }}
            style={{
              ...cardStyle, padding: "16px 24px", cursor: "pointer",
              border: `1px solid ${PURPLE}44`, transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 16,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = PURPLE; e.currentTarget.style.background = PURPLE + "08"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = PURPLE + "44"; e.currentTarget.style.background = t.card; }}
          >
            <div style={{ fontSize: 28, flexShrink: 0 }}>◆</div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: 16, fontFamily: SERIF, color: PURPLE, fontWeight: 600 }}>Start by Function</div>
              <div style={{ fontSize: 12, color: t.tx2 }}>Select a business function first, then drill into its processes</div>
            </div>
            <div style={{ fontSize: 18, color: PURPLE, flexShrink: 0 }}>→</div>
          </div>
        </div>

        <button onClick={() => setMode(mode === "dark" ? "light" : "dark")} style={{ background: "none", border: "none", color: t.mut, cursor: "pointer", fontSize: 12, fontFamily: FONT }}>
          {mode === "dark" ? "☀ Light" : "◐ Dark"}
        </button>
        <div style={{ marginTop: 40, fontSize: 11, color: t.sub }}>V2 · Built by Christian Spetz</div>
      </div>
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
    { n: 4, l: "Benchmark" }, { n: 5, l: "Value Calc" }, { n: 6, l: "Realization" }, { n: 7, l: "Action Plan" }
  ];

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.tx, fontFamily: FONT, display: "flex", flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* ─── HEADER ─── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 24px", borderBottom: `1px solid ${t.bdr}`, background: mode === "dark" ? "#131312" : "#EFEBE3", flexShrink: 0, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18, fontFamily: SERIF, color: GOLD, fontWeight: 500, cursor: "pointer" }} onClick={() => setPage("choose")}>PrismL4</span>
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
            <div>
              <div style={{ fontSize: 9, color: t.mut, textTransform: "uppercase", marginBottom: 2 }}>Company</div>
              <input type="text" value={baseline.company ?? ""} onChange={e => setBaseline(prev => ({ ...prev, company: e.target.value }))}
                style={{ width: "100%", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 4, padding: "5px 8px", color: t.tx, fontFamily: FONT, fontSize: 12 }} />
            </div>
            <div>
              <div style={{ fontSize: 9, color: t.mut, textTransform: "uppercase", marginBottom: 2 }}>Industry</div>
              <select value={baseline.industry || "Manufacturing"} onChange={e => setBaseline(prev => ({ ...prev, industry: e.target.value }))}
                style={{ width: "100%", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 4, padding: "5px 8px", color: t.tx, fontFamily: FONT, fontSize: 12 }}>
                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 9, color: t.mut, textTransform: "uppercase", marginBottom: 2 }}>Revenue Band</div>
              <select value={baseline.revenueBand || "$1-5B"} onChange={e => setBaseline(prev => ({ ...prev, revenueBand: e.target.value }))}
                style={{ width: "100%", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 4, padding: "5px 8px", color: t.tx, fontFamily: FONT, fontSize: 12 }}>
                {REVENUE_BANDS.map(rb => <option key={rb} value={rb}>{rb}</option>)}
              </select>
            </div>
            {[
              { k: "revenue", l: "Revenue ($M)" },
              { k: "cogs", l: "COGS ($M)" },
              { k: "sga", l: "SG&A ($M)" },
              { k: "ebitda", l: "EBITDA ($M)" },
              { k: "recv", l: "Receivables ($M)" },
              { k: "pay", l: "Payables ($M)" },
              { k: "inventory", l: "Inventory ($M)" },
            ].map(f => (
              <div key={f.k}>
                <div style={{ fontSize: 9, color: t.mut, textTransform: "uppercase", marginBottom: 2 }}>{f.l}</div>
                <input type="number" value={baseline[f.k] ?? ""} onChange={e => setBaseline(prev => ({ ...prev, [f.k]: parseFloat(e.target.value) || 0 }))}
                  style={{ width: "100%", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 4, padding: "5px 8px", color: t.tx, fontFamily: "monospace", fontSize: 12 }} />
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
          <div style={{ height: 16, width: 1, background: t.bdr }} />
          <div><span style={{ fontSize: 10, color: PURPLE, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginRight: 4 }}>Peer</span><span style={{ fontSize: 13, fontFamily: FONT, color: PURPLE, fontWeight: 500 }}>{assessmentProfile.industry && assessmentProfile.revenueBand ? `${assessmentProfile.industry}, ${assessmentProfile.revenueBand}` : "Complete company setup"}</span></div>
          {valResult.total > 0 && <>
            <div style={{ height: 16, width: 1, background: t.bdr }} />
            <div><span style={{ fontSize: 10, color: GOLD, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginRight: 4 }}>Value</span><span style={{ fontSize: 18, fontFamily: SERIF, color: GOLD }}>{fd(valResult.total)}</span></div>
          </>}
          {valResult.balanceSheet?.totalWorkingCapital > 0 && <>
            <div style={{ height: 16, width: 1, background: t.bdr }} />
            <div><span style={{ fontSize: 10, color: GREEN, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginRight: 4 }}>WC Freed</span><span style={{ fontSize: 18, fontFamily: SERIF, color: GREEN }}>{fm(valResult.balanceSheet.totalWorkingCapital)}</span></div>
          </>}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {assessmentProfile.companyName && (
            <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 6, background: GOLD + "12", border: `1px solid ${GOLD}25`, color: GOLD, fontWeight: 600, whiteSpace: "nowrap" }}>
              {assessmentProfile.companyName} · {assessmentProfile.industry || "—"} · {assessmentProfile.revenueBand || "—"} · FY{assessmentProfile.fiscalYear}
            </span>
          )}
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {steps.map(s => {
              const isComplete = stepStatus[s.n];
              const isCurrent = step === s.n;
              const isLocked = (s.n === 3 && !(stepStatus[1] && stepStatus[2])) ||
                (s.n === 4 && !(stepStatus[1] && stepStatus[2])) ||
                (s.n === 5 && !(stepStatus[3] && stepStatus[4])) ||
                (s.n === 6 && !(stepStatus[3] && stepStatus[4])) ||
                (s.n === 7 && !(stepStatus[5] && stepStatus[6]));
              return (
                <button key={s.n} onClick={() => !isLocked && setStep(s.n)} style={{
                  background: isCurrent ? GOLD : isComplete ? GREEN + "15" : "none",
                  color: isCurrent ? "#111" : isLocked ? t.sub : isComplete ? GREEN : t.tx2,
                  border: isCurrent ? "none" : isComplete ? `1px solid ${GREEN}33` : `1px solid ${t.bdr}`,
                  borderRadius: 6, padding: "4px 12px", cursor: isLocked ? "not-allowed" : "pointer",
                  fontSize: 11, fontWeight: isCurrent ? 700 : 500, fontFamily: FONT,
                  opacity: isLocked ? 0.5 : 1,
                }}>
                  {isComplete && !isCurrent && <span style={{ color: GOLD, marginRight: 2 }}>✓</span>}
                  {isLocked && <span style={{ marginRight: 2, fontSize: 9 }}>🔒</span>}
                  {s.n}. {s.l}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>

        {/* ═══════════════════════════════════════════════
            STEP 1 — Browse APQC L1→L4, Select Scope
           ═══════════════════════════════════════════════ */}
        {step === 1 && (
          <div>
            {stepHeader(1, "Process Scope Selection", "Select the L4 processes to include in this assessment.")}
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
                          {(TRANSFORMATION_AREAS[selectedFunction] || []).map(bp => {
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
                          const bps = TRANSFORMATION_AREAS[selectedFunction] || [];
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
                                  {proc.kpis?.length > 0 && <span title={proc.kpis.map(k => k.name).join("\n")} style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: GREEN + "15", color: GREEN, fontWeight: 600, cursor: "help" }}>{proc.kpis.length} KPIs</span>}
                                  {proc.sap?.[0] && <SapBadge module={proc.sap[0].module} />}
                                  {proc.valLevers?.[0] && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: ORANGE + "15", color: ORANGE }}>{proc.valLevers[0].vclass}</span>}
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
                                    <span title={p.kpis?.map(k => k.name).join("\n") || "No KPIs"} style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: GREEN + "15", color: GREEN, fontWeight: 600, cursor: "help" }}>{p.kpis?.length || 0}</span>
                                  </td>
                                  <td style={{ padding: "4px 8px", borderBottom: `1px solid ${t.bdr}30` }}>
                                    {p.sap?.[0] && <SapBadge module={p.sap[0].module} />}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ));
                    })()}
                    {/* V2: Process Ownership Register */}
                    <div style={{ marginTop: 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div style={labelStyle}>Process Ownership</div>
                        <button onClick={() => {
                          const rows = [["Process ID","Process Name","L2","L3","Owner Name","Role"]];
                          selProcs.forEach(p => {
                            const o = processOwnership[p.id] || {};
                            rows.push([p.l4, `"${p.label}"`, `"${p.l2}"`, `"${p.l3}"`, `"${o.owner || ""}"`, o.role || ""]);
                          });
                          const csv = rows.map(r => r.join(",")).join("\n");
                          const blob = new Blob([csv], { type: "text/csv" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url; a.download = "ownership_register.csv"; a.click();
                          URL.revokeObjectURL(url);
                        }} style={{ fontSize: 11, padding: "5px 14px", borderRadius: 6, background: GREEN + "15", border: `1px solid ${GREEN}44`, color: GREEN, cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}>
                          Download Ownership Register (CSV)
                        </button>
                      </div>
                      {(() => {
                        const unowned = selProcs.filter(p => !processOwnership[p.id]?.owner?.trim());
                        return unowned.length > 0 ? (
                          <div style={{ padding: "8px 12px", background: RED + "10", border: `1px solid ${RED}33`, borderRadius: 8, marginBottom: 12, fontSize: 11, color: RED }}>
                            {unowned.length} of {selProcs.length} selected processes have no owner assigned. Assign owners before proceeding to Step 2.
                          </div>
                        ) : (
                          <div style={{ padding: "8px 12px", background: GREEN + "10", border: `1px solid ${GREEN}33`, borderRadius: 8, marginBottom: 12, fontSize: 11, color: GREEN }}>
                            All {selProcs.length} processes have owners assigned.
                          </div>
                        );
                      })()}
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead><tr>
                          {["APQC", "Process", "Owner Name", "Role"].map((h, i) => (
                            <th key={i} style={{ padding: "4px 8px", borderBottom: `1px solid ${t.bdr}`, textAlign: "left", color: t.mut, fontWeight: 600, fontSize: 10 }}>{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {selProcs.map(p => {
                            const o = processOwnership[p.id] || {};
                            return (
                              <tr key={p.id}>
                                <td style={{ padding: "4px 8px", borderBottom: `1px solid ${t.bdr}30`, fontFamily: "monospace", fontSize: 10, color: t.mut }}>{p.l4}</td>
                                <td style={{ padding: "4px 8px", borderBottom: `1px solid ${t.bdr}30`, color: t.tx, fontSize: 11 }}>{p.label}</td>
                                <td style={{ padding: "4px 8px", borderBottom: `1px solid ${t.bdr}30` }}>
                                  <input
                                    type="text"
                                    value={o.owner || ""}
                                    onChange={e => setProcessOwnership(prev => ({ ...prev, [p.id]: { ...prev[p.id], owner: e.target.value } }))}
                                    placeholder="Owner name"
                                    style={{ width: "100%", padding: "4px 8px", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 4, color: t.tx, fontSize: 11, fontFamily: FONT, outline: "none", boxSizing: "border-box" }}
                                  />
                                </td>
                                <td style={{ padding: "4px 8px", borderBottom: `1px solid ${t.bdr}30` }}>
                                  <select
                                    value={o.role || ""}
                                    onChange={e => setProcessOwnership(prev => ({ ...prev, [p.id]: { ...prev[p.id], role: e.target.value } }))}
                                    style={{ width: "100%", padding: "4px 8px", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 4, color: t.tx, fontSize: 11, fontFamily: FONT, outline: "none" }}
                                  >
                                    <option value="">Select role</option>
                                    <option value="Owner">Owner</option>
                                    <option value="Coach">Coach</option>
                                    <option value="Contributor">Contributor</option>
                                  </select>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ textAlign: "right", marginTop: 16 }}>
                      <button onClick={() => {
                        const unowned = selProcs.filter(p => !processOwnership[p.id]?.owner?.trim());
                        if (unowned.length > 0 && !window.confirm(`${unowned.length} processes have no owner assigned. Continue anyway?`)) return;
                        setStep(2);
                      }} style={btnPrimary}>Confirm Scope — Baseline Research →</button>
                    </div>
                  </div>
                )}

                {/* BlueprintReconciler Modal */}
                {showBlueprint && (
                  <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: t.card, border: `1px solid ${t.bdr}`, borderRadius: 16, padding: 24, maxWidth: 700, width: "90%", maxHeight: "80vh", overflowY: "auto" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div style={{ fontSize: 18, fontFamily: SERIF, color: GOLD }}>EY.ai Value Blueprint Reconciler</div>
                        <button onClick={() => setShowBlueprint(false)} style={{ background: "none", border: "none", color: t.mut, cursor: "pointer", fontSize: 20 }}>×</button>
                      </div>
                      <Suspense fallback={<div style={{ padding: 20, textAlign: "center", color: t.mut }}>Loading...</div>}>
                        <BlueprintReconciler
                          blueprints={TRANSFORMATION_AREAS[selectedFunction] || []}
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
                                          <span title={proc.kpis?.map(k => k.name).join("\n") || "No KPIs"} style={{ fontSize: 10, color: t.mut, cursor: "help" }}>{proc.kpis?.length || 0} KPIs</span>
                                          {proc.sap?.[0] && <SapBadge module={proc.sap[0].module} />}
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

            {/* ─── EY.ai Value Blueprint Alignment ─── */}
            {selectedProcs.size > 0 && (() => {
              const tierCounts = {};
              BLUEPRINT_TIERS.forEach(bt => tierCounts[bt.id] = 0);
              selProcs.forEach(p => (p.blueprintTiers || []).forEach(tid => { tierCounts[tid] = (tierCounts[tid] || 0) + 1; }));
              const coveredCount = BLUEPRINT_TIERS.filter(bt => tierCounts[bt.id] > 0).length;
              return (
                <div style={{ marginTop: 24, padding: 20, background: t.card, border: `1px solid ${t.bdr}`, borderRadius: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.tx, marginBottom: 4, fontFamily: SERIF }}>EY.ai Value Blueprint Alignment</div>
                  <div style={{ fontSize: 11, color: t.tx2, marginBottom: 14 }}>Selected processes cover <span style={{ color: GOLD, fontWeight: 700 }}>{coveredCount} of 7</span> blueprint tiers</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {BLUEPRINT_TIERS.map(bt => {
                      const count = tierCounts[bt.id] || 0;
                      const covered = count > 0;
                      return (
                        <div key={bt.id} style={{ flex: "1 1 120px", minWidth: 110, padding: "10px 10px", borderRadius: 8, background: covered ? bt.color + "12" : t.bg, border: `1px solid ${covered ? bt.color + "33" : t.bdr}`, opacity: covered ? 1 : 0.45, textAlign: "center" }}>
                          <div style={{ fontSize: 18, marginBottom: 2 }}>{bt.icon}</div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: covered ? bt.color : t.mut }}>{bt.name}</div>
                          {covered && <div style={{ fontSize: 9, color: t.tx2, marginTop: 2 }}>{count} processes</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* ─── Collapsible EY.ai Value Blueprint Explainer ─── */}
            <div style={{ marginTop: 16 }}>
              <button onClick={() => setShowBlueprintExplainer(prev => !prev)} style={{ background: "none", border: `1px solid ${t.bdr}`, borderRadius: 8, padding: "8px 16px", color: t.tx2, fontSize: 12, cursor: "pointer", fontFamily: FONT, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                {showBlueprintExplainer ? "▾" : "▸"} About EY.ai Value Blueprints
              </button>
              {showBlueprintExplainer && (
                <div style={{ marginTop: 12, padding: 20, background: t.card, border: `1px solid ${t.bdr}`, borderRadius: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: GOLD, fontFamily: SERIF, marginBottom: 2 }}>EY.ai Value Blueprint Framework</div>
                  <div style={{ fontSize: 12, color: t.tx2, marginBottom: 16 }}>Seven interdependent tiers for building AI-native operations</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {[
                      { mapping: "Quantifies customer-facing process improvements (O2C dispute resolution, collections, order management)" },
                      { mapping: "Models human-AI collaboration through agent feasibility scoring and FTE impact analysis" },
                      { mapping: "Core of PrismL4 — APQC L4 process baseline, benchmarking, and value calculation" },
                      { mapping: "Audit trail, role-based access, responsible AI guardrails on Catalyst recommendations" },
                      { mapping: "Multi-source benchmarks, process mining evidence, KPI analytics and quartile scoring" },
                      { mapping: "AI agent assessment per process — feasibility, implementation specs, incremental value" },
                      { mapping: "SAP S/4HANA module mapping, system integration prerequisites, data quality scoring" },
                    ].map((info, i) => {
                      const bt = BLUEPRINT_TIERS[i];
                      return (
                        <div key={bt.id} style={{ padding: "12px 14px", background: t.bg, borderRadius: 8, borderLeft: `3px solid ${bt.color}`, display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: bt.color, minWidth: 16, textAlign: "center" }}>{i + 1}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: t.tx }}>{bt.icon} {bt.name}</div>
                            <div style={{ fontSize: 11, color: t.tx2, marginTop: 2 }}>{bt.description}</div>
                            <div style={{ fontSize: 10, color: t.mut, marginTop: 4, fontStyle: "italic" }}>{info.mapping}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 10, color: t.mut, marginTop: 14, lineHeight: 1.6, fontStyle: "italic" }}>
                    PrismL4 provides the quantitative foundation for EY.ai Value Blueprint execution — measuring the value opportunity across tiers to prioritize transformation investments.
                  </div>
                </div>
              )}
            </div>

            <div style={{ textAlign: "right", marginTop: 20 }}>
              <button onClick={() => {
                const unowned = selProcs.filter(p => !processOwnership[p.id]?.owner?.trim());
                if (unowned.length > 0 && !window.confirm(`${unowned.length} processes have no owner assigned. Continue anyway?`)) return;
                setStep(2);
              }} disabled={selectedProcs.size === 0} style={{ ...btnPrimary, opacity: selectedProcs.size > 0 ? 1 : 0.4 }}>Baseline Research →</button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            STEP 2 — Baseline Research (Guided Sub-Flow)
           ═══════════════════════════════════════════════ */}
        {step === 2 && (
          <div>
            {stepHeader(2, "Baseline Research", viewMode === "consultant" ? "Collect baseline data through questionnaires, manual entry, or process mining." : "Review baseline data collected from questionnaires and process mining.")}

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
                      <div style={{ fontSize: 15, fontWeight: 700, color: t.tx, marginBottom: 4 }}>Download Questionnaire <span title="Smart questionnaire with 5 universal + conditional follow-up questions per process. Send to your L2/L3 process owners." style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, borderRadius: "50%", background: t.mut + "20", color: t.mut, fontSize: 8, fontWeight: 700, cursor: "help", verticalAlign: "middle" }}>?</span></div>
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
              const procsWithKPIs = selProcs.filter(p => Object.keys(procValues).some(k => k === p.id && Object.keys(procValues[k]).some(vk => vk.startsWith("kpi_current_")))).length;
              const dataCount = procsWithBaseline + procsWithAnswers + procsWithKPIs;
              const hasData = dataCount > 0;
              return (
                <div style={{ marginBottom: 16, padding: 20, background: t.card, border: `1px solid ${hasData ? GOLD + "44" : GOLD + "22"}`, borderLeft: `4px solid ${GOLD}`, borderRadius: 12, opacity: hasData ? 0.85 : 1 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ fontSize: 28, fontFamily: SERIF, color: GOLD, fontWeight: 700, lineHeight: 1 }}>②</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: t.tx, marginBottom: 4 }}>Collect Baseline Data</div>
                      <div style={{ fontSize: 12, color: t.tx2, lineHeight: 1.6, marginBottom: 10 }}>Upload questionnaire responses, enter data via questionnaire, or input KPI values directly.</div>

                      {/* Sub-tab switcher */}
                      <div style={{ display: "flex", gap: 2, marginBottom: 12, borderBottom: `1px solid ${t.bdr}` }}>
                        {[
                          { key: "questionnaire", label: "Questionnaire", color: GOLD },
                          { key: "manual", label: "Enter Manually", color: GREEN },
                        ].map(tab => (
                          <button key={tab.key} onClick={() => { setStep2Tab(tab.key); if (tab.key === "questionnaire") setFocusProc(focusProc || selProcs[0]?.id || null); }}
                            style={{
                              fontSize: 11, padding: "6px 14px", fontWeight: step2Tab === tab.key ? 700 : 500,
                              background: step2Tab === tab.key ? tab.color + "12" : "transparent",
                              border: "none", borderBottomStyle: "solid", borderBottomWidth: 2,
                              borderBottomColor: step2Tab === tab.key ? tab.color : "transparent",
                              color: step2Tab === tab.key ? tab.color : t.tx2,
                              cursor: "pointer", fontFamily: FONT,
                            }}>{tab.label}</button>
                        ))}
                      </div>

                      {/* Questionnaire Tab */}
                      {step2Tab === "questionnaire" && (
                        <div>
                          <div style={{ marginBottom: 8 }}>
                            <label style={{ display: "block", fontSize: 14, padding: "12px 24px", borderRadius: 10, background: GOLD, border: "none", color: "#111", cursor: "pointer", fontFamily: FONT, fontWeight: 600, textAlign: "center", marginBottom: 8 }}>
                              ↑ Upload Responses (CSV)
                              <input type="file" accept=".csv" onChange={handleQuestionnaireUpload} style={{ display: "none" }} />
                            </label>
                            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                              <button onClick={() => setShowPasteModal(true)} style={{ fontSize: 12, padding: "8px 16px", borderRadius: 8, background: "none", border: `1px solid ${t.bdr}`, color: t.tx2, cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}>
                                ⎘ Paste Responses
                              </button>
                              <button onClick={() => setFocusProc(focusProc ? null : selProcs[0]?.id || null)} style={{ fontSize: 12, padding: "8px 16px", borderRadius: 8, background: "none", border: `1px solid ${t.bdr}`, color: t.tx2, cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}>
                                ⌨ Enter via Questionnaire
                              </button>
                              <span onClick={() => setStep(3)} style={{ fontSize: 11, color: t.mut, fontStyle: "italic", cursor: "pointer", marginLeft: 4 }}>Skip for now →</span>
                            </div>
                          </div>
                          {hasData && <span style={{ fontSize: 11, color: GREEN, fontWeight: 600, display: "block", marginBottom: 8 }}>✓ Data received for {dataCount} processes</span>}

                          {/* Inline questionnaire entry — process selector + panels */}
                          {focusProc && (
                            <div style={{ marginTop: 8 }}>
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
                                    {(Object.keys(baselineData).some(k => k.startsWith(proc.id)) || Object.keys(questAnswers).some(k => k.startsWith(proc.id + "_q-"))) && <span style={{ marginLeft: 4, color: GREEN }}>✓</span>}
                                  </button>
                                ))}
                              </div>
                              <div style={{ fontSize: 10, color: t.mut, marginBottom: 8 }}>{selProcs.filter(p => Object.keys(questAnswers).some(k => k.startsWith(p.id + "_q-")) || Object.keys(baselineData).some(k => k.startsWith(p.id))).length} of {selProcs.length} processes have baseline data</div>

                              {PROC_MAP[focusProc] && (
                                <div style={{ ...cardStyle, maxHeight: 500, overflowY: "auto" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                    <div>
                                      <div style={{ fontSize: 10, fontFamily: "monospace", color: t.mut }}>{PROC_MAP[focusProc].l4}</div>
                                      <div style={{ fontSize: 16, fontWeight: 600, color: t.tx }}>{PROC_MAP[focusProc].label}</div>
                                    </div>
                                    <button onClick={() => setFocusProc(null)} style={{ background: "none", border: "none", color: t.mut, cursor: "pointer", fontSize: 16 }}>×</button>
                                  </div>

                                  {/* Smart Questions */}
                                  {(() => {
                                    const visibleQs = getVisibleQuestions(focusProc);
                                    const answeredCount = visibleQs.filter(q => {
                                      const v = questAnswers[`${focusProc}_${q.id}`];
                                      return v !== undefined && v !== "" && v !== null;
                                    }).length;
                                    const warnings = getValidationWarnings(focusProc);
                                    const summary = getSmartSummary(focusProc);
                                    const effQs = visibleQs.filter(q => q.category === "efficiency");
                                    const leakQs = visibleQs.filter(q => q.category === "leakage");
                                    const inputStyle = { width: "100%", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 6, padding: "6px 10px", color: t.tx, fontFamily: FONT, fontSize: 12, boxSizing: "border-box" };
                                    const renderQ = (q) => (
                                      <div key={q.id} style={{ marginBottom: 10, transition: "all 0.3s ease" }}>
                                        <div style={{ fontSize: 11, color: t.tx2, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
                                          {q.question}
                                          {q.required && <span style={{ color: RED, fontSize: 9 }}>*</span>}
                                          {!q.required && <span style={{ fontSize: 9, color: t.mut, fontStyle: "italic" }}>conditional</span>}
                                        </div>
                                        {q.type === "dropdown" ? (
                                          <select value={questAnswers[`${focusProc}_${q.id}`] || ""} onChange={e => setSmartAnswer(focusProc, q.id, e.target.value)} style={inputStyle}>
                                            <option value="">Select...</option>
                                            {q.options.map(o => <option key={o} value={o}>{o}</option>)}
                                          </select>
                                        ) : q.type === "rating" ? (
                                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                            {[1, 2, 3, 4, 5].map(n => {
                                              const sel = parseInt(questAnswers[`${focusProc}_${q.id}`]) === n;
                                              return <button key={n} onClick={() => setSmartAnswer(focusProc, q.id, n)} style={{ width: 32, height: 32, borderRadius: "50%", border: `2px solid ${sel ? GOLD : t.bdr}`, background: sel ? GOLD + "25" : "transparent", color: sel ? GOLD : t.mut, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: FONT }}>{n}</button>;
                                            })}
                                            {questAnswers[`${focusProc}_${q.id}`] && <span style={{ fontSize: 10, color: GOLD, marginLeft: 4 }}>{q.labels[parseInt(questAnswers[`${focusProc}_${q.id}`]) - 1]}</span>}
                                          </div>
                                        ) : q.type === "text" ? (
                                          <textarea value={questAnswers[`${focusProc}_${q.id}`] || ""} onChange={e => setSmartAnswer(focusProc, q.id, e.target.value)}
                                            placeholder="Enter your response..." rows={2} style={{ ...inputStyle, resize: "vertical", minHeight: 40 }} />
                                        ) : q.type === "number_with_unit" ? (
                                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                            <input type="number" value={questAnswers[`${focusProc}_${q.id}`] || ""} onChange={e => setSmartAnswer(focusProc, q.id, e.target.value)}
                                              placeholder="0" style={{ ...inputStyle, flex: 1, width: "auto" }} />
                                            <select value={questAnswers[`${focusProc}_${q.id}-unit`] || q.units[1]} onChange={e => setSmartUnit(focusProc, q.id, e.target.value)}
                                              style={{ background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 6, padding: "6px 8px", color: t.tx, fontFamily: FONT, fontSize: 11 }}>
                                              {q.units.map(u => <option key={u} value={u}>{u}</option>)}
                                            </select>
                                          </div>
                                        ) : (
                                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                            <input type="number" value={questAnswers[`${focusProc}_${q.id}`] || ""} onChange={e => setSmartAnswer(focusProc, q.id, e.target.value)}
                                              min={q.range?.[0]} max={q.range?.[1]} placeholder="0" style={{ ...inputStyle, flex: 1, width: "auto" }} />
                                            {q.unit && <span style={{ fontSize: 10, color: t.mut }}>{q.unit}</span>}
                                          </div>
                                        )}
                                        {warnings[q.id] && <div style={{ fontSize: 10, color: GOLD, marginTop: 2 }}>{warnings[q.id]}</div>}
                                      </div>
                                    );
                                    return (
                                      <>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                          <div style={{ fontSize: 10, color: t.mut }}>{answeredCount} of {visibleQs.length} questions answered</div>
                                          <div style={{ width: 80, height: 4, borderRadius: 2, background: t.bdr }}>
                                            <div style={{ width: `${visibleQs.length ? (answeredCount / visibleQs.length) * 100 : 0}%`, height: "100%", borderRadius: 2, background: answeredCount === visibleQs.length ? GREEN : GOLD, transition: "width 0.3s ease" }} />
                                          </div>
                                        </div>
                                        <div style={{ padding: 12, background: GREEN + "08", border: `1px solid ${GREEN}22`, borderLeft: `3px solid ${GREEN}`, borderRadius: 10, marginBottom: 12 }}>
                                          <div style={{ fontSize: 11, color: GREEN, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Process Efficiency</div>
                                          {effQs.map(renderQ)}
                                        </div>
                                        {leakQs.length > 0 && (
                                          <div style={{ padding: 12, background: GOLD + "08", border: `1px solid ${GOLD}22`, borderLeft: `3px solid ${GOLD}`, borderRadius: 10, marginBottom: 12 }}>
                                            <div style={{ fontSize: 11, color: GOLD, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Data-Driven Leakage</div>
                                            {leakQs.map(renderQ)}
                                          </div>
                                        )}
                                        {summary && (
                                          <div style={{ padding: 10, background: BLUE + "08", border: `1px solid ${BLUE}22`, borderRadius: 8, marginBottom: 12 }}>
                                            <div style={{ fontSize: 10, color: BLUE, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Auto-Summary</div>
                                            <div style={{ fontSize: 12, color: t.tx2, lineHeight: 1.6 }}>{summary}</div>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}

                                  {/* MiningLinker */}
                                  {uploadedMining[focusProc] && baselineData[`${focusProc}_a_ftes`] && (
                                    <Suspense fallback={null}>
                                      <MiningLinker procId={focusProc} proc={PROC_MAP[focusProc]} miningData={uploadedMining[focusProc]} baselineData={baselineData} theme={t} />
                                    </Suspense>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Enter Manually Tab — Inline KPI baseline entry */}
                      {step2Tab === "manual" && (
                        <div>
                          <div style={{ fontSize: 12, color: t.tx2, lineHeight: 1.6, marginBottom: 12 }}>Enter current KPI values directly for each process. These values drive the gap analysis and value calculation.</div>
                          <div style={{ display: "grid", gap: 8 }}>
                            {selProcs.map(proc => {
                              const vals = procValues[proc.id] || {};
                              const setVal = (key, val) => setProcValues(prev => ({ ...prev, [proc.id]: { ...(prev[proc.id] || {}), [key]: val } }));
                              const filledCount = (proc.kpis || []).filter((_, ki) => vals[`kpi_current_${ki}`] != null).length;
                              const totalKpis = (proc.kpis || []).length;
                              return (
                                <div key={proc.id} style={{ ...cardStyle, borderLeft: `3px solid ${proc.l1Color}` }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                    <div>
                                      <span style={{ fontSize: 10, fontFamily: "monospace", color: t.mut, marginRight: 6 }}>{proc.l4}</span>
                                      <span style={{ fontSize: 13, fontWeight: 600, color: t.tx }}>{proc.label}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                      <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: proc.l1Color + "15", color: proc.l1Color, fontWeight: 600 }}>{proc.e2e}</span>
                                      {filledCount > 0 && <span style={{ fontSize: 10, color: GREEN, fontWeight: 600 }}>{filledCount}/{totalKpis}</span>}
                                    </div>
                                  </div>
                                  <div style={{ display: "grid", gap: 4 }}>
                                    {(proc.kpis || []).map((kpi, ki) => (
                                      <div key={ki} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                                        <span style={{ fontSize: 12, color: t.tx2, flex: 1 }}>{kpi.name}</span>
                                        <span style={{ fontSize: 10, color: t.mut, minWidth: 50, textAlign: "right" }}>Bench: {kpi.benchmark ?? "—"}</span>
                                        <input type="number" placeholder="Current" value={vals[`kpi_current_${ki}`] ?? ""} onChange={e => {
                                          const v = e.target.value === "" ? null : parseFloat(e.target.value);
                                          setVal(`kpi_current_${ki}`, v);
                                          if (v != null) setKpiSources(prev => ({ ...prev, [proc.id]: { ...(prev[proc.id] || {}), [`kpi_current_${ki}`]: "manual" } }));
                                        }}
                                          style={{ width: 80, background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 4, padding: "3px 6px", color: t.tx, fontFamily: "monospace", fontSize: 12, textAlign: "right" }} />
                                        <span style={{ fontSize: 10, color: t.mut, minWidth: 30 }}>{kpi.unit}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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
                              // Sync mining KPI values into procValues
                              setProcValues(prev => {
                                let updated = { ...prev };
                                Object.entries(newMining).forEach(([procId, mData]) => {
                                  const proc = PROC_MAP[procId];
                                  if (!proc?.kpis) return;
                                  proc.kpis.forEach((kpi, ki) => {
                                    let mVal = null;
                                    if (mData.conformance != null && /conformance/i.test(kpi.name) && kpi.unit === "%") mVal = mData.conformance;
                                    else if (mData.cycleTime != null && /cycle time|processing time|turnaround/i.test(kpi.name) && (kpi.unit === "days" || kpi.unit === "hours")) mVal = mData.cycleTime;
                                    else if (mData.rework != null && /rework/i.test(kpi.name) && kpi.unit === "%") mVal = mData.rework;
                                    if (mVal != null && updated[procId]?.[`kpi_current_${ki}`] == null) {
                                      updated = { ...updated, [procId]: { ...(updated[procId] || {}), [`kpi_current_${ki}`]: mVal } };
                                    }
                                  });
                                });
                                return updated;
                              });
                              setKpiSources(prev => {
                                let updated = { ...prev };
                                Object.entries(newMining).forEach(([procId, mData]) => {
                                  const proc = PROC_MAP[procId];
                                  if (!proc?.kpis) return;
                                  proc.kpis.forEach((kpi, ki) => {
                                    let mVal = null;
                                    if (mData.conformance != null && /conformance/i.test(kpi.name) && kpi.unit === "%") mVal = mData.conformance;
                                    else if (mData.cycleTime != null && /cycle time|processing time|turnaround/i.test(kpi.name) && (kpi.unit === "days" || kpi.unit === "hours")) mVal = mData.cycleTime;
                                    else if (mData.rework != null && /rework/i.test(kpi.name) && kpi.unit === "%") mVal = mData.rework;
                                    if (mVal != null) {
                                      updated = { ...updated, [procId]: { ...(updated[procId] || {}), [`kpi_current_${ki}`]: "mining" } };
                                    }
                                  });
                                });
                                return updated;
                              });
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

                      {/* Example data format — collapsible */}
                      <MiningExampleFormat theme={t} />

                      <div style={{ marginTop: 8, padding: "8px 12px", background: GOLD + "08", border: `1px solid ${GOLD}22`, borderRadius: 8, fontSize: 11, color: t.tx2, lineHeight: 1.6 }}>
                        Don't have process mining data? Skip this step — questionnaire responses will be used instead. Process mining data upgrades your confidence score from <span style={{ color: GOLD, fontWeight: 600 }}>Medium</span> → <span style={{ color: GREEN, fontWeight: 600 }}>High</span>.
                      </div>
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
                                  if (v != null) {
                                    const mProc = PROC_MAP[signavioView];
                                    if (mProc?.kpis) {
                                      mProc.kpis.forEach((kpi, ki) => {
                                        let match = false;
                                        if (f.key === "conformance" && /conformance/i.test(kpi.name) && kpi.unit === "%") match = true;
                                        else if (f.key === "cycleTime" && /cycle time|processing time|turnaround/i.test(kpi.name) && (kpi.unit === "days" || kpi.unit === "hours")) match = true;
                                        else if (f.key === "rework" && /rework/i.test(kpi.name) && kpi.unit === "%") match = true;
                                        if (match) {
                                          setProcValues(prev => ({ ...prev, [signavioView]: { ...(prev[signavioView] || {}), [`kpi_current_${ki}`]: v } }));
                                          setKpiSources(prev => ({ ...prev, [signavioView]: { ...(prev[signavioView] || {}), [`kpi_current_${ki}`]: "mining" } }));
                                        }
                                      });
                                    }
                                  }
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

            {/* ─── Sub-step ④ — Company Financials ─── */}
            {(() => {
              const hasFinancials = !!companyFinancials;
              const draftGP = financialsDraft.revenue && financialsDraft.cogs ? (parseFloat(financialsDraft.revenue) - parseFloat(financialsDraft.cogs)).toFixed(1) : "";
              const draftEBITDA = financialsDraft.revenue && financialsDraft.cogs && financialsDraft.sga
                ? (parseFloat(financialsDraft.revenue) - parseFloat(financialsDraft.cogs) - parseFloat(financialsDraft.sga)).toFixed(1) : "";

              const confirmFinancials = (data) => {
                const cf = {
                  revenue: parseFloat(data.revenue) || null,
                  cogs: parseFloat(data.cogs) || null,
                  grossProfit: parseFloat(data.grossProfit) || (parseFloat(data.revenue) - parseFloat(data.cogs)) || null,
                  sga: parseFloat(data.sga) || null,
                  ebitda: parseFloat(data.ebitda) || null,
                  headcount: parseInt(data.headcount) || null,
                  financeHeadcount: parseInt(data.financeHeadcount) || null,
                  annualPayroll: parseFloat(data.annualPayroll) || null,
                  fiscalYear: data.fiscalYear || new Date().getFullYear().toString(),
                  currency: data.currency || "USD",
                  companyName: data.companyName || baseline.company,
                  source: data.source || "manual",
                  segments: data.segments || [],
                };
                setCompanyFinancials(cf);
                // Also sync baseline if values are meaningful
                if (cf.revenue) setBaseline(prev => ({ ...prev, revenue: cf.revenue, company: cf.companyName || prev.company }));
                if (cf.cogs) setBaseline(prev => ({ ...prev, cogs: cf.cogs }));
                if (cf.sga) setBaseline(prev => ({ ...prev, sga: cf.sga }));
                if (cf.ebitda) setBaseline(prev => ({ ...prev, ebitda: cf.ebitda }));
                setFinancialsEntryMode(null);
              };

              const handleFileUpload = async (file) => {
                setFinancialsExtracting(true);
                const reader = new FileReader();
                reader.onload = async (evt) => {
                  const base64 = evt.target.result.split(",")[1];
                  const prompt = `You are a financial data extraction assistant. Extract the following line items from this financial document and return ONLY a JSON object with no other text: { "revenue": number, "cogs": number, "grossProfit": number, "sga": number, "ebitda": number, "headcount": number, "financeHeadcount": number, "annualPayroll": number, "fiscalYear": string, "currency": string, "companyName": string, "source": "uploaded", "segments": [] } Use null for any field not found. All monetary values in millions USD. If you see segment breakdowns, also return segments: [{name, revenue, ebitda}]. The file content (base64 ${file.name.endsWith(".pdf") ? "PDF" : "Excel"}): ${base64.slice(0, 50000)}`;
                  try {
                    // Use the same callCatalyst pattern — server proxy first
                    const proxyRes = await fetch("/api/catalyst", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ prompt }),
                    });
                    let text = "";
                    if (proxyRes.ok) {
                      const proxyData = await proxyRes.json();
                      text = proxyData.result || "";
                    } else if (apiKey) {
                      const response = await fetch("https://api.anthropic.com/v1/messages", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
                        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, messages: [{ role: "user", content: prompt }] }),
                      });
                      const data = await response.json();
                      text = data.content?.map(i => i.text || "").join("\n") || "";
                    }
                    // Parse JSON from response
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                      const parsed = JSON.parse(jsonMatch[0]);
                      setFinancialsDraft(prev => ({ ...prev, ...parsed, source: "uploaded" }));
                      // Set confidence per field
                      const conf = {};
                      Object.keys(parsed).forEach(k => {
                        if (parsed[k] != null && parsed[k] !== "") conf[k] = "found";
                        else conf[k] = "not_found";
                      });
                      setFinancialsConfidence(conf);
                      setFinancialsEntryMode("manual"); // Show review table
                    }
                  } catch (err) {
                    console.error("Financial extraction error:", err);
                  }
                  setFinancialsExtracting(false);
                };
                reader.readAsDataURL(file);
              };

              return (
                <div style={{ marginBottom: 16, padding: 20, background: t.card, border: `1px solid ${hasFinancials ? GOLD + "44" : GOLD + "22"}`, borderLeft: `4px solid ${GOLD}`, borderRadius: 12 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ fontSize: 28, fontFamily: SERIF, color: GOLD, fontWeight: 700, lineHeight: 1 }}>④</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: t.tx, marginBottom: 4 }}>Company Financials</div>
                      <div style={{ fontSize: 12, color: t.tx2, lineHeight: 1.6, marginBottom: 10 }}>Upload or enter your P&L data to anchor all value calculations to actual financials instead of revenue band estimates.</div>

                      {/* Confirmed banner */}
                      {hasFinancials && !financialsEntryMode && (
                        <div style={{ padding: "10px 16px", background: GREEN + "15", border: `1px solid ${GREEN}33`, borderRadius: 8, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ color: GREEN, fontWeight: 700 }}>✓</span>
                          <span style={{ fontSize: 13, color: GREEN, fontWeight: 600 }}>P&L loaded — {companyFinancials.companyName || baseline.company} FY{companyFinancials.fiscalYear} — All calculations now anchored to your actual financials</span>
                          <div style={{ flex: 1 }} />
                          <button onClick={() => { setFinancialsDraft({ ...companyFinancials }); setFinancialsEntryMode("manual"); }} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, background: "transparent", border: `1px solid ${t.bdr}`, color: t.tx2, cursor: "pointer", fontFamily: FONT }}>Edit</button>
                        </div>
                      )}

                      {/* Option cards */}
                      {!hasFinancials && !financialsEntryMode && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <div onClick={() => document.getElementById("financials-upload").click()} style={{ ...cardStyle, padding: "20px 16px", cursor: "pointer", textAlign: "center", border: `1px dashed ${GOLD}44` }}>
                            <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: t.tx, marginBottom: 4 }}>Upload P&L</div>
                            <div style={{ fontSize: 11, color: t.mut }}>PDF or Excel (.xlsx)</div>
                            <input id="financials-upload" type="file" accept=".pdf,.xlsx,.xls" onChange={e => { const f = e.target.files[0]; if (f) handleFileUpload(f); }} style={{ display: "none" }} />
                          </div>
                          <div onClick={() => setFinancialsEntryMode("manual")} style={{ ...cardStyle, padding: "20px 16px", cursor: "pointer", textAlign: "center", border: `1px dashed ${GOLD}44` }}>
                            <div style={{ fontSize: 24, marginBottom: 8 }}>⌨</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: t.tx, marginBottom: 4 }}>Enter Manually</div>
                            <div style={{ fontSize: 11, color: t.mut }}>8-row financial summary</div>
                          </div>
                        </div>
                      )}

                      {financialsExtracting && (
                        <div style={{ padding: 20, textAlign: "center", color: GOLD }}>
                          <div style={{ fontSize: 14, marginBottom: 6 }}>Extracting financial data...</div>
                          <div style={{ fontSize: 11, color: t.mut }}>Parsing document with AI</div>
                        </div>
                      )}

                      {/* Manual entry / review table */}
                      {financialsEntryMode === "manual" && (
                        <div style={{ marginTop: 12 }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead><tr>
                              <th style={{ padding: "6px 10px", borderBottom: `2px solid ${t.bdr}`, textAlign: "left", color: t.mut, fontSize: 11 }}>Line Item</th>
                              <th style={{ padding: "6px 10px", borderBottom: `2px solid ${t.bdr}`, textAlign: "right", color: t.mut, fontSize: 11 }}>Value ($M / count)</th>
                              <th style={{ padding: "6px 10px", borderBottom: `2px solid ${t.bdr}`, textAlign: "left", color: t.mut, fontSize: 11 }}>Note</th>
                              {Object.keys(financialsConfidence).length > 0 && <th style={{ padding: "6px 10px", borderBottom: `2px solid ${t.bdr}`, textAlign: "center", color: t.mut, fontSize: 11 }}>Status</th>}
                            </tr></thead>
                            <tbody>
                              {[
                                { key: "revenue", label: "Net Revenue", note: "Full year (most recent)", prefix: "$", suffix: "M" },
                                { key: "cogs", label: "Cost of Goods", note: "", prefix: "$", suffix: "M" },
                                { key: "grossProfit", label: "Gross Profit", note: "Auto-calculated", prefix: "$", suffix: "M", auto: true },
                                { key: "sga", label: "SG&A", note: "", prefix: "$", suffix: "M" },
                                { key: "ebitda", label: "EBITDA", note: "Auto-calculated if possible", prefix: "$", suffix: "M", auto: true },
                                { key: "headcount", label: "Total Headcount", note: "People", prefix: "", suffix: "" },
                                { key: "financeHeadcount", label: "Finance FTEs", note: "People", prefix: "", suffix: "" },
                                { key: "annualPayroll", label: "Annual Payroll", note: "Total loaded cost", prefix: "$", suffix: "M" },
                              ].map(row => (
                                <tr key={row.key}>
                                  <td style={{ padding: "6px 10px", borderBottom: `1px solid ${t.bdr}40`, color: t.tx, fontWeight: 500 }}>{row.label}</td>
                                  <td style={{ padding: "6px 10px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right" }}>
                                    <input
                                      type="number"
                                      value={row.auto && row.key === "grossProfit" ? (draftGP || financialsDraft.grossProfit || "") : row.auto && row.key === "ebitda" ? (draftEBITDA || financialsDraft.ebitda || "") : (financialsDraft[row.key] ?? "")}
                                      onChange={e => setFinancialsDraft(prev => ({ ...prev, [row.key]: e.target.value }))}
                                      placeholder="—"
                                      style={{ width: 120, textAlign: "right", background: row.auto ? t.bg : t.card, border: `1px solid ${t.bdr}`, borderRadius: 6, padding: "4px 8px", color: t.tx, fontFamily: "monospace", fontSize: 13 }}
                                      readOnly={row.auto && ((row.key === "grossProfit" && draftGP) || (row.key === "ebitda" && draftEBITDA))}
                                    />
                                  </td>
                                  <td style={{ padding: "6px 10px", borderBottom: `1px solid ${t.bdr}40`, fontSize: 11, color: t.mut }}>{row.note}</td>
                                  {Object.keys(financialsConfidence).length > 0 && (
                                    <td style={{ padding: "6px 10px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "center" }}>
                                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: financialsConfidence[row.key] === "found" ? GREEN + "15" : financialsConfidence[row.key] === "estimated" ? GOLD + "15" : RED + "15", color: financialsConfidence[row.key] === "found" ? GREEN : financialsConfidence[row.key] === "estimated" ? GOLD : RED, fontWeight: 600 }}>
                                        {financialsConfidence[row.key] === "found" ? "Found" : financialsConfidence[row.key] === "estimated" ? "Estimated" : "Not found"}
                                      </span>
                                    </td>
                                  )}
                                </tr>
                              ))}
                              <tr>
                                <td style={{ padding: "6px 10px", borderBottom: `1px solid ${t.bdr}40`, color: t.tx, fontWeight: 500 }}>Fiscal Year</td>
                                <td style={{ padding: "6px 10px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right" }}>
                                  <input type="text" value={financialsDraft.fiscalYear || ""} onChange={e => setFinancialsDraft(prev => ({ ...prev, fiscalYear: e.target.value }))} placeholder="2025" style={{ width: 120, textAlign: "right", background: t.card, border: `1px solid ${t.bdr}`, borderRadius: 6, padding: "4px 8px", color: t.tx, fontFamily: "monospace", fontSize: 13 }} />
                                </td>
                                <td colSpan={2} style={{ padding: "6px 10px", borderBottom: `1px solid ${t.bdr}40`, fontSize: 11, color: t.mut }}>Year of financial data</td>
                              </tr>
                              <tr>
                                <td style={{ padding: "6px 10px", borderBottom: `1px solid ${t.bdr}40`, color: t.tx, fontWeight: 500 }}>Company Name</td>
                                <td style={{ padding: "6px 10px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right" }}>
                                  <input type="text" value={financialsDraft.companyName || ""} onChange={e => setFinancialsDraft(prev => ({ ...prev, companyName: e.target.value }))} placeholder={baseline.company} style={{ width: 200, textAlign: "right", background: t.card, border: `1px solid ${t.bdr}`, borderRadius: 6, padding: "4px 8px", color: t.tx, fontSize: 13 }} />
                                </td>
                                <td colSpan={2} style={{ padding: "6px 10px", borderBottom: `1px solid ${t.bdr}40`, fontSize: 11, color: t.mut }}></td>
                              </tr>
                            </tbody>
                          </table>
                          <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                            <button onClick={() => setFinancialsEntryMode(null)} style={{ fontSize: 12, padding: "8px 20px", borderRadius: 8, background: "transparent", border: `1px solid ${t.bdr}`, color: t.tx2, cursor: "pointer", fontFamily: FONT }}>Cancel</button>
                            <button onClick={() => {
                              const d = { ...financialsDraft };
                              if (draftGP) d.grossProfit = draftGP;
                              if (draftEBITDA) d.ebitda = draftEBITDA;
                              confirmFinancials(d);
                            }} style={{ fontSize: 12, padding: "8px 20px", borderRadius: 8, background: GOLD, border: "none", color: "#111", cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}>Confirm & Apply</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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
            {stepHeader(3, "Value Setting", "Attach value levers and KPIs to each selected process.")}

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
                      {(proc.kpis || []).map((kpi, ki) => {
                        const currentVal = vals[`kpi_current_${ki}`];
                        const displayVal = currentVal ?? kpi.current ?? "";
                        const isDefault = currentVal == null && kpi.current != null;
                        return (
                        <div key={ki} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                          <span style={{ fontSize: 12, color: t.tx2, flex: 1 }}>{kpi.name}</span>
                          <input type="number" placeholder="Current" value={displayVal} onChange={e => setVal(`kpi_current_${ki}`, e.target.value === "" ? null : parseFloat(e.target.value))}
                            disabled={viewMode === "client"}
                            style={{ width: 80, background: isDefault ? GOLD + "08" : t.bg, border: `1px solid ${isDefault ? GOLD + "44" : t.bdr}`, borderRadius: 4, padding: "3px 6px", color: isDefault ? GOLD : t.tx, fontFamily: "monospace", fontSize: 12, textAlign: "right" }} />
                          <span style={{ fontSize: 10, color: t.mut, minWidth: 30 }}>{kpi.unit}</span>
                          {isDefault && <span style={{ fontSize: 8, color: GOLD, whiteSpace: "nowrap" }}>est.</span>}
                        </div>
                        );
                      })}
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
            {stepHeader(4, "Benchmark & Assessment", "Compare your processes against industry benchmarks and generate AI agent assessments.")}

            {/* Module summary badges */}
            {(() => {
              const modules = {};
              selProcs.forEach(p => (p.sap || []).forEach(s => { if (!modules[s.module]) modules[s.module] = []; modules[s.module].push(p.label); }));
              return Object.keys(modules).length > 0 ? (
                <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                  {Object.entries(modules).map(([mod, procs]) => (
                    <div key={mod} title={procs.join(", ")} style={{ padding: "4px 10px", background: BLUE + "10", border: `1px solid ${BLUE}22`, borderRadius: 6, display: "flex", alignItems: "center", gap: 4 }}>
                      <SapBadge module={mod} />
                      <span style={{ fontSize: 9, color: t.mut }}>{procs.length}</span>
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
                  const realCurrent = vals[`kpi_current_${ki}`];
                  const current = realCurrent ?? kpi.current;
                  const isModeled = realCurrent == null && kpi.current != null;
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
                    agentImpact = Math.min(agentImpact, 5);
                  }
                  procErpVal += erpImpact;
                  procAgentVal += agentImpact;
                  return { kpi, ki, current, isModeled, bench, agentBench, erpImpact, agentImpact };
                });

                // Tab state per process — default "benchmarks"
                const procTab = procScenarios[proc.id]?._tab || "sap";
                const setTab = (tab) => setProcScenarios(prev => ({ ...prev, [proc.id]: { ...(prev[proc.id] || {}), _tab: tab } }));

                return (
                  <div key={proc.id} style={{ ...cardStyle, borderLeft: `3px solid ${proc.l1Color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div>
                        <span style={{ fontSize: 10, fontFamily: "monospace", color: t.mut, marginRight: 6 }}>{proc.l4}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: t.tx }}>{proc.label}</span>
                        {(() => { const _bp = getBlueprintForL2(proc.l2id); return _bp && <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, background: _bp.color + "20", color: _bp.color, marginLeft: 4 }}>{_bp.name}</span>; })()}
                      </div>
                      <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: proc.l1Color + "15", color: proc.l1Color, fontWeight: 600 }}>{proc.e2e}</span>
                    </div>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 10 }}>
                      {(proc.blueprintTiers || []).map(tid => { const bt = BLUEPRINT_TIER_MAP[tid]; return bt ? <span key={tid} style={{ fontSize: 9, padding: "1px 6px", borderRadius: 8, background: bt.color + "20", color: bt.color, border: `1px solid ${bt.color}33` }}>{bt.icon} {bt.name}</span> : null; })}
                    </div>

                    {/* Section Tabs */}
                    <div style={{ display: "flex", gap: 2, marginBottom: 12, borderBottom: `1px solid ${t.bdr}` }}>
                      {[
                        { key: "sap", label: "SAP Lever", color: BLUE },
                        { key: "agents", label: "AI Agents", color: GOLD },
                        { key: "benchmarks", label: "Benchmarks", color: GREEN },
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
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <div style={{ fontSize: 11, color: t.tx2 }}>{assessmentProfile.industry && assessmentProfile.revenueBand ? <>Benchmarks — <span style={{ color: GOLD, fontWeight: 600 }}>{assessmentProfile.industry}, {assessmentProfile.revenueBand}</span> peer group</> : <span style={{ color: t.mut, fontStyle: "italic" }}>Complete company setup to see peer benchmarks</span>}</div>
                          <button onClick={() => callCatalyst(proc.id,
                            `You are a benchmarking expert for ${baseline.industry} companies. For the process "${proc.label}" (APQC ${proc.l4}), provide TWO sections:\n\nSECTION 1 — TRADITIONAL BENCHMARKS\nProvide 3-5 specific benchmark suggestions from published sources. Include: KPI name, benchmark value with unit, source/year, and brief calculation methodology.\n\nSECTION 2 — AI AGENT IMPACT BENCHMARKS\nFor this same process, what efficiency gains have AI agents achieved? Include: agent type, % efficiency improvement, source/case study. Be specific and quantitative.`,
                            setCatalystResults, setCatalystLoading
                          )} disabled={catalystLoading[proc.id]}
                            style={{ fontSize: 10, padding: "4px 12px", borderRadius: 6, background: GOLD + "15", border: `1px solid ${GOLD}33`, color: GOLD, cursor: catalystLoading[proc.id] ? "wait" : "pointer", fontFamily: FONT, fontWeight: 600 }}>
                            {catalystLoading[proc.id] ? (catalystLoadingMsg[proc.id] || "Analyzing...") : "⚡ Catalyst"}
                          </button>
                        </div>
                        <div style={{ display: "grid", gap: 10 }}>
                          {(proc.kpis || []).map((kpi, ki) => {
                            const currentVal = vals[`kpi_current_${ki}`] ?? kpi.current;
                            const selectedSource = bmarks[`src_${ki}`] || "primary";
                            const seed = (proc.id + ki).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
                            const jitter = (n) => +(((seed * (n + 1) * 9301 + 49297) % 233280) / 233280 * 0.3 + 0.85).toFixed(1);
                            const hib = /rate|score|adoption|fill|perfect|touchless|match|auto|straight/i.test(kpi.name);
                            const adjPrimary = adjustBenchmark(kpi.benchmark, baseline.industry, baseline.revenueBand, hib);
                            const adjSapvlm = kpi.benchmark ? adjustBenchmark(+(kpi.benchmark * jitter(1)).toFixed(1), baseline.industry, baseline.revenueBand, hib) : null;
                            const adjHackett = kpi.benchmark ? adjustBenchmark(+(kpi.benchmark * jitter(2)).toFixed(1), baseline.industry, baseline.revenueBand, hib) : null;
                            const sources = [
                              { key: "primary", label: kpi.src || "APQC", value: adjPrimary },
                              { key: "sapvlm", label: "SAP VLM", value: adjSapvlm },
                              { key: "hackett", label: "Hackett", value: adjHackett },
                              { key: "custom", label: "Custom", value: bmarks[`bench_custom_${ki}`] ?? null },
                            ];
                            const activeBench = selectedSource === "custom" ? (bmarks[`bench_custom_${ki}`] ?? null) : sources.find(s => s.key === selectedSource)?.value ?? adjPrimary;
                            const gap = currentVal != null && activeBench != null ? Math.abs(currentVal - activeBench) : null;
                            const quartile = getQuartile(currentVal, activeBench, kpi);
                            const peerN = getSampleSize("primary", seed);
                            return (
                              <div key={ki} style={{ padding: "10px 12px", background: t.bg, borderRadius: 8, border: `1px solid ${t.bdr}` }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                  <div>
                                    <div style={{ fontSize: 13, color: t.tx, fontWeight: 500 }}>{kpi.name} <span style={{ fontSize: 10, color: t.mut }}>({kpi.unit})</span>{kpi.method && <span title={kpi.method} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, borderRadius: "50%", background: t.mut + "20", color: t.mut, fontSize: 8, fontWeight: 700, cursor: "help", marginLeft: 4, verticalAlign: "middle" }}>?</span>}</div>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {gap != null && <span style={{ fontSize: 14, fontFamily: "monospace", color: gap > 0 ? RED : GREEN, fontWeight: 700 }}>Gap: {gap.toFixed(1)}</span>}
                                    {quartile && (
                                      <span title={`Peer group: ${assessmentProfile.industry || baseline.industry || "Manufacturing"} ${assessmentProfile.revenueBand || baseline.revenueBand || "$1-5B"} (n=${peerN})`} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: quartile.color + "20", color: quartile.color, fontWeight: 700 }}>
                                        {quartile.icon} {quartile.label} <span style={{ fontWeight: 400, opacity: 0.7 }}>n={peerN}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                  <span style={{ fontSize: 10, color: t.mut, minWidth: 50 }}>Current:</span>
                                  <span style={{ fontSize: 14, fontFamily: "monospace", color: currentVal != null ? t.tx : t.sub }}>{currentVal ?? "—"} <span style={{ fontSize: 9, color: t.mut }}>{kpi.unit}</span></span>
                                </div>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                                  <thead><tr>
                                    {["", "Source", "Value", "Range", "Fresh"].map((h, i) => (
                                      <th key={i} style={{ padding: "3px 6px", borderBottom: `1px solid ${t.bdr}40`, textAlign: i === 2 || i === 3 ? "right" : "left", color: t.mut, fontWeight: 600, fontSize: 10 }}>{h}</th>
                                    ))}
                                  </tr></thead>
                                  <tbody>
                                    {sources.map(src => {
                                      const meta = SOURCE_META[src.key] || SOURCE_META.custom;
                                      const sn = getSampleSize(src.key, seed + (src.key === "sapvlm" ? 1 : src.key === "hackett" ? 2 : 0));
                                      const lo = src.value != null ? Math.round(src.value * 0.85 * 10) / 10 : null;
                                      const hi = src.value != null ? Math.round(src.value * 1.15 * 10) / 10 : null;
                                      return (
                                      <tr key={src.key} style={{ background: selectedSource === src.key ? (src.key === "primary" ? GREEN : GOLD) + "08" : "transparent" }}>
                                        <td style={{ padding: "4px 6px", borderBottom: `1px solid ${t.bdr}20`, width: 30 }}>
                                          <input type="radio" name={`src_${proc.id}_${ki}`} checked={selectedSource === src.key}
                                            onChange={() => { setBmark(`src_${ki}`, src.key); const val = src.key === "custom" ? (bmarks[`bench_custom_${ki}`] ?? null) : src.value; if (val != null) setBmark(`bench_${ki}`, val); }}
                                            style={{ accentColor: GREEN, cursor: "pointer" }} />
                                        </td>
                                        <td style={{ padding: "4px 6px", borderBottom: `1px solid ${t.bdr}20`, color: selectedSource === src.key ? t.tx : t.tx2, fontWeight: selectedSource === src.key ? 600 : 400 }}>
                                          {src.label}
                                          {sn && <span style={{ fontSize: 9, color: t.mut, marginLeft: 4 }}>n={sn}</span>}
                                        </td>
                                        <td style={{ padding: "4px 6px", borderBottom: `1px solid ${t.bdr}20`, textAlign: "right", fontFamily: "monospace" }} title={src.key !== "custom" ? `Adjusted for ${baseline.industry || "Manufacturing"}, ${baseline.revenueBand || "$1-5B"}` : undefined}>
                                          {src.key === "custom" ? (
                                            <input type="number" value={bmarks[`bench_custom_${ki}`] ?? ""} onChange={e => { const v = parseFloat(e.target.value) || null; setBmark(`bench_custom_${ki}`, v); if (selectedSource === "custom") setBmark(`bench_${ki}`, v); }}
                                              placeholder="—" style={{ width: 60, background: t.card, border: `1px solid ${GOLD}33`, borderRadius: 4, padding: "2px 4px", color: GOLD, fontFamily: "monospace", fontSize: 12, textAlign: "center" }} />
                                          ) : (
                                            <span style={{ color: selectedSource === src.key ? GREEN : t.mut }}>{src.value ?? "—"}</span>
                                          )}
                                        </td>
                                        <td style={{ padding: "4px 6px", borderBottom: `1px solid ${t.bdr}20`, textAlign: "right", fontSize: 9, color: t.mut, fontFamily: "monospace" }}>
                                          {lo != null ? `${lo}–${hi}${kpi.unit === "%" ? "%" : ""}` : "—"}
                                        </td>
                                        <td style={{ padding: "4px 6px", borderBottom: `1px solid ${t.bdr}20`, fontSize: 9 }}>
                                          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: meta.freshColor, marginRight: 4, verticalAlign: "middle" }} />
                                          <span style={{ color: t.mut }}>{meta.quarter}</span>
                                        </td>
                                      </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                                {activeBench != null && (
                                  <div style={{ fontSize: 9, color: t.mut, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                                    <span>{sources.find(s => s.key === selectedSource)?.label || kpi.src} benchmark</span>
                                    <span title={`Range: ${Math.round(activeBench * 0.85 * 10) / 10}–${Math.round(activeBench * 1.15 * 10) / 10}${kpi.unit === "%" ? "%" : ""} | n=${getSampleSize(selectedSource, seed)} | ${(SOURCE_META[selectedSource] || SOURCE_META.custom).year}`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 12, height: 12, borderRadius: "50%", background: t.mut + "20", color: t.mut, fontSize: 7, fontWeight: 700, cursor: "help" }}>?</span>
                                  </div>
                                )}
                                {(() => { const ctx = getBenchmarkContext(proc.id, kpi.name); const lv = getSapLever(proc.id); return ctx && lv ? (
                                  <div style={{ fontSize: 9, color: GOLD, fontStyle: "italic", marginTop: 4, lineHeight: 1.4 }}>Benchmark requires <span style={{ fontWeight: 600 }}>{lv.lever.name}</span> to be achievable — {ctx}</div>
                                ) : null; })()}
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

                    {/* Section B: SAP Lever — Story Card */}
                    {procTab === "sap" && (
                      <div>
                        {(() => {
                          const leverData = getSapLever(proc.id);
                          if (!leverData) return (
                            <div style={{ padding: 20, textAlign: "center", color: t.mut, border: `2px dashed ${t.bdr}`, borderRadius: 10 }}>No SAP lever mapped for this process</div>
                          );
                          const lv = leverData.lever;
                          const depColor = lv.deploymentType === "Optimization" ? PURPLE : BLUE;
                          return (
                            <div style={{ padding: "16px 18px", background: t.bg, borderRadius: 10, border: `1px solid ${BLUE}20`, marginBottom: 8 }}>
                              <div style={{ fontSize: 10, color: BLUE, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>What S/4HANA Activates</div>
                              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: BLUE + "18", color: BLUE, fontWeight: 700, fontFamily: "monospace" }}>{lv.module}</span>
                                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: depColor + "15", color: depColor, fontWeight: 600 }}>{lv.deploymentType}</span>
                              </div>
                              <div style={{ fontSize: 16, fontWeight: 700, color: t.tx, marginBottom: 4 }}>{lv.name}</div>
                              <div style={{ fontSize: 13, color: "#888", fontStyle: "italic", lineHeight: 1.5, marginBottom: 14 }}>{lv.capability}</div>
                              <div style={{ borderTop: `1px solid ${t.bdr}`, paddingTop: 12 }}>
                                <div style={{ fontSize: 10, color: t.mut, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>KPIs this lever impacts</div>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                  <thead><tr>
                                    <th style={{ padding: "4px 8px", textAlign: "left", color: t.mut, fontSize: 10, fontWeight: 600, borderBottom: `1px solid ${t.bdr}40` }}>KPI</th>
                                    <th style={{ padding: "4px 8px", textAlign: "right", color: t.mut, fontSize: 10, fontWeight: 600, borderBottom: `1px solid ${t.bdr}40` }}>Current</th>
                                    <th style={{ padding: "4px 0", textAlign: "center", color: t.mut, fontSize: 10, borderBottom: `1px solid ${t.bdr}40`, width: 24 }}></th>
                                    <th style={{ padding: "4px 8px", textAlign: "right", color: t.mut, fontSize: 10, fontWeight: 600, borderBottom: `1px solid ${t.bdr}40` }}>With Lever</th>
                                    <th style={{ padding: "4px 8px", textAlign: "right", color: t.mut, fontSize: 10, fontWeight: 600, borderBottom: `1px solid ${t.bdr}40` }}>Improvement</th>
                                  </tr></thead>
                                  <tbody>
                                    {kpiRows.map(({ kpi, ki, current, bench }) => {
                                      const hib = /rate|score|adoption|fill|perfect|touchless|match|auto|straight/i.test(kpi.name);
                                      const gap = current != null && bench != null ? Math.abs(current - bench) : null;
                                      const improvLabel = gap != null ? (hib ? `+${gap.toFixed(1)}${kpi.unit === "%" ? "pp" : " " + kpi.unit}` : `-${gap.toFixed(1)} ${kpi.unit}`) : null;
                                      return (
                                        <tr key={ki}>
                                          <td style={{ padding: "5px 8px", borderBottom: `1px solid ${t.bdr}20`, color: t.tx2, fontSize: 11 }}>{kpi.name} <span style={{ color: t.sub, fontSize: 9 }}>({kpi.unit})</span></td>
                                          <td style={{ padding: "5px 8px", borderBottom: `1px solid ${t.bdr}20`, textAlign: "right", fontFamily: "monospace", color: "#888" }}>{current ?? "—"}</td>
                                          <td style={{ padding: "5px 0", borderBottom: `1px solid ${t.bdr}20`, textAlign: "center", color: GOLD, fontSize: 13 }}>→</td>
                                          <td style={{ padding: "5px 8px", borderBottom: `1px solid ${t.bdr}20`, textAlign: "right", fontFamily: "monospace", color: GOLD, fontWeight: 600 }}>{bench ?? "—"}</td>
                                          <td style={{ padding: "5px 8px", borderBottom: `1px solid ${t.bdr}20`, textAlign: "right", fontSize: 10, color: GREEN, fontWeight: 600 }}>{improvLabel || "—"}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                              {/* Benchmark context per KPI */}
                              {kpiRows.map(({ kpi, ki }) => {
                                const ctx = getBenchmarkContext(proc.id, kpi.name);
                                if (!ctx) return null;
                                return (
                                  <div key={ki} style={{ marginTop: 8, padding: "6px 10px", background: GOLD + "08", borderRadius: 6, border: `1px solid ${GOLD}18` }}>
                                    <div style={{ fontSize: 10, color: GOLD, fontStyle: "italic", lineHeight: 1.5 }}>
                                      <span style={{ fontWeight: 600 }}>{kpi.name}:</span> {ctx}
                                    </div>
                                  </div>
                                );
                              })}
                              <div style={{ marginTop: 10, fontSize: 9, color: t.mut }}>Source: APQC · n={getSampleSize("primary", proc.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0))} · {baseline.industry || "Manufacturing"} {baseline.revenueBand || "$1-5B"} · 2023</div>
                            </div>
                          );
                        })()}
                        {/* Also show original SAP modules for reference */}
                        {(proc.sap || []).length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            {(proc.sap || []).map((sap, si) => (
                              <div key={si} style={{ padding: "8px 12px", background: t.bg, borderRadius: 6, border: `1px solid ${BLUE}10`, marginBottom: 3 }}>
                                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                  <SapBadge module={sap.module} />
                                  <span style={{ fontSize: 11, color: t.tx2 }}>{sap.desc}</span>
                                </div>
                                {sap.scenario && <div style={{ fontSize: 11, color: t.mut, lineHeight: 1.4, fontStyle: "italic", marginTop: 3 }}>{sap.scenario}</div>}
                              </div>
                            ))}
                          </div>
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
                            {[
                              { label: "KPI", sub: "", align: "left" },
                              { label: "Current State", sub: "Your baseline", align: "right" },
                              { label: "", sub: "", align: "center", arrow: true },
                              { label: "ERP Benchmark", sub: "S/4HANA best practice", align: "right" },
                              { label: "", sub: "", align: "center", arrow: true },
                              { label: "ERP + AI Agent", sub: "With intelligent automation", align: "right" },
                              { label: "Value Impact", sub: "Annual $ improvement", align: "right" },
                            ].map((h, i) => (
                              <th key={i} style={{ padding: h.arrow ? "5px 0" : "5px 8px", borderBottom: `2px solid ${t.bdr}`, textAlign: h.align, color: t.mut, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: ".5px", width: h.arrow ? 24 : "auto" }}>
                                {h.arrow ? <span style={{ fontSize: 14, color: t.sub }}>→</span> : <>{h.label}{h.sub && <div style={{ fontSize: 8, fontWeight: 400, textTransform: "none", letterSpacing: 0, color: t.sub, marginTop: 1 }}>{h.sub}</div>}</>}
                              </th>
                            ))}
                          </tr></thead>
                          <tbody>
                            {kpiRows.map(({ kpi, ki, current, isModeled, bench, agentBench, erpImpact, agentImpact }) => {
                              const gapRatio = (current != null && bench != null && bench !== 0) ? Math.abs(current - bench) / Math.abs(bench) : null;
                              const todayColor = gapRatio != null ? (gapRatio > 0.35 ? RED : gapRatio > 0.1 ? GOLD : GREEN) : t.mut;
                              return (
                                <tr key={ki}>
                                  <td style={{ padding: "4px 8px", borderBottom: `1px solid ${t.bdr}40`, color: t.tx2, fontSize: 11 }}>{kpi.name} <span style={{ color: t.sub, fontSize: 9 }}>({kpi.unit})</span></td>
                                  <td style={{ padding: "4px 8px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", fontWeight: 600, color: isModeled ? t.sub : todayColor, fontStyle: isModeled ? "italic" : "normal" }}>
                                    {current != null ? <>{current}{isModeled && <span style={{ fontSize: 8, color: t.mut, fontStyle: "italic", marginLeft: 2 }}>(est.)</span>}</> : "—"}
                                  </td>
                                  <td style={{ padding: "4px 0", borderBottom: `1px solid ${t.bdr}40`, textAlign: "center", color: t.sub, fontSize: 13 }}>→</td>
                                  <td style={{ padding: "4px 8px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", color: GOLD, fontWeight: 600 }}>{bench != null ? bench : "—"}</td>
                                  <td style={{ padding: "4px 0", borderBottom: `1px solid ${t.bdr}40`, textAlign: "center", color: t.sub, fontSize: 13 }}>→</td>
                                  <td style={{ padding: "4px 8px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", color: GREEN, fontWeight: 600 }}>{agentBench != null ? agentBench : "—"}</td>
                                  <td style={{ padding: "4px 8px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontSize: 10, lineHeight: 1.4 }}>
                                    {erpImpact > 0 && <div style={{ color: GOLD, fontFamily: "monospace" }}>ERP: +${erpImpact < 1 ? `${(erpImpact * 1000).toFixed(0)}K` : `${erpImpact.toFixed(1)}M`}</div>}
                                    {agentImpact > 0 && <div style={{ color: GREEN, fontFamily: "monospace" }}>Agent: +${agentImpact < 1 ? `${(agentImpact * 1000).toFixed(0)}K` : `${agentImpact.toFixed(1)}M`}</div>}
                                    {erpImpact === 0 && agentImpact === 0 && <span style={{ color: t.sub }}>—</span>}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {/* Three value boxes: ERP + Agent = Total */}
                        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                          <div style={{ flex: 1, padding: "10px 12px", borderRadius: 8, background: GOLD + "10", border: `1px solid ${GOLD}30`, textAlign: "center" }}>
                            <div style={{ fontSize: 9, color: GOLD, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 2 }}>ERP Value</div>
                            <div style={{ fontSize: 18, fontFamily: "monospace", fontWeight: 700, color: GOLD }}>{procErpVal > 0 ? `$${procErpVal.toFixed(1)}M` : "—"}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", fontSize: 18, color: t.sub, fontWeight: 300 }}>+</div>
                          <div style={{ flex: 1, padding: "10px 12px", borderRadius: 8, background: GREEN + "10", border: `1px solid ${GREEN}30`, textAlign: "center" }}>
                            <div style={{ fontSize: 9, color: GREEN, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 2 }}>Agent Uplift</div>
                            <div style={{ fontSize: 18, fontFamily: "monospace", fontWeight: 700, color: GREEN }}>{procAgentVal > 0 ? `$${procAgentVal.toFixed(1)}M` : "—"}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", fontSize: 18, color: t.sub, fontWeight: 300 }}>=</div>
                          <div style={{ flex: 1, padding: "10px 12px", borderRadius: 8, background: t.card, border: `2px solid ${t.bdr}`, textAlign: "center" }}>
                            <div style={{ fontSize: 9, color: t.mut, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 2 }}>Total Opportunity</div>
                            <div style={{ fontSize: 18, fontFamily: "monospace", fontWeight: 700, color: t.tx }}>{(procErpVal + procAgentVal) > 0 ? `$${(procErpVal + procAgentVal).toFixed(1)}M` : "—"}</div>
                          </div>
                        </div>

                        {/* What SAP delivers / What agents add */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                          <div style={{ padding: "8px 10px", borderRadius: 6, background: GOLD + "06", border: `1px solid ${GOLD}18` }}>
                            <div style={{ fontSize: 9, color: GOLD, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4 }}>What S/4HANA delivers</div>
                            {(proc.sap || []).length > 0 ? (proc.sap || []).slice(0, 3).map((s, si) => (
                              <div key={si} style={{ fontSize: 10, color: t.tx2, lineHeight: 1.5, paddingLeft: 8, borderLeft: `2px solid ${GOLD}30`, marginBottom: 3 }}><SapBadge module={s.module} /> {s.desc}</div>
                            )) : <div style={{ fontSize: 10, color: t.sub, fontStyle: "italic" }}>No SAP modules mapped</div>}
                          </div>
                          <div style={{ padding: "8px 10px", borderRadius: 6, background: GREEN + "06", border: `1px solid ${GREEN}18` }}>
                            <div style={{ fontSize: 9, color: GREEN, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4 }}>What AI agents add</div>
                            {agentResults[proc.id] ? (
                              <div style={{ fontSize: 10, color: t.tx2, lineHeight: 1.5, maxHeight: 60, overflow: "hidden" }}>{agentResults[proc.id].slice(0, 200)}...</div>
                            ) : (
                              <div style={{ fontSize: 10, color: t.sub, fontStyle: "italic" }}>Generate agent for details</div>
                            )}
                          </div>
                        </div>


                        {/* Agent Implementation Spec */}
                        {(() => {
                          const spec = AGENT_SPECS[proc.id];
                          if (!spec) return null;
                          const fColor = spec.feasibility >= 80 ? GREEN : spec.feasibility >= 60 ? GOLD : spec.feasibility >= 40 ? ORANGE : RED;
                          const eColor = spec.effort === "Low" ? GREEN : spec.effort === "Medium" ? GOLD : RED;
                          const annualAgentVal = procAgentVal > 0 ? procAgentVal : 0;
                          const roi = spec.implCost > 0 && annualAgentVal > 0 ? Math.round((annualAgentVal * 1000 / spec.implCost) * 100) : null;
                          return (
                            <div style={{ marginBottom: 12 }}>
                              {/* Feasibility Gauge */}
                              <div style={{ padding: "10px 12px", background: t.bg, borderRadius: 8, border: `1px solid ${t.bdr}`, marginBottom: 8 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                  <div style={{ fontSize: 10, color: t.mut, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px" }}>Feasibility Score</div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: fColor + "18", color: fColor, fontWeight: 700 }}>{spec.agentType}</span>
                                    <span style={{ fontSize: 16, fontFamily: "monospace", fontWeight: 700, color: fColor }}>{spec.feasibility}</span>
                                  </div>
                                </div>
                                <div style={{ height: 8, background: t.bdr, borderRadius: 4, overflow: "hidden" }}>
                                  <div style={{ height: "100%", width: `${spec.feasibility}%`, background: `linear-gradient(90deg, ${fColor}88, ${fColor})`, borderRadius: 4, transition: "width 0.5s" }} />
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                                  <span style={{ fontSize: 8, color: t.sub }}>0</span>
                                  <span style={{ fontSize: 8, color: t.sub }}>100</span>
                                </div>
                              </div>

                              {/* Implementation Spec Card — collapsed by default */}
                              <div style={{ padding: "12px 14px", background: t.bg, borderRadius: 8, border: `1px solid ${t.bdr}`, marginBottom: 8 }}>
                                <div onClick={() => setImplSpecCollapsed(prev => ({ ...prev, [proc.id]: !prev[proc.id] }))} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                                  <div style={{ fontSize: 10, color: GOLD, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px" }}>Implementation Specification</div>
                                  <span style={{ fontSize: 11, color: t.mut }}>{implSpecCollapsed[proc.id] ? "▾ Hide" : "▸ Show details"}</span>
                                </div>
                                {implSpecCollapsed[proc.id] && <>
                                <div style={{ fontSize: 11, color: t.tx2, lineHeight: 1.6, marginBottom: 10, marginTop: 8 }}>{spec.description}</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                                  <div style={{ textAlign: "center", padding: 6, borderRadius: 6, background: eColor + "0C", border: `1px solid ${eColor}22` }}>
                                    <div style={{ fontSize: 9, color: t.mut, textTransform: "uppercase" }}>Effort</div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: eColor }}>{spec.effort}</div>
                                  </div>
                                  <div style={{ textAlign: "center", padding: 6, borderRadius: 6, background: BLUE + "0C", border: `1px solid ${BLUE}22` }}>
                                    <div style={{ fontSize: 9, color: t.mut, textTransform: "uppercase" }}>Timeline</div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: BLUE }}>{spec.implMonths}mo</div>
                                  </div>
                                  <div style={{ textAlign: "center", padding: 6, borderRadius: 6, background: PURPLE + "0C", border: `1px solid ${PURPLE}22` }}>
                                    <div style={{ fontSize: 9, color: t.mut, textTransform: "uppercase" }}>Cost</div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: PURPLE }}>${spec.implCost}K</div>
                                  </div>
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                  <div style={{ fontSize: 9, color: t.mut, fontWeight: 600, marginBottom: 3 }}>PREREQUISITES</div>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                    {spec.prerequisites.map((p, pi) => (
                                      <span key={pi} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: GREEN + "10", color: GREEN, border: `1px solid ${GREEN}25` }}>{p}</span>
                                    ))}
                                  </div>
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                  <div style={{ fontSize: 9, color: t.mut, fontWeight: 600, marginBottom: 3 }}>RISK FACTORS</div>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                    {spec.riskFactors.map((r, ri) => (
                                      <span key={ri} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: RED + "10", color: RED, border: `1px solid ${RED}25` }}>{r}</span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontSize: 9, color: t.mut, fontWeight: 600, marginBottom: 3 }}>TECH STACK</div>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                    {spec.techStack.map((ts, ti) => (
                                      <span key={ti} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: BLUE + "10", color: BLUE, border: `1px solid ${BLUE}25` }}>{ts}</span>
                                    ))}
                                  </div>
                                </div>
                              </>}
                              </div>

                              {/* ROI Timeline — collapsed by default */}
                              <div style={{ padding: "10px 12px", background: t.bg, borderRadius: 8, border: `1px solid ${t.bdr}` }}>
                                <div onClick={() => setRoiTimelineCollapsed(prev => ({ ...prev, [proc.id]: !prev[proc.id] }))} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                                  <div style={{ fontSize: 10, color: GOLD, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px" }}>ROI Timeline</div>
                                  <span style={{ fontSize: 11, color: t.mut }}>{roiTimelineCollapsed[proc.id] ? "▾ Hide" : "▸ Show timeline"}</span>
                                </div>
                                {roiTimelineCollapsed[proc.id] && <>
                                <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 50, marginBottom: 6 }}>
                                  <div style={{ flex: 1, textAlign: "center" }}>
                                    <div style={{ fontSize: 10, fontFamily: "monospace", color: RED, fontWeight: 700, marginBottom: 2 }}>-${spec.implCost}K</div>
                                    <div style={{ height: 24, background: RED + "30", borderRadius: 4, border: `1px solid ${RED}40` }} />
                                    <div style={{ fontSize: 8, color: t.sub, marginTop: 2 }}>Investment</div>
                                  </div>
                                  <div style={{ flex: 1, textAlign: "center" }}>
                                    <div style={{ fontSize: 10, fontFamily: "monospace", color: GOLD, fontWeight: 700, marginBottom: 2 }}>{spec.paybackMonths}mo</div>
                                    <div style={{ height: 16, background: GOLD + "30", borderRadius: 4, border: `1px solid ${GOLD}40` }} />
                                    <div style={{ fontSize: 8, color: t.sub, marginTop: 2 }}>Payback</div>
                                  </div>
                                  <div style={{ flex: 1, textAlign: "center" }}>
                                    <div style={{ fontSize: 10, fontFamily: "monospace", color: GREEN, fontWeight: 700, marginBottom: 2 }}>{annualAgentVal > 0 ? `$${annualAgentVal.toFixed(1)}M` : "TBD"}</div>
                                    <div style={{ height: 32, background: GREEN + "30", borderRadius: 4, border: `1px solid ${GREEN}40` }} />
                                    <div style={{ fontSize: 8, color: t.sub, marginTop: 2 }}>Annual Value</div>
                                  </div>
                                </div>
                                {roi != null && <div style={{ fontSize: 10, color: t.tx2, textAlign: "center" }}>Estimated ROI: <span style={{ fontWeight: 700, color: roi > 200 ? GREEN : roi > 100 ? GOLD : ORANGE }}>{roi}%</span></div>}
                              </>}
                              </div>
                            </div>
                          );
                        })()}
                        {agentResults[proc.id] ? (
                          <div style={{ padding: 14, background: GOLD + "08", border: `1px solid ${GOLD}22`, borderRadius: 10 }}>
                            <div style={{ fontSize: 10, color: GOLD, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>⚡ AI Agent Scenario</div>
                            <div style={{ fontSize: 12, color: t.tx2, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{agentResults[proc.id]}</div>
                          </div>
                        ) : (
                          <div style={{ padding: 24, border: `2px dashed ${t.bdr}`, borderRadius: 10, textAlign: "center" }}>
                            <div style={{ fontSize: 24, marginBottom: 6, opacity: 0.5 }}>🤖</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: t.tx2, marginBottom: 4 }}>No agent assessment yet</div>
                            <div style={{ fontSize: 11, color: t.mut }}>Click "Generate Agent" above to create one</div>
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
        {step === 5 && (() => { try { return (
          <div>
            {stepHeader(5, "Value Calculation", "Review the gap analysis and choose a scenario level.")}

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

            {/* Methodology Card — collapsible */}
            <div style={{ marginBottom: 16 }}>
              <button onClick={() => setMethodologyOpen(!methodologyOpen)} style={{ width: "100%", padding: "10px 16px", background: methodologyOpen ? BLUE + "10" : t.card, border: `1px solid ${BLUE}22`, borderRadius: methodologyOpen ? "10px 10px 0 0" : 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: FONT }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: BLUE }}>How these numbers are calculated — and why you can defend them</span>
                <div style={{ flex: 1 }} />
                <span style={{ color: BLUE, fontSize: 12 }}>{methodologyOpen ? "▲" : "▼"}</span>
              </button>
              {methodologyOpen && (
                <div style={{ padding: "16px 20px", background: t.card, border: `1px solid ${BLUE}22`, borderTop: "none", borderRadius: "0 0 10px 10px" }}>
                  {[
                    { id: "approach", title: "1. THE APPROACH", content: "PrismL4 uses a bottom-up methodology. We start with your actual processes, measure the gap between where you are and where best practice is, and size the financial impact of closing that gap. This is the same approach used by the Big 4 in Phase 0 business cases — we've just automated the 6-week exercise." },
                    { id: "benchmarks", title: "2. THE BENCHMARK DATA", content: `Benchmarks come from three sources:\n• APQC Process Classification Framework — the largest process benchmarking dataset globally, updated annually\n• SAP Value Lifecycle Management — SAP's own customer outcome database from thousands of S/4HANA implementations\n• Hackett Group — premium benchmarks for finance and supply chain processes\n\nEach benchmark is adjusted for your industry (${baseline.industry}) and revenue band (${baseline.revenueBand}), using published adjustment factors.` },
                    { id: "gap", title: "3. THE GAP CALCULATION", content: "For each KPI, we calculate: Gap = |Your baseline - Best practice benchmark|. We then ask: what % of that gap is realistically addressable? You set this — default is 40-60% depending on process complexity. The remaining gap is treated as non-addressable (organizational, structural, or market constraints)." },
                    { id: "financial", title: "4. THE FINANCIAL TRANSLATION", content: `The gap in process terms (days, %, FTEs) is translated to dollars using your financial inputs. For example: a 2-day reduction in DSO x your annual revenue / 365 = working capital released. For headcount KPIs: FTE reduction x loaded cost per FTE = SG&A impact.${companyFinancials ? "\n\nYour calculations are anchored to " + (companyFinancials.companyName || baseline.company) + " FY" + companyFinancials.fiscalYear + " actuals." : "\n\nCurrently using revenue band estimates. Upload your P&L in Step 2 for exact figures."}` },
                    { id: "split", title: "5. THE ERP / AI SPLIT", content: "ERP value = what S/4HANA delivers by implementing best practice processes. Agent uplift = the additional improvement from intelligent automation on top of ERP. Agent benchmarks are set at 15-30% better than ERP benchmarks, based on outcomes from early AI agent deployments in finance processes." },
                    { id: "scenarios", title: "6. THE SCENARIO FACTORS", content: "Three scenarios reflect implementation risk:\n• High (100%): Full addressable value — assumes excellent execution and adoption\n• Medium (65%): Conservative — our recommended planning assumption\n• Low (35%): Minimum credible case — poor adoption, partial deployment\n\nAll headline numbers shown at Medium unless you change the scenario." },
                    { id: "defensible", title: "7. WHAT MAKES THIS DEFENSIBLE", content: `Three things make this number defensible in front of a CFO or board:\n1. It's anchored to your P&L — not a percentage of generic industry revenue\n2. It's process-level, not top-down — every dollar traces back to a specific process, a specific KPI, a specific benchmark with a source and sample size\n3. It's deliberately conservative — addressable % and scenario factor both reduce the theoretical maximum by 35-65%` },
                  ].map(section => (
                    <div key={section.id} style={{ marginBottom: 8 }}>
                      <button onClick={() => setMethodologySections(prev => ({ ...prev, [section.id]: !prev[section.id] }))} style={{ width: "100%", padding: "8px 0", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FONT }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: section.id === "defensible" ? GOLD : t.tx, letterSpacing: ".3px" }}>{section.title}</span>
                        <div style={{ flex: 1, height: 1, background: t.bdr }} />
                        <span style={{ fontSize: 10, color: t.mut }}>{methodologySections[section.id] ? "−" : "+"}</span>
                      </button>
                      {methodologySections[section.id] && (
                        <div style={{ padding: "8px 0 8px 12px", fontSize: 12, color: t.tx2, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{section.content}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary KPIs — ERP / Agent / Combined split */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
              {[
                { l: "ERP Value", v: fd(valResult.total), c: GOLD, dollar: true },
                { l: "Agent Uplift", v: fd(valResult.agentTotal), c: GREEN, dollar: true },
                { l: "Combined", v: fd(valResult.combined), c: "#FFFFFF", large: true, dollar: true },
                { l: "Scenario", v: scenarioLevel, c: scenarioLevel === "High" ? GREEN : scenarioLevel === "Medium" ? GOLD : ORANGE },
              ].map(k => (
                <div key={k.l} style={{ background: `${k.c}0C`, border: `1px solid ${k.c}22`, borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: k.c, textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 600, marginBottom: 4 }}>{k.l}</div>
                  <div style={{ fontSize: k.large ? 28 : 22, fontFamily: SERIF, color: k.c, fontWeight: k.large ? 700 : 400, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>{k.v}{k.dollar && <span title={`${k.l}: gap × base amount × addressable% × scenario factor`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, borderRadius: "50%", background: k.c + "20", color: k.c, fontSize: 8, fontWeight: 700, cursor: "help", flexShrink: 0 }}>i</span>}</div>
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
                <div style={{ padding: 32, textAlign: "center", color: t.mut, marginBottom: 24, border: `2px dashed ${t.bdr}`, borderRadius: 10 }}>
                  <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.5 }}>📊</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: t.tx2, marginBottom: 6 }}>Value calculation requires baseline data</div>
                  <div style={{ fontSize: 12, color: t.mut, marginBottom: 14, lineHeight: 1.6 }}>
                    You have {selProcs.filter(p => !Object.keys(baselineData).some(k => k.startsWith(p.id))).length} of {selProcs.length} processes with no baseline entered.
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    <button onClick={() => setStep(3)} style={{ fontSize: 12, padding: "10px 20px", borderRadius: 8, background: GOLD + "15", border: `1px solid ${GOLD}33`, color: GOLD, cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}>Enter baseline data</button>
                    <button onClick={() => {
                      selProcs.forEach(proc => {
                        (proc.kpis || []).forEach((kpi, ki) => {
                          if (!procValues[proc.id]?.["kpi_current_" + ki]) {
                            setProcValues(prev => ({ ...prev, [proc.id]: { ...(prev[proc.id] || {}), ["kpi_current_" + ki]: kpi.current ?? kpi.benchmark } }));
                          }
                        });
                      });
                      showToast("Benchmark estimates applied as proxy baseline");
                    }} style={{ fontSize: 12, padding: "10px 20px", borderRadius: 8, background: "transparent", border: `1px solid ${t.bdr}`, color: t.tx2, cursor: "pointer", fontFamily: FONT, fontWeight: 600 }}>Use benchmark estimates</button>
                  </div>
                </div>
              );
            })()}

            {/* Tab switcher — P&L vs Balance Sheet & Multi-Year */}
            <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
              {[{ id: "pnl", label: "P&L Impact" }, { id: "balanceSheet", label: "Balance Sheet & Multi-Year" }].map(tab => (
                <button key={tab.id} onClick={() => setStep5Tab(tab.id)} style={{
                  fontSize: 12, padding: "8px 20px", borderRadius: 8,
                  background: step5Tab === tab.id ? GOLD + "18" : "transparent",
                  border: `1px solid ${step5Tab === tab.id ? GOLD + "44" : t.bdr}`,
                  color: step5Tab === tab.id ? GOLD : t.tx2,
                  cursor: "pointer", fontFamily: FONT, fontWeight: step5Tab === tab.id ? 700 : 400,
                }}>{tab.label}</button>
              ))}
            </div>

            {step5Tab === "pnl" && (<>
            {/* P&L Impact Summary */}
            <div style={labelStyle}>P&L Impact Summary</div>
            {(() => {
              const pnl = valResult.pnl || {};
              const { revImpact = 0, cogsImpact = 0, sgaImpact = 0, agentRevImpact = 0, agentCogsImpact = 0, agentSgaImpact = 0 } = pnl;
              return (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 24 }}>
                  <thead><tr>{["Line Item", "Baseline", "ERP Impact", "Agent Impact", "Combined", "Improved"].map((h, i) => (
                    <th key={i} style={{ padding: "8px 12px", borderBottom: `2px solid ${t.bdr}`, textAlign: i === 0 ? "left" : "right", color: t.mut, fontWeight: 600, fontSize: 12 }}>{h}</th>
                  ))}</tr></thead>
                  <tbody>
                    {[
                      { l: "Revenue", base: baseline.revenue || 0, imp: revImpact, agent: agentRevImpact || 0 },
                      { l: "COGS", base: baseline.cogs || 0, imp: -cogsImpact, agent: -(agentCogsImpact || 0) },
                      { l: "Gross Profit", base: (baseline.revenue || 0) - (baseline.cogs || 0), imp: revImpact + cogsImpact, agent: (agentRevImpact || 0) + (agentCogsImpact || 0) },
                      { l: "SG&A", base: baseline.sga || 0, imp: -sgaImpact, agent: -(agentSgaImpact || 0) },
                      { l: "EBITDA", base: baseline.ebitda || 0, imp: revImpact + cogsImpact + sgaImpact, agent: (agentRevImpact || 0) + (agentCogsImpact || 0) + (agentSgaImpact || 0) },
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
            {(valResult.balanceSheet?.totalWorkingCapital || 0) > 0 && (
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
                      { l: "Accounts Receivable", base: baseline.recv || 0, imp: -valResult.balanceSheet.receivablesImpact, c: GREEN },
                      { l: "Inventory", base: baseline.inventory || 0, imp: -valResult.balanceSheet.inventoryImpact, c: GREEN },
                      { l: "Accounts Payable", base: baseline.pay || 0, imp: valResult.balanceSheet.payablesImpact, c: BLUE },
                      { l: "Net Working Capital",
                        base: (baseline.recv || 0) + (baseline.inventory || 0) - (baseline.pay || 0),
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
                      <td style={{ padding: "5px 10px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", color: GOLD, fontWeight: 700 }}>
                        {fd(imp.value)}
                        <ExplainerIcon color={GOLD} onClick={() => {
                          const p = PROC_MAP[imp.id];
                          if (p?.kpis?.[0]) {
                            const d = buildExplainerData(p, p.kpis[0], 0, "erp");
                            if (d) setCalcExplainer({ ...d, onChallenge: () => challengeCalcValue(d) });
                          }
                        }} />
                      </td>
                      <td style={{ padding: "5px 10px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", color: GREEN, fontWeight: 600 }}>{imp.agentValue > 0 ? fd(imp.agentValue) : "—"}</td>
                      <td style={{ padding: "5px 10px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", color: t.tx, fontWeight: 700 }}>{fd(imp.value + (imp.agentValue || 0))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>


            {/* Implementation Roadmap */}
            {(() => {
              const roadmapData = selProcs
                .filter(p => AGENT_SPECS[p.id])
                .map(p => {
                  const spec = AGENT_SPECS[p.id];
                  const impact = valResult.impacts.find(i => i.id === p.id);
                  const agentVal = impact?.agentValue || 0;
                  const roi = spec.implCost > 0 && agentVal > 0 ? Math.round((agentVal * 1000 / spec.implCost) * 100) : 0;
                  return { id: p.id, label: p.label, l4: p.l4, e2e: p.e2e, color: p.l1Color, ...spec, agentVal, roi };
                })
                .sort((a, b) => b.roi - a.roi);
              if (roadmapData.length === 0) return null;
              const totalCost = roadmapData.reduce((s, r) => s + r.implCost, 0);
              const avgPayback = Math.round(roadmapData.reduce((s, r) => s + r.paybackMonths, 0) / roadmapData.length);
              const totalAgentVal = roadmapData.reduce((s, r) => s + r.agentVal, 0);
              const avgFeasibility = Math.round(roadmapData.reduce((s, r) => s + r.feasibility, 0) / roadmapData.length);
              const portfolioROI = totalCost > 0 && totalAgentVal > 0 ? Math.round((totalAgentVal * 1000 / totalCost) * 100) : 0;
              return (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 11, color: t.mut, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginBottom: 6 }}>AI Agent Implementation Roadmap</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
                    {[
                      { l: "Total Impl. Cost", v: "$" + (totalCost >= 1000 ? (totalCost / 1000).toFixed(1) + "M" : totalCost + "K"), c: PURPLE },
                      { l: "Avg Payback", v: avgPayback + " months", c: GOLD },
                      { l: "Total Agent Value", v: totalAgentVal > 0 ? "$" + totalAgentVal.toFixed(1) + "M/yr" : "TBD", c: GREEN },
                      { l: "Portfolio ROI", v: portfolioROI > 0 ? portfolioROI + "%" : "TBD", c: portfolioROI > 200 ? GREEN : portfolioROI > 100 ? GOLD : ORANGE },
                    ].map(k => (
                      <div key={k.l} style={{ background: k.c + "0C", border: "1px solid " + k.c + "22", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: k.c, textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 600, marginBottom: 2 }}>{k.l}</div>
                        <div style={{ fontSize: 18, fontFamily: "'Playfair Display',Georgia,serif", color: k.c, fontWeight: 600 }}>{k.v}</div>
                      </div>
                    ))}
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 8 }}>
                    <thead><tr>
                      {["Process", "Type", "Effort", "Months", "Cost", "Feasibility", "Payback", "Agent Value", "ROI"].map((h, i) => (
                        <th key={i} style={{ padding: "5px 8px", borderBottom: "2px solid " + t.bdr, textAlign: i >= 4 ? "right" : "left", color: t.mut, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: ".5px" }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {roadmapData.slice(0, 15).map((r, idx) => {
                        const fC = r.feasibility >= 80 ? GREEN : r.feasibility >= 60 ? GOLD : ORANGE;
                        const rC = r.roi > 200 ? GREEN : r.roi > 100 ? GOLD : ORANGE;
                        return (
                          <tr key={idx}>
                            <td style={{ padding: "4px 8px", borderBottom: "1px solid " + t.bdr + "40", color: t.tx, fontSize: 11 }}>{r.label.length > 35 ? r.label.slice(0, 35) + "..." : r.label}</td>
                            <td style={{ padding: "4px 8px", borderBottom: "1px solid " + t.bdr + "40" }}><span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: (r.agentType === "Autonomous" ? GREEN : r.agentType === "Hybrid" ? GOLD : BLUE) + "15", color: r.agentType === "Autonomous" ? GREEN : r.agentType === "Hybrid" ? GOLD : BLUE, fontWeight: 600 }}>{r.agentType}</span></td>
                            <td style={{ padding: "4px 8px", borderBottom: "1px solid " + t.bdr + "40" }}><span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: (r.effort === "Low" ? GREEN : r.effort === "Medium" ? GOLD : RED) + "15", color: r.effort === "Low" ? GREEN : r.effort === "Medium" ? GOLD : RED, fontWeight: 600 }}>{r.effort}</span></td>
                            <td style={{ padding: "4px 8px", borderBottom: "1px solid " + t.bdr + "40", textAlign: "right", fontFamily: "monospace", color: t.tx2 }}>{r.implMonths}</td>
                            <td style={{ padding: "4px 8px", borderBottom: "1px solid " + t.bdr + "40", textAlign: "right", fontFamily: "monospace", color: PURPLE }}>{"$"}{r.implCost}K</td>
                            <td style={{ padding: "4px 8px", borderBottom: "1px solid " + t.bdr + "40", textAlign: "right" }}><span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 600, color: fC }}>{r.feasibility}</span></td>
                            <td style={{ padding: "4px 8px", borderBottom: "1px solid " + t.bdr + "40", textAlign: "right", fontFamily: "monospace", color: GOLD }}>{r.paybackMonths}mo</td>
                            <td style={{ padding: "4px 8px", borderBottom: "1px solid " + t.bdr + "40", textAlign: "right", fontFamily: "monospace", color: GREEN, fontWeight: 600 }}>{r.agentVal > 0 ? "$" + r.agentVal.toFixed(1) + "M" : "—"}</td>
                            <td style={{ padding: "4px 8px", borderBottom: "1px solid " + t.bdr + "40", textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: rC }}>{r.roi > 0 ? r.roi + "%" : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div style={{ fontSize: 10, color: t.sub, fontStyle: "italic" }}>Sorted by ROI (highest first) · Avg feasibility: {avgFeasibility}/100</div>
                </div>
              );
            })()}
            </>)}

            {/* ═══ Balance Sheet & Multi-Year Tab ═══ */}
            {step5Tab === "balanceSheet" && (<>
              {/* SECTION A — Balance Sheet Impact */}
              <div style={labelStyle}>Balance Sheet Impact (Year 1)</div>
              {(() => {
                const cf = effectiveFinancials;
                const bsh = valResult.balanceSheet || { receivablesImpact: 0, payablesImpact: 0, inventoryImpact: 0, totalWorkingCapital: 0 };
                const isEst = !cf.anchored;
                const estTag = isEst ? " (est.)" : "";
                const cfRevenue = cf.revenue || 0;
                const cfCogs = cf.cogs || 0;

                // Current DSO/DIO/DPO from baseline or industry averages
                const currentDSO = (baseline.recv || 0) > 0 && cfRevenue > 0 ? Math.round((baseline.recv || 0) / cfRevenue * 365) : 45;
                const currentDIO = (baseline.inventory || 0) > 0 && cfCogs > 0 ? Math.round((baseline.inventory || 0) / cfCogs * 365) : 60;
                const currentDPO = (baseline.pay || 0) > 0 && cfCogs > 0 ? Math.round((baseline.pay || 0) / cfCogs * 365) : 35;
                const currentCCC = currentDSO + currentDIO - currentDPO;

                // Improvements from value calculation
                const dsoImprove = cfRevenue > 0 ? Math.round(bsh.receivablesImpact / (cfRevenue / 365)) : 0;
                const dioImprove = cfCogs > 0 ? Math.round(bsh.inventoryImpact / (cfCogs / 365)) : 0;
                const dpoImprove = cfCogs > 0 ? Math.round(bsh.payablesImpact / (cfCogs / 365)) : 0;

                // Post-ERP values (70% of improvement from ERP)
                const erpFactor = 0.7;
                const agentFactor = 0.3;
                const postErpDSO = currentDSO - Math.round(dsoImprove * erpFactor);
                const postErpDIO = currentDIO - Math.round(dioImprove * erpFactor);
                const postErpDPO = currentDPO + Math.round(dpoImprove * erpFactor);
                const postAllDSO = currentDSO - dsoImprove;
                const postAllDIO = currentDIO - dioImprove;
                const postAllDPO = currentDPO + dpoImprove;

                const currentAR = baseline.recv || Math.round(cfRevenue * currentDSO / 365);
                const currentInv = baseline.inventory || Math.round(cfCogs * currentDIO / 365);
                const currentAP = baseline.pay || Math.round(cfCogs * currentDPO / 365);
                const currentWC = currentAR + currentInv - currentAP;

                const postErpAR = Math.round(cfRevenue * postErpDSO / 365);
                const postErpInv = Math.round(cfCogs * postErpDIO / 365);
                const postErpAP = Math.round(cfCogs * postErpDPO / 365);
                const postAllAR = Math.round(cfRevenue * postAllDSO / 365);
                const postAllInv = Math.round(cfCogs * postAllDIO / 365);
                const postAllAP = Math.round(cfCogs * postAllDPO / 365);

                const bsRows = [
                  { l: "Accounts Receivable", cur: currentAR, erp: postErpAR, all: postAllAR, unit: "$M", better: "down" },
                  { l: "Inventory", cur: currentInv, erp: postErpInv, all: postAllInv, unit: "$M", better: "down" },
                  { l: "Accounts Payable", cur: currentAP, erp: postErpAP, all: postAllAP, unit: "$M", better: "up" },
                  { l: "Cash & Equivalents", cur: baseline.cash || 0, erp: (baseline.cash || 0) + Math.round(bsh.totalWorkingCapital * erpFactor), all: (baseline.cash || 0) + Math.round(bsh.totalWorkingCapital), unit: "$M", better: "up" },
                  { l: "Working Capital", cur: currentWC, erp: postErpAR + postErpInv - postErpAP, all: postAllAR + postAllInv - postAllAP, unit: "$M", better: "down", highlight: true },
                  { l: "DSO (Days)", cur: currentDSO, erp: postErpDSO, all: postAllDSO, unit: "days", better: "down" },
                  { l: "DIO (Days)", cur: currentDIO, erp: postErpDIO, all: postAllDIO, unit: "days", better: "down" },
                  { l: "DPO (Days)", cur: currentDPO, erp: postErpDPO, all: postAllDPO, unit: "days", better: "up" },
                  { l: "Cash Conversion Cycle", cur: currentCCC, erp: postErpDSO + postErpDIO - postErpDPO, all: postAllDSO + postAllDIO - postAllDPO, unit: "days", better: "down", highlight: true },
                ];

                return (
                  <>
                    {isEst && (
                      <div style={{ padding: "8px 14px", background: GOLD + "10", border: `1px solid ${GOLD}22`, borderRadius: 8, marginBottom: 12, fontSize: 12, color: GOLD }}>
                        Values are estimated from revenue band. <button onClick={() => { setStep(2); setFinancialsEntryMode("manual"); }} style={{ background: "none", border: "none", color: GOLD, textDecoration: "underline", cursor: "pointer", fontFamily: FONT, fontSize: 12, fontWeight: 600 }}>Upload P&L for exact figures</button>
                      </div>
                    )}
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 24 }}>
                      <thead><tr>
                        {["Line Item", `Current${estTag}`, "Post-ERP", "Post-ERP+AI", "Change", "Direction"].map((h, i) => (
                          <th key={i} style={{ padding: "6px 10px", borderBottom: `2px solid ${t.bdr}`, textAlign: i === 0 ? "left" : "right", color: t.mut, fontWeight: 600, fontSize: 11 }}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {bsRows.map(row => {
                          const change = row.all - row.cur;
                          const pctChange = row.cur !== 0 ? Math.round(Math.abs(change) / Math.abs(row.cur) * 100) : 0;
                          const isGood = (row.better === "down" && change < 0) || (row.better === "up" && change > 0);
                          return (
                            <tr key={row.l} style={{ background: row.highlight ? GOLD + "08" : "transparent" }}>
                              <td style={{ padding: "5px 10px", borderBottom: `1px solid ${t.bdr}40`, color: row.highlight ? GOLD : t.tx, fontWeight: row.highlight ? 700 : 400 }}>{row.l}</td>
                              <td style={{ padding: "5px 10px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", color: t.mut }}>{row.unit === "$M" ? fm(row.cur) : row.cur}</td>
                              <td style={{ padding: "5px 10px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", color: t.tx2 }}>{row.unit === "$M" ? fm(row.erp) : row.erp}</td>
                              <td style={{ padding: "5px 10px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", color: t.tx }}>{row.unit === "$M" ? fm(row.all) : row.all}</td>
                              <td style={{ padding: "5px 10px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", color: isGood ? GREEN : RED, fontWeight: 600 }}>
                                {row.unit === "$M" ? `${change >= 0 ? "+" : ""}${fm(change)}` : `${change >= 0 ? "+" : ""}${change}`} ({pctChange}%)
                              </td>
                              <td style={{ padding: "5px 10px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontSize: 12 }}>
                                <span style={{ color: isGood ? GREEN : RED }}>{isGood ? (row.better === "down" ? "↓ Better" : "↑ Better") : (row.better === "down" ? "↑ Worse" : "↓ Worse")}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </>
                );
              })()}

              {/* SECTION B — Multi-Year Value Projection */}
              <div style={labelStyle}>Multi-Year Value Projection (3-Year)</div>
              {(() => {
                const tv = valResult.total || 0;
                const agTot = valResult.agentTotal || 0;
                const bsh = valResult.balanceSheet || { totalWorkingCapital: 0 };
                const _r = multiYearRamp || {};
                const ramp = { erp: _r.erp || [30, 70, 100], agent: _r.agent || [0, 40, 100], costSpread: _r.costSpread || [70, 20, 10] };

                // Calculate per-year values
                const y1ERP = tv * (ramp.erp[0] || 0) / 100;
                const y2ERP = tv * (ramp.erp[1] || 0) / 100;
                const y3ERP = tv * (ramp.erp[2] || 0) / 100;
                const y1Agent = agTot * (ramp.agent[0] || 0) / 100;
                const y2Agent = agTot * (ramp.agent[1] || 0) / 100;
                const y3Agent = agTot * (ramp.agent[2] || 0) / 100;

                // Implementation costs from agent specs
                const totalImplCost = selProcs.reduce((s, p) => s + (AGENT_SPECS[p.id]?.implCost || 0), 0) / 1000; // convert K to M
                const erpImplCost = tv * 0.15; // rough ERP implementation as 15% of annual value (industry standard)
                const totalCost = totalImplCost + erpImplCost;
                const y1Cost = totalCost * (ramp.costSpread[0] || 0) / 100;
                const y2Cost = totalCost * (ramp.costSpread[1] || 0) / 100;
                const y3Cost = totalCost * (ramp.costSpread[2] || 0) / 100;

                const y1Net = y1ERP + y1Agent - y1Cost;
                const y2Net = y2ERP + y2Agent - y2Cost;
                const y3Net = y3ERP + y3Agent - y3Cost;
                const cum1 = y1Net;
                const cum2 = cum1 + y2Net;
                const cum3 = cum2 + y3Net;

                const twc = bsh.totalWorkingCapital || 0;
                const y1WC = twc * 0.5;
                const y2WC = twc * 0.8;
                const y3WC = twc;

                const efEbitda = effectiveFinancials.ebitda || 0;
                const y1EBITDA = efEbitda > 0 ? ((y1ERP + y1Agent) / efEbitda * 100).toFixed(1) : "—";
                const y2EBITDA = efEbitda > 0 ? ((y2ERP + y2Agent) / efEbitda * 100).toFixed(1) : "—";
                const y3EBITDA = efEbitda > 0 ? ((y3ERP + y3Agent) / efEbitda * 100).toFixed(1) : "—";

                // Breakeven calculation
                const monthlyNet = (y1Net + y2Net + y3Net) / 36;
                const _beDiv1 = (y2Net + y3Net) / 24;
                const _beDiv2 = (y1ERP + y1Agent) / 12;
                const breakEvenMonths = y1Net < 0 ? (_beDiv1 > 0 ? Math.ceil(Math.abs(y1Net) / _beDiv1) + 12 : 0) : (_beDiv2 > 0 ? Math.ceil(y1Cost / _beDiv2) : 0);

                // Chart data
                const chartData = [
                  { month: 0, value: 0 },
                  { month: 6, value: cum1 * 0.3 },
                  { month: 12, value: cum1 },
                  { month: 18, value: cum1 + y2Net * 0.5 },
                  { month: 24, value: cum2 },
                  { month: 30, value: cum2 + y3Net * 0.5 },
                  { month: 36, value: cum3 },
                ];

                return (
                  <>
                    {/* Editable ramp assumptions */}
                    <div style={{ marginBottom: 16, padding: "10px 14px", background: t.bg, borderRadius: 8, border: `1px solid ${t.bdr}`, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
                      <div style={{ fontSize: 11, color: t.mut, fontWeight: 600 }}>Ramp Assumptions:</div>
                      {[
                        { label: "ERP", key: "erp", c: GOLD },
                        { label: "Agent", key: "agent", c: GREEN },
                        { label: "Cost Spread", key: "costSpread", c: PURPLE },
                      ].map(cfg => (
                        <div key={cfg.key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                          <span style={{ color: cfg.c, fontWeight: 600 }}>{cfg.label}:</span>
                          {[0, 1, 2].map(yi => (
                            <span key={yi}>
                              Y{yi + 1}
                              <input type="number" value={ramp[cfg.key][yi]} onChange={e => {
                                const base = multiYearRamp || {};
                                const newRamp = {
                                  erp: base.erp ? [...base.erp] : [30, 70, 100],
                                  agent: base.agent ? [...base.agent] : [0, 40, 100],
                                  costSpread: base.costSpread ? [...base.costSpread] : [70, 20, 10],
                                };
                                newRamp[cfg.key][yi] = parseInt(e.target.value) || 0;
                                setMultiYearRamp(newRamp);
                              }} style={{ width: 36, textAlign: "center", background: t.card, border: `1px solid ${t.bdr}`, borderRadius: 4, padding: "2px 4px", color: cfg.c, fontFamily: "monospace", fontSize: 11, marginLeft: 2 }} />%
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 24 }}>
                      <thead><tr>
                        {["Metric", "Year 1", "Year 2", "Year 3", "3-Year Total"].map((h, i) => (
                          <th key={i} style={{ padding: "6px 10px", borderBottom: `2px solid ${t.bdr}`, textAlign: i === 0 ? "left" : "right", color: t.mut, fontWeight: 600, fontSize: 11 }}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {[
                          { l: "ERP Value Realized", vals: [y1ERP, y2ERP, y3ERP], total: y1ERP + y2ERP + y3ERP, c: GOLD, pcts: ramp.erp },
                          { l: "Agent Uplift Realized", vals: [y1Agent, y2Agent, y3Agent], total: y1Agent + y2Agent + y3Agent, c: GREEN, pcts: ramp.agent },
                          { l: "Combined Value", vals: [y1ERP + y1Agent, y2ERP + y2Agent, y3ERP + y3Agent], total: y1ERP + y2ERP + y3ERP + y1Agent + y2Agent + y3Agent, c: t.tx },
                          { l: "Implementation Cost", vals: [-y1Cost, -y2Cost, -y3Cost], total: -(y1Cost + y2Cost + y3Cost), c: RED },
                          { l: "Net Value", vals: [y1Net, y2Net, y3Net], total: y1Net + y2Net + y3Net, c: t.tx, bold: true },
                          { l: "Cumulative Net", vals: [cum1, cum2, cum3], total: cum3, c: GOLD, bold: true, highlight: true },
                          { l: "Working Capital Release", vals: [y1WC, y2WC, y3WC], total: y3WC, c: BLUE },
                          { l: "EBITDA Impact (%)", vals: [y1EBITDA, y2EBITDA, y3EBITDA], total: "—", c: PURPLE, pct: true },
                        ].map(row => (
                          <tr key={row.l} style={{ background: row.highlight ? GOLD + "08" : "transparent" }}>
                            <td style={{ padding: "5px 10px", borderBottom: `1px solid ${t.bdr}40`, color: row.c, fontWeight: row.bold ? 700 : 400 }}>{row.l}</td>
                            {row.vals.map((v, i) => (
                              <td key={i} style={{ padding: "5px 10px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", color: row.c, fontWeight: row.bold ? 700 : 500 }}>
                                {row.pct ? `${v}%` : fm(v)}{row.pcts ? ` (${row.pcts[i]}%)` : ""}
                              </td>
                            ))}
                            <td style={{ padding: "5px 10px", borderBottom: `1px solid ${t.bdr}40`, textAlign: "right", fontFamily: "monospace", color: row.c, fontWeight: 700 }}>
                              {row.pct ? row.total : fm(row.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Cumulative Net Value chart */}
                    <div style={labelStyle}>Cumulative Net Value Over 3 Years</div>
                    <div style={{ height: 220, marginBottom: 16 }}>
                      <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={t.bdr} />
                          <XAxis dataKey="month" tick={{ fill: t.tx2, fontSize: 11 }} tickFormatter={v => `M${v}`} axisLine={{ stroke: t.bdr }} />
                          <YAxis tick={{ fill: t.mut, fontSize: 11, fontFamily: "monospace" }} axisLine={{ stroke: t.bdr }} tickFormatter={v => typeof v === "number" && isFinite(v) ? `$${v.toFixed(0)}M` : "$0M"} />
                          <Tooltip contentStyle={{ background: t.card, border: `1px solid ${t.bdr}`, borderRadius: 8, fontSize: 13, color: t.tx }} formatter={v => [typeof v === "number" && isFinite(v) ? `$${v.toFixed(1)}M` : "—", "Cumulative Net"]} />
                          <ReferenceLine y={0} stroke={RED} strokeDasharray="3 3" />
                          <Line type="monotone" dataKey="value" stroke={GOLD} strokeWidth={2} dot={{ fill: GOLD, r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ textAlign: "center", fontSize: 13, color: GOLD, fontWeight: 600, marginBottom: 24 }}>
                      Payback in ~{breakEvenMonths > 0 && breakEvenMonths < 37 ? breakEvenMonths : "—"} months
                    </div>
                  </>
                );
              })()}
            </>)}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <button onClick={() => setStep(4)} style={btnSecondary}>← Benchmark</button>
              <button onClick={() => setStep(6)} style={btnPrimary}>Value Realization →</button>
            </div>
          </div>
        ); } catch (err) { console.error("Step 5 render error:", err); return (
          <div style={{ padding: 24, background: "#D48A8A15", border: "1px solid #D48A8A33", borderRadius: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#D48A8A", marginBottom: 8 }}>Value Calculation Error</div>
            <pre style={{ fontSize: 11, color: t.tx2, overflow: "auto", marginBottom: 12, maxHeight: 200 }}>{err?.message || "Unknown error"}{"\n"}{err?.stack || ""}</pre>
            <div style={{ fontSize: 12, color: t.mut, marginBottom: 12 }}>Processes: {selProcs.length}, Scenario: {scenarioLevel}, ProcValues keys: {Object.keys(procValues).length}, MultiYearRamp: {multiYearRamp ? "set" : "null"}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setStep(4)} style={btnSecondary}>← Back to Benchmark</button>
              <button onClick={() => { setScenarioLevel("Medium"); setProcScenarios({}); }} style={btnPrimary}>Reset Scenarios</button>
            </div>
          </div>
        ); } })()}

        {/* ═══════════════════════════════════════════════
            STEP 6 — Value Realization Plan
           ═══════════════════════════════════════════════ */}
        {step === 6 && (
          <div>
            {stepHeader(6, "Value Realization Plan", "Expand each dimension card to define how value will be realized.")}

            {[
              { key: "people", label: "People", icon: "👥", color: GOLD, fields: [
                { id: "roleChanges", label: "Role changes", type: "textarea", placeholder: "Describe anticipated role changes..." },
                { id: "headcountDelta", label: "Headcount delta", type: "number", placeholder: "e.g. -5 or +3" },
                { id: "skillsRequired", label: "Skills required", type: "tags", placeholder: "Add skill and press Enter" },
              ]},
              { key: "processes", label: "Processes", icon: "⚙️", color: GREEN, fields: [
                { id: "processesRedesigned", label: "Processes redesigned", type: "list", placeholder: "Add process name" },
                { id: "processesRetired", label: "Processes retired", type: "list", placeholder: "Add process name" },
                { id: "automationCandidates", label: "Automation candidates", type: "list", placeholder: "Add process name" },
              ]},
              { key: "data", label: "Data", icon: "📊", color: BLUE, fields: [
                { id: "dataGaps", label: "Data gaps", type: "textarea", placeholder: "Describe data gaps..." },
                { id: "governanceNeeds", label: "Governance needs", type: "textarea", placeholder: "Describe governance requirements..." },
                { id: "qualityIssues", label: "Quality issues", type: "tags", placeholder: "Add issue and press Enter" },
              ]},
              { key: "technology", label: "Technology", icon: "💻", color: PURPLE, fields: [
                { id: "sapModules", label: "SAP modules", type: "prefilled", getValue: () => [...new Set(selProcs.flatMap(p => (p.sap || []).map(s => s.module)))].map(m => { const n = SAP_MODULE_NAMES[m.split(/\s*\/\s*/)[0].trim()]; return n ? `${m} — ${n}` : m; }).join(", ") || "None selected" },
                { id: "aiAgents", label: "AI agents", type: "prefilled", getValue: () => selProcs.filter(p => AGENT_SPECS[p.id]).map(p => p.label).slice(0, 5).join(", ") || "None generated" },
                { id: "integrationNeeds", label: "Integration needs", type: "textarea", placeholder: "Describe integration requirements..." },
                { id: "itInfrastructure", label: "IT infrastructure", type: "textarea", placeholder: "Infrastructure changes needed..." },
                { id: "physicalFootprint", label: "Physical footprint", type: "textarea", placeholder: "Physical footprint changes..." },
              ]},
              { key: "governance", label: "Governance", icon: "🏛️", color: ORANGE, fields: [
                { id: "decisionRights", label: "Decision rights changes", type: "textarea", placeholder: "Describe changes to decision rights..." },
                { id: "ownershipModel", label: "Process ownership model", type: "textarea", placeholder: "Describe the target ownership model..." },
              ]},
              { key: "operatingModel", label: "Operating Model", icon: "🔄", color: RED, fields: [
                { id: "structuralChanges", label: "Structural changes", type: "textarea", placeholder: "Describe organizational structural changes..." },
                { id: "reportingChanges", label: "Reporting changes", type: "textarea", placeholder: "Describe reporting line changes..." },
                { id: "serviceModel", label: "Service model", type: "textarea", placeholder: "Describe target service delivery model..." },
              ]},
            ].map(dim => {
              const isOpen = !vrCollapsed[dim.key];
              const dimData = valueRealization[dim.key] || {};
              const updateDim = (fieldId, val) => setValueRealization(prev => ({ ...prev, [dim.key]: { ...(prev[dim.key] || {}), [fieldId]: val } }));
              return (
                <div key={dim.key} style={{ ...cardStyle, marginBottom: 10, overflow: "hidden" }}>
                  <div onClick={() => setVrCollapsed(prev => ({ ...prev, [dim.key]: !prev[dim.key] }))}
                    style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "4px 0" }}>
                    <span style={{ fontSize: 18 }}>{dim.icon}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: dim.color, flex: 1 }}>{dim.label}</span>
                    {vrLoading[dim.key] && <span style={{ fontSize: 11, color: dim.color, fontWeight: 500 }}>Analyzing {dim.label}...</span>}
                    <span style={{ fontSize: 12, color: t.mut, transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
                  </div>
                  {isOpen && (
                    <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                      {dim.fields.map(field => (
                        <div key={field.id}>
                          <div style={{ fontSize: 11, color: t.tx2, fontWeight: 600, marginBottom: 4 }}>{field.label}</div>
                          {field.type === "textarea" && (
                            <textarea value={dimData[field.id] || ""} onChange={e => updateDim(field.id, e.target.value)} placeholder={field.placeholder}
                              style={{ width: "100%", minHeight: 60, padding: "8px 10px", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 8, color: t.tx, fontFamily: FONT, fontSize: 12, resize: "vertical", outline: "none" }} />
                          )}
                          {field.type === "number" && (
                            <input type="number" value={dimData[field.id] || ""} onChange={e => updateDim(field.id, e.target.value)} placeholder={field.placeholder}
                              style={{ width: 120, padding: "8px 10px", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 8, color: t.tx, fontFamily: FONT, fontSize: 12, outline: "none" }} />
                          )}
                          {field.type === "tags" && (
                            <div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
                                {(dimData[field.id] || []).map((tag, ti) => (
                                  <span key={ti} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12, background: dim.color + "18", color: dim.color, display: "flex", alignItems: "center", gap: 4 }}>
                                    {tag}
                                    <span onClick={() => updateDim(field.id, (dimData[field.id] || []).filter((_, i) => i !== ti))} style={{ cursor: "pointer", fontWeight: 700 }}>×</span>
                                  </span>
                                ))}
                              </div>
                              <input placeholder={field.placeholder} onKeyDown={e => {
                                if (e.key === "Enter" && e.target.value.trim()) {
                                  updateDim(field.id, [...(dimData[field.id] || []), e.target.value.trim()]);
                                  e.target.value = "";
                                }
                              }} style={{ width: "100%", padding: "6px 10px", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 8, color: t.tx, fontFamily: FONT, fontSize: 12, outline: "none" }} />
                            </div>
                          )}
                          {field.type === "list" && (
                            <div>
                              {(dimData[field.id] || []).map((item, li) => (
                                <div key={li} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                  <span style={{ fontSize: 12, color: t.tx, flex: 1 }}>• {item}</span>
                                  <span onClick={() => updateDim(field.id, (dimData[field.id] || []).filter((_, i) => i !== li))} style={{ cursor: "pointer", fontSize: 11, color: t.mut }}>×</span>
                                </div>
                              ))}
                              <input placeholder={field.placeholder} onKeyDown={e => {
                                if (e.key === "Enter" && e.target.value.trim()) {
                                  updateDim(field.id, [...(dimData[field.id] || []), e.target.value.trim()]);
                                  e.target.value = "";
                                }
                              }} style={{ width: "100%", padding: "6px 10px", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 8, color: t.tx, fontFamily: FONT, fontSize: 12, outline: "none" }} />
                            </div>
                          )}
                          {field.type === "prefilled" && (
                            <div style={{ fontSize: 12, color: t.tx2, padding: "8px 10px", background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 8 }}>{field.getValue()}</div>
                          )}
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button onClick={async () => {
                          setVrLoading(prev => ({ ...prev, [dim.key]: true }));
                          const fullP = "System: You are a transformation impact analyst. Generate specific impacts for the " + dim.label + " dimension. Return JSON with keyPoints array and actions array. User: Processes: " + selProcs.map(p => p.label).slice(0, 10).join(", ") + ". ERP value: " + (valResult.total ? "$" + valResult.total.toFixed(1) + "M" : "TBD") + ". Company: " + companyName + ". Generate for: " + dim.label;
                          callCatalyst(dim.key, fullP, (fn) => {
                            fn(prev => {
                              const r = prev[dim.key];
                              if (typeof r === "string") {
                                try {
                                  const m = r.match(/\{[\s\S]*\}/);
                                  if (m) {
                                    const parsed = JSON.parse(m[0]);
                                    const fld = { people: "roleChanges", processes: "processesRedesigned", data: "dataGaps", technology: "integrationNeeds", governance: "decisionRights", operatingModel: "structuralChanges" }[dim.key];
                                    if (parsed.keyPoints) setValueRealization(vr => ({ ...vr, [dim.key]: { ...(vr[dim.key] || {}), [fld]: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.join("\n") : parsed.keyPoints } }));
                                  }
                                } catch (_e) { /* ignore parse errors */ }
                              }
                              setVrLoading(vl => ({ ...vl, [dim.key]: false }));
                              return prev;
                            });
                          }, setVrLoading);
                        }} disabled={vrLoading[dim.key]} style={{ padding: "6px 14px", borderRadius: 8, background: dim.color + "15", border: "1px solid " + dim.color + "30", color: dim.color, fontFamily: FONT, fontSize: 11, fontWeight: 600, cursor: vrLoading[dim.key] ? "wait" : "pointer" }}>
                          {vrLoading[dim.key] ? "Regenerating..." : "Regenerate"}
                        </button>
                        {!apiKey && catalystServer === false && <span style={{ fontSize: 10, color: t.mut, fontStyle: "italic" }}>Add API key to auto-populate</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <button onClick={() => setStep(5)} style={btnSecondary}>← Value Calculation</button>
              <button onClick={() => setStep(7)} style={btnPrimary}>Action Plan →</button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            STEP 7 — Phase 0 Action Plan
           ═══════════════════════════════════════════════ */}
        {step === 7 && (
          <div>
            {stepHeader(7, "Phase 0 Action Plan", "Download deliverables, share with stakeholders, and define next steps.")}

            {/* Hero Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, marginBottom: 28 }}>
              {[
                { l: "Combined Value", v: fd(valResult.combined), c: "#FFFFFF", large: true, dollar: true },
                { l: "ERP Value", v: fd(valResult.total), c: GOLD, dollar: true },
                { l: "Agent Uplift", v: fd(valResult.agentTotal), c: GREEN, dollar: true },
                { l: "Processes", v: selProcs.length, c: BLUE },
                { l: "KPIs Assessed", v: totalKPIs, c: PURPLE },
                { l: "Peer Group", v: assessmentProfile.industry && assessmentProfile.revenueBand ? `${assessmentProfile.industry} ${assessmentProfile.revenueBand}` : "Not configured", c: "#AAA" },
              ].map(k => (
                <div key={k.l} style={{ background: `${k.c}0C`, border: `1px solid ${k.c}22`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: k.c, textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 600, marginBottom: 4 }}>{k.l}</div>
                  <div style={{ fontSize: k.large ? 28 : 22, fontFamily: SERIF, color: k.c, fontWeight: k.large ? 700 : 400, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>{k.v}{k.dollar && <span title={`${k.l}: gap × base amount × addressable% × scenario factor`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, borderRadius: "50%", background: k.c + "20", color: k.c, fontSize: 8, fontWeight: 700, cursor: "help", flexShrink: 0 }}>i</span>}</div>
                </div>
              ))}
            </div>

            {/* ─── Blueprint Coverage ─── */}
            {(() => {
              const tierCounts = {};
              BLUEPRINT_TIERS.forEach(bt => tierCounts[bt.id] = 0);
              selProcs.forEach(p => (p.blueprintTiers || []).forEach(tid => { tierCounts[tid] = (tierCounts[tid] || 0) + 1; }));
              const coveredCount = BLUEPRINT_TIERS.filter(bt => tierCounts[bt.id] > 0).length;
              const maxCount = Math.max(...Object.values(tierCounts), 1);
              const missing = BLUEPRINT_TIERS.filter(bt => tierCounts[bt.id] === 0).map(bt => bt.name);
              return (
                <div style={{ marginBottom: 28 }}>
                  <div style={labelStyle}>EY.ai Value Blueprint Coverage</div>
                  <div style={{ ...cardStyle, padding: 20 }}>
                    <div style={{ display: "grid", gap: 6 }}>
                      {BLUEPRINT_TIERS.map(bt => {
                        const count = tierCounts[bt.id] || 0;
                        const pct = count > 0 ? Math.round((count / maxCount) * 100) : 0;
                        return (
                          <div key={bt.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 14, minWidth: 22, textAlign: "center" }}>{bt.icon}</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: count > 0 ? bt.color : t.mut, minWidth: 110 }}>{bt.name}</span>
                            <div style={{ flex: 1, height: 14, background: t.bg, borderRadius: 7, overflow: "hidden" }}>
                              {count > 0 && <div style={{ width: pct + "%", height: "100%", background: bt.color, borderRadius: 7, transition: "width 0.3s" }} />}
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 600, color: count > 0 ? t.tx : t.mut, minWidth: 28, textAlign: "right" }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ fontSize: 11, color: t.tx2, marginTop: 14 }}>Assessment covers <span style={{ color: GOLD, fontWeight: 700 }}>{coveredCount} of 7</span> tiers across {selProcs.length} processes</div>
                    {missing.length > 0 && <div style={{ fontSize: 11, color: t.mut, marginTop: 6, fontStyle: "italic" }}>Consider expanding scope to address: {missing.join(", ")}</div>}
                  </div>
                </div>
              );
            })()}

            {/* Downloads — Primary action first */}
            <div style={labelStyle}>Deliverables</div>
            <div style={{ ...cardStyle, textAlign: "center", padding: 24, marginBottom: 12 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
              <div style={{ fontSize: 18, fontFamily: SERIF, fontWeight: 700, color: GOLD, marginBottom: 6 }}>Executive Deck (4 slides)</div>
              <div style={{ fontSize: 12, color: t.tx2, lineHeight: 1.5, marginBottom: 14 }}>Board-ready: value summary, P&L, decision leakage, next steps</div>
                <button onClick={() => generateExecDeck({ baseline: { ...baseline, company: companyName }, selProcs, valResult, scenarioLevel, procValues, procBenchmarks, agentResults, baselineData, selectedFunction, totalKPIs, FUNCTIONS, PROC_MAP, getQuartile, BLUEPRINT_TIERS, valueRealization, processOwners: processOwnership, companyFinancials, multiYearRamp, assessmentProfile })} style={{ ...btnPrimary, padding: "14px 24px", fontSize: 15, width: "100%", background: GOLD }}>
                  ↓ Download Executive PPTX
                </button>
              </div>
              <div onClick={() => setMoreOptionsOpen(prev => ({ ...prev, step7downloads: !prev.step7downloads }))} style={{ fontSize: 12, color: t.mut, cursor: "pointer", marginBottom: 8 }}>{moreOptionsOpen.step7downloads ? "▾ Fewer options" : "▸ More downloads"}</div>
              {moreOptionsOpen.step7downloads && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 28 }}>
                <button onClick={() => generateDetailedDeck({ baseline: { ...baseline, company: companyName }, selProcs, valResult, scenarioLevel, procValues, procBenchmarks, agentResults, baselineData, selectedFunction, totalKPIs, FUNCTIONS, PROC_MAP, getQuartile, BLUEPRINT_TIERS, valueRealization, processOwners: processOwnership, companyFinancials, multiYearRamp, assessmentProfile })} style={{ ...btnSecondary, padding: "10px 16px", fontSize: 12 }}>
                  ↓ Detailed PPTX (10 slides)
                </button>
                <button onClick={generatePhase0Report} style={{ ...btnSecondary, padding: "10px 16px", fontSize: 12 }}>
                  ↓ Phase 0 Report (HTML)
                </button>
                <button onClick={exportSessionJSON} style={{ ...btnSecondary, padding: "10px 16px", fontSize: 12 }}>
                  ↓ Export JSON
                </button>
                <button onClick={() => generatePPTX({ baseline, selProcs, valResult, scenarioLevel, procValues, procBenchmarks, agentResults, baselineData, selectedFunction, totalKPIs, FUNCTIONS, PROC_MAP, getQuartile, BLUEPRINT_TIERS })} style={{ ...btnSecondary, padding: "10px 16px", fontSize: 12 }}>
                  ↓ Legacy PPTX (v1)
                </button>
              </div>
              )}

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

                const biggestProc = valResult.impacts[0];
                const highFeasAgents = selProcs.filter(p => AGENT_SPECS[p.id] && AGENT_SPECS[p.id].feasibility >= 80);

                const actionSteps = [];
                if (topE2E) actionSteps.push({ action: `Prioritize ${topE2E[0]} for Phase 1`, rationale: `$${topE2E[1].toFixed(1)}M addressable — largest value concentration`, owner: "Executive Sponsor", timeline: "Week 1-2", priority: "High", c: GOLD });
                if (biggestProc) actionSteps.push({ action: `Validate ${biggestProc.label} baseline with process owner`, rationale: `$${biggestProc.value.toFixed(1)}M at stake — confirm KPI assumptions before design`, owner: "Process Owner", timeline: "Week 1-3", priority: "High", c: GOLD });
                if (topAgent) actionSteps.push({ action: `Deploy AI agent for ${topAgent.label}`, rationale: `$${topAgent.agentValue.toFixed(1)}M incremental uplift${highFeasAgents.length > 0 ? ` — ${highFeasAgents.length} high-feasibility candidates` : ""}`, owner: "Technology Lead", timeline: "Week 4-8", priority: "Medium", c: GREEN });
                if (bottomQuartile > 0) actionSteps.push({ action: `Address ${bottomQuartile} bottom quartile KPIs`, rationale: "Largest headroom for improvement vs. industry benchmarks", owner: "Process Owners", timeline: "Week 2-6", priority: "High", c: RED });
                if (leastData > 0) actionSteps.push({ action: `Collect baseline for ${leastData} processes with missing data`, rationale: "Missing data reduces confidence — schedule SME workshops", owner: "Project Lead", timeline: "Week 1-2", priority: "High", c: PURPLE });
                actionSteps.push({ action: "Initiate Phase 1 detailed design", rationale: "Translate findings into wave plan, requirements, and roadmap", owner: "Project Lead", timeline: "Week 2-4", priority: "High", c: BLUE });

                return (
                  <div style={{ display: "grid", gap: 10 }}>
                    {actionSteps.map((s, i) => {
                      const pColor = s.priority === "High" ? GOLD : s.priority === "Medium" ? GREEN : BLUE;
                      return (
                        <div key={i} style={{ padding: "14px 16px", background: s.c + "08", border: `1px solid ${s.c}22`, borderRadius: 10, display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: t.tx, marginBottom: 4 }}>{i + 1}. {s.action}</div>
                            <div style={{ fontSize: 12, color: t.tx2, lineHeight: 1.5, marginBottom: 6 }}>{s.rationale}</div>
                            <div style={{ fontSize: 11, color: t.mut }}>Owner: {s.owner} | {s.timeline}</div>
                          </div>
                          <div style={{ padding: "4px 12px", borderRadius: 6, background: pColor + "20", color: pColor, fontSize: 11, fontWeight: 700, height: "fit-content", textTransform: "uppercase" }}>{s.priority}</div>
                        </div>
                      );
                    })}
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
              <button onClick={() => setStep(6)} style={btnSecondary}>← Value Realization</button>
            </div>
          </div>
        )}

      </div>

      {/* ─── TOAST NOTIFICATIONS ─── */}
      {toasts.length > 0 && (
        <div style={{ position: "fixed", bottom: 80, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
          {toasts.map(toast => (
            <div key={toast.id} style={{ padding: "10px 18px", background: GREEN + "20", border: `1px solid ${GREEN}44`, borderRadius: 10, color: GREEN, fontSize: 13, fontFamily: FONT, fontWeight: 600, animation: "fadeIn 0.2s ease-in", backdropFilter: "blur(8px)" }}>
              {toast.message}
            </div>
          ))}
        </div>
      )}

      {/* ─── CALC EXPLAINER DRAWER ─── */}
      {calcExplainer && <CalcExplainerDrawer data={calcExplainer} onClose={() => { setCalcExplainer(null); setChallengeResult(null); }} mode={mode} />}

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
