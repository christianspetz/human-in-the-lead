// Shared industry list (same as Diagnostic.jsx)
export const INDUSTRIES = [
  'Pharma/Biotech/Life Sciences', 'Financial Services', 'Manufacturing/Industrial',
  'Technology/Telecom', 'Energy/Utilities', 'Retail/Consumer Goods',
  'Healthcare/Public Sector', 'Professional Services', 'Other'
];

export const DEPARTMENTS = [
  { id: 'finance', label: 'Finance' },
  { id: 'hr', label: 'HR' },
  { id: 'procurement', label: 'Procurement' },
  { id: 'supply_chain', label: 'Supply Chain' },
  { id: 'it', label: 'IT' },
  { id: 'sales_marketing', label: 'Sales & Marketing' },
  { id: 'rnd', label: 'R&D' },
  { id: 'customer_service', label: 'Customer Service' },
  { id: 'legal_compliance', label: 'Legal/Compliance' },
  { id: 'operations', label: 'Operations' },
];

export const AUTOMATION_LEVELS = [
  { id: 'full_ai', label: 'Full AI', shortLabel: 'Full AI', color: '#A855F7' },
  { id: 'ai_led', label: 'AI-Led + Human Oversight', shortLabel: 'AI-Led', color: '#3B82F6' },
  { id: 'human_led', label: 'Human-Led + AI Assist', shortLabel: 'Human-Led', color: '#22C55E' },
  { id: 'full_human', label: 'Full Human', shortLabel: 'Full Human', color: '#64748B' },
];

// ─── Department Tasks by Industry ───────────────────────────────────────────

const DEFAULT_TASKS = {
  finance: [
    { id: 'fin_1', label: 'AP Invoice Processing' },
    { id: 'fin_2', label: 'Financial Close & Reconciliation' },
    { id: 'fin_3', label: 'FP&A Forecasting' },
    { id: 'fin_4', label: 'Treasury & Cash Management' },
    { id: 'fin_5', label: 'Audit & Compliance Reporting' },
    { id: 'fin_6', label: 'Tax Reporting & Filing' },
  ],
  hr: [
    { id: 'hr_1', label: 'Resume Screening & Candidate Shortlisting' },
    { id: 'hr_2', label: 'Employee Onboarding Documentation' },
    { id: 'hr_3', label: 'Performance Review Cycle Management' },
    { id: 'hr_4', label: 'Benefits Administration' },
    { id: 'hr_5', label: 'Workforce Planning & Scheduling' },
    { id: 'hr_6', label: 'Training Compliance Tracking' },
  ],
  procurement: [
    { id: 'proc_1', label: 'Supplier Evaluation & Selection' },
    { id: 'proc_2', label: 'Purchase Order Processing' },
    { id: 'proc_3', label: 'Contract Management & Renewal' },
    { id: 'proc_4', label: 'Spend Analysis & Category Management' },
    { id: 'proc_5', label: 'Supplier Risk Monitoring' },
    { id: 'proc_6', label: 'Invoice Matching (3-Way Match)' },
  ],
  supply_chain: [
    { id: 'sc_1', label: 'Demand Forecasting' },
    { id: 'sc_2', label: 'Inventory Optimization' },
    { id: 'sc_3', label: 'Order Fulfillment & Logistics' },
    { id: 'sc_4', label: 'Supplier Lead Time Tracking' },
    { id: 'sc_5', label: 'Warehouse Management' },
    { id: 'sc_6', label: 'Transportation Route Optimization' },
  ],
  it: [
    { id: 'it_1', label: 'IT Service Desk Ticket Triage' },
    { id: 'it_2', label: 'Infrastructure Monitoring & Alerting' },
    { id: 'it_3', label: 'Security Incident Detection' },
    { id: 'it_4', label: 'Software Deployment & Release' },
    { id: 'it_5', label: 'User Access Provisioning' },
    { id: 'it_6', label: 'Patch Management' },
  ],
  sales_marketing: [
    { id: 'sm_1', label: 'Lead Scoring & Qualification' },
    { id: 'sm_2', label: 'Campaign Performance Analytics' },
    { id: 'sm_3', label: 'Content Generation & Personalization' },
    { id: 'sm_4', label: 'Customer Segmentation' },
    { id: 'sm_5', label: 'Sales Forecasting' },
    { id: 'sm_6', label: 'Proposal & RFP Response Drafting' },
  ],
  rnd: [
    { id: 'rnd_1', label: 'Literature Review & Research Synthesis' },
    { id: 'rnd_2', label: 'Experiment Design & Planning' },
    { id: 'rnd_3', label: 'Data Analysis & Pattern Recognition' },
    { id: 'rnd_4', label: 'Technical Documentation' },
    { id: 'rnd_5', label: 'Prototype Testing & QA' },
    { id: 'rnd_6', label: 'IP & Patent Landscape Analysis' },
  ],
  customer_service: [
    { id: 'cs_1', label: 'First-Line Inquiry Handling' },
    { id: 'cs_2', label: 'Complaint Resolution & Escalation' },
    { id: 'cs_3', label: 'Knowledge Base Maintenance' },
    { id: 'cs_4', label: 'Customer Sentiment Analysis' },
    { id: 'cs_5', label: 'SLA Monitoring & Reporting' },
    { id: 'cs_6', label: 'Self-Service Portal Management' },
  ],
  legal_compliance: [
    { id: 'lc_1', label: 'Contract Review & Clause Extraction' },
    { id: 'lc_2', label: 'Regulatory Change Monitoring' },
    { id: 'lc_3', label: 'Compliance Audit Preparation' },
    { id: 'lc_4', label: 'Policy Document Drafting' },
    { id: 'lc_5', label: 'Risk Assessment & Reporting' },
    { id: 'lc_6', label: 'Litigation Support & Document Review' },
  ],
  operations: [
    { id: 'ops_1', label: 'Production Scheduling' },
    { id: 'ops_2', label: 'Quality Inspection & Defect Detection' },
    { id: 'ops_3', label: 'Predictive Maintenance' },
    { id: 'ops_4', label: 'Process Optimization & Bottleneck Analysis' },
    { id: 'ops_5', label: 'Safety Incident Reporting' },
    { id: 'ops_6', label: 'Capacity Planning' },
  ],
};

