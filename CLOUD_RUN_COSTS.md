# Cloud Run Cost Analysis

## Free Tier Limits (Per Month)

Google Cloud Run offers a generous **free tier** that should cover most small to medium workloads:

- **2 million requests** per month
- **180,000 vCPU-seconds** (50 hours of 1 vCPU, or 25 hours of 2 vCPU)
- **360,000 GiB-seconds** (100 hours of 1 GiB, or 50 hours of 2 GiB)
- **1 GB network egress** from North America

## Current Configuration

Your Cloud Run service is configured with:
- **Memory**: 2 GiB
- **CPU**: 2 vCPU
- **Min instances**: 0 (scales to zero when idle) ✅
- **Max instances**: 10
- **Region**: `us-central1` (eligible for free tier) ✅

## Cost Calculation

### Within Free Tier (Most Likely Scenario)

If your usage stays within free tier limits, **cost = $0.00/month**

**Example usage that stays free:**
- ~1,000 requests/day = ~30,000/month ✅ (well under 2M limit)
- Each request uses ~10 seconds of compute
- Total: ~300,000 seconds = ~83 hours
- With 2 vCPU: 83 × 2 = 166 vCPU-hours = 597,600 vCPU-seconds ✅ (under 180,000 limit)
- Memory: 83 × 2 GiB = 166 GiB-hours = 597,600 GiB-seconds ❌ (exceeds 360,000 limit)

**More realistic free tier usage:**
- ~500 requests/day = ~15,000/month ✅
- Each request uses ~5 seconds
- Total: ~75 hours/month
- With 2 vCPU: 75 × 2 = 150 vCPU-hours = 540,000 vCPU-seconds ❌ (exceeds limit)
- **Better**: Use 1 vCPU instead of 2 for most requests

### If You Exceed Free Tier

**Pricing (after free tier):**
- **vCPU**: $0.00002400 per vCPU-second ($0.0864 per vCPU-hour)
- **Memory**: $0.00000250 per GiB-second ($0.009 per GiB-hour)
- **Requests**: $0.40 per million requests

**Example overage costs:**
- 100,000 extra vCPU-seconds: ~$2.40
- 50,000 extra GiB-seconds: ~$0.13
- 100,000 extra requests: ~$0.04

## Cost Optimization Recommendations

### 1. Reduce Memory (Recommended)
Change from 2 GiB to **1 GiB** - Python FastAPI apps typically don't need 2 GiB:

```yaml
--memory 1Gi  # Instead of 2Gi
```

**Benefits:**
- Doubles your free tier memory allowance (from 50 hours to 100 hours)
- Reduces costs if you exceed free tier
- Usually sufficient for Python agents

### 2. Reduce CPU (Optional)
Change from 2 vCPU to **1 vCPU** for most workloads:

```yaml
--cpu 1  # Instead of 2
```

**Benefits:**
- Doubles your free tier vCPU allowance (from 25 hours to 50 hours)
- Reduces costs significantly if you exceed free tier
- Most AI API calls are I/O bound, not CPU bound

### 3. Keep Min Instances at 0 ✅
Your current config already has `--min-instances 0`, which is perfect:
- Service scales to zero when not in use
- No charges when idle
- Only pay for actual request processing time

### 4. Monitor Usage
Set up billing alerts in Google Cloud Console:
1. Go to **Billing** → **Budgets & alerts**
2. Create a budget (e.g., $5/month)
3. Get email alerts at 50%, 90%, 100%

## Estimated Monthly Costs

### Scenario 1: Light Usage (Free Tier)
- **Requests**: 10,000/month
- **Compute**: ~20 hours/month (1 vCPU, 1 GiB)
- **Cost**: **$0.00** ✅

### Scenario 2: Moderate Usage (Free Tier)
- **Requests**: 50,000/month
- **Compute**: ~100 hours/month (1 vCPU, 1 GiB)
- **Cost**: **$0.00** ✅

### Scenario 3: Heavy Usage (Some Overage)
- **Requests**: 200,000/month
- **Compute**: ~200 hours/month (1 vCPU, 1 GiB)
- **Overage**: ~20 hours beyond free tier
- **Cost**: ~$1.73/month (mostly vCPU overage)

### Scenario 4: Current Config (2 vCPU, 2 GiB) - Heavy Usage
- **Requests**: 200,000/month
- **Compute**: ~200 hours/month
- **Overage**: Significant (exceeds free tier quickly)
- **Cost**: ~$6-10/month

## Recommended Configuration for Cost Optimization

Update your Cloud Run deployment to use less resources:

```yaml
--memory 1Gi      # Reduced from 2Gi
--cpu 1           # Reduced from 2
--min-instances 0 # Keep at 0 (already set)
--max-instances 5 # Reduced from 10 (unless you need high concurrency)
```

This configuration will:
- ✅ Stay within free tier for most use cases
- ✅ Reduce costs if you exceed free tier
- ✅ Still handle moderate traffic efficiently
- ✅ Scale to zero when idle

## Additional Costs to Consider

### 1. Container Registry (GCR)
- **Free**: 0.5 GB storage per month
- **Overage**: $0.026 per GB/month
- Your Docker images are likely < 500 MB, so **free** ✅

### 2. Network Egress
- **Free**: 1 GB/month from North America
- **Overage**: $0.12 per GB
- API responses are small, so **likely free** ✅

### 3. Google AI Studio API
- **Free**: Using `gemini-2.0-flash-exp` (unlimited tokens in free tier)
- **Cost**: $0.00 ✅

## Summary

**Will running agents in Cloud Run cost money?**

- **Short answer**: Probably not, if you optimize the configuration
- **With current config (2 vCPU, 2 GiB)**: May incur small costs (~$2-10/month) with moderate-heavy usage
- **With optimized config (1 vCPU, 1 GiB)**: Likely **$0.00/month** for most use cases

**Recommendation**: Update the configuration to use 1 vCPU and 1 GiB memory to maximize free tier usage and minimize costs.

