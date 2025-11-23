# Cloud Build Cost Analysis

## Free Tier Limits

Google Cloud Build offers a **generous free tier**:
- **2,500 build-minutes per month** for default machine type (`e2-standard-2`)
- **Default machine type**: `e2-standard-2` (2 vCPU, 8 GB RAM)
- **Free tier applies to**: Standard machine types only

## Machine Type Comparison

### Default (`e2-standard-2`) - FREE ✅
- **Specs**: 2 vCPU, 8 GB RAM
- **Free tier**: 2,500 build-minutes/month
- **Cost after free tier**: $0.003 per build-minute
- **Best for**: Most builds, including Python Docker images
- **Your use case**: ✅ Perfect for your Python agent builds

### E2_HIGHCPU_8 - PAID ❌
- **Specs**: 8 vCPU, 8 GB RAM
- **Free tier**: ❌ NOT included
- **Cost**: ~$0.012 per build-minute (4x more expensive)
- **Best for**: Very large/complex builds, parallel compilation
- **Your use case**: ❌ Overkill for Python Docker builds

## Why Default is Better for Your Project

### Your Build Process
1. Install Python dependencies (`pip install`)
2. Copy Python files
3. Build Docker image

**This is NOT CPU-intensive:**
- Python package installation is I/O bound (downloading from PyPI)
- Docker image building is mostly file copying
- No compilation, no parallel builds needed

### Build Time Comparison

**Default (`e2-standard-2`):**
- Typical build time: 2-5 minutes
- Free tier allows: ~500-1,250 builds/month ✅

**E2_HIGHCPU_8:**
- Typical build time: 1-3 minutes (slightly faster)
- Cost: ~$0.012-0.036 per build ❌
- No free tier benefit

**Verdict**: The time saved doesn't justify the cost!

## Cost Scenarios

### Using Default Machine Type (Recommended)

**Light usage** (10 builds/month):
- Build time: ~3 minutes each = 30 minutes total
- Cost: **$0.00** ✅ (well within 2,500 free minutes)

**Moderate usage** (50 builds/month):
- Build time: ~3 minutes each = 150 minutes total
- Cost: **$0.00** ✅ (well within 2,500 free minutes)

**Heavy usage** (200 builds/month):
- Build time: ~3 minutes each = 600 minutes total
- Cost: **$0.00** ✅ (still within 2,500 free minutes)

**Very heavy usage** (1,000 builds/month):
- Build time: ~3 minutes each = 3,000 minutes total
- Overage: 500 minutes
- Cost: ~$1.50/month (500 × $0.003)

### Using E2_HIGHCPU_8 (Not Recommended)

**Any usage**:
- Cost: ~$0.012 per build-minute
- 10 builds (30 minutes): ~$0.36/month ❌
- 50 builds (150 minutes): ~$1.80/month ❌
- 200 builds (600 minutes): ~$7.20/month ❌

## Recommendation

**Remove the `machineType` setting** to use the default:

```yaml
options:
  logging: CLOUD_LOGGING_ONLY
  # machineType removed - uses default e2-standard-2 (FREE)
```

**Benefits:**
- ✅ Stays within free tier (2,500 minutes/month)
- ✅ Sufficient for Python Docker builds
- ✅ No additional costs
- ✅ Builds complete in 2-5 minutes (acceptable for CI/CD)

**When to use E2_HIGHCPU_8:**
- Building very large C++ projects
- Compiling multiple languages in parallel
- Building multiple Docker images simultaneously
- When build time is critical and you're willing to pay

## Summary

**Question**: Is `E2_HIGHCPU_8` necessary?

**Answer**: ❌ **No!** 

- Your Python Docker builds don't need high CPU
- Default machine type is FREE (2,500 minutes/month)
- E2_HIGHCPU_8 costs money and provides minimal benefit
- **Recommendation**: Remove `machineType` setting to use default

**Will you stay in free tier?**

- ✅ **Yes**, if you use default machine type
- ❌ **No**, if you use E2_HIGHCPU_8 (costs from first build)