export const DEPARTMENT_TASKS = {
  'Pharma/Biotech/Life Sciences': {
    finance: [
      { id: 'pharma_fin_1', label: 'Clinical Trial Budget Forecasting' },
      { id: 'pharma_fin_2', label: 'Regulatory Submission Cost Tracking' },
      { id: 'pharma_fin_3', label: 'Revenue Recognition (Milestone Payments)' },
      { id: 'pharma_fin_4', label: 'R&D Tax Credit & Grant Management' },
      { id: 'pharma_fin_5', label: 'AP Invoice Processing' },
      { id: 'pharma_fin_6', label: 'Financial Compliance Reporting (SOX/FDA)' },
    ],
    hr: [
      { id: 'pharma_hr_1', label: 'Scientific Talent Recruiting & Screening' },
      { id: 'pharma_hr_2', label: 'GxP Training Compliance Tracking' },
      { id: 'pharma_hr_3', label: 'Employee Onboarding (Regulated Roles)' },
      { id: 'pharma_hr_4', label: 'Performance Review Management' },
      { id: 'pharma_hr_5', label: 'Benefits Administration' },
      { id: 'pharma_hr_6', label: 'Workforce Planning for Trial Phases' },
    ],
    procurement: [
      { id: 'pharma_proc_1', label: 'CRO/CDMO Vendor Qualification' },
      { id: 'pharma_proc_2', label: 'Raw Material & API Sourcing' },
      { id: 'pharma_proc_3', label: 'GMP Supplier Audit Scheduling' },
      { id: 'pharma_proc_4', label: 'Clinical Supply Chain Procurement' },
      { id: 'pharma_proc_5', label: 'Contract Management (MSAs/SOWs)' },
      { id: 'pharma_proc_6', label: 'Spend Analytics & Category Management' },
    ],
    supply_chain: [
      { id: 'pharma_sc_1', label: 'Cold Chain Logistics Monitoring' },
      { id: 'pharma_sc_2', label: 'Drug Product Demand Forecasting' },
      { id: 'pharma_sc_3', label: 'Serialization & Track-and-Trace' },
      { id: 'pharma_sc_4', label: 'Clinical Trial Material Distribution' },
      { id: 'pharma_sc_5', label: 'Inventory Management (Controlled Substances)' },
      { id: 'pharma_sc_6', label: 'Batch Release & Lot Tracking' },
    ],
    it: [
      { id: 'pharma_it_1', label: 'CSV (Computer System Validation) Support' },
      { id: 'pharma_it_2', label: 'IT Service Desk Ticket Triage' },
      { id: 'pharma_it_3', label: 'GxP System Change Control' },
      { id: 'pharma_it_4', label: 'Data Integrity Monitoring (21 CFR Part 11)' },
      { id: 'pharma_it_5', label: 'Security Incident Detection' },
      { id: 'pharma_it_6', label: 'LIMS/ELN System Administration' },
    ],
    sales_marketing: [
      { id: 'pharma_sm_1', label: 'HCP Engagement & KOL Mapping' },
      { id: 'pharma_sm_2', label: 'Medical Affairs Content Review' },
      { id: 'pharma_sm_3', label: 'Promotional Review (MLR Process)' },
      { id: 'pharma_sm_4', label: 'Market Access & Payer Analytics' },
      { id: 'pharma_sm_5', label: 'Sales Territory Optimization' },
      { id: 'pharma_sm_6', label: 'Adverse Event Report Monitoring (Field)' },
    ],
    rnd: [
      { id: 'pharma_rnd_1', label: 'Literature Review & Meta-Analysis' },
      { id: 'pharma_rnd_2', label: 'Clinical Protocol Design Assistance' },
      { id: 'pharma_rnd_3', label: 'Adverse Event Signal Detection' },
      { id: 'pharma_rnd_4', label: 'Molecular Compound Screening' },
      { id: 'pharma_rnd_5', label: 'Biostatistical Analysis' },
      { id: 'pharma_rnd_6', label: 'Regulatory Submission Document Prep' },
      { id: 'pharma_rnd_7', label: 'Clinical Data Management & Cleaning' },
    ],
    customer_service: [
      { id: 'pharma_cs_1', label: 'Medical Information Inquiry Handling' },
      { id: 'pharma_cs_2', label: 'Patient Support Program Administration' },
      { id: 'pharma_cs_3', label: 'Adverse Event Intake & Reporting' },
      { id: 'pharma_cs_4', label: 'Product Complaint Processing' },
      { id: 'pharma_cs_5', label: 'HCP Portal Support' },
      { id: 'pharma_cs_6', label: 'Reimbursement & Access Support' },
    ],
    legal_compliance: [
      { id: 'pharma_lc_1', label: 'FDA/EMA Regulatory Intelligence Monitoring' },
      { id: 'pharma_lc_2', label: 'Clinical Trial Agreement Review' },
      { id: 'pharma_lc_3', label: 'Pharmacovigilance Compliance Reporting' },
      { id: 'pharma_lc_4', label: 'Sunshine Act / Transparency Reporting' },
      { id: 'pharma_lc_5', label: 'IP Patent Landscape Monitoring' },
      { id: 'pharma_lc_6', label: 'GxP Audit Preparation & CAPA Tracking' },
    ],
    operations: [
      { id: 'pharma_ops_1', label: 'GMP Manufacturing Batch Records' },
      { id: 'pharma_ops_2', label: 'Quality Control Testing & Release' },
      { id: 'pharma_ops_3', label: 'Equipment Qualification & Calibration' },
      { id: 'pharma_ops_4', label: 'Deviation & CAPA Management' },
      { id: 'pharma_ops_5', label: 'Environmental Monitoring' },
      { id: 'pharma_ops_6', label: 'Production Scheduling & Capacity Planning' },
    ],
  },

  'Financial Services': {
    finance: [
      { id: 'finsvc_fin_1', label: 'Regulatory Capital Calculations' },
      { id: 'finsvc_fin_2', label: 'Transaction Reconciliation' },
      { id: 'finsvc_fin_3', label: 'Fraud Detection & Investigation' },
      { id: 'finsvc_fin_4', label: 'Credit Risk Scoring & Underwriting' },
      { id: 'finsvc_fin_5', label: 'Financial Statement Preparation' },
      { id: 'finsvc_fin_6', label: 'Internal Audit Sampling' },
      { id: 'finsvc_fin_7', label: 'Client Fee Calculation & Billing' },
    ],
    hr: [
      { id: 'finsvc_hr_1', label: 'Compliance Training Tracking (FINRA/SEC)' },
      { id: 'finsvc_hr_2', label: 'Background Check & Licensing Verification' },
      { id: 'finsvc_hr_3', label: 'Performance & Bonus Calibration' },
      { id: 'finsvc_hr_4', label: 'Workforce Attrition Prediction' },
      { id: 'finsvc_hr_5', label: 'Employee Onboarding Documentation' },
      { id: 'finsvc_hr_6', label: 'Diversity & Inclusion Analytics' },
    ],
    procurement: [
      { id: 'finsvc_proc_1', label: 'Vendor Risk & Due Diligence' },
      { id: 'finsvc_proc_2', label: 'Third-Party Risk Management (TPRM)' },
      { id: 'finsvc_proc_3', label: 'Software License Management' },
      { id: 'finsvc_proc_4', label: 'Contract Negotiation & Renewal' },
      { id: 'finsvc_proc_5', label: 'Spend Analytics' },
      { id: 'finsvc_proc_6', label: 'Outsourcing Governance' },
    ],
    supply_chain: [
      { id: 'finsvc_sc_1', label: 'Document & Forms Distribution' },
      { id: 'finsvc_sc_2', label: 'IT Hardware Asset Lifecycle' },
      { id: 'finsvc_sc_3', label: 'Branch Supply Management' },
      { id: 'finsvc_sc_4', label: 'Data Center Capacity Planning' },
      { id: 'finsvc_sc_5', label: 'Business Continuity Resource Planning' },
      { id: 'finsvc_sc_6', label: 'Print & Mail Operations' },
    ],
    it: [
      { id: 'finsvc_it_1', label: 'Cybersecurity Threat Detection (SOC)' },
      { id: 'finsvc_it_2', label: 'Core Banking System Monitoring' },
      { id: 'finsvc_it_3', label: 'Identity & Access Management' },
      { id: 'finsvc_it_4', label: 'IT Change Management & Approvals' },
      { id: 'finsvc_it_5', label: 'Disaster Recovery Testing' },
      { id: 'finsvc_it_6', label: 'API Gateway & Integration Monitoring' },
    ],
    sales_marketing: [
      { id: 'finsvc_sm_1', label: 'Client Propensity Scoring' },
      { id: 'finsvc_sm_2', label: 'Personalized Product Recommendations' },
      { id: 'finsvc_sm_3', label: 'Marketing Campaign Attribution' },
      { id: 'finsvc_sm_4', label: 'Wealth Management Client Reporting' },
      { id: 'finsvc_sm_5', label: 'Cross-Sell / Upsell Analytics' },
      { id: 'finsvc_sm_6', label: 'Regulatory-Compliant Content Generation' },
    ],
    rnd: [
      { id: 'finsvc_rnd_1', label: 'Quantitative Model Development' },
      { id: 'finsvc_rnd_2', label: 'Algorithmic Trading Strategy Backtesting' },
      { id: 'finsvc_rnd_3', label: 'Product Feature A/B Testing' },
      { id: 'finsvc_rnd_4', label: 'Market Data Analysis & Insights' },
      { id: 'finsvc_rnd_5', label: 'Fintech Partnership Evaluation' },
      { id: 'finsvc_rnd_6', label: 'Customer Experience Research' },
    ],
    customer_service: [
      { id: 'finsvc_cs_1', label: 'Account Inquiry & Balance Requests' },
      { id: 'finsvc_cs_2', label: 'Dispute & Chargeback Processing' },
      { id: 'finsvc_cs_3', label: 'KYC/AML Customer Verification' },
      { id: 'finsvc_cs_4', label: 'Loan Application Status Updates' },
      { id: 'finsvc_cs_5', label: 'Complaint Escalation & Tracking' },
      { id: 'finsvc_cs_6', label: 'Digital Banking Support' },
    ],
    legal_compliance: [
      { id: 'finsvc_lc_1', label: 'KYC/AML Screening & Due Diligence' },
      { id: 'finsvc_lc_2', label: 'Regulatory Reporting (SOX, Basel, Dodd-Frank)' },
      { id: 'finsvc_lc_3', label: 'Sanctions List Monitoring' },
      { id: 'finsvc_lc_4', label: 'Suspicious Activity Report (SAR) Filing' },
      { id: 'finsvc_lc_5', label: 'Consumer Complaint Response (CFPB)' },
      { id: 'finsvc_lc_6', label: 'Model Risk Management (SR 11-7)' },
    ],
    operations: [
      { id: 'finsvc_ops_1', label: 'Trade Settlement & Clearing' },
      { id: 'finsvc_ops_2', label: 'Payment Processing & Reconciliation' },
      { id: 'finsvc_ops_3', label: 'Account Opening & Maintenance' },
      { id: 'finsvc_ops_4', label: 'Loan Origination & Servicing' },
      { id: 'finsvc_ops_5', label: 'Wire Transfer Processing' },
      { id: 'finsvc_ops_6', label: 'Statement Generation & Distribution' },
    ],
  },

  'Manufacturing/Industrial': {
    finance: [
      { id: 'mfg_fin_1', label: 'Cost-of-Goods-Sold Variance Analysis' },
      { id: 'mfg_fin_2', label: 'Capital Expenditure Tracking' },
      { id: 'mfg_fin_3', label: 'Plant-Level P&L Reporting' },
      { id: 'mfg_fin_4', label: 'AP Invoice Processing' },
      { id: 'mfg_fin_5', label: 'Inventory Valuation & Write-Offs' },
      { id: 'mfg_fin_6', label: 'Transfer Pricing & Intercompany' },
    ],
    hr: [
      { id: 'mfg_hr_1', label: 'Shift Worker Scheduling' },
      { id: 'mfg_hr_2', label: 'Safety Training & Certification Tracking' },
      { id: 'mfg_hr_3', label: 'Union Contract Compliance' },
      { id: 'mfg_hr_4', label: 'Manufacturing Talent Recruiting' },
      { id: 'mfg_hr_5', label: 'Time & Attendance Management' },
      { id: 'mfg_hr_6', label: 'Skills Gap Analysis' },
    ],
    procurement: [
      { id: 'mfg_proc_1', label: 'Raw Material Sourcing & Pricing' },
      { id: 'mfg_proc_2', label: 'Supplier Quality Management' },
      { id: 'mfg_proc_3', label: 'MRO (Maintenance/Repair/Operations) Purchasing' },
      { id: 'mfg_proc_4', label: 'Supplier Delivery Performance Tracking' },
      { id: 'mfg_proc_5', label: 'Purchase Order Automation' },
      { id: 'mfg_proc_6', label: 'Contract Compliance Monitoring' },
    ],
    supply_chain: [
      { id: 'mfg_sc_1', label: 'Production Demand Forecasting' },
      { id: 'mfg_sc_2', label: 'Bill-of-Materials (BOM) Management' },
      { id: 'mfg_sc_3', label: 'Warehouse & Inventory Optimization' },
      { id: 'mfg_sc_4', label: 'Logistics & Freight Management' },
      { id: 'mfg_sc_5', label: 'Supplier Risk & Disruption Monitoring' },
      { id: 'mfg_sc_6', label: 'Returns & Reverse Logistics' },
    ],
    it: [
      { id: 'mfg_it_1', label: 'OT/IT Network Security Monitoring' },
      { id: 'mfg_it_2', label: 'MES/SCADA System Administration' },
      { id: 'mfg_it_3', label: 'ERP System Support (SAP/Oracle)' },
      { id: 'mfg_it_4', label: 'IoT Device Management' },
      { id: 'mfg_it_5', label: 'IT Service Desk Ticket Triage' },
      { id: 'mfg_it_6', label: 'Data Backup & Recovery' },
    ],
    sales_marketing: [
      { id: 'mfg_sm_1', label: 'Distributor & Channel Analytics' },
      { id: 'mfg_sm_2', label: 'Quotation & Pricing Optimization' },
      { id: 'mfg_sm_3', label: 'Product Configurator Support' },
      { id: 'mfg_sm_4', label: 'Trade Show & Event ROI Tracking' },
      { id: 'mfg_sm_5', label: 'Customer Demand Sensing' },
      { id: 'mfg_sm_6', label: 'Technical Sales Proposal Generation' },
    ],
    rnd: [
      { id: 'mfg_rnd_1', label: 'CAD/CAM Design Assistance' },
      { id: 'mfg_rnd_2', label: 'Material Science Analysis' },
      { id: 'mfg_rnd_3', label: 'Failure Mode Analysis (FMEA)' },
      { id: 'mfg_rnd_4', label: 'Prototype Testing & Simulation' },
      { id: 'mfg_rnd_5', label: 'Patent & Prior Art Research' },
      { id: 'mfg_rnd_6', label: 'Design-for-Manufacturability Review' },
    ],
    customer_service: [
      { id: 'mfg_cs_1', label: 'Technical Support & Troubleshooting' },
      { id: 'mfg_cs_2', label: 'Warranty Claim Processing' },
      { id: 'mfg_cs_3', label: 'Spare Parts Order Management' },
      { id: 'mfg_cs_4', label: 'Field Service Scheduling' },
      { id: 'mfg_cs_5', label: 'Product Recall Notification' },
      { id: 'mfg_cs_6', label: 'Customer Feedback Analysis' },
    ],
    legal_compliance: [
      { id: 'mfg_lc_1', label: 'Environmental Compliance Reporting (EPA)' },
      { id: 'mfg_lc_2', label: 'OSHA Safety Compliance Tracking' },
      { id: 'mfg_lc_3', label: 'Export Control & Trade Compliance' },
      { id: 'mfg_lc_4', label: 'Product Liability Risk Assessment' },
      { id: 'mfg_lc_5', label: 'ISO Certification Audit Prep' },
      { id: 'mfg_lc_6', label: 'Supplier Contract Compliance' },
    ],
    operations: [
      { id: 'mfg_ops_1', label: 'Production Line Scheduling & Sequencing' },
      { id: 'mfg_ops_2', label: 'Quality Inspection & SPC Monitoring' },
      { id: 'mfg_ops_3', label: 'Predictive Maintenance (Equipment)' },
      { id: 'mfg_ops_4', label: 'Overall Equipment Effectiveness (OEE) Tracking' },
      { id: 'mfg_ops_5', label: 'Safety Incident Reporting & Investigation' },
      { id: 'mfg_ops_6', label: 'Energy Consumption Optimization' },
    ],
  },

  'Technology/Telecom': {
    finance: [
      { id: 'tech_fin_1', label: 'SaaS Revenue Recognition (ASC 606)' },
      { id: 'tech_fin_2', label: 'Subscription Billing & Invoicing' },
      { id: 'tech_fin_3', label: 'R&D Capitalization Tracking' },
      { id: 'tech_fin_4', label: 'FP&A & ARR/MRR Forecasting' },
      { id: 'tech_fin_5', label: 'Expense Report Processing' },
      { id: 'tech_fin_6', label: 'Financial Close & Consolidation' },
    ],
    hr: [
      { id: 'tech_hr_1', label: 'Engineering Talent Sourcing & Screening' },
      { id: 'tech_hr_2', label: 'Stock Option & RSU Administration' },
      { id: 'tech_hr_3', label: 'Remote Workforce Management' },
      { id: 'tech_hr_4', label: 'Performance & OKR Tracking' },
      { id: 'tech_hr_5', label: 'Learning & Development Platform' },
      { id: 'tech_hr_6', label: 'Employee Engagement Survey Analysis' },
    ],
    procurement: [
      { id: 'tech_proc_1', label: 'Cloud Infrastructure Cost Management' },
      { id: 'tech_proc_2', label: 'SaaS Vendor License Optimization' },
      { id: 'tech_proc_3', label: 'Hardware Procurement (Data Centers)' },
      { id: 'tech_proc_4', label: 'Contractor & SOW Management' },
      { id: 'tech_proc_5', label: 'Vendor Security Assessment' },
      { id: 'tech_proc_6', label: 'Spend Analytics & Budget Tracking' },
    ],
    supply_chain: [
      { id: 'tech_sc_1', label: 'Hardware Component Demand Planning' },
      { id: 'tech_sc_2', label: 'Network Equipment Inventory' },
      { id: 'tech_sc_3', label: 'Device Fulfillment & Shipping' },
      { id: 'tech_sc_4', label: 'Cloud Resource Capacity Planning' },
      { id: 'tech_sc_5', label: 'Spare Parts & RMA Management' },
      { id: 'tech_sc_6', label: 'Supply Chain Risk Monitoring' },
    ],
    it: [
      { id: 'tech_it_1', label: 'CI/CD Pipeline Management' },
      { id: 'tech_it_2', label: 'Production Incident Response (SRE)' },
      { id: 'tech_it_3', label: 'Cloud Infrastructure Orchestration' },
      { id: 'tech_it_4', label: 'Security Vulnerability Scanning' },
      { id: 'tech_it_5', label: 'Service Desk Automation' },
      { id: 'tech_it_6', label: 'Database Performance Optimization' },
    ],
    sales_marketing: [
      { id: 'tech_sm_1', label: 'Product-Led Growth Analytics' },
      { id: 'tech_sm_2', label: 'Lead Scoring & MQL Qualification' },
      { id: 'tech_sm_3', label: 'Content Marketing & SEO Optimization' },
      { id: 'tech_sm_4', label: 'Customer Usage & Churn Prediction' },
      { id: 'tech_sm_5', label: 'Sales Demo & POC Coordination' },
      { id: 'tech_sm_6', label: 'Partner & Channel Management' },
    ],
    rnd: [
      { id: 'tech_rnd_1', label: 'Code Review & Quality Analysis' },
      { id: 'tech_rnd_2', label: 'Automated Testing & QA' },
      { id: 'tech_rnd_3', label: 'Architecture Decision Documentation' },
      { id: 'tech_rnd_4', label: 'API Design & Documentation' },
      { id: 'tech_rnd_5', label: 'Performance Benchmarking' },
      { id: 'tech_rnd_6', label: 'User Research & Feedback Analysis' },
    ],
    customer_service: [
      { id: 'tech_cs_1', label: 'Tier 1 Technical Support' },
      { id: 'tech_cs_2', label: 'Bug Report Triage & Routing' },
      { id: 'tech_cs_3', label: 'Customer Onboarding & Setup' },
      { id: 'tech_cs_4', label: 'Usage & Billing Support' },
      { id: 'tech_cs_5', label: 'Knowledge Base & FAQ Maintenance' },
      { id: 'tech_cs_6', label: 'NPS & CSAT Survey Management' },
    ],
    legal_compliance: [
      { id: 'tech_lc_1', label: 'Data Privacy Compliance (GDPR/CCPA)' },
      { id: 'tech_lc_2', label: 'Open Source License Compliance' },
      { id: 'tech_lc_3', label: 'SOC 2 / ISO 27001 Audit Prep' },
      { id: 'tech_lc_4', label: 'Patent Filing & IP Management' },
      { id: 'tech_lc_5', label: 'Customer Contract Review (SaaS/MSA)' },
      { id: 'tech_lc_6', label: 'AI Ethics & Responsible AI Review' },
    ],
    operations: [
      { id: 'tech_ops_1', label: 'Network Operations Center (NOC) Monitoring' },
      { id: 'tech_ops_2', label: 'Site Reliability & Uptime Management' },
      { id: 'tech_ops_3', label: 'Data Center Operations' },
      { id: 'tech_ops_4', label: 'Deployment Rollback & Incident Triage' },
      { id: 'tech_ops_5', label: 'Capacity Forecasting & Scaling' },
      { id: 'tech_ops_6', label: 'Customer Data Migration Support' },
    ],
  },

  'Energy/Utilities': {
    finance: [
      { id: 'energy_fin_1', label: 'Utility Rate Case Financial Modeling' },
      { id: 'energy_fin_2', label: 'Capital Project Cost Tracking' },
      { id: 'energy_fin_3', label: 'Regulatory Rate Filing Preparation' },
      { id: 'energy_fin_4', label: 'Revenue Assurance & Billing Accuracy' },
      { id: 'energy_fin_5', label: 'AP Invoice Processing' },
      { id: 'energy_fin_6', label: 'Financial Close & Consolidation' },
    ],
    hr: [
      { id: 'energy_hr_1', label: 'Field Technician Recruiting & Credentialing' },
      { id: 'energy_hr_2', label: 'Safety Certification Tracking (OSHA/NERC)' },
      { id: 'energy_hr_3', label: 'Workforce Retirement Planning' },
      { id: 'energy_hr_4', label: 'Union Workforce Scheduling' },
      { id: 'energy_hr_5', label: 'Storm Response Crew Mobilization' },
      { id: 'energy_hr_6', label: 'Apprenticeship Program Management' },
    ],
    procurement: [
      { id: 'energy_proc_1', label: 'Utility Pole & Equipment Sourcing' },
      { id: 'energy_proc_2', label: 'Fuel & Commodity Purchasing' },
      { id: 'energy_proc_3', label: 'Grid Infrastructure Vendor Management' },
      { id: 'energy_proc_4', label: 'Renewable Energy PPA Procurement' },
      { id: 'energy_proc_5', label: 'Contractor Management & Compliance' },
      { id: 'energy_proc_6', label: 'Fleet Vehicle Procurement' },
    ],
    supply_chain: [
      { id: 'energy_sc_1', label: 'Grid Equipment Inventory Management' },
      { id: 'energy_sc_2', label: 'Transformer & Switchgear Forecasting' },
      { id: 'energy_sc_3', label: 'Spare Parts Warehouse Management' },
      { id: 'energy_sc_4', label: 'Emergency Material Stockpile Planning' },
      { id: 'energy_sc_5', label: 'Fuel Supply Logistics' },
      { id: 'energy_sc_6', label: 'Vegetation Management Scheduling' },
    ],
    it: [
      { id: 'energy_it_1', label: 'SCADA/OT System Cybersecurity' },
      { id: 'energy_it_2', label: 'Smart Meter Data Management' },
      { id: 'energy_it_3', label: 'GIS & Asset Management Systems' },
      { id: 'energy_it_4', label: 'IT/OT Convergence Security' },
      { id: 'energy_it_5', label: 'Customer Information System (CIS) Support' },
      { id: 'energy_it_6', label: 'NERC CIP Compliance Monitoring' },
    ],
    sales_marketing: [
      { id: 'energy_sm_1', label: 'Customer Usage Pattern Analysis' },
      { id: 'energy_sm_2', label: 'Energy Efficiency Program Marketing' },
      { id: 'energy_sm_3', label: 'Rate Plan Recommendation Engine' },
      { id: 'energy_sm_4', label: 'Renewable Energy Product Promotion' },
      { id: 'energy_sm_5', label: 'Commercial Account Management' },
      { id: 'energy_sm_6', label: 'Outage Communication Management' },
    ],
    rnd: [
      { id: 'energy_rnd_1', label: 'Grid Modernization Research' },
      { id: 'energy_rnd_2', label: 'Renewable Integration Modeling' },
      { id: 'energy_rnd_3', label: 'Battery Storage Optimization Research' },
      { id: 'energy_rnd_4', label: 'Demand Response Algorithm Development' },
      { id: 'energy_rnd_5', label: 'Environmental Impact Analysis' },
      { id: 'energy_rnd_6', label: 'Smart Grid Technology Evaluation' },
    ],
    customer_service: [
      { id: 'energy_cs_1', label: 'Billing Inquiry & Payment Support' },
      { id: 'energy_cs_2', label: 'Outage Reporting & Status Updates' },
      { id: 'energy_cs_3', label: 'Service Connection/Disconnection' },
      { id: 'energy_cs_4', label: 'Energy Efficiency Advisory' },
      { id: 'energy_cs_5', label: 'Net Metering & Solar Customer Support' },
      { id: 'energy_cs_6', label: 'Low-Income Assistance Program Support' },
    ],
    legal_compliance: [
      { id: 'energy_lc_1', label: 'FERC/PUC Regulatory Filing' },
      { id: 'energy_lc_2', label: 'NERC Reliability Compliance' },
      { id: 'energy_lc_3', label: 'Environmental Permit Management' },
      { id: 'energy_lc_4', label: 'Easement & Right-of-Way Management' },
      { id: 'energy_lc_5', label: 'Rate Case Legal Support' },
      { id: 'energy_lc_6', label: 'Safety Incident Investigation' },
    ],
    operations: [
      { id: 'energy_ops_1', label: 'Grid Load Balancing & Dispatch' },
      { id: 'energy_ops_2', label: 'Outage Detection & Restoration' },
      { id: 'energy_ops_3', label: 'Predictive Maintenance (Lines/Transformers)' },
      { id: 'energy_ops_4', label: 'Meter Reading & Data Validation' },
      { id: 'energy_ops_5', label: 'Vegetation Management Operations' },
      { id: 'energy_ops_6', label: 'Generation Plant Scheduling' },
    ],
  },

  'Retail/Consumer Goods': {
    finance: [
      { id: 'retail_fin_1', label: 'Store-Level P&L Reporting' },
      { id: 'retail_fin_2', label: 'Markdown & Promotion Impact Analysis' },
      { id: 'retail_fin_3', label: 'Accounts Payable Processing' },
      { id: 'retail_fin_4', label: 'Revenue Forecasting & Budgeting' },
      { id: 'retail_fin_5', label: 'Lease Accounting (ASC 842)' },
      { id: 'retail_fin_6', label: 'Shrinkage & Loss Reporting' },
    ],
    hr: [
      { id: 'retail_hr_1', label: 'Seasonal Hiring & Scheduling' },
      { id: 'retail_hr_2', label: 'Store Associate Onboarding' },
      { id: 'retail_hr_3', label: 'Time & Attendance Management' },
      { id: 'retail_hr_4', label: 'Employee Engagement & Retention' },
      { id: 'retail_hr_5', label: 'Multi-Location Compliance Training' },
      { id: 'retail_hr_6', label: 'Payroll Processing (Hourly Workers)' },
    ],
    procurement: [
      { id: 'retail_proc_1', label: 'Assortment & Vendor Selection' },
      { id: 'retail_proc_2', label: 'Private Label Product Sourcing' },
      { id: 'retail_proc_3', label: 'Purchase Order Management' },
      { id: 'retail_proc_4', label: 'Supplier Scorecard & Performance' },
      { id: 'retail_proc_5', label: 'Import/Trade Compliance' },
      { id: 'retail_proc_6', label: 'Promotional Buy Planning' },
    ],
    supply_chain: [
      { id: 'retail_sc_1', label: 'Demand Forecasting & Replenishment' },
      { id: 'retail_sc_2', label: 'Distribution Center Optimization' },
      { id: 'retail_sc_3', label: 'Last-Mile Delivery Management' },
      { id: 'retail_sc_4', label: 'Omnichannel Inventory Visibility' },
      { id: 'retail_sc_5', label: 'Returns Processing & Reverse Logistics' },
      { id: 'retail_sc_6', label: 'Seasonal Demand Planning' },
    ],
    it: [
      { id: 'retail_it_1', label: 'POS System Support & Monitoring' },
      { id: 'retail_it_2', label: 'E-Commerce Platform Management' },
      { id: 'retail_it_3', label: 'Payment Security (PCI-DSS)' },
      { id: 'retail_it_4', label: 'Store Network Connectivity' },
      { id: 'retail_it_5', label: 'Mobile App Performance Monitoring' },
      { id: 'retail_it_6', label: 'Customer Data Platform Management' },
    ],
    sales_marketing: [
      { id: 'retail_sm_1', label: 'Personalized Product Recommendations' },
      { id: 'retail_sm_2', label: 'Dynamic Pricing & Promotion' },
      { id: 'retail_sm_3', label: 'Customer Segmentation & Targeting' },
      { id: 'retail_sm_4', label: 'Social Media & Influencer Analytics' },
      { id: 'retail_sm_5', label: 'Loyalty Program Management' },
      { id: 'retail_sm_6', label: 'Store Layout & Planogram Optimization' },
    ],
    rnd: [
      { id: 'retail_rnd_1', label: 'New Product Concept Testing' },
      { id: 'retail_rnd_2', label: 'Consumer Trend Analysis' },
      { id: 'retail_rnd_3', label: 'Packaging Design & Testing' },
      { id: 'retail_rnd_4', label: 'Formulation & Recipe Optimization' },
      { id: 'retail_rnd_5', label: 'Shelf Life & Stability Testing' },
      { id: 'retail_rnd_6', label: 'Competitive Product Benchmarking' },
    ],
    customer_service: [
      { id: 'retail_cs_1', label: 'Order Status & Tracking Inquiries' },
      { id: 'retail_cs_2', label: 'Returns & Exchange Processing' },
      { id: 'retail_cs_3', label: 'Product Information & Recommendations' },
      { id: 'retail_cs_4', label: 'Loyalty Program Support' },
      { id: 'retail_cs_5', label: 'Store Feedback & Complaint Handling' },
      { id: 'retail_cs_6', label: 'Chat & Social Media Support' },
    ],
    legal_compliance: [
      { id: 'retail_lc_1', label: 'Consumer Protection Compliance' },
      { id: 'retail_lc_2', label: 'Product Labeling & Safety Regulations' },
      { id: 'retail_lc_3', label: 'Franchise Agreement Management' },
      { id: 'retail_lc_4', label: 'Data Privacy (CCPA/GDPR) Compliance' },
      { id: 'retail_lc_5', label: 'Food Safety & FDA Compliance' },
      { id: 'retail_lc_6', label: 'Advertising Claims Review' },
    ],
    operations: [
      { id: 'retail_ops_1', label: 'Store Operations & Task Management' },
      { id: 'retail_ops_2', label: 'Inventory Cycle Counting' },
      { id: 'retail_ops_3', label: 'Loss Prevention & Shrinkage' },
      { id: 'retail_ops_4', label: 'Store Opening/Closing Procedures' },
      { id: 'retail_ops_5', label: 'Visual Merchandising Compliance' },
      { id: 'retail_ops_6', label: 'Facility Maintenance Scheduling' },
    ],
  },

  'Healthcare/Public Sector': {
    finance: [
      { id: 'health_fin_1', label: 'Medical Billing & Claims Processing' },
      { id: 'health_fin_2', label: 'Revenue Cycle Management' },
      { id: 'health_fin_3', label: 'Grant & Fund Accounting' },
      { id: 'health_fin_4', label: 'Denials Management & Appeals' },
      { id: 'health_fin_5', label: 'Budget Allocation & Tracking' },
      { id: 'health_fin_6', label: 'Cost Report Preparation (CMS)' },
    ],
    hr: [
      { id: 'health_hr_1', label: 'Clinical Staff Credentialing' },
      { id: 'health_hr_2', label: 'Nurse Scheduling & Float Pool' },
      { id: 'health_hr_3', label: 'CME/CEU Compliance Tracking' },
      { id: 'health_hr_4', label: 'Background Check & License Verification' },
      { id: 'health_hr_5', label: 'Employee Wellness Programs' },
      { id: 'health_hr_6', label: 'Workforce Shortage Forecasting' },
    ],
    procurement: [
      { id: 'health_proc_1', label: 'Medical Device & Supply Sourcing' },
      { id: 'health_proc_2', label: 'Pharmaceutical Purchasing (340B)' },
      { id: 'health_proc_3', label: 'GPO Contract Management' },
      { id: 'health_proc_4', label: 'Capital Equipment Procurement' },
      { id: 'health_proc_5', label: 'PPE & Critical Supply Monitoring' },
      { id: 'health_proc_6', label: 'Vendor Credentialing & Compliance' },
    ],
    supply_chain: [
      { id: 'health_sc_1', label: 'Medical Supply Par-Level Management' },
      { id: 'health_sc_2', label: 'Pharmaceutical Cold Chain' },
      { id: 'health_sc_3', label: 'Implant & Consignment Tracking' },
      { id: 'health_sc_4', label: 'Emergency Preparedness Stockpiling' },
      { id: 'health_sc_5', label: 'Lab Supply Replenishment' },
      { id: 'health_sc_6', label: 'Waste & Biohazard Disposal Logistics' },
    ],
    it: [
      { id: 'health_it_1', label: 'EHR System Administration' },
      { id: 'health_it_2', label: 'HIPAA Security Monitoring' },
      { id: 'health_it_3', label: 'Telehealth Platform Management' },
      { id: 'health_it_4', label: 'Health Data Interoperability (HL7/FHIR)' },
      { id: 'health_it_5', label: 'Clinical Decision Support Maintenance' },
      { id: 'health_it_6', label: 'IT Service Desk (Clinical Users)' },
    ],
    sales_marketing: [
      { id: 'health_sm_1', label: 'Patient Acquisition & Outreach' },
      { id: 'health_sm_2', label: 'Community Health Education' },
      { id: 'health_sm_3', label: 'Physician Referral Network Management' },
      { id: 'health_sm_4', label: 'Public Health Campaign Analytics' },
      { id: 'health_sm_5', label: 'Service Line Marketing' },
      { id: 'health_sm_6', label: 'Patient Satisfaction Survey Analysis' },
    ],
    rnd: [
      { id: 'health_rnd_1', label: 'Clinical Research Protocol Management' },
      { id: 'health_rnd_2', label: 'IRB Submission & Compliance' },
      { id: 'health_rnd_3', label: 'Population Health Data Analysis' },
      { id: 'health_rnd_4', label: 'Outcomes Research & Quality Metrics' },
      { id: 'health_rnd_5', label: 'Grant Application Preparation' },
      { id: 'health_rnd_6', label: 'Medical Literature Review' },
    ],
    customer_service: [
      { id: 'health_cs_1', label: 'Patient Appointment Scheduling' },
      { id: 'health_cs_2', label: 'Insurance Verification & Pre-Auth' },
      { id: 'health_cs_3', label: 'Patient Portal Support' },
      { id: 'health_cs_4', label: 'Prescription Refill Coordination' },
      { id: 'health_cs_5', label: 'Billing & Payment Plan Support' },
      { id: 'health_cs_6', label: 'Post-Discharge Follow-Up' },
    ],
    legal_compliance: [
      { id: 'health_lc_1', label: 'HIPAA Privacy & Breach Reporting' },
      { id: 'health_lc_2', label: 'Joint Commission (JCAHO) Audit Prep' },
      { id: 'health_lc_3', label: 'Stark Law & Anti-Kickback Compliance' },
      { id: 'health_lc_4', label: 'Medicare/Medicaid Billing Compliance' },
      { id: 'health_lc_5', label: 'Informed Consent Documentation' },
      { id: 'health_lc_6', label: 'Public Records & FOIA Response' },
    ],
    operations: [
      { id: 'health_ops_1', label: 'Patient Flow & Bed Management' },
      { id: 'health_ops_2', label: 'Operating Room Scheduling' },
      { id: 'health_ops_3', label: 'Lab Test Processing & Results' },
      { id: 'health_ops_4', label: 'Medication Administration & Reconciliation' },
      { id: 'health_ops_5', label: 'Facility Cleaning & Infection Control' },
      { id: 'health_ops_6', label: 'Medical Equipment Maintenance' },
    ],
  },

  'Professional Services': {
    finance: [
      { id: 'profsvc_fin_1', label: 'Project Billing & Time-to-Invoice' },
      { id: 'profsvc_fin_2', label: 'Utilization Rate Tracking' },
      { id: 'profsvc_fin_3', label: 'Project Margin Analysis' },
      { id: 'profsvc_fin_4', label: 'Expense Report Processing' },
      { id: 'profsvc_fin_5', label: 'Client Accounts Receivable' },
      { id: 'profsvc_fin_6', label: 'Partner Distribution Calculations' },
    ],
    hr: [
      { id: 'profsvc_hr_1', label: 'Campus & Lateral Recruiting' },
      { id: 'profsvc_hr_2', label: 'Staff Allocation & Resource Matching' },
      { id: 'profsvc_hr_3', label: 'Professional Development Tracking' },
      { id: 'profsvc_hr_4', label: 'Promotion & Career Path Management' },
      { id: 'profsvc_hr_5', label: 'Alumni Network Management' },
      { id: 'profsvc_hr_6', label: 'Employee Engagement & Retention' },
    ],
    procurement: [
      { id: 'profsvc_proc_1', label: 'Subcontractor & Expert Sourcing' },
      { id: 'profsvc_proc_2', label: 'Software & Tool Licensing' },
      { id: 'profsvc_proc_3', label: 'Office Space & Facility Management' },
      { id: 'profsvc_proc_4', label: 'Travel & Event Procurement' },
      { id: 'profsvc_proc_5', label: 'Research Database Subscriptions' },
      { id: 'profsvc_proc_6', label: 'Vendor Performance Management' },
    ],
    supply_chain: [
      { id: 'profsvc_sc_1', label: 'Knowledge Asset Management' },
      { id: 'profsvc_sc_2', label: 'Proposal Template & Content Library' },
      { id: 'profsvc_sc_3', label: 'Client Deliverable Version Control' },
      { id: 'profsvc_sc_4', label: 'Training Material Distribution' },
      { id: 'profsvc_sc_5', label: 'Office Supply & Equipment' },
      { id: 'profsvc_sc_6', label: 'IT Equipment Provisioning' },
    ],
    it: [
      { id: 'profsvc_it_1', label: 'Collaboration Platform Management' },
      { id: 'profsvc_it_2', label: 'Client Data Security & Access' },
      { id: 'profsvc_it_3', label: 'VPN & Remote Access Support' },
      { id: 'profsvc_it_4', label: 'IT Service Desk' },
      { id: 'profsvc_it_5', label: 'Document Management Systems' },
      { id: 'profsvc_it_6', label: 'Data Analytics Platform Support' },
    ],
    sales_marketing: [
      { id: 'profsvc_sm_1', label: 'Proposal & RFP Response Drafting' },
      { id: 'profsvc_sm_2', label: 'Client Relationship Management (CRM)' },
      { id: 'profsvc_sm_3', label: 'Thought Leadership Content Creation' },
      { id: 'profsvc_sm_4', label: 'Win/Loss Analysis' },
      { id: 'profsvc_sm_5', label: 'Conference & Event Strategy' },
      { id: 'profsvc_sm_6', label: 'Cross-Selling Opportunity Identification' },
    ],
    rnd: [
      { id: 'profsvc_rnd_1', label: 'Industry Benchmarking & Research' },
      { id: 'profsvc_rnd_2', label: 'Methodology & Framework Development' },
      { id: 'profsvc_rnd_3', label: 'Client Data Analysis & Insights' },
      { id: 'profsvc_rnd_4', label: 'Market & Competitive Intelligence' },
      { id: 'profsvc_rnd_5', label: 'Innovation Lab & Proof of Concept' },
      { id: 'profsvc_rnd_6', label: 'Survey Design & Analysis' },
    ],
    customer_service: [
      { id: 'profsvc_cs_1', label: 'Client Engagement Satisfaction Tracking' },
      { id: 'profsvc_cs_2', label: 'Project Status Communication' },
      { id: 'profsvc_cs_3', label: 'Deliverable Feedback Collection' },
      { id: 'profsvc_cs_4', label: 'Invoice Dispute Resolution' },
      { id: 'profsvc_cs_5', label: 'Post-Engagement Follow-Up' },
      { id: 'profsvc_cs_6', label: 'Reference & Testimonial Coordination' },
    ],
    legal_compliance: [
      { id: 'profsvc_lc_1', label: 'Engagement Letter & Contract Review' },
      { id: 'profsvc_lc_2', label: 'Conflict of Interest Screening' },
      { id: 'profsvc_lc_3', label: 'Professional Liability Risk Assessment' },
      { id: 'profsvc_lc_4', label: 'Independence & Ethics Compliance' },
      { id: 'profsvc_lc_5', label: 'Client Confidentiality Management' },
      { id: 'profsvc_lc_6', label: 'Regulatory Body Compliance (Bar/CPA)' },
    ],
    operations: [
      { id: 'profsvc_ops_1', label: 'Project Staffing & Scheduling' },
      { id: 'profsvc_ops_2', label: 'Timesheet & Billing Review' },
      { id: 'profsvc_ops_3', label: 'Quality Assurance & Peer Review' },
      { id: 'profsvc_ops_4', label: 'Knowledge Management & Capture' },
      { id: 'profsvc_ops_5', label: 'Office & Facility Operations' },
      { id: 'profsvc_ops_6', label: 'Resource Utilization Optimization' },
    ],
  },

  'Other': DEFAULT_TASKS,
};

