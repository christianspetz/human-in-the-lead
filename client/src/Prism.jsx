import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Area, AreaChart, CartesianGrid } from "recharts";

const GOLD="#D4A853",GREEN="#7CB9A8",PURPLE="#C4A1D4",BLUE="#7BA7CC",RED="#D48A8A",ORANGE="#D4A07A",TEAL="#6BB8A8",PINK="#D48AB4";
const FONT="'DM Sans',sans-serif",SERIF="'Playfair Display',serif";
const TH={
  dark:{bg:"#111110",card:"#1A1A18",bdr:"#2A2A25",tx:"#EEEAE4",tx2:"#B8B0A4",mut:"#888",sub:"#555"},
  light:{bg:"#F5F0E8",card:"#FFFFFF",bdr:"#D8D2C6",tx:"#1A1A18",tx2:"#555548",mut:"#888880",sub:"#BBB5A8"},
};
const DEF_BL={company:"The Coca-Cola Company",ticker:"KO",src:"2023 10-K",revenue:45800,cogs:18500,sga:12700,da:1800,ebitda:13100,interest:1500,taxRate:.195,ni:10714,shares:4.328,eps:2.47,inventory:2000,recv:3500,pay:4200,cash:9400,evMult:22};
const IMP={automate:{l:"Automate",c:BLUE,d:"AI/ML replaces manual execution. Reduces cycle time 60-80%, eliminates human error, enables 24/7 operation."},optimize:{l:"Optimize",c:GREEN,d:"AI augments human decisions with data. Improves accuracy 20-40%, surfaces insights humans miss."},redesign:{l:"Redesign",c:GOLD,d:"Process is fundamentally restructured. New workflow, new roles, new KPIs. Highest change management effort."}};
const ITYPES={quick:{l:"Quick Win",c:GREEN},structural:{l:"Structural",c:GOLD},foundation:{l:"Foundation",c:PURPLE}};
const CATS=[{id:"commercial",label:"Commercial",icon:"◈",color:GOLD},{id:"supplychain",label:"Supply Chain",icon:"◉",color:GREEN},{id:"finance",label:"Finance",icon:"◆",color:BLUE},{id:"hr",label:"HR & Talent",icon:"▲",color:PINK},{id:"it",label:"IT & Enterprise",icon:"●",color:PURPLE},{id:"customer",label:"Customer",icon:"◇",color:TEAL}];

// Process tree + lookup
const PLOOK={};
const PHOW={};
const PT=[
  {id:"l1-com",label:"Commercial",icon:"◈",color:GOLD,areas:[
    {l2:"Revenue Growth",l3:"Pricing",procs:[{id:"p-elast",label:"Price elasticity modeling",how:"ML models ingest POS + competitor + macro data to predict volume response to price changes at SKU/channel level. Replaces quarterly spreadsheet refresh with continuous recalibration."},{id:"p-pack",label:"Pack size optimization",how:"Conjoint analysis + ML identifies optimal pack formats by channel and occasion. Simulates margin impact before launch."},{id:"p-compmon",label:"Competitive monitoring",how:"NLP scrapes pricing databases, retailer sites, and syndicated data. Alerts on competitive moves within hours, not weeks."}]},
    {l2:"Revenue Growth",l3:"Trade Promo",procs:[{id:"p-promplan",label:"Promotion planning",how:"Predictive models score promotion concepts on expected lift, margin, and cannibalization before committing spend."},{id:"p-promroi",label:"Promo ROI measurement",how:"Automated post-event analytics isolate baseline vs. incremental. Dashboards surface ROI by event type, retailer, brand within days."},{id:"p-tradespend",label:"Trade spend allocation",how:"Optimization engine allocates budget across retailers/events to maximize total portfolio margin. Replaces gut-based negotiation."}]},
    {l2:"Revenue Growth",l3:"Channel",procs:[{id:"p-keyacct",label:"Key account planning",how:"AI assembles retailer-specific growth plans from shopper data, competitive share, and whitespace analysis."},{id:"p-chanmix",label:"Channel mix optimization",how:"Attribution models quantify margin contribution by channel. Simulation shows impact of shifting volume between channels."}]},
    {l2:"Brand & Portfolio",l3:"Brand",procs:[{id:"p-brandh",label:"Brand health tracking",how:"Real-time sentiment analysis + social listening replaces quarterly brand trackers. Dashboards update weekly."},{id:"p-consins",label:"Consumer insights",how:"ML segments consumers from 1P + 3P data. Surfaces unmet needs and occasion gaps at scale."},{id:"p-npd",label:"New product development",how:"Concept scoring models predict in-market success. Reduces NPD failure rate from ~80% to ~55%."}]},
    {l2:"Brand & Portfolio",l3:"Portfolio",procs:[{id:"p-skurat",label:"SKU rationalization",how:"Multi-criteria scoring (margin, velocity, substitutability, strategic role) flags tail SKUs. Simulates P&L impact of delisting."},{id:"p-catdec",label:"Category decisions",how:"Market attractiveness models score category entry/exit decisions on growth, margin, and capability fit."}]},
  ]},
  {id:"l1-sc",label:"Supply Chain",icon:"◉",color:GREEN,areas:[
    {l2:"Plan",l3:"Demand",procs:[{id:"p-statfcst",label:"Statistical forecasting",how:"Ensemble ML models (gradient boost + neural nets) replace exponential smoothing. Incorporates 50+ external signals."},{id:"p-promlift",label:"Promo lift estimation",how:"Causal models isolate promotional lift by mechanic, depth, timing. Auto-adjusts baseline for future events."},{id:"p-consens",label:"Consensus S&OP",how:"AI generates draft consensus plan from statistical + commercial inputs. Humans review exceptions only — meeting time drops 60%."}]},
    {l2:"Plan",l3:"Supply",procs:[{id:"p-mps",label:"Master scheduling",how:"Optimization engine balances demand, capacity, changeover costs, and service levels. Reoptimizes daily vs. weekly."},{id:"p-mrp",label:"Material requirements",how:"ML-driven MRP accounts for supplier lead time variability and demand uncertainty. Reduces expediting by 40%."},{id:"p-capplan",label:"Capacity planning",how:"Digital twin simulates capacity scenarios across network. Identifies bottlenecks 8-12 weeks earlier."}]},
    {l2:"Plan",l3:"Inventory",procs:[{id:"p-safety",label:"Safety stock optimization",how:"Dynamic safety stock models adjust buffers based on demand volatility, service requirements, and supply reliability — daily, not quarterly."},{id:"p-shelf",label:"Shelf-life management",how:"FIFO optimization + expiry prediction reduces waste. ML flags at-risk inventory for promotional clearance."},{id:"p-slow",label:"Slow-mover ID",how:"Automated velocity monitoring flags slow-moving SKUs for markdown, redeployment, or write-off within 2 weeks."}]},
    {l2:"Make",l3:"Manufacturing",procs:[{id:"p-prodsched",label:"Production scheduling",how:"Constraint-based optimizer sequences production runs to minimize changeover while meeting service targets."},{id:"p-qc",label:"Quality control",how:"Computer vision + sensor data predict quality deviations before they occur. Reduces scrap and rework."},{id:"p-changeover",label:"Changeover optimization",how:"ML analyzes changeover sequences to find optimal run ordering. Reduces changeover time 15-25%."}]},
    {l2:"Make",l3:"Process Eng",procs:[{id:"p-oee",label:"OEE improvement",how:"Real-time OEE dashboards from IoT sensors. ML identifies micro-stop root causes invisible to operators."},{id:"p-energy",label:"Energy management",how:"Predictive models optimize HVAC, compressed air, and steam systems based on production schedule and weather."},{id:"p-waste",label:"Waste reduction",how:"ML correlates process parameters with yield. Recommends set-point adjustments to minimize waste."}]},
    {l2:"Source",l3:"Procurement",procs:[{id:"p-commodity",label:"Commodity buying",how:"Predictive models forecast commodity prices 4-8 weeks out. Optimizes hedge timing and contract structure."},{id:"p-suppsel",label:"Supplier selection",how:"Multi-criteria scoring automates supplier evaluation. Risk models flag financial/ESG/geopolitical exposure."},{id:"p-contract",label:"Contract management",how:"NLP extracts key terms, obligations, and renewal dates. Alerts on compliance gaps and rebate triggers."}]},
    {l2:"Deliver",l3:"Logistics",procs:[{id:"p-route",label:"Route optimization",how:"Dynamic routing considers traffic, delivery windows, vehicle capacity, and driver hours. Reoptimizes intraday."},{id:"p-fleet",label:"Fleet management",how:"Telematics + ML predict maintenance needs. Optimizes fleet utilization and reduces unplanned downtime."},{id:"p-whouse",label:"Warehouse ops",how:"Slotting optimization, pick-path algorithms, and labor planning models reduce cost-per-case 10-15%."}]},
  ]},
  {id:"l1-fin",label:"Finance & Ops",icon:"◆",color:BLUE,areas:[
    {l2:"Financial Planning",l3:"Budgeting",procs:[{id:"p-revfcst",label:"Revenue forecasting",how:"ML models blend bottom-up pipeline data with macro signals. Reduces forecast error from ±8% to ±3%."},{id:"p-costbud",label:"Cost center budgeting",how:"Driver-based models auto-generate budgets from activity volumes. Managers adjust exceptions only."},{id:"p-capalloc",label:"Capital allocation",how:"Portfolio optimization scores capex proposals on risk-adjusted return, strategic alignment, and interdependencies."}]},
    {l2:"Financial Planning",l3:"Performance",procs:[{id:"p-kpi",label:"KPI monitoring",how:"Automated dashboards with anomaly detection. Alerts on KPI breaches instead of monthly reporting cycles."},{id:"p-variance",label:"Variance analysis",how:"ML decomposes variances into price/volume/mix/FX components automatically. Narratives auto-generated."},{id:"p-closecycle",label:"Close cycle management",how:"Automate reconciliations, accruals, and journal entries. Reduce close from 10 days to 4."}]},
    {l2:"Working Capital",l3:"O2C",procs:[{id:"p-credit",label:"Credit management",how:"ML credit scoring replaces manual review. Auto-approves 70% of orders, flags high-risk for review."},{id:"p-collect",label:"Collections",how:"Prioritization engine ranks overdue invoices by likelihood-to-pay and dollar impact. Auto-generates dunning."},{id:"p-cashapp",label:"Cash application",how:"ML matches incoming payments to invoices with 95%+ accuracy. Eliminates manual matching backlog."}]},
    {l2:"Working Capital",l3:"P2P",procs:[{id:"p-invproc",label:"Invoice processing",how:"OCR + ML extracts invoice data, matches to PO/receipt, routes exceptions. Touchless rate reaches 80%."},{id:"p-paysched",label:"Payment scheduling",how:"Optimization engine balances early payment discounts vs. DPO targets. Dynamic discounting captures 1-2% savings."},{id:"p-suppfin",label:"Supplier financing",how:"Platform enables reverse factoring for strategic suppliers. Extends DPO while improving supplier cash flow."}]},
  ]},
  {id:"l1-hr",label:"HR & Talent",icon:"▲",color:PINK,areas:[
    {l2:"Workforce",l3:"Planning",procs:[{id:"p-wfplan",label:"Workforce planning",how:"Predictive models forecast headcount needs by function, level, and skill from business plan inputs."},{id:"p-succession",label:"Succession planning",how:"ML identifies high-potential employees and flight risks. Maps skill gaps against future leadership needs."},{id:"p-orgdesign",label:"Org design",how:"Network analysis identifies collaboration patterns, span-of-control issues, and redundant layers."}]},
    {l2:"Workforce",l3:"Talent",procs:[{id:"p-recruit",label:"Recruiting & sourcing",how:"AI screens resumes, scores candidates, and auto-schedules interviews. Reduces recruiter workload 50%."},{id:"p-onboard",label:"Onboarding",how:"Automated onboarding workflows: system provisioning, training sequencing, and 30/60/90 check-ins."},{id:"p-retention",label:"Retention analytics",how:"ML identifies attrition risk factors and recommends targeted retention actions per employee."},{id:"p-perf",label:"Performance management",how:"Continuous feedback platform with ML-powered goal tracking and calibration suggestions."}]},
    {l2:"Workforce",l3:"Operations",procs:[{id:"p-payroll",label:"Payroll processing",how:"Automated payroll with exception-based review. ML flags anomalies before processing."},{id:"p-benefits",label:"Benefits admin",how:"AI chatbot handles 60% of benefits inquiries. Auto-enrollment and life-event processing."},{id:"p-compliance",label:"Labor compliance",how:"Automated tracking of hours, certifications, and regulatory requirements across jurisdictions."}]},
  ]},
  {id:"l1-it",label:"IT & Enterprise",icon:"●",color:PURPLE,areas:[
    {l2:"Data & Analytics",l3:"Data Mgmt",procs:[{id:"p-mdm",label:"Master data governance",how:"Automated data quality rules, deduplication, and golden record management across systems."},{id:"p-dq",label:"Data quality",how:"ML monitors data quality metrics continuously. Auto-corrects known patterns, flags anomalies for review."},{id:"p-dpipe",label:"Data pipelines",how:"Self-healing data pipelines with automated schema evolution, lineage tracking, and SLA monitoring."}]},
    {l2:"Data & Analytics",l3:"Analytics",procs:[{id:"p-predict",label:"Predictive modeling",how:"MLOps platform standardizes model development, deployment, monitoring, and retraining across the enterprise."},{id:"p-dash",label:"Dashboarding",how:"Self-service analytics layer with semantic model. Business users build dashboards without IT tickets."}]},
    {l2:"IT Operations",l3:"Service",procs:[{id:"p-itsm",label:"IT service management",how:"AI categorizes, routes, and resolves L1 tickets automatically. Knowledge base auto-updates from resolution patterns."},{id:"p-incident",label:"Incident management",how:"AIOps correlates alerts across monitoring tools. Predicts incidents before they impact users."},{id:"p-change",label:"Change management",how:"ML risk-scores change requests based on historical failure patterns and blast radius analysis."}]},
    {l2:"Process",l3:"Mining",procs:[{id:"p-procmine",label:"Process discovery",how:"Process mining reconstructs actual process flows from event logs. Identifies deviations from standard paths."},{id:"p-procopt",label:"Process optimization",how:"Simulation identifies bottlenecks and tests improvement scenarios before implementation."},{id:"p-rpa",label:"RPA orchestration",how:"Intelligent automation platform manages bot fleet, handles exceptions, and identifies new automation candidates."}]},
  ]},
  {id:"l1-cust",label:"Customer",icon:"◇",color:TEAL,areas:[
    {l2:"Customer Service",l3:"Support",procs:[{id:"p-cxroute",label:"Case routing",how:"ML classifies incoming cases by type, urgency, and required skill. Routes to best available agent."},{id:"p-cxresolve",label:"Resolution automation",how:"AI agent handles 35-45% of inquiries end-to-end. Suggests next-best-action for agent-handled cases."},{id:"p-cxinsight",label:"Customer insights",how:"Voice-of-customer analytics across all touchpoints. Sentiment trends and emerging issue detection."}]},
    {l2:"Digital Commerce",l3:"eCommerce",procs:[{id:"p-personalize",label:"Personalization",how:"Real-time personalization engine adapts content, offers, and navigation per visitor. Increases engagement 25-40%."},{id:"p-recommend",label:"Recommendation engine",how:"Collaborative filtering + content-based recommendations. Drives 15-25% of digital revenue."},{id:"p-pricing-dyn",label:"Dynamic pricing",how:"Real-time pricing adjusts based on demand, competition, inventory, and customer segment."}]},
  ]},
];
PT.forEach(l1=>l1.areas.forEach(a=>a.procs.forEach(p=>{PLOOK[p.id]={label:p.label,l1:l1.label,l2:a.l2,l3:a.l3,l1Color:l1.color,l1Icon:l1.icon,how:p.how};})));

