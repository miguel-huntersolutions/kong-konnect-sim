const CARD_DOMAINS = {
  plat:"Platform", gw:"API Gateway", ops:"APIOps", ai:"AI Gateway", ev:"Event Gateway",
  id:"Identity", portal:"Dev Portal", cat:"Catalog", meter:"Metering", obs:"Observability", org:"Organizations"
};
// h = headline, q = prompt on the front, p = key points on the back, t = exam trap
const CARDS = [
{d:"plat",h:"Hybrid mode",q:"Who runs what in Konnect hybrid mode?",p:["Kong hosts the control plane: config, UI, APIs, analytics","You run the data planes in your infrastructure","Data planes proxy traffic and execute plugins"],t:"The control plane never proxies client traffic."},
{d:"plat",h:"Control plane outage",q:"The control plane is unreachable for 2 hours. What happens to traffic?",p:["Data planes keep serving with the last cached config","Config changes arrive after reconnection","Telemetry is buffered and sent later"],t:"A brand-new node that never connected has nothing to serve."},
{d:"plat",h:"CP to DP security",q:"How do control plane and data plane trust each other?",p:["Mutual TLS on every connection","Konnect generates a DP certificate or you upload yours","Outbound 443 from the data plane"],t:"No shared passwords, no OAuth flow between planes."},
{d:"plat",h:"Deployment options",q:"Name the three ways to run data planes with Konnect.",p:["Self-managed hybrid: your VMs, K8s or Docker","Dedicated Cloud Gateways: Kong runs them in the cloud and region you pick","Serverless gateways: Kong-managed, fastest start for dev"],t:"Need private networking to a VPC and dedicated capacity? Dedicated Cloud Gateways."},
{d:"plat",h:"Control plane groups",q:"Several teams, one set of data planes. What do you use?",p:["Each team owns a member control plane","Data planes connect to the group, not the members","The group merges member configs"],t:"Conflicting entities across members cause errors."},
{d:"plat",h:"Geos",q:"What does choosing a Konnect geo mean?",p:["Config and data live in that region","Resources are not shared across geos","Switch geo from the Konnect UI"],t:"Data residency is the reason geos exist."},
{d:"plat",h:"Version compatibility",q:"Config uses a field the data plane version doesn't know. What now?",p:["Konnect flags the node as incompatible or with limitations","Upgrade the data plane or drop the unsupported config"],t:"Konnect never upgrades data planes silently."},
{d:"plat",h:"Business value",q:"Explain Konnect's value to a CIO in one line.",p:["One control layer for API, AI and event traffic","Consistent security, governance and analytics","Less operational overhead, runtimes deployed where needed"],t:"Avoid claims like guaranteed lowest latency."},
{d:"plat",h:"Kong Operator",q:"How do you manage gateways and Konnect entities as Kubernetes resources?",p:["Kong Operator with CRDs","KonnectAPIAuthConfiguration holds Konnect credentials","Evolution of Gateway Operator and Ingress Controller"],t:"decK is a CLI, not a Kubernetes controller."},

{d:"gw",h:"Service vs Route",q:"Which entity matches requests and which one points to the backend?",p:["Route: hosts, paths, methods, headers to match","Gateway Service: protocol, host, port, path of the backend","A Route sends matched traffic to its Service"],t:"Matching rules live on the Route, never on the Service."},
{d:"gw",h:"Upstreams and Targets",q:"Balance traffic across 3 replicas with weights?",p:["Create an Upstream (virtual host + load balancer)","Add one Target per replica with a weight","Set the Service host to the Upstream name"],t:"Default algorithm is round-robin."},
{d:"gw",h:"LB algorithms",q:"Which load-balancing algorithms do Upstreams support?",p:["round-robin (default)","consistent-hashing","least-connections","latency"],t:"geo-proximity or dns-priority are fake options."},
{d:"gw",h:"Active health checks",q:"How do active health checks work?",p:["Kong probes each Target on a path and interval","Marks Targets healthy or unhealthy from responses","Brings recovered Targets back automatically"],t:"Active = synthetic probes."},
{d:"gw",h:"Passive health checks",q:"What is a circuit breaker in Kong?",p:["Passive checks watch real traffic","Too many errors or timeouts mark the Target unhealthy","Traffic shifts to healthy Targets"],t:"Passive alone never marks a Target healthy again."},
{d:"gw",h:"Plugin precedence",q:"Which plugin instance wins when several match?",p:["Most specific wins, only one runs","Consumer+Route+Service at the top","Route+Service beats Consumer-only","Global is always last"],t:"Limits are never added together."},
{d:"gw",h:"Precedence drill",q:"Global 5/min, Route 50/min, Consumer+Route 500/min. Two callers?",p:["Consumer with its own instance gets 500","Any other Consumer on that Route gets 50","Requests elsewhere get 5"],t:"Read the scope before the number."},
{d:"gw",h:"Plugin phases",q:"Name the main request phases in order.",p:["certificate, rewrite, access","header_filter, body_filter, log"],t:"Only global plugins run in rewrite."},
{d:"gw",h:"Log phase",q:"Where should a logging plugin do its work?",p:["log phase, after the response is sent","No added latency for the client"],t:"Heavy work in access adds latency to every call."},
{d:"gw",h:"Static priority",q:"Why does key-auth run before rate-limiting?",p:["Each plugin has a static priority","Higher priority runs first within a phase","Auth identifies the Consumer before limits apply"],t:"Not alphabetical, not creation order."},
{d:"gw",h:"Dynamic ordering",q:"How do you force request-transformer before key-auth?",p:["ordering.before / ordering.after on the plugin","Applies to the access phase","Enterprise feature"],t:"You cannot edit priorities of bundled plugins."},
{d:"gw",h:"strip_path",q:"Route /orders, strip_path true, Service path /v1. Request /orders/42?",p:["Upstream receives /v1/42","strip_path removes the matched prefix","Remaining path is appended to the Service path"],t:"With strip_path false it would be /v1/orders/42."},
{d:"gw",h:"Regex paths",q:"How is a regex path written in the traditional router?",p:["Prefix the path with ~","Other paths are prefix matches"],t:"There is no regex: true flag."},
{d:"gw",h:"preserve_host",q:"What does preserve_host: true change?",p:["Upstream gets the client's original Host header","Default sends the Service host"],t:"It does not validate the Host."},
{d:"gw",h:"Expressions router",q:"Why use the expressions router?",p:["Logical operators && || over http fields","Explicit priority per Route","Complex matching in one rule"],t:"It still needs Services and data planes."},
{d:"gw",h:"Status codes",q:"Missing key, ACL deny, rate limit exceeded?",p:["401 missing or invalid credentials","403 authenticated but not allowed (ACL)","429 rate limit exceeded"],t:"503 is an upstream issue, not a policy."},
{d:"gw",h:"Consumer Groups",q:"Gold, Silver, Bronze tiers for hundreds of Consumers?",p:["One Consumer Group per tier","Scope rate-limiting-advanced to each group","Move Consumers between groups to change tier"],t:"One plugin per Consumer does not scale."},
{d:"gw",h:"SNIs and certificates",q:"How does Kong choose the TLS certificate to serve?",p:["SNI entities map hostnames to Certificates","Exact match, then wildcards","Falls back to the default certificate"],t:"SNI is about TLS, not upstream hosts."},
{d:"gw",h:"Vaults",q:"Keep secrets out of plugin config?",p:["Use a Vault and a reference like {vault://aws/key}","Backends: AWS, GCP, Azure, HashiCorp, Konnect Config Store, env"],t:"Resolved at runtime on the data plane."},

{d:"ops",h:"sync vs apply",q:"Which decK command deletes what is missing from the file?",p:["deck gateway sync: full declarative state, deletes extras","deck gateway apply: create and update only"],t:"Classic exam trap. sync deletes."},
{d:"ops",h:"diff",q:"How do you preview changes safely?",p:["deck gateway diff shows creates, updates, deletes","Post it on the pull request before merging"],t:"diff never changes anything."},
{d:"ops",h:"dump",q:"How do you export live config to YAML?",p:["deck gateway dump -o kong.yaml","Backups, migrations, GitOps bootstrap"],t:"dump reads, sync writes."},
{d:"ops",h:"openapi2kong",q:"OpenAPI spec to Kong config?",p:["deck file openapi2kong -s openapi.yaml","Generates Services and Routes","Then patch, add-plugins, merge"],t:"kong2kic is for Kubernetes manifests."},
{d:"ops",h:"select_tags",q:"Team A must not touch Team B's entities in one control plane?",p:["_info.select_tags in the state file","sync, diff and dump only see tagged entities"],t:"No need for separate organizations."},
{d:"ops",h:"Konnect flags",q:"Point decK at a Konnect control plane?",p:["--konnect-token","--konnect-control-plane-name","--konnect-addr for the regional endpoint"],t:"--workspace is for self-managed Enterprise."},
{d:"ops",h:"PAT vs system account",q:"Which token for a CI pipeline?",p:["System account access token, scoped by roles","Not tied to a person, survives staff changes","PATs act as the user and die with the user"],t:"Never put a personal token in CI."},
{d:"ops",h:"lint",q:"Enforce governance rules on files in CI?",p:["deck file lint with a ruleset","Runs offline, before any deploy"],t:"lint checks rules, ping checks connectivity."},
{d:"ops",h:"APIOps pipeline",q:"Order the steps of an APIOps pipeline.",p:["openapi2kong","patch / add-plugins","merge","diff on the PR","sync after merge"],t:"sync comes last, after review."},
{d:"ops",h:"Terraform",q:"Which provider manages Konnect as code?",p:["kong/konnect","Control planes, entities, portals, teams"],t:"There is no hashicorp/kong provider for Konnect."},

{d:"ai",h:"AI Proxy",q:"One LLM provider behind a standard API?",p:["AI Proxy translates requests to the chosen provider","Injects provider credentials at the gateway","Apps never hold provider keys"],t:"One target only."},
{d:"ai",h:"AI Proxy Advanced",q:"Several models with load balancing and failover?",p:["Multiple targets","round-robin, lowest-latency, lowest-usage, consistent-hashing, priority, semantic","Fallback on errors or 429"],t:"Semantic routing picks a model by prompt meaning."},
{d:"ai",h:"Prompt Guard vs Semantic Guard",q:"Regex rules or meaning-based blocking?",p:["AI Prompt Guard: regex allow/deny lists","AI Semantic Prompt Guard: embeddings, catches rewording"],t:"Rephrased jailbreaks beat regex, not semantics."},
{d:"ai",h:"Semantic Cache",q:"What does AI Semantic Cache need?",p:["An embeddings model","A vector database such as Redis","Returns cached answers for similar prompts"],t:"Not a byte-by-byte HTTP cache."},
{d:"ai",h:"Token limits",q:"Cap LLM spend per team by tokens?",p:["AI Rate Limiting Advanced","Counts prompt and completion tokens or cost","Per provider and window"],t:"Plain rate-limiting counts requests only."},
{d:"ai",h:"Decorator vs Template",q:"Inject a system message vs allow only approved prompts?",p:["AI Prompt Decorator: prepend or append messages","AI Prompt Template: named templates with {{variables}}"],t:"Decorator adds, Template restricts."},
{d:"ai",h:"AI Sanitizer",q:"Remove PII before the prompt leaves the company?",p:["AI Sanitizer redacts or anonymizes PII","Can restore values in the response"],t:"Prompt Guard blocks, Sanitizer rewrites."},
{d:"ai",h:"MCP",q:"Let agents call existing REST APIs as tools?",p:["AI MCP Proxy exposes and governs MCP traffic","Kong handles auth and policies for agents"],t:"MCP is about agent tools, not model routing."},
{d:"ai",h:"AI observability",q:"Where do you see tokens and cost per model?",p:["Konnect Analytics with AI metrics","Collected by the data planes"],t:"Not in the Dev Portal or Catalog."},

{d:"ev",h:"Event Gateway",q:"What is Kong Event Gateway?",p:["Kafka protocol-aware proxy","Applies security and governance to Kafka traffic","Clients keep standard Kafka clients"],t:"It does not replace brokers."},
{d:"ev",h:"Virtual clusters",q:"Many teams, one physical Kafka cluster, isolated namespaces?",p:["Virtual clusters on top of a backend cluster","Topic namespacing and separate auth per team"],t:"Backend cluster = the real Kafka."},
{d:"ev",h:"Event policies",q:"Encrypt a sensitive field without touching producers?",p:["Encryption policy on Event Gateway","Records or fields encrypted in flight"],t:"AI Sanitizer is for HTTP LLM traffic."},

{d:"id",h:"Kong Identity",q:"What is Kong Identity?",p:["Konnect-hosted OAuth 2.0 authorization server","Auth servers, clients, scopes, claims","Mainly machine-to-machine"],t:"It is not employee SSO for Konnect."},
{d:"id",h:"M2M grant",q:"Backend job, no user present. Which grant?",p:["Client credentials","Gateway validates the token with OpenID Connect"],t:"Implicit and password grants are legacy."},
{d:"id",h:"Scopes",q:"Why define scopes?",p:["Encode what a token allows","Gateway requires scopes per Route or Service"],t:"Scopes are permissions, not rate limits."},

{d:"portal",h:"Dev Portal",q:"What does the Dev Portal do?",p:["Publish APIs with specs and docs","Developer sign-up and approval","Applications to get credentials"],t:"Docs come from the attached OpenAPI spec."},
{d:"portal",h:"Auth strategies",q:"How do portal apps authenticate?",p:["Key auth","OpenID Connect","DCR creates clients in Okta, Auth0, Azure, Curity"],t:"No basic auth, no SAML for API clients."},
{d:"portal",h:"Visibility",q:"Partner-only API in the portal?",p:["Private visibility","Manual developer approval","Developer SSO with OIDC or SAML"],t:"Hiding the link is not access control."},

{d:"cat",h:"Catalog",q:"What is the Konnect Catalog?",p:["Inventory of services and APIs with owners","Integrations: GitHub, GitLab, PagerDuty, Datadog","Scorecards measure standards"],t:"Use scorecards to find services without specs or owners."},

{d:"meter",h:"Metering & Billing",q:"Charge customers per API call or AI token?",p:["Meters aggregate usage events: count, sum, unique","Plans and entitlements define tiers","Invoices through Stripe and similar"],t:"Rate limiting caps usage, metering charges for it."},

{d:"obs",h:"Debugger",q:"Which phase or plugin is slow on one Route?",p:["Active tracing / Debugger session on the data plane","Per-request spans with plugin timings"],t:"Analytics shows aggregates, Debugger shows single requests."},
{d:"obs",h:"Latency split",q:"High upstream latency, low Kong latency?",p:["The backend is slow","Kong latency = gateway work, mostly plugins"],t:"Don't blame the gateway for upstream time."},
{d:"obs",h:"Explorer vs Dashboards",q:"Ad hoc query by Route and Consumer?",p:["Explorer for ad hoc analysis","Dashboards and reports to save and share"],t:"Data comes from data plane telemetry."},
{d:"obs",h:"Export metrics",q:"Prometheus or OpenTelemetry?",p:["Prometheus plugin: metrics for scraping","OpenTelemetry plugin: traces and logs over OTLP"],t:"Correlation ID only adds a header."},
{d:"obs",h:"Out of sync",q:"A node shows out of sync. First step?",p:["Check data plane logs","Check outbound connectivity to CP and telemetry endpoints","Check certificates and version compatibility"],t:"Start at the node, not the portal."},

{d:"org",h:"Teams and roles",q:"Contractor edits one control plane only?",p:["Role scoped to that control plane","Assign through a team for scale","Least privilege"],t:"Never share admin tokens."},
{d:"org",h:"Org SSO and audit",q:"Corporate login and change history to SIEM?",p:["Konnect SSO with OIDC or SAML, IdP groups to teams","Audit logs to a SIEM webhook"],t:"Organization Admin has full access. Keep it small."}
];