export function getTasksForDepartment(industry, departmentId) {
  const industryTasks = DEPARTMENT_TASKS[industry] || DEPARTMENT_TASKS['Other'];
  return industryTasks[departmentId] || DEFAULT_TASKS[departmentId] || [];
}

// ─── Task Risk Tiers ────────────────────────────────────────────────────────
// Every task is classified as routine, judgment, or critical.
// This determines how aggressively automation choices shift the meters.

const CRITICAL_KEYWORDS = [
  'compliance', 'regulatory', 'audit', 'safety', 'adverse event', 'pharmacovigilance',
  'kyc', 'aml', 'hipaa', 'fda', 'gxp', 'fraud', 'sanctions', 'sox', 'breach',
  'informed consent', 'controlled substance', 'deviation', 'capa', 'complaint',
  'recall', 'nerc', 'osha', 'ferc', 'pci', 'gdpr', 'ccpa', 'anti-kickback',
  'stark law', 'defect detection', 'quality inspection', 'quality control',
  'incident reporting', 'incident investigation', 'data integrity',
  'environmental compliance', 'product liability', 'consumer protection',
  'food safety', 'patient safety', 'infection control', 'medication',
  'spc monitoring', 'cybersecurity', 'threat detection', 'vulnerability',
];

const JUDGMENT_KEYWORDS = [
  'forecasting', 'planning', 'strategy', 'evaluation', 'analysis', 'scoring',
  'assessment', 'recruiting', 'screening', 'design', 'pricing', 'optimization',
  'selection', 'review', 'decision', 'calibration', 'recommendation',
  'segmentation', 'prediction', 'research', 'synthesis', 'protocol',
  'architecture', 'benchmarking', 'negotiation', 'resolution', 'investigation',
  'engagement', 'retention', 'talent', 'resource matching',
];