// ═══ INITIATIVES ═══
const INITS=[
  {id:"i-rgm",name:"Revenue Growth Management",icon:"◈",color:GOLD,cat:"commercial",itype:"structural",impl:95,ramp:[.2,.55,.85,1,1],
    desc:"Price-pack architecture, trade promo optimization, channel mix modeling with AI-driven elasticity.",
    ready:{data:7,org:6,tech:5,sponsor:8},
    stakeholders:[{role:"Sponsor",who:"Chief Commercial Officer"},{role:"Accountable",who:"VP Revenue Management"},{role:"Contributors",who:"Category Directors, Trade Marketing, Finance BP"},{role:"Informed",who:"CFO, Regional Sales VPs, Key Account Managers"}],
    procs:[{p:"p-elast",t:"automate"},{p:"p-pack",t:"optimize"},{p:"p-compmon",t:"automate"},{p:"p-promplan",t:"optimize"},{p:"p-promroi",t:"automate"},{p:"p-tradespend",t:"redesign"},{p:"p-keyacct",t:"optimize"},{p:"p-chanmix",t:"redesign"},{p:"p-revfcst",t:"optimize"}],
    vds:[{id:"rgm-nrr",name:"Net revenue realization",est:2.0,min:.5,max:4,step:.1,bL:1,bH:3,unit:"%",src:"McKinsey RGM Practice 2023",pnl:"rev",base:"revenue",pct:.00087},
      {id:"rgm-promo",name:"Promotional ROI improvement",est:22,min:5,max:40,step:1,bL:15,bH:30,unit:"%",src:"NIQ/IRI Trade Promo benchmarks",pnl:"rev",base:"revenue",pct:.00004},
      {id:"rgm-trade",name:"Trade spend effectiveness",est:15,min:5,max:25,step:1,bL:10,bH:20,unit:"%",src:"Bain CPG Commercial Excellence",pnl:"sga",base:"sga",pct:-.00016}],
    bs:{inventory:0,recv:.003,pay:0,cash:-.003}},
  {id:"i-mkt",name:"Marketing Mix Optimization",icon:"◈",color:GOLD,cat:"commercial",itype:"quick",impl:55,ramp:[.3,.7,1,1,1],
    desc:"ML marketing mix modeling, real-time budget reallocation, AI content testing.",
    ready:{data:6,org:7,tech:6,sponsor:7},
    stakeholders:[{role:"Sponsor",who:"CMO"},{role:"Accountable",who:"VP Marketing Analytics"},{role:"Contributors",who:"Brand Directors, Media Agency, Data Science"},{role:"Informed",who:"CFO, Regional Marketing, Sales Leadership"}],
    procs:[{p:"p-brandh",t:"automate"},{p:"p-consins",t:"automate"},{p:"p-npd",t:"optimize"},{p:"p-chanmix",t:"redesign"},{p:"p-predict",t:"optimize"},{p:"p-dash",t:"optimize"},{p:"p-kpi",t:"automate"}],
    vds:[{id:"mkt-roi",name:"Marketing ROI improvement",est:28,min:10,max:45,step:1,bL:20,bH:40,unit:"%",src:"Google/Ekimetrics MMM 2023",pnl:"sga",base:"sga",pct:-.00006},
      {id:"mkt-brand",name:"Brand consideration lift",est:5,min:1,max:10,step:.5,bL:3,bH:8,unit:"%",src:"Kantar BrandZ CPG benchmark",pnl:"rev",base:"revenue",pct:.0002},
      {id:"mkt-cac",name:"CAC reduction",est:18,min:8,max:30,step:1,bL:15,bH:25,unit:"%",src:"Meta CPG advertiser",pnl:"sga",base:"sga",pct:-.00005}],
    bs:{inventory:0,recv:0,pay:0,cash:0}},
  {id:"i-port",name:"Portfolio Rationalization",icon:"◈",color:GOLD,cat:"commercial",itype:"quick",impl:30,ramp:[.35,.75,1,1,1],
    desc:"Systematic long-tail SKU elimination. AI scoring: margin, growth, strategic fit.",
    ready:{data:8,org:6,tech:7,sponsor:7},
    stakeholders:[{role:"Sponsor",who:"President, North America"},{role:"Accountable",who:"VP Category Management"},{role:"Contributors",who:"Brand Managers, Supply Chain Planning, Finance"},{role:"Informed",who:"CMO, VP Manufacturing, Regional Sales"}],
    procs:[{p:"p-skurat",t:"redesign"},{p:"p-catdec",t:"redesign"},{p:"p-npd",t:"optimize"},{p:"p-changeover",t:"optimize"},{p:"p-slow",t:"automate"},{p:"p-shelf",t:"optimize"},{p:"p-costbud",t:"optimize"}],
    vds:[{id:"pf-sku",name:"SKU count reduction",est:30,min:10,max:50,step:1,bL:20,bH:40,unit:"%",src:"Bain Portfolio Simplification",pnl:"cogs",base:"cogs",pct:-.00006},
      {id:"pf-chg",name:"Changeover reduction",est:22,min:8,max:35,step:1,bL:15,bH:30,unit:"%",src:"KO Investor Day 2023",pnl:"cogs",base:"cogs",pct:-.00008},
      {id:"pf-sga",name:"SG&A per SKU reduction",est:30,min:15,max:45,step:1,bL:25,bH:40,unit:"%",src:"Accenture CPG",pnl:"sga",base:"sga",pct:-.00002}],
    bs:{inventory:-.003,recv:0,pay:0,cash:.003}},
  {id:"i-dem",name:"AI Demand Forecasting",icon:"◉",color:GREEN,cat:"supplychain",itype:"structural",impl:75,ramp:[.25,.65,1,1,1],
    desc:"ML models with POS, weather, social signals. Automated S&OP consensus.",
    ready:{data:6,org:7,tech:5,sponsor:7},
    stakeholders:[{role:"Sponsor",who:"Chief Supply Chain Officer"},{role:"Accountable",who:"VP Demand Planning"},{role:"Contributors",who:"S&OP Team, Commercial Planning, Data Engineering"},{role:"Informed",who:"CFO, VP Manufacturing, Logistics Directors"}],
    procs:[{p:"p-statfcst",t:"automate"},{p:"p-promlift",t:"automate"},{p:"p-consens",t:"redesign"},{p:"p-safety",t:"automate"},{p:"p-shelf",t:"optimize"},{p:"p-slow",t:"automate"},{p:"p-mps",t:"optimize"},{p:"p-mrp",t:"optimize"},{p:"p-predict",t:"redesign"},{p:"p-dq",t:"optimize"}],
    vds:[{id:"dem-acc",name:"Forecast accuracy",est:25,min:10,max:40,step:1,bL:20,bH:35,unit:"%",src:"Gartner SC Top 25",pnl:"cogs",base:"cogs",pct:-.00006},
      {id:"dem-safe",name:"Safety stock reduction",est:20,min:8,max:30,step:1,bL:15,bH:25,unit:"%",src:"McKinsey Operations",pnl:"cogs",base:"cogs",pct:-.00011},
      {id:"dem-waste",name:"Waste reduction",est:15,min:5,max:25,step:1,bL:10,bH:20,unit:"%",src:"Deloitte CPG",pnl:"cogs",base:"cogs",pct:-.00008},
      {id:"dem-stock",name:"Stockout reduction",est:40,min:15,max:60,step:1,bL:30,bH:50,unit:"%",src:"IHL Lost Sales",pnl:"rev",base:"revenue",pct:.000015}],
    bs:{inventory:-.007,recv:0,pay:0,cash:.007}},
  {id:"i-dt",name:"Supply Chain Digital Twin",icon:"◉",color:GREEN,cat:"supplychain",itype:"structural",impl:190,ramp:[.15,.4,.7,.9,1],
    desc:"End-to-end digital twin: simulation, predictive maintenance, energy optimization.",
    ready:{data:4,org:5,tech:4,sponsor:6},
    stakeholders:[{role:"Sponsor",who:"Chief Supply Chain Officer"},{role:"Accountable",who:"VP Manufacturing & Engineering"},{role:"Contributors",who:"Plant Directors, IT Architecture, Data Engineering"},{role:"Informed",who:"CFO, Chief Sustainability Officer, CHRO"}],
    procs:[{p:"p-capplan",t:"redesign"},{p:"p-prodsched",t:"automate"},{p:"p-qc",t:"automate"},{p:"p-changeover",t:"optimize"},{p:"p-oee",t:"automate"},{p:"p-energy",t:"automate"},{p:"p-waste",t:"optimize"},{p:"p-route",t:"automate"},{p:"p-fleet",t:"optimize"},{p:"p-whouse",t:"optimize"},{p:"p-dpipe",t:"redesign"},{p:"p-dash",t:"optimize"}],
    vds:[{id:"dt-oee",name:"OEE improvement",est:8,min:3,max:15,step:.5,bL:5,bH:12,unit:"%",src:"WEF Lighthouse",pnl:"cogs",base:"cogs",pct:-.00018},
      {id:"dt-log",name:"Logistics cost reduction",est:11,min:4,max:18,step:.5,bL:8,bH:15,unit:"%",src:"BCG SC 4.0",pnl:"cogs",base:"cogs",pct:-.00009},
      {id:"dt-eng",name:"Energy cost reduction",est:14,min:5,max:22,step:1,bL:10,bH:20,unit:"%",src:"McKinsey Sustainability",pnl:"cogs",base:"cogs",pct:-.00003},
      {id:"dt-down",name:"Downtime reduction",est:30,min:10,max:45,step:1,bL:20,bH:40,unit:"%",src:"Siemens Opcenter",pnl:"cogs",base:"cogs",pct:-.00008}],
    bs:{inventory:-.002,recv:0,pay:0,cash:.002}},
  {id:"i-proc",name:"Procurement Analytics",icon:"◉",color:GREEN,cat:"supplychain",itype:"quick",impl:35,ramp:[.35,.7,1,1,1],
    desc:"AI spend analytics, supplier risk scoring, commodity hedging, contract intelligence.",
    ready:{data:7,org:6,tech:6,sponsor:7},
    stakeholders:[{role:"Sponsor",who:"Chief Procurement Officer"},{role:"Accountable",who:"VP Strategic Sourcing"},{role:"Contributors",who:"Category Buyers, Legal, Risk Management"},{role:"Informed",who:"CFO, Supply Chain VPs, Plant Directors"}],
    procs:[{p:"p-commodity",t:"automate"},{p:"p-suppsel",t:"optimize"},{p:"p-contract",t:"redesign"},{p:"p-dq",t:"optimize"}],
    vds:[{id:"proc-spend",name:"Spend under management",est:15,min:5,max:25,step:1,bL:10,bH:20,unit:"%",src:"Hackett Procurement",pnl:"cogs",base:"cogs",pct:-.00012},
      {id:"proc-cycle",name:"Sourcing cycle time",est:30,min:15,max:50,step:1,bL:20,bH:40,unit:"%",src:"Deloitte CPO Survey",pnl:"sga",base:"sga",pct:-.00002}],
    bs:{inventory:0,recv:0,pay:.002,cash:.002}},
  {id:"i-wc",name:"Working Capital Automation",icon:"◆",color:BLUE,cat:"finance",itype:"quick",impl:40,ramp:[.4,.8,1,1,1],
    desc:"Automate O2C/P2P: AI matching, dynamic discounting, supplier financing.",
    ready:{data:7,org:8,tech:7,sponsor:8},
    stakeholders:[{role:"Sponsor",who:"CFO"},{role:"Accountable",who:"VP Treasury / Controller"},{role:"Contributors",who:"AR/AP Teams, IT, Procurement"},{role:"Informed",who:"COO, Business Unit Finance, External Auditors"}],
    procs:[{p:"p-credit",t:"automate"},{p:"p-collect",t:"automate"},{p:"p-cashapp",t:"automate"},{p:"p-invproc",t:"automate"},{p:"p-paysched",t:"optimize"},{p:"p-suppfin",t:"redesign"},{p:"p-variance",t:"automate"}],
    vds:[{id:"wc-fte",name:"Finance FTE productivity",est:35,min:15,max:50,step:1,bL:25,bH:45,unit:"%",src:"APQC Finance",pnl:"sga",base:"sga",pct:-.00005}],
    bs:{inventory:-.002,recv:-.008,pay:.005,cash:.015}},
  {id:"i-fpa",name:"FP&A Automation",icon:"◆",color:BLUE,cat:"finance",itype:"quick",impl:25,ramp:[.4,.8,1,1,1],
    desc:"AI forecasting, automated variance analysis, close cycle acceleration.",
    ready:{data:7,org:7,tech:6,sponsor:8},
    stakeholders:[{role:"Sponsor",who:"CFO"},{role:"Accountable",who:"VP FP&A"},{role:"Contributors",who:"Business Unit Controllers, Data Engineering, IT"},{role:"Informed",who:"CEO, Business Unit Presidents, Investor Relations"}],
    procs:[{p:"p-revfcst",t:"automate"},{p:"p-costbud",t:"optimize"},{p:"p-capalloc",t:"optimize"},{p:"p-kpi",t:"automate"},{p:"p-variance",t:"automate"},{p:"p-closecycle",t:"redesign"},{p:"p-dash",t:"optimize"}],
    vds:[{id:"fpa-fte",name:"FP&A productivity",est:40,min:20,max:60,step:1,bL:30,bH:50,unit:"%",src:"Gartner Finance",pnl:"sga",base:"sga",pct:-.00003},
      {id:"fpa-close",name:"Close cycle reduction",est:35,min:15,max:50,step:1,bL:25,bH:45,unit:"%",src:"APQC Close Cycle",pnl:"sga",base:"sga",pct:-.00001}],
    bs:{inventory:0,recv:0,pay:0,cash:.001}},
  {id:"i-wfp",name:"AI Workforce Planning",icon:"▲",color:PINK,cat:"hr",itype:"structural",impl:45,ramp:[.2,.5,.8,1,1],
    desc:"Predictive workforce models, skills gap analysis, succession, org design optimization.",
    ready:{data:5,org:5,tech:4,sponsor:6},
    stakeholders:[{role:"Sponsor",who:"CHRO"},{role:"Accountable",who:"VP People Analytics"},{role:"Contributors",who:"HR Business Partners, L&D, Talent Acquisition"},{role:"Informed",who:"CEO, CFO, Business Unit Presidents"}],
    procs:[{p:"p-wfplan",t:"redesign"},{p:"p-succession",t:"optimize"},{p:"p-orgdesign",t:"redesign"},{p:"p-retention",t:"automate"},{p:"p-perf",t:"optimize"}],
    vds:[{id:"wfp-att",name:"Attrition reduction",est:18,min:8,max:30,step:1,bL:12,bH:25,unit:"%",src:"Visier People Analytics",pnl:"sga",base:"sga",pct:-.00008},
      {id:"wfp-prod",name:"Workforce productivity",est:5,min:2,max:10,step:.5,bL:3,bH:8,unit:"%",src:"McKinsey OrgSolutions",pnl:"sga",base:"sga",pct:-.00006}],
    bs:{inventory:0,recv:0,pay:0,cash:0}},
  {id:"i-talent",name:"Talent Acquisition AI",icon:"▲",color:PINK,cat:"hr",itype:"quick",impl:15,ramp:[.5,.85,1,1,1],
    desc:"AI sourcing, automated screening, predictive candidate scoring, onboarding automation.",
    ready:{data:6,org:7,tech:7,sponsor:7},
    stakeholders:[{role:"Sponsor",who:"CHRO"},{role:"Accountable",who:"VP Talent Acquisition"},{role:"Contributors",who:"Recruiters, Hiring Managers, IT"},{role:"Informed",who:"HR Business Partners, Finance"}],
    procs:[{p:"p-recruit",t:"automate"},{p:"p-onboard",t:"redesign"},{p:"p-compliance",t:"optimize"}],
    vds:[{id:"tal-ttf",name:"Time-to-fill reduction",est:35,min:15,max:50,step:1,bL:25,bH:45,unit:"%",src:"LinkedIn Talent",pnl:"sga",base:"sga",pct:-.00002},
      {id:"tal-q",name:"Quality of hire",est:20,min:8,max:35,step:1,bL:15,bH:30,unit:"%",src:"SHRM Talent",pnl:"sga",base:"sga",pct:-.00001}],
    bs:{inventory:0,recv:0,pay:0,cash:0}},
  {id:"i-data",name:"Enterprise Data Platform",icon:"●",color:PURPLE,cat:"it",itype:"foundation",impl:85,ramp:[.15,.4,.7,.9,1],
    desc:"Unified data lakehouse, real-time pipelines, data quality automation, self-service analytics.",
    ready:{data:4,org:5,tech:4,sponsor:7},
    stakeholders:[{role:"Sponsor",who:"CTO / CDO"},{role:"Accountable",who:"VP Data Engineering"},{role:"Contributors",who:"Enterprise Architects, Data Stewards, Cloud Ops"},{role:"Informed",who:"All Business Unit Heads, CFO, CISO"}],
    procs:[{p:"p-mdm",t:"redesign"},{p:"p-dq",t:"automate"},{p:"p-dpipe",t:"redesign"},{p:"p-predict",t:"optimize"},{p:"p-dash",t:"redesign"}],
    vds:[{id:"data-time",name:"Insight-to-action reduction",est:60,min:30,max:80,step:1,bL:45,bH:70,unit:"%",src:"Gartner D&A",pnl:"sga",base:"sga",pct:-.00002},
      {id:"data-dup",name:"Data rework reduction",est:40,min:20,max:60,step:1,bL:30,bH:50,unit:"%",src:"IDC Data Quality",pnl:"sga",base:"sga",pct:-.00002}],
    bs:{inventory:0,recv:0,pay:0,cash:0}},
  {id:"i-procmine",name:"Process Mining & Automation",icon:"●",color:PURPLE,cat:"it",itype:"quick",impl:30,ramp:[.35,.75,1,1,1],
    desc:"AI process discovery, bottleneck identification, RPA orchestration.",
    ready:{data:6,org:6,tech:6,sponsor:6},
    stakeholders:[{role:"Sponsor",who:"COO / CIO"},{role:"Accountable",who:"VP Process Excellence"},{role:"Contributors",who:"Process Owners, IT Operations, Internal Audit"},{role:"Informed",who:"All Function Heads, CFO"}],
    procs:[{p:"p-procmine",t:"automate"},{p:"p-procopt",t:"optimize"},{p:"p-rpa",t:"redesign"},{p:"p-itsm",t:"optimize"},{p:"p-incident",t:"automate"}],
    vds:[{id:"pm-fte",name:"Process FTE savings",est:25,min:10,max:40,step:1,bL:18,bH:35,unit:"%",src:"Celonis Process Intel",pnl:"sga",base:"sga",pct:-.00004},
      {id:"pm-cycle",name:"Cycle time reduction",est:35,min:15,max:55,step:1,bL:25,bH:45,unit:"%",src:"Gartner Hyperautomation",pnl:"sga",base:"sga",pct:-.00002}],
    bs:{inventory:0,recv:0,pay:0,cash:0}},
  {id:"i-cx",name:"Customer Service AI",icon:"◇",color:TEAL,cat:"customer",itype:"quick",impl:25,ramp:[.4,.8,1,1,1],
    desc:"AI agent assist, automated routing, self-service resolution, predictive insights.",
    ready:{data:7,org:7,tech:7,sponsor:7},
    stakeholders:[{role:"Sponsor",who:"Chief Customer Officer"},{role:"Accountable",who:"VP Customer Service"},{role:"Contributors",who:"Contact Center Ops, CX Design, IT"},{role:"Informed",who:"CMO, Sales Leadership, Product"}],
    procs:[{p:"p-cxroute",t:"automate"},{p:"p-cxresolve",t:"automate"},{p:"p-cxinsight",t:"optimize"},{p:"p-dq",t:"optimize"}],
    vds:[{id:"cx-fcr",name:"First contact resolution",est:25,min:10,max:40,step:1,bL:18,bH:35,unit:"%",src:"Gartner CX",pnl:"sga",base:"sga",pct:-.00004},
      {id:"cx-ret",name:"Retention uplift",est:8,min:3,max:15,step:1,bL:5,bH:12,unit:"%",src:"Bain NPS linkage",pnl:"rev",base:"revenue",pct:.000008}],
    bs:{inventory:0,recv:0,pay:0,cash:0}},
  {id:"i-dcom",name:"Digital Commerce Intelligence",icon:"◇",color:TEAL,cat:"customer",itype:"structural",impl:60,ramp:[.25,.6,.85,1,1],
    desc:"AI personalization, recommendation engines, dynamic pricing, conversion optimization.",
    ready:{data:5,org:5,tech:5,sponsor:6},
    stakeholders:[{role:"Sponsor",who:"Chief Digital Officer"},{role:"Accountable",who:"VP eCommerce"},{role:"Contributors",who:"Digital Marketing, Product, Data Science, UX"},{role:"Informed",who:"CMO, CFO, Sales Leadership"}],
    procs:[{p:"p-personalize",t:"automate"},{p:"p-recommend",t:"automate"},{p:"p-pricing-dyn",t:"redesign"},{p:"p-consins",t:"optimize"}],
    vds:[{id:"dcom-conv",name:"Conversion rate improvement",est:20,min:8,max:35,step:1,bL:15,bH:30,unit:"%",src:"Adobe Commerce",pnl:"rev",base:"revenue",pct:.00003},
      {id:"dcom-aov",name:"AOV increase",est:12,min:5,max:20,step:1,bL:8,bH:18,unit:"%",src:"Salesforce Commerce",pnl:"rev",base:"revenue",pct:.00002}],
    bs:{inventory:0,recv:0,pay:0,cash:0}},
];

