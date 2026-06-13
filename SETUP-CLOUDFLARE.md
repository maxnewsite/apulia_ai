# Hardening apulia.ai against cost blow-ups

Goal: stop a hostile crawler / DDoS / scraper from running up your Cloud Run
bill. Five concrete things to do, in order of payoff.

> Cloud Run autoscaling is already capped at **3 instances** in
> `scripts/deploy-landing.sh` (`--max-instances 3 --concurrency 80`).
> Worst case ≈ 240 simultaneous requests before backpressure.
> Pin lower (`--max-instances 1`) during the launch week if you want
> to be extra paranoid.

---

## 1. Set a GCP billing budget (5 min)

Your circuit breaker. Won't stop an attack but you'll know within the hour.

1. Open https://console.cloud.google.com/billing/budgets
2. **Create budget**
   - Name: `apulia.ai cap`
   - Scope → Projects: `apuliaai`
   - Amount: **€50/month** (adjust as you grow)
   - Alerts at **50% / 90% / 100%**
   - Send to `max@kalym.me`

Or via CLI:

```bash
BILLING_ACCT=$(gcloud billing projects describe apuliaai \
  --format='value(billingAccountName)' | sed 's|.*/||')

gcloud billing budgets create \
  --billing-account="${BILLING_ACCT}" \
  --display-name="apulia.ai cap" \
  --budget-amount=50EUR \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100
```

---

## 2. Put Cloudflare in front of Cloud Run (30 min)

Biggest single win. Free plan gives you DDoS protection, bot challenge,
rate limiting, static-asset caching, and lets you hide your Cloud Run URL.

### 2a. Register apulia.ai on Cloudflare

1. https://dash.cloudflare.com → **Add a site** → `apulia.ai` → Free plan
2. Cloudflare gives you 2 nameservers (e.g. `dora.ns.cloudflare.com`,
   `pete.ns.cloudflare.com`)
3. At your domain registrar (wherever you bought apulia.ai), replace the
   current nameservers with Cloudflare's two. Propagation: 5 min – 24 h.
4. Cloudflare will email you when active.

### 2b. Map apulia.ai → Cloud Run

```bash
gcloud run domain-mappings create \
  --service apulia-landing \
  --domain apulia.ai \
  --region europe-west1
```

This prints DNS records you need to add. Typically a few `A` / `AAAA`
records and one `CNAME` for `www.apulia.ai`.

In Cloudflare:

1. **DNS → Records → Add** each record exactly as Cloud Run printed
2. **Set the proxy to ON (orange cloud)** for the apex `apulia.ai`
   and the `www` CNAME. That's the toggle that puts Cloudflare in front.
3. Wait for the green check next to your record (~1 min).

### 2c. Force HTTPS and modern TLS

- **SSL/TLS → Overview → Full (strict)**
- **SSL/TLS → Edge Certificates → Always Use HTTPS: ON**
- **SSL/TLS → Edge Certificates → Minimum TLS Version: TLS 1.2**

### 2d. Cache the static assets

- **Caching → Configuration → Browser Cache TTL: 4 hours**
- **Rules → Cache Rules → Create rule**
  - When: `(http.request.uri.path matches "^/_next/static/.*") or (http.request.uri.path matches "\\.(webp|jpg|png|svg|woff2|css|js)$")`
  - Then: **Eligible for cache** + **Edge TTL: 30 days**

This means Cloudflare serves your fonts/images/JS without ever hitting
Cloud Run. Expected savings on a normal traffic month: 70%+ of requests.

---

## 3. Rate-limit /api/subscribe at the Cloudflare edge (10 min)

This is the most abuse-prone endpoint (DB write + Zepto API call).

1. **Security → WAF → Rate limiting rules → Create rule**
   - Name: `subscribe-flood-guard`
   - When incoming requests match:
     - Field: URI Path
     - Operator: equals
     - Value: `/api/subscribe`
   - Then: **Block** for **1 hour**
   - With:
     - **10 requests per IP per 1 hour** (tune to taste)
   - Save

The free plan gives you one rate-limit rule. Use it on `/api/subscribe`.
If you ever outgrow it, the Pro plan ($20/mo) adds more.

Optional, also free: **Security → Bots → Bot Fight Mode: ON**. Blocks the
worst scrapers without challenging real users.

---

## 4. Lock down Cloud Run so only Cloudflare can reach it

Right now anyone with the random `apulia-landing-…run.app` URL bypasses
Cloudflare. Two ways to fix:

### Option A — Easiest: trust Cloudflare's IP ranges in Cloud Armor

Skip if you don't already use a Global Load Balancer (most people).

### Option B — Cheapest & simplest: check the Cloudflare header at the app

Cloudflare adds a header `cf-connecting-ip` to every request it proxies.
Add a tiny check in the Next.js middleware so direct-to-Cloud-Run requests
are rejected. Tell me if you want me to wire this — ~20 lines of code.

Until then, the `run.app` URL stays public. Realistically attackers won't
find it for months after you publish `apulia.ai`, so this is "later" not
"emergency."

---

## 5. Cap the external APIs (5 min)

Cloud Run isn't your only cost vector — the external services it calls are.

### Anthropic (Claude API)

https://console.anthropic.com → **Settings → Limits**

- **Monthly budget: $20** (the weekly pipeline costs cents; anything above
  this means something's wrong)
- Email alert at 80%

### Zepto

Already pre-paid credits ✅ — natural cap.
**Don't turn on Auto Top-up** until you have steady traffic; right now if
something glitches and tries to send 1M emails, you want it to hit the
zero-credits wall, not auto-refill from your card.

### Supabase

Free tier has hard ceilings (500 MB DB, 5 GB egress, 50k auth users) —
you'll get warning emails before it bills you. Don't enable the Pro plan
until you actually need it.

---

## Checklist

- [ ] GCP budget alert at €50/mo with 3 thresholds
- [ ] Cloudflare proxying apulia.ai (orange cloud ON)
- [ ] HTTPS forced, TLS 1.2 min
- [ ] Cache rule for `/_next/static/*` and image extensions
- [ ] Rate-limit rule on `/api/subscribe` (10/hr/IP)
- [ ] Bot Fight Mode ON
- [ ] Anthropic monthly cap $20
- [ ] Zepto Auto Top-up OFF (default)
- [ ] (Later) Cloud Run header check so the run.app URL stops working

After this is done, the realistic worst-case bill for a sustained attack
is **bounded by your €50 budget**, and your real concern shifts from
"will I get a five-figure bill" to "is Cloudflare's free tier enough"
(it almost always is for a newsletter).