export function getTaskTier(label) {
  const lower = label.toLowerCase();
  if (CRITICAL_KEYWORDS.some(k => lower.includes(k))) return 'critical';
  if (JUDGMENT_KEYWORDS.some(k => lower.includes(k))) return 'judgment';
  return 'routine';
}

// ─── Scoring System ─────────────────────────────────────────────────────────

export const BASE_SCORES = {
  full_ai:    { cost: 70,  risk: -50, speed: 90,  morale: -60, quality: 30  },
  ai_led:     { cost: 40,  risk: -15, speed: 65,  morale: -20, quality: 55  },
  human_led:  { cost: 10,  risk: 20,  speed: 25,  morale: 30,  quality: 45  },
  full_human: { cost: 0,   risk: 10,  speed: 0,   morale: 40,  quality: 20  },
};

// Tier modifiers are ADDED to base scores. Critical tasks hit risk hard when automated.
const TIER_MODIFIERS = {
  critical: {
    full_ai:    { cost: 0,  risk: -40, speed: 0,  morale: -10, quality: -15 },
    ai_led:     { cost: 0,  risk: -15, speed: 0,  morale: -5,  quality: -5  },
    human_led:  { cost: 0,  risk: 5,   speed: 0,  morale: 5,   quality: 5   },
    full_human: { cost: 0,  risk: 5,   speed: 0,  morale: 0,   quality: 0   },
  },
  judgment: {
    full_ai:    { cost: 0,  risk: -15, speed: 0,  morale: -5,  quality: -25 },
    ai_led:     { cost: 0,  risk: 0,   speed: 0,  morale: 0,   quality: 5   },
    human_led:  { cost: 0,  risk: 0,   speed: 0,  morale: 5,   quality: 10  },
    full_human: { cost: 0,  risk: 0,   speed: 0,  morale: 0,   quality: 0   },
  },
  routine: {
    full_ai:    { cost: 0,  risk: 0,   speed: 0,  morale: 0,   quality: 0   },
    ai_led:     { cost: 0,  risk: 0,   speed: 0,  morale: 0,   quality: 0   },
    human_led:  { cost: 0,  risk: 0,   speed: 0,  morale: 0,   quality: 0   },
    full_human: { cost: 0,  risk: 0,   speed: 0,  morale: 0,   quality: 0   },
  },
};