// Helpers
const fm=v=>{if(!v&&v!==0)return"—";const a=Math.abs(v),s=v<0?"-":"";return a>=1000?`${s}$${(a/1000).toFixed(1)}B`:`${s}$${a.toFixed(0)}M`;};
const fd=v=>{if(Math.abs(v)<.5)return"—";const s=v>=0?"+":"";return Math.abs(v)>=1000?`${s}$${(v/1000).toFixed(1)}B`:`${s}$${v.toFixed(0)}M`;};
function cPnL(init,ov,bl){let r=0,c=0,s=0;init.vds.forEach(v=>{const val=ov[v.id]??v.est,imp=val*v.pct*(bl[v.base]||bl.revenue);if(v.pnl==="rev")r+=imp;else if(v.pnl==="cogs")c+=imp;else if(v.pnl==="sga")s+=imp;});return{rev:r,cogs:c,sga:s};}
function ssE(inits,ov,bl){let t=0;inits.forEach(i=>{const p=cPnL(i,ov,bl);t+=p.rev-p.cogs-p.sga;});return t;}
function cProj(inits,ov,bl){
  const p=[];const baseE=bl.revenue-bl.cogs-bl.sga+(bl.da||1800);
  for(let y=0;y<=5;y++){
    let rev=bl.revenue,cogs=bl.cogs,sga=bl.sga,ic=0,bD={inv:0,recv:0,pay:0,cash:0};
    inits.forEach(init=>{const rf=y===0?0:(init.ramp[Math.min(y-1,4)]||1);const pnl=cPnL(init,ov,bl);
      rev+=pnl.rev*rf;cogs+=pnl.cogs*rf;sga+=pnl.sga*rf;
      ["inventory","recv","pay","cash"].forEach(k=>{bD[k==="inventory"?"inv":k]+=(init.bs[k]||0)*bl.revenue*rf;});
      if(y>=1&&y<=2)ic+=init.impl/2;});
    const gp=rev-cogs,oi=gp-sga-(y>=1&&y<=2?ic:0),ebitda=oi+(bl.da||1800),ni=(oi-(bl.interest||1500))*(1-bl.taxRate);
    p.push({yr:y===0?"Base":`Y${y}`,rev,cogs,sga,gp,oi,ebitda,ni,eps:bl.shares?(ni/1000)/bl.shares:0,ic:y>=1&&y<=2?ic:0,eDelta:ebitda-baseE,
      inv:(bl.inventory||2000)+bD.inv,recv:(bl.recv||3500)+bD.recv,pay:(bl.pay||4200)+bD.pay,cash:(bl.cash||9400)+bD.cash});}
  return p;
}
function parseCSV(text){
  const bl={...DEF_BL,company:"Custom Upload",src:"Uploaded CSV"};
  const map={revenue:["revenue","net revenue","sales"],cogs:["cogs","cost of goods","cost of revenue"],sga:["sga","sg&a","selling general","operating expenses"],ebitda:["ebitda"],da:["depreciation","d&a"],inventory:["inventory"],recv:["receivables"],pay:["payables"],cash:["cash"],interest:["interest"]};
  text.split("\n").forEach(line=>{const parts=line.split(",").map(c=>c.trim().replace(/^"|"$/g,""));
    if(parts.length>=2){const lbl=parts[0].toLowerCase(),val=parseFloat(parts[1].replace(/[$,]/g,""));
      if(!isNaN(val))Object.entries(map).forEach(([k,al])=>{for(const a of al){if(lbl.includes(a)){bl[k]=val;break;}}});}});
  bl.gp=bl.revenue-bl.cogs;if(!bl.ebitda)bl.ebitda=bl.gp-bl.sga+(bl.da||1800);bl.ni=(bl.gp-bl.sga-(bl.interest||1500))*(1-bl.taxRate);bl.eps=bl.shares?(bl.ni/1000)/bl.shares:0;return bl;}

