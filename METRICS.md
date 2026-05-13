# Metrics

## North Star

The North Star metric is **qualified high-savings reports created per week**.

This is better than DAU or page views because ModelMeter is not a daily-use product. The business value is in identifying teams with enough AI spend pain that Credex follow-up makes sense. A completed audit with `$0` savings can still be useful, but it is less valuable to Credex than a saved report showing `$500+/month` in modeled savings.

## Input Metrics

1. **Audit completion rate**  
   Measures whether the form is clear enough for a cold visitor to finish.

2. **Lead capture rate after report view**  
   Measures whether the report creates enough trust for the user to leave an email after seeing value.

3. **High-savings consultation click rate**  
   Measures whether Credex placement is compelling for the cases where Credex is most relevant.

## Instrument First

I would instrument:

- audit started
- audit completed
- report viewed
- PDF downloaded
- share link copied
- lead submitted
- email sent/skipped/failed
- Credex CTA clicked

These events are enough to debug the funnel without building a full analytics stack.

## Pivot Threshold

If 200 completed audits produce fewer than 10 leads, the report is not trusted or the capture offer is weak. If high-savings reports produce fewer than 5% Credex CTA clicks, the product may be identifying savings but failing to connect those savings to Credex's value proposition. If fewer than 30% of visitors who start the form complete it, the input flow is too long or unclear.