export const INDUSTRY_WEIGHTS = {
  'Pharma/Biotech/Life Sciences':   { cost: 0.8, risk: 1.4, speed: 0.7, morale: 0.9, quality: 1.5 },
  'Financial Services':             { cost: 1.0, risk: 1.6, speed: 1.0, morale: 0.8, quality: 1.1 },
  'Manufacturing/Industrial':       { cost: 1.1, risk: 1.3, speed: 1.2, morale: 1.0, quality: 1.0 },
  'Technology/Telecom':             { cost: 1.0, risk: 0.8, speed: 1.4, morale: 1.1, quality: 1.0 },
  'Energy/Utilities':               { cost: 1.0, risk: 1.5, speed: 0.9, morale: 0.9, quality: 1.2 },
  'Retail/Consumer Goods':          { cost: 1.3, risk: 0.8, speed: 1.3, morale: 1.0, quality: 1.1 },
  'Healthcare/Public Sector':       { cost: 0.8, risk: 1.5, speed: 0.8, morale: 1.0, quality: 1.4 },
  'Professional Services':          { cost: 1.1, risk: 1.0, speed: 1.0, morale: 1.2, quality: 1.2 },
  'Other':                          { cost: 1.0, risk: 1.0, speed: 1.0, morale: 1.0, quality: 1.0 },
};