// ═══ MAIN ═══
export default function Prism(){
  const[page,setPage]=useState("entry");
  const[step,setStep]=useState(1);
  const[mode,setMode]=useState("dark");
  const[actIds,setActIds]=useState(new Set(["i-rgm","i-dem","i-wc"]));
  const[focId,setFocId]=useState(null);
  const[ov,setOv]=useState({});
  const[bl,setBl]=useState(DEF_BL);
  const[scenarios,setScns]=useState([]);
  const[catF,setCatF]=useState("all");
  const[itF,setItF]=useState("all");
  const[procDetail,setProcDetail]=useState(null);

  const t=TH[mode];
  const actInits=useMemo(()=>INITS.filter(i=>actIds.has(i.id)),[actIds]);
  const focInit=INITS.find(i=>i.id===focId);
  const proj=useMemo(()=>cProj(actInits,ov,bl),[actInits,ov,bl]);
  const ss=proj[proj.length-1];
  const totalE=useMemo(()=>ssE(actInits,ov,bl),[actInits,ov,bl]);
  const implC=actInits.reduce((a,i)=>a+i.impl,0);
  const allE=useMemo(()=>ssE(INITS,ov,bl),[ov,bl]);
  const ev=totalE*(bl.evMult||22);
  const maxE=Math.max(...INITS.map(i=>Math.abs(ssE([i],ov,bl))),1);
  const filtInits=useMemo(()=>{let r=INITS;if(catF!=="all")r=r.filter(i=>i.cat===catF);if(itF!=="all")r=r.filter(i=>i.itype===itF);return r.sort((a,b)=>Math.abs(ssE([b],ov,bl))-Math.abs(ssE([a],ov,bl)));},[catF,itF,ov,bl]);
  const handleFile=()=>{const inp=document.createElement("input");inp.type="file";inp.accept=".csv";inp.onchange=e=>{const f=e.target?.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>{try{setBl(parseCSV(ev.target.result));}catch(err){}};r.readAsText(f);};inp.click();};

  // All value drivers with impact
  const allDrivers=useMemo(()=>{
    const d=[];actInits.forEach(init=>{init.vds.forEach(vd=>{
      const val=ov[vd.id]??vd.est,imp=val*vd.pct*(bl[vd.base]||bl.revenue);
      if(vd.pnl!=="wc")d.push({name:vd.name,init:init.name,initColor:init.color,val,unit:vd.unit,impact:imp,pnl:vd.pnl});});});
    return d.sort((a,b)=>Math.abs(b.impact)-Math.abs(a.impact));
  },[actInits,ov,bl]);

  // ─── ENTRY ───
  if(page==="entry") return(
    <div style={{minHeight:"100vh",background:t.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FONT,padding:20}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{textAlign:"center",maxWidth:520}}>
        <div style={{fontSize:12,color:t.mut,letterSpacing:"3px",textTransform:"uppercase",marginBottom:16}}>humaninthelead.ai</div>
        <div style={{fontSize:48,fontFamily:SERIF,color:t.tx,fontWeight:400,letterSpacing:"-1px",marginBottom:4}}>Prism</div>
        <div style={{fontSize:16,color:t.tx2,marginBottom:20}}>Value Identification Engine</div>
        <div style={{fontSize:28,fontFamily:SERIF,color:GOLD,fontWeight:300,marginBottom:6}}>{fd(allE)} EBITDA</div>
        <div style={{fontSize:14,color:t.tx2,marginBottom:24}}>{INITS.length} initiatives · {CATS.length} functions · {INITS.reduce((a,i)=>a+i.vds.length,0)} value drivers</div>
        <div style={{fontSize:18,color:t.tx,fontWeight:500,marginBottom:2}}>{bl.company}</div>
        <div style={{fontSize:13,color:t.tx2,marginBottom:24}}>{bl.src}</div>
        <div onClick={handleFile} style={{border:`2px dashed ${t.bdr}`,borderRadius:12,padding:"14px 20px",marginBottom:20,cursor:"pointer"}}>
          <div style={{fontSize:14,color:t.tx,fontWeight:500}}>Upload CSV to customize baseline</div>
          <div style={{fontSize:12,color:t.mut,marginTop:4}}>Label col A, value col B</div></div>
        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:20}}>
          <button onClick={()=>{setPage("work");setStep(1);}} style={{background:GOLD,color:"#111",border:"none",borderRadius:10,padding:"14px 32px",fontSize:16,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>Enter Workspace</button>
          <button onClick={()=>setPage("how")} style={{background:"none",border:`1px solid ${t.bdr}`,borderRadius:10,padding:"14px 24px",fontSize:14,color:t.tx2,cursor:"pointer",fontFamily:FONT}}>How It Works</button></div>
        <button onClick={()=>setMode(mode==="dark"?"light":"dark")} style={{background:"none",border:"none",color:t.mut,cursor:"pointer",fontSize:12,fontFamily:FONT}}>{mode==="dark"?"☀ Light":"◐ Dark"}</button>
        <div style={{marginTop:40,fontSize:12,color:t.sub}}>Built by Christian Spetz</div>
      </div></div>);

  // ─── HOW ───
  if(page==="how") return(
    <div style={{minHeight:"100vh",background:t.bg,fontFamily:FONT,display:"flex",alignItems:"center",justifyContent:"center",padding:40}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{maxWidth:600}}>
        <div style={{fontSize:12,color:t.mut,letterSpacing:"3px",textTransform:"uppercase",marginBottom:12}}>humaninthelead.ai</div>
        <div style={{fontSize:38,fontFamily:SERIF,color:t.tx,marginBottom:8}}>How Prism Works</div>
        <div style={{fontSize:15,color:t.tx2,lineHeight:1.7,marginBottom:32}}>Three steps: select initiatives, see which processes change and how, then view financial impact over time.</div>
        {[{i:"◈",t:"Select Initiatives",d:"14 initiatives across 6 functions. Filter by category or type. Adjust value drivers. See who needs to be involved."},
          {i:"◉",t:"Process Impact",d:"Every initiative maps to L4 processes. Click any process to see exactly HOW it changes — the specific AI/automation approach."},
          {i:"◆",t:"Financial Impact",d:"5-year P&L and Balance Sheet. Incremental EBITDA chart. Impact ranked by individual value driver."}
        ].map((s,i)=>(<div key={i} style={{display:"flex",gap:14,padding:16,background:t.card,border:`1px solid ${t.bdr}`,borderRadius:10,marginBottom:12}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:GOLD+"15",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:16,color:GOLD}}>{s.i}</div>
            <div><div style={{fontSize:16,fontWeight:600,color:t.tx,marginBottom:3}}>Step {i+1}: {s.t}</div><div style={{fontSize:14,color:t.tx2,lineHeight:1.6}}>{s.d}</div></div>
          </div>))}
        <div style={{textAlign:"center",marginTop:24}}><button onClick={()=>{setPage("work");setStep(1);}} style={{background:GOLD,color:"#111",border:"none",borderRadius:10,padding:"14px 40px",fontSize:16,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>Enter Workspace →</button></div>
      </div></div>);

  // ─── WORKSPACE ───
  return(
    <div style={{minHeight:"100vh",background:t.bg,color:t.tx,fontFamily:FONT,display:"flex",flexDirection:"column"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 24px",borderBottom:`1px solid ${t.bdr}`,background:mode==="dark"?"#131312":"#EFEBE3",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <span style={{fontSize:18,fontFamily:SERIF,color:GOLD,fontWeight:500,cursor:"pointer"}} onClick={()=>setPage("entry")}>Prism</span>
          <div style={{height:14,width:1,background:t.bdr}}/><span style={{fontSize:14,fontWeight:600,color:t.tx}}>{bl.company}</span></div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setMode(mode==="dark"?"light":"dark")} style={{background:"none",border:`1px solid ${t.bdr}`,borderRadius:6,padding:"4px 10px",color:t.mut,cursor:"pointer",fontSize:12,fontFamily:FONT}}>{mode==="dark"?"☀":"◐"}</button>
          <button onClick={handleFile} style={{background:"none",border:`1px solid ${t.bdr}`,borderRadius:6,padding:"4px 10px",color:t.tx2,cursor:"pointer",fontSize:12,fontFamily:FONT}}>CSV</button>
          <button onClick={()=>{setActIds(new Set());setFocId(null);setStep(1);}} style={{background:"none",border:`1px solid ${t.bdr}`,borderRadius:6,padding:"4px 10px",color:t.tx2,cursor:"pointer",fontSize:12,fontFamily:FONT}}>↺</button></div></div>
      {/* Hero */}
      <div style={{background:`linear-gradient(90deg,${GOLD}10,transparent)`,borderBottom:`1px solid ${GOLD}22`,padding:"8px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"baseline",gap:14,flexWrap:"wrap"}}>
          <div><span style={{fontSize:11,color:GOLD,textTransform:"uppercase",letterSpacing:"1px",fontWeight:600,marginRight:6}}>EBITDA</span><span style={{fontSize:22,fontFamily:SERIF,color:GOLD}}>{fd(totalE)}</span></div>
          <div style={{height:18,width:1,background:t.bdr}}/><div><span style={{fontSize:11,color:GREEN,textTransform:"uppercase",letterSpacing:"1px",fontWeight:600,marginRight:6}}>EV</span><span style={{fontSize:22,fontFamily:SERIF,color:GREEN}}>{fd(ev)}</span></div>
          <div style={{height:18,width:1,background:t.bdr}}/><div><span style={{fontSize:11,color:t.tx2,marginRight:4}}>Payback</span><span style={{fontSize:15,color:t.tx,fontWeight:600}}>{totalE>0?`${(implC/totalE*12).toFixed(0)}mo`:"—"}</span></div>
          <div style={{height:18,width:1,background:t.bdr}}/><span style={{fontSize:12,color:t.mut}}>{actInits.length}/{INITS.length}</span></div>
        <div style={{display:"flex",gap:4}}>
          {[{n:1,l:"Select"},{n:2,l:"Processes"},{n:3,l:"Financials"}].map(s=>(
            <button key={s.n} onClick={()=>setStep(s.n)} style={{background:step===s.n?GOLD:"none",color:step===s.n?"#111":t.tx2,border:step===s.n?"none":`1px solid ${t.bdr}`,borderRadius:8,padding:"6px 16px",cursor:"pointer",fontSize:13,fontWeight:step===s.n?700:500,fontFamily:FONT}}>{s.n}. {s.l}</button>))}</div></div>

      <div style={{flex:1,overflowY:"auto",padding:"24px 32px",maxWidth:1100,margin:"0 auto",width:"100%"}}>

      {/* ═══ STEP 1 ═══ */}
      {step===1&&(<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:16}}>
          <div><div style={{fontSize:11,color:t.mut,textTransform:"uppercase",letterSpacing:"2px",fontWeight:600,marginBottom:4}}>Step 1</div>
            <div style={{fontSize:24,fontFamily:SERIF,color:t.tx}}>Select Initiatives</div></div></div>
        <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:3,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontSize:11,color:t.mut,marginRight:3}}>Function:</span>
            <button onClick={()=>setCatF("all")} style={{fontSize:10,padding:"2px 8px",borderRadius:5,background:catF==="all"?GOLD+"20":"none",border:`1px solid ${catF==="all"?GOLD+"44":t.bdr}`,color:catF==="all"?GOLD:t.tx2,cursor:"pointer",fontFamily:FONT}}>All</button>
            {CATS.map(c=><button key={c.id} onClick={()=>setCatF(c.id)} style={{fontSize:10,padding:"2px 8px",borderRadius:5,background:catF===c.id?c.color+"20":"none",border:`1px solid ${catF===c.id?c.color+"44":t.bdr}`,color:catF===c.id?c.color:t.tx2,cursor:"pointer",fontFamily:FONT}}>{c.icon} {c.label}</button>)}</div>
          <div style={{display:"flex",gap:3,alignItems:"center"}}>
            <span style={{fontSize:11,color:t.mut,marginRight:3}}>Type:</span>
            <button onClick={()=>setItF("all")} style={{fontSize:10,padding:"2px 8px",borderRadius:5,background:itF==="all"?t.bdr:"none",border:`1px solid ${t.bdr}`,color:t.tx2,cursor:"pointer",fontFamily:FONT}}>All</button>
            {Object.entries(ITYPES).map(([k,v])=><button key={k} onClick={()=>setItF(k)} style={{fontSize:10,padding:"2px 8px",borderRadius:5,background:itF===k?v.c+"20":"none",border:`1px solid ${itF===k?v.c+"44":t.bdr}`,color:itF===k?v.c:t.tx2,cursor:"pointer",fontFamily:FONT}}>{v.l}</button>)}</div></div>

        <div style={{display:"grid",gridTemplateColumns:focId?"1fr 1fr":"1fr 1fr 1fr",gap:10}}>
          <div style={{display:"grid",gridTemplateColumns:focId?"1fr":"1fr 1fr 1fr",gap:8,alignContent:"start",gridColumn:focId?"1":"1 / -1"}}>
            {filtInits.map(init=>{
              const active=actIds.has(init.id),focused=focId===init.id,e=ssE([init],ov,bl);
              const catI=CATS.find(c=>c.id===init.cat);
              return(<div key={init.id} style={{background:active?`${init.color}08`:t.card,border:`1px solid ${focused?init.color+"66":active?init.color+"33":t.bdr}`,borderLeft:active?`4px solid ${init.color}`:`1px solid ${t.bdr}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",transition:"all 0.15s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                  <span style={{fontSize:13,fontWeight:600,color:active?t.tx:t.tx2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{init.icon} {init.name}</span>
                  <div onClick={(ev)=>{ev.stopPropagation();setActIds(p=>{const n=new Set(p);n.has(init.id)?n.delete(init.id):n.add(init.id);return n;});}} style={{background:active?init.color:"transparent",border:active?"none":`1px solid ${t.bdr}`,borderRadius:6,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:active?"#111":t.mut,fontWeight:700,flexShrink:0}}>{active?"✓":"+"}</div></div>
                <div style={{display:"flex",gap:3,marginBottom:5}}>
                  <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:(catI?.color||GOLD)+"18",color:catI?.color||GOLD,fontWeight:600,textTransform:"uppercase"}}>{catI?.label}</span>
                  <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:ITYPES[init.itype].c+"18",color:ITYPES[init.itype].c,fontWeight:600,textTransform:"uppercase"}}>{ITYPES[init.itype].l}</span></div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <div style={{flex:1,height:4,background:t.bdr,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${(Math.abs(e)/maxE)*100}%`,background:init.color,opacity:active?.8:.3,borderRadius:2}}/></div>
                  <span style={{fontSize:13,fontFamily:"monospace",color:active?init.color:t.mut,fontWeight:700}}>{fd(e)}</span></div>
                <div style={{fontSize:10,color:t.mut}}>{fm(init.impl)} · {e>0?(init.impl/e*12).toFixed(0)+"mo":"—"}</div>
                {active&&<button onClick={(ev)=>{ev.stopPropagation();setFocId(focused?null:init.id);}} style={{marginTop:5,background:"none",border:`1px solid ${init.color}44`,borderRadius:5,padding:"3px 10px",color:init.color,cursor:"pointer",fontSize:10,fontFamily:FONT,fontWeight:600}}>{focused?"Close":"Details ▸"}</button>}
              </div>);})}
          </div>
          {focId&&focInit&&(
            <div style={{background:t.card,border:`1px solid ${focInit.color}33`,borderRadius:12,padding:18,overflowY:"auto",maxHeight:650}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:16,fontWeight:600,color:t.tx}}>{focInit.icon} {focInit.name}</span>
                <button onClick={()=>setFocId(null)} style={{background:"none",border:"none",color:t.mut,cursor:"pointer",fontSize:16}}>×</button></div>
              <div style={{fontSize:12,color:t.tx2,lineHeight:1.5,marginBottom:10}}>{focInit.desc}</div>
              {/* Readiness */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
                {[{k:"data",l:"Data"},{k:"org",l:"Org"},{k:"tech",l:"Tech"},{k:"sponsor",l:"Sponsor"}].map(d=>(
                  <div key={d.k} style={{display:"flex",alignItems:"center",gap:4}}>
                    <span style={{fontSize:10,color:t.mut,minWidth:42}}>{d.l}</span>
                    <div style={{flex:1,height:4,background:t.bdr,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${focInit.ready[d.k]*10}%`,background:focInit.ready[d.k]>=7?GREEN:focInit.ready[d.k]>=5?GOLD:RED,borderRadius:2}}/></div>
                    <span style={{fontSize:10,fontFamily:"monospace",color:t.tx}}>{focInit.ready[d.k]}</span></div>))}</div>
              {/* Stakeholders */}
              <div style={{fontSize:11,color:t.mut,textTransform:"uppercase",letterSpacing:"1px",fontWeight:600,marginBottom:5}}>Stakeholders</div>
              <div style={{marginBottom:10}}>
                {focInit.stakeholders.map((s,i)=>(
                  <div key={i} style={{display:"flex",gap:6,padding:"3px 0",borderBottom:`1px solid ${t.bdr}40`}}>
                    <span style={{fontSize:11,color:s.role==="Sponsor"?GOLD:s.role==="Accountable"?GREEN:t.mut,fontWeight:600,minWidth:75}}>{s.role}</span>
                    <span style={{fontSize:11,color:t.tx2}}>{s.who}</span></div>))}</div>
              {/* Value drivers */}
              <div style={{fontSize:11,color:t.mut,textTransform:"uppercase",letterSpacing:"1px",fontWeight:600,marginBottom:5}}>Value Drivers</div>
              {focInit.vds.map(vd=>{
                const val=ov[vd.id]??vd.est,imp=val*vd.pct*(bl[vd.base]||bl.revenue);
                return(<div key={vd.id} style={{background:t.bg,border:`1px solid ${t.bdr}`,borderRadius:6,padding:"7px 10px",marginBottom:4}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                    <span style={{fontSize:12,fontWeight:500,color:t.tx}}>{vd.name}</span>
                    <span style={{fontSize:15,fontFamily:SERIF,color:t.tx}}>{val}<span style={{fontSize:10,color:t.tx2}}>{vd.unit}</span></span></div>
                  <input type="range" min={vd.min} max={vd.max} step={vd.step} value={val} onChange={e=>setOv(p=>({...p,[vd.id]:parseFloat(e.target.value)}))} style={{width:"100%",height:3,cursor:"pointer",accentColor:focInit.color}}/>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10}}>
                    <span style={{color:t.mut}}>Bench: {vd.bL}–{vd.bH}{vd.unit} · {vd.src}</span>
                    {vd.pnl!=="wc"&&Math.abs(imp)>.1&&<span style={{color:GREEN,fontWeight:600}}>{fd(imp)}</span>}</div>
                </div>);})}</div>)}</div>
        <div style={{textAlign:"right",marginTop:16}}>
          <button onClick={()=>setStep(2)} disabled={actInits.length===0} style={{background:actInits.length>0?GOLD:"#333",color:actInits.length>0?"#111":"#666",border:"none",borderRadius:10,padding:"12px 28px",fontSize:15,fontWeight:600,cursor:actInits.length>0?"pointer":"default",fontFamily:FONT}}>Process Impact →</button></div>
      </div>)}

      {/* ═══ STEP 2 ═══ */}
      {step===2&&(<div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:t.mut,textTransform:"uppercase",letterSpacing:"2px",fontWeight:600,marginBottom:4}}>Step 2</div>
          <div style={{fontSize:24,fontFamily:SERIF,color:t.tx,marginBottom:6}}>Process Impact</div>
          <div style={{display:"flex",gap:14,fontSize:13}}>
            {Object.entries(IMP).map(([k,v])=>{const cnt=actInits.reduce((s,i)=>s+i.procs.filter(p=>p.t===k).length,0);
              return <span key={k}><span style={{color:v.c,fontWeight:700}}>{cnt}</span> <span style={{color:t.tx2}}>{v.l}</span></span>;})}
            <span style={{color:t.mut}}>· {actInits.reduce((s,i)=>s+i.procs.length,0)} total</span></div></div>
        <div style={{fontSize:12,color:t.tx2,marginBottom:16}}>Click any process to see how it changes.</div>
        {PT.map(l1=>{
          const hits=[];actInits.forEach(init=>{init.procs.forEach(pi=>{const info=PLOOK[pi.p];if(info&&info.l1===l1.label)hits.push({...info,type:pi.t,initName:init.name,initColor:init.color,pid:pi.p});});});
          if(hits.length===0) return null;
          const grouped={};hits.forEach(h=>{const k=`${h.l2} → ${h.l3}`;if(!grouped[k])grouped[k]=[];grouped[k].push(h);});
          return(<div key={l1.id} style={{marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,paddingBottom:6,borderBottom:`1px solid ${l1.color}33`}}>
              <span style={{color:l1.color,fontSize:16}}>{l1.icon}</span>
              <span style={{fontSize:16,fontWeight:600,color:t.tx}}>{l1.label}</span>
              <span style={{fontSize:12,color:t.mut}}>({hits.length})</span></div>
            {Object.entries(grouped).map(([path,items])=>(
              <div key={path} style={{marginBottom:8,paddingLeft:10}}>
                <div style={{fontSize:12,color:t.tx2,fontWeight:600,marginBottom:4}}>{path}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                  {items.map((item,i)=>(
                    <div key={i} onClick={()=>setProcDetail(procDetail===item.pid?null:item.pid)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",background:procDetail===item.pid?`${IMP[item.type].c}10`:t.card,border:`1px solid ${procDetail===item.pid?IMP[item.type].c+"44":t.bdr}`,borderRadius:6,borderLeft:`3px solid ${IMP[item.type].c}`,cursor:"pointer",transition:"all 0.15s"}}>
                      <span style={{fontSize:12,color:t.tx,flex:1}}>{item.label}</span>
                      <span style={{fontSize:9,padding:"1px 5px",borderRadius:4,background:IMP[item.type].c+"22",color:IMP[item.type].c,fontWeight:700,textTransform:"uppercase"}}>{IMP[item.type].l}</span></div>))}</div>
                {/* Expanded detail */}
                {items.filter(i=>procDetail===i.pid).map(item=>(
                  <div key={item.pid+"d"} style={{margin:"6px 0",padding:12,background:t.card,border:`1px solid ${IMP[item.type].c}33`,borderRadius:8,borderLeft:`3px solid ${IMP[item.type].c}`}}>
                    <div style={{fontSize:13,fontWeight:600,color:t.tx,marginBottom:4}}>{item.label}</div>
                    <div style={{fontSize:12,color:IMP[item.type].c,fontWeight:600,marginBottom:6}}>{IMP[item.type].l}: {IMP[item.type].d}</div>
                    <div style={{fontSize:12,color:t.tx2,lineHeight:1.6,marginBottom:6}}>{item.how||"Implementation approach specific to this process."}</div>
                    <div style={{fontSize:11,color:t.mut}}>Driven by: <span style={{color:item.initColor,fontWeight:600}}>{item.initName}</span></div></div>))}</div>))}</div>);})}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:16}}>
          <button onClick={()=>setStep(1)} style={{background:"none",border:`1px solid ${t.bdr}`,borderRadius:10,padding:"12px 28px",color:t.tx2,cursor:"pointer",fontSize:15,fontFamily:FONT}}>← Selection</button>
          <button onClick={()=>setStep(3)} style={{background:GOLD,color:"#111",border:"none",borderRadius:10,padding:"12px 28px",fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>Financials →</button></div>
      </div>)}

      {/* ═══ STEP 3 ═══ */}
      {step===3&&(<div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:t.mut,textTransform:"uppercase",letterSpacing:"2px",fontWeight:600,marginBottom:4}}>Step 3</div>
          <div style={{fontSize:24,fontFamily:SERIF,color:t.tx}}>Financial Impact</div></div>
        {/* KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:24}}>
          {[{l:"EBITDA",v:fd(totalE),c:GOLD},{l:`EV (${bl.evMult||22}x)`,v:fd(ev),c:GREEN},{l:"Implementation",v:fm(implC),c:RED},{l:"Payback",v:totalE>0?`${(implC/totalE*12).toFixed(0)} months`:"—",c:BLUE}].map(k=>(
            <div key={k.l} style={{background:`${k.c}0C`,border:`1px solid ${k.c}22`,borderRadius:10,padding:"12px 16px",textAlign:"center"}}>
              <div style={{fontSize:11,color:k.c,textTransform:"uppercase",letterSpacing:".5px",fontWeight:600,marginBottom:4}}>{k.l}</div>
              <div style={{fontSize:22,fontFamily:SERIF,color:k.c}}>{k.v}</div></div>))}</div>
        {/* Delta chart */}
        <div style={{fontSize:12,color:t.mut,textTransform:"uppercase",letterSpacing:"1px",fontWeight:600,marginBottom:8}}>Incremental EBITDA ($M)</div>
        <div style={{height:200,marginBottom:24}}>
          <ResponsiveContainer>
            <AreaChart data={proj.map(p=>({n:p.yr,v:Math.round(p.eDelta)}))} margin={{top:5,right:10,left:10,bottom:0}}>
              <defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GOLD} stopOpacity={.35}/><stop offset="100%" stopColor={GOLD} stopOpacity={.02}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.bdr+"60"}/>
              <XAxis dataKey="n" tick={{fill:t.tx2,fontSize:12}} axisLine={{stroke:t.bdr}} tickLine={false}/>
              <YAxis tick={{fill:t.mut,fontSize:11,fontFamily:"monospace"}} axisLine={{stroke:t.bdr}} tickLine={false} tickFormatter={v=>`$${v}M`}/>
              <Tooltip contentStyle={{background:t.card,border:`1px solid ${t.bdr}`,borderRadius:8,fontSize:13,color:t.tx}} formatter={v=>[`$${v}M`,"Δ EBITDA"]}/>
              <Area type="monotone" dataKey="v" stroke={GOLD} fill="url(#eg)" strokeWidth={2} dot={{r:4,fill:GOLD}}/></AreaChart>
          </ResponsiveContainer></div>
        {/* Driver Impact Ranked */}
        <div style={{fontSize:12,color:t.mut,textTransform:"uppercase",letterSpacing:"1px",fontWeight:600,marginBottom:8}}>Impact by Value Driver</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginBottom:24}}>
          <thead><tr>{["Driver","Initiative","Estimate","P&L Line","Impact ($M)"].map((h,i)=><th key={i} style={{padding:"6px 10px",borderBottom:`2px solid ${t.bdr}`,textAlign:i>=3?"right":"left",color:t.mut,fontWeight:600,fontSize:12}}>{h}</th>)}</tr></thead>
          <tbody>
            {allDrivers.map((d,i)=>(
              <tr key={i}><td style={{padding:"5px 10px",borderBottom:`1px solid ${t.bdr}40`,color:t.tx,fontWeight:500}}>{d.name}</td>
                <td style={{padding:"5px 10px",borderBottom:`1px solid ${t.bdr}40`,color:d.initColor,fontSize:12}}>{d.init}</td>
                <td style={{padding:"5px 10px",borderBottom:`1px solid ${t.bdr}40`,color:t.tx2,fontFamily:"monospace",fontSize:12}}>{d.val}{d.unit}</td>
                <td style={{padding:"5px 10px",borderBottom:`1px solid ${t.bdr}40`,textAlign:"right",color:t.mut,fontSize:11,textTransform:"uppercase"}}>{d.pnl}</td>
                <td style={{padding:"5px 10px",borderBottom:`1px solid ${t.bdr}40`,textAlign:"right",fontFamily:"monospace",fontSize:13,color:GREEN,fontWeight:700}}>{fd(d.impact)}</td></tr>))}</tbody></table>
        {/* P&L */}
        <div style={{fontSize:12,color:t.mut,textTransform:"uppercase",letterSpacing:"1px",fontWeight:600,marginBottom:8}}>P&L Projection ($M)</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginBottom:24}}>
          <thead><tr>{["","Base","Y1","Y2","Y3","Y4","Y5"].map((h,i)=><th key={i} style={{padding:"6px 10px",borderBottom:`2px solid ${t.bdr}`,textAlign:i===0?"left":"right",color:i<=1?t.mut:t.tx,fontWeight:600}}>{h}</th>)}</tr></thead>
          <tbody>
            {[{l:"Revenue",k:"rev"},{l:"COGS",k:"cogs"},{l:"Gross Profit",k:"gp"},{l:"SG&A",k:"sga"},{l:"Impl. Cost",k:"ic"},{l:"EBITDA",k:"ebitda"},{l:"Net Income",k:"ni"}].map(r=>(
              <tr key={r.l} style={{background:r.l==="EBITDA"?GOLD+"08":"transparent"}}>
                <td style={{padding:"5px 10px",borderBottom:`1px solid ${t.bdr}40`,color:r.l==="EBITDA"?GOLD:t.tx2,fontWeight:r.l==="EBITDA"?600:400}}>{r.l}</td>
                {proj.map((p,i)=>{const v=p[r.k],base=proj[0][r.k],ch=i>0&&Math.abs(v-base)>.5;
                  return (<td key={i} style={{padding:"5px 10px",borderBottom:`1px solid ${t.bdr}40`,textAlign:"right",fontFamily:"monospace",fontSize:12,color:r.k==="ic"?(v>0?RED:t.sub):r.l==="EBITDA"?(i===0?t.mut:GOLD):ch?t.tx:t.mut,fontWeight:r.l==="EBITDA"&&i>0?700:400}}>{r.k==="ic"?(v>0?`-${fm(v)}`:"—"):fm(v)}</td>);})}</tr>))}</tbody></table>
        {/* BS */}
        <div style={{fontSize:12,color:t.mut,textTransform:"uppercase",letterSpacing:"1px",fontWeight:600,marginBottom:8}}>Balance Sheet ($M)</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginBottom:24}}>
          <thead><tr>{["","Base","Y1","Y2","Y3","Y4","Y5"].map((h,i)=><th key={i} style={{padding:"6px 10px",borderBottom:`2px solid ${t.bdr}`,textAlign:i===0?"left":"right",color:i<=1?t.mut:t.tx,fontWeight:600}}>{h}</th>)}</tr></thead>
          <tbody>
            {[{l:"Inventory",k:"inv"},{l:"Receivables",k:"recv"},{l:"Payables",k:"pay"},{l:"Cash",k:"cash"}].map(r=>(
              <tr key={r.l}><td style={{padding:"5px 10px",borderBottom:`1px solid ${t.bdr}40`,color:t.tx2}}>{r.l}</td>
                {proj.map((p,i)=>{const v=p[r.k],d=v-proj[0][r.k],good=(r.l==="Cash"||r.l==="Payables")?d>5:d<-5;
                  return (<td key={i} style={{padding:"5px 10px",borderBottom:`1px solid ${t.bdr}40`,textAlign:"right",fontFamily:"monospace",fontSize:12,color:i===0?t.mut:(good?GREEN:(Math.abs(d)>5?BLUE:t.mut)),fontWeight:Math.abs(d)>5?600:400}}>{fm(v)}</td>);})}</tr>))}
            <tr style={{background:BLUE+"06"}}><td style={{padding:"5px 10px",color:BLUE,fontWeight:600}}>Working Capital Δ</td>
              {proj.map((p,i)=>{const wc=p.inv+p.recv-p.pay,base=proj[0].inv+proj[0].recv-proj[0].pay,d=wc-base;
                return (<td key={i} style={{padding:"5px 10px",textAlign:"right",fontFamily:"monospace",fontSize:12,color:i===0?t.mut:(d<-5?GREEN:d>5?RED:t.mut),fontWeight:600}}>{i===0?fm(wc):fd(d)}</td>);})}</tr></tbody></table>
        {/* Bar */}
        <div style={{fontSize:12,color:t.mut,textTransform:"uppercase",letterSpacing:"1px",fontWeight:600,marginBottom:8}}>EBITDA by Initiative</div>
        <div style={{height:200,marginBottom:16}}>
          <ResponsiveContainer>
            <BarChart data={actInits.map(i=>{const p=cPnL(i,ov,bl);return{name:i.name.length>16?i.name.substring(0,14)+"…":i.name,value:Math.round(p.rev-p.cogs-p.sga),color:i.color};})} margin={{top:5,right:10,left:10,bottom:55}} barSize={36}>
              <XAxis dataKey="name" tick={{fill:t.tx2,fontSize:10}} angle={-25} textAnchor="end" interval={0} axisLine={{stroke:t.bdr}} tickLine={false}/>
              <YAxis tick={{fill:t.mut,fontSize:11,fontFamily:"monospace"}} axisLine={{stroke:t.bdr}} tickLine={false} tickFormatter={v=>`$${v}M`}/>
              <Tooltip contentStyle={{background:t.card,border:`1px solid ${t.bdr}`,borderRadius:8,fontSize:13,color:t.tx}} formatter={v=>[`$${v}M`,"EBITDA"]}/>
              <Bar dataKey="value" radius={[4,4,0,0]}>{actInits.map((i,idx)=><Cell key={idx} fill={i.color} fillOpacity={.75}/>)}</Bar></BarChart>
          </ResponsiveContainer></div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
          <button onClick={()=>setStep(2)} style={{background:"none",border:`1px solid ${t.bdr}`,borderRadius:10,padding:"12px 28px",color:t.tx2,cursor:"pointer",fontSize:15,fontFamily:FONT}}>← Processes</button>
          <button onClick={()=>{const n=prompt("Name:","Scenario "+(scenarios.length+1));if(n)setScns(p=>[...p,{name:n,ids:new Set(actIds),ov:{...ov},e:totalE}]);}} style={{background:GOLD,color:"#111",border:"none",borderRadius:10,padding:"12px 28px",fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>Save Scenario</button></div>
      </div>)}
      </div>
      {/* Footer */}
      <div style={{borderTop:`1px solid ${t.bdr}`,background:mode==="dark"?"#131312":"#EFEBE3",padding:"6px 24px",display:"flex",alignItems:"center",gap:10,flexShrink:0,flexWrap:"wrap"}}>
        <span style={{fontSize:11,color:t.mut,textTransform:"uppercase",letterSpacing:"1px",fontWeight:600}}>Scenarios</span>
        {scenarios.map((s,i)=><button key={i} onClick={()=>{setActIds(new Set(s.ids));setOv({...s.ov});}} style={{fontSize:12,padding:"3px 10px",borderRadius:6,background:t.card,border:`1px solid ${t.bdr}`,color:t.tx2,cursor:"pointer",fontFamily:FONT}}>{s.name} ({fd(s.e)})</button>)}
        <div style={{flex:1}}/><span style={{fontSize:11,color:t.sub}}>Prism · humaninthelead.ai</span></div>
    </div>);
}