const DIMENSIONS = ['cost', 'risk', 'speed', 'morale', 'quality'];

// calculateMeters now accounts for task tiers — needs taskLabels to classify
export function calculateMeters(assignments, industry, taskLabels) {
  const weights = INDUSTRY_WEIGHTS[industry] || INDUSTRY_WEIGHTS['Other'];
  const taskIds = Object.keys(assignments);

  if (taskIds.length === 0) {
    return { cost: 50, risk: 50, speed: 50, morale: 50, quality: 50 };
  }

  const rawTotals = { cost: 0, risk: 0, speed: 0, morale: 0, quality: 0 };

  for (const taskId of taskIds) {
    const level = assignments[taskId];
    if (!level || !BASE_SCORES[level]) continue;
    const base = BASE_SCORES[level];
    const label = (taskLabels && taskLabels[taskId]) || '';
    const tier = getTaskTier(label);
    const tierMod = TIER_MODIFIERS[tier]?.[level] || {};

    for (const dim of DIMENSIONS) {
      rawTotals[dim] += (base[dim] + (tierMod[dim] || 0));
    }
  }

  const result = {};
  for (const dim of DIMENSIONS) {
    const avg = rawTotals[dim] / taskIds.length;
    const weighted = avg * weights[dim];
    result[dim] = Math.max(0, Math.min(100, Math.round((weighted + 100) / 2)));
  }

  return result;
}

// ─── Industry-Specific Meter Descriptions ───────────────────────────────────

const INDUSTRY_METER_DESC = {
  'Pharma/Biotech/Life Sciences': {
    cost: 'R&D burn rate, CRO costs, licensing overhead',
    risk: 'GxP compliance, 21 CFR Part 11, patient safety',
    speed: 'Trial timelines, regulatory submission velocity',
    morale: 'Scientific workforce autonomy, lab vs desk roles',
    quality: 'Data integrity, analytical accuracy, audit-readiness',
  },
  'Financial Services': {
    cost: 'Headcount savings vs model risk infrastructure',
    risk: 'Regulatory exposure (SOX, Basel, KYC/AML, SR 11-7)',
    speed: 'Transaction throughput, settlement velocity',
    morale: 'Front-office vs back-office displacement anxiety',
    quality: 'Decision accuracy, false positive rates, audit trail',
  },
  'Manufacturing/Industrial': {
    cost: 'Labor savings vs OT/IT integration costs',
    risk: 'OSHA safety, environmental compliance, product liability',
    speed: 'Production throughput, cycle time reduction',
    morale: 'Shop floor workforce, union considerations, reskilling',
    quality: 'Defect rates, SPC accuracy, first-pass yield',
  },
  'Technology/Telecom': {
    cost: 'Engineering efficiency vs tooling sprawl',
    risk: 'Data privacy (GDPR/CCPA), security posture, IP exposure',
    speed: 'Release velocity, incident response time',
    morale: 'Developer autonomy, "AI replacing engineers" narrative',
    quality: 'Code quality, system reliability, customer experience',
  },
  'Energy/Utilities': {
    cost: 'Grid maintenance savings vs SCADA security investment',
    risk: 'NERC CIP compliance, public safety, grid reliability',
    speed: 'Outage response, meter-to-cash cycle time',
    morale: 'Field workforce, aging workforce transition, unions',
    quality: 'Grid reliability metrics, billing accuracy, safety records',
  },
  'Retail/Consumer Goods': {
    cost: 'Store labor optimization vs tech implementation costs',
    risk: 'Consumer data privacy, product safety, brand reputation',
    speed: 'Fulfillment speed, promotional agility, time-to-shelf',
    morale: 'Store associates, seasonal workforce, corporate restructuring',
    quality: 'Customer experience scores, order accuracy, personalization',
  },
  'Healthcare/Public Sector': {
    cost: 'Revenue cycle efficiency vs EHR integration costs',
    risk: 'HIPAA compliance, patient safety, clinical liability',
    speed: 'Patient throughput, claims processing, lab turnaround',
    morale: 'Clinical staff burnout, care team autonomy, public trust',
    quality: 'Clinical outcomes, diagnostic accuracy, patient satisfaction',
  },
  'Professional Services': {
    cost: 'Utilization gains vs knowledge management overhead',
    risk: 'Client confidentiality, professional liability, independence',
    speed: 'Engagement delivery speed, proposal turnaround',
    morale: 'Associate/analyst displacement, partner buy-in, career paths',
    quality: 'Deliverable quality, analytical rigor, client satisfaction',
  },
  'Other': {
    cost: 'Savings vs AI licensing and integration costs',
    risk: 'Compliance, errors, accountability gaps',
    speed: 'Processing speed and throughput gains',
    morale: 'Workforce sentiment and adoption readiness',
    quality: 'Output accuracy and consistency',
  },
};

export function getMeterDescription(industry, meterKey) {
  const descs = INDUSTRY_METER_DESC[industry] || INDUSTRY_METER_DESC['Other'];
  return descs[meterKey] || '';
}

// ─── Priority-to-Meter Mapping ───────────────────────────────────────────────

export const PRIORITY_TO_METER = {
  cost_efficiency: 'cost',
  speed_throughput: 'speed',
  employee_satisfaction: 'morale',
  risk_compliance: 'risk',
  quality_accuracy: 'quality',
  customer_experience: null,
};

// ─── Meter Interpretation ───────────────────────────────────────────────────

export function getMeterInterpretation(key, value, industry, priorities) {
  const industryContext = {
    'Financial Services': { riskWord: 'regulatory', qualityWord: 'decision' },
    'Pharma/Biotech/Life Sciences': { riskWord: 'compliance', qualityWord: 'data integrity' },
    'Manufacturing/Industrial': { riskWord: 'safety', qualityWord: 'defect' },
    'Healthcare/Public Sector': { riskWord: 'patient safety', qualityWord: 'clinical' },
    'Energy/Utilities': { riskWord: 'grid reliability', qualityWord: 'operational' },
    'Retail/Consumer Goods': { riskWord: 'brand', qualityWord: 'customer experience' },
    'Technology/Telecom': { riskWord: 'security', qualityWord: 'system reliability' },
    'Professional Services': { riskWord: 'liability', qualityWord: 'deliverable' },
  };
  const ctx = industryContext[industry] || { riskWord: 'operational', qualityWord: 'output' };

  let baseInterp = '';
  if (key === 'cost') {
    if (value >= 70) baseInterp = 'Aggressive savings — verify you have the AI infrastructure to deliver.';
    else if (value >= 55) baseInterp = 'Strong cost case. Achievable if implementation is phased.';
    else if (value >= 40) baseInterp = 'Moderate savings. Human-heavy choices limit cost upside.';
    else baseInterp = 'Minimal cost impact. Consider whether the investment justifies the return.';
  } else if (key === 'risk') {
    if (value >= 70) baseInterp = `Low ${ctx.riskWord} exposure. Conservative choices are protecting you.`;
    else if (value >= 50) baseInterp = `Moderate ${ctx.riskWord} risk. Some automation choices need oversight plans.`;
    else if (value >= 35) baseInterp = `Elevated ${ctx.riskWord} exposure. Critical tasks may lack human safeguards.`;
    else baseInterp = `High ${ctx.riskWord} risk. Automated critical functions create accountability gaps.`;
  } else if (key === 'speed') {
    if (value >= 70) baseInterp = 'Major throughput gain. Ensure downstream processes can absorb the volume.';
    else if (value >= 50) baseInterp = 'Good velocity improvement across automated functions.';
    else if (value >= 35) baseInterp = 'Moderate speed gains. Human-led processes are the bottleneck.';
    else baseInterp = 'Minimal speed improvement. Heavy human involvement limits throughput.';
  } else if (key === 'morale') {
    if (value >= 65) baseInterp = 'Workforce feels empowered, not replaced. Strong adoption signal.';
    else if (value >= 50) baseInterp = 'Mixed sentiment. Some roles feel supported, others threatened.';
    else if (value >= 35) baseInterp = 'Displacement anxiety rising. Change management is critical.';
    else baseInterp = 'Workforce resistance likely. Aggressive automation without a people strategy.';
  } else if (key === 'quality') {
    if (value >= 70) baseInterp = `Strong ${ctx.qualityWord} quality. AI augmentation is well-calibrated.`;
    else if (value >= 50) baseInterp = `Good ${ctx.qualityWord} quality, but judgment-heavy tasks need monitoring.`;
    else if (value >= 35) baseInterp = `${ctx.qualityWord} quality concerns. Full AI on judgment tasks is risky.`;
    else baseInterp = `${ctx.qualityWord} quality at risk. Human expertise is being removed too aggressively.`;
  }

  // Priority-aware amplification
  if (priorities && Array.isArray(priorities) && priorities.length > 0) {
    const meterToPriority = { cost: 'cost_efficiency', speed: 'speed_throughput', morale: 'employee_satisfaction', risk: 'risk_compliance', quality: 'quality_accuracy' };
    const priorityId = meterToPriority[key];
    if (priorityId) {
      const match = priorities.find(p => p.id === priorityId);
      if (match && match.rank <= 2) {
        if (value < 34) {
          baseInterp = `You ranked ${match.label} #${match.rank} — this score is critical. ` + baseInterp;
        } else if (value < 50) {
          baseInterp = `A stated top priority (#${match.rank}) — needs attention. ` + baseInterp;
        }
      }
    }
  }

  return baseInterp;
}

// ─── Consequence Callouts ───────────────────────────────────────────────────
// Returns a warning string when a user makes a high-stakes automation choice.
// null = no warning (safe choice).

const INDUSTRY_RISK_CONTEXT = {
  'Pharma/Biotech/Life Sciences': {
    regulator: 'FDA/EMA',
    framework: 'GxP and 21 CFR Part 11',
    criticalStake: 'patient safety and data integrity',
    judgmentStake: 'scientific rigor and regulatory defensibility',
  },
  'Financial Services': {
    regulator: 'OCC, Fed, CFPB, and SEC',
    framework: 'SOX, Basel III, and SR 11-7',
    criticalStake: 'regulatory compliance and fiduciary duty',
    judgmentStake: 'model risk and decision accountability',
  },
  'Manufacturing/Industrial': {
    regulator: 'OSHA and EPA',
    framework: 'ISO 9001 and ISA-95',
    criticalStake: 'worker safety and product liability',
    judgmentStake: 'production quality and engineering judgment',
  },
  'Technology/Telecom': {
    regulator: 'FTC, EU regulators',
    framework: 'GDPR, CCPA, and SOC 2',
    criticalStake: 'data privacy and security posture',
    judgmentStake: 'architectural decisions and system reliability',
  },
  'Energy/Utilities': {
    regulator: 'FERC, NERC, and state PUCs',
    framework: 'NERC CIP and OSHA',
    criticalStake: 'grid reliability and public safety',
    judgmentStake: 'load management and infrastructure decisions',
  },
  'Retail/Consumer Goods': {
    regulator: 'FTC, FDA (food), and state AGs',
    framework: 'PCI-DSS and consumer protection laws',
    criticalStake: 'customer data and product safety',
    judgmentStake: 'brand perception and customer experience',
  },
  'Healthcare/Public Sector': {
    regulator: 'HHS/OCR, CMS, and Joint Commission',
    framework: 'HIPAA, Stark Law, and Anti-Kickback',
    criticalStake: 'patient safety and protected health information',
    judgmentStake: 'clinical outcomes and care quality',
  },
  'Professional Services': {
    regulator: 'professional licensing boards',
    framework: 'professional ethics and liability standards',
    criticalStake: 'client confidentiality and professional liability',
    judgmentStake: 'analytical quality and advisory credibility',
  },
  'Other': {
    regulator: 'relevant regulators',
    framework: 'applicable compliance frameworks',
    criticalStake: 'compliance and accountability',
    judgmentStake: 'decision quality and oversight',
  },
};

export function getConsequenceCallout(label, level, industry) {
  const tier = getTaskTier(label);
  if (tier === 'routine') return null;

  const ctx = INDUSTRY_RISK_CONTEXT[industry] || INDUSTRY_RISK_CONTEXT['Other'];
  const taskName = label;

  if (tier === 'critical') {
    if (level === 'full_ai') {
      return {
        severity: 'danger',
        text: `Full automation of "${taskName}" creates significant ${ctx.criticalStake} risk. ${ctx.regulator} guidance requires human accountability for these decisions. ${ctx.framework} compliance may be compromised.`,
      };
    }
    if (level === 'ai_led') {
      return {
        severity: 'warning',
        text: `AI-led "${taskName}" with human oversight is viable but requires robust escalation protocols. Ensure ${ctx.framework} audit trails capture the human review step.`,
      };
    }
  }

  if (tier === 'judgment') {
    if (level === 'full_ai') {
      return {
        severity: 'warning',
        text: `"${taskName}" involves nuanced judgment that AI often handles inconsistently. Full automation risks ${ctx.judgmentStake} issues. Consider AI-Led with human oversight instead.`,
      };
    }
  }

  return null;
}

// ─── Posture Analysis ───────────────────────────────────────────────────────

const INDUSTRY_AVG_POSTURE = {
  'Pharma/Biotech/Life Sciences':   { full_ai: 5,  ai_led: 20, human_led: 45, full_human: 30 },
  'Financial Services':             { full_ai: 8,  ai_led: 25, human_led: 40, full_human: 27 },
  'Manufacturing/Industrial':       { full_ai: 12, ai_led: 28, human_led: 35, full_human: 25 },
  'Technology/Telecom':             { full_ai: 18, ai_led: 35, human_led: 30, full_human: 17 },
  'Energy/Utilities':               { full_ai: 6,  ai_led: 20, human_led: 40, full_human: 34 },
  'Retail/Consumer Goods':          { full_ai: 15, ai_led: 30, human_led: 35, full_human: 20 },
  'Healthcare/Public Sector':       { full_ai: 4,  ai_led: 18, human_led: 42, full_human: 36 },
  'Professional Services':          { full_ai: 8,  ai_led: 22, human_led: 42, full_human: 28 },
  'Other':                          { full_ai: 10, ai_led: 25, human_led: 38, full_human: 27 },
};

export function getPostureAnalysis(assignments, industry) {
  const taskIds = Object.keys(assignments);
  if (taskIds.length === 0) return null;

  const counts = { full_ai: 0, ai_led: 0, human_led: 0, full_human: 0 };
  for (const level of Object.values(assignments)) {
    if (counts[level] !== undefined) counts[level]++;
  }
  const total = taskIds.length;
  const pct = {
    full_ai: Math.round((counts.full_ai / total) * 100),
    ai_led: Math.round((counts.ai_led / total) * 100),
    human_led: Math.round((counts.human_led / total) * 100),
    full_human: Math.round((counts.full_human / total) * 100),
  };

  const benchmark = INDUSTRY_AVG_POSTURE[industry] || INDUSTRY_AVG_POSTURE['Other'];
  const aiHeavy = pct.full_ai + pct.ai_led;
  const benchmarkAiHeavy = benchmark.full_ai + benchmark.ai_led;

  let interpretation = '';
  if (aiHeavy > benchmarkAiHeavy + 20) {
    interpretation = `Significantly more aggressive than the ${industry} average (${benchmarkAiHeavy}% AI-heavy vs your ${aiHeavy}%). This will demand strong governance and change management.`;
  } else if (aiHeavy > benchmarkAiHeavy + 8) {
    interpretation = `More automated than typical ${industry} organizations (${benchmarkAiHeavy}% AI-heavy vs your ${aiHeavy}%). Manageable with proper oversight.`;
  } else if (aiHeavy < benchmarkAiHeavy - 8) {
    interpretation = `More conservative than ${industry} peers (${benchmarkAiHeavy}% AI-heavy vs your ${aiHeavy}%). You may be leaving efficiency gains on the table.`;
  } else {
    interpretation = `In line with ${industry} norms (${benchmarkAiHeavy}% AI-heavy vs your ${aiHeavy}%). A balanced starting point.`;
  }

  return { counts, pct, benchmark, interpretation };
}
