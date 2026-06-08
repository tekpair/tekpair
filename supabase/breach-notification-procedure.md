# Tekpair — Internal Data Breach Notification Procedure

**Effective:** June 8, 2026  
**Owner:** Connor (Tekpair, Cohoes, NY · Capital Region)  
**Legal basis:** NY SHIELD Act (N.Y. Gen. Bus. Law § 899-bb) · NY GBL § 899-aa

This document is internal and not published on the website.

---

## 1. What Counts as a Breach

A "breach of the security of the system" under NY law means unauthorized acquisition of, or access to, **private information** of a New York resident where such acquisition or access is reasonably believed to have occurred.

**Private information Tekpair holds:**
- Email addresses combined with passwords (Supabase auth)
- Names combined with financial account or payment information
- Full names combined with phone numbers or home addresses (booking records)

**Triggers that require activating this procedure:**
- Unauthorized access to the Supabase database or admin panel
- Supabase reports a breach or data exposure
- A third-party service (Square, Resend, etc.) notifies you of a breach involving your customers' data
- You discover credentials or booking records posted or accessible outside of Tekpair systems
- GitHub repository exposure of live secrets or database credentials

---

## 2. Immediate Response Steps (Day 1)

1. **Stop the bleed.** Change all compromised credentials immediately:
   - Supabase service role key and anon key (invalidate + rotate in Supabase dashboard)
   - Supabase admin login password
   - GitHub access tokens if repo secrets were exposed
   - Square API keys if applicable

2. **Document what happened.** Write down:
   - Date and time you discovered the breach
   - How you discovered it
   - What data was potentially accessed (which fields, which users)
   - Estimated number of affected users
   - Whether the breach is ongoing or contained

3. **Contain access.** If the breach is ongoing (e.g., active unauthorized session):
   - Disable affected Supabase project if necessary
   - Revoke active sessions via Supabase Auth dashboard

4. **Preserve evidence.** Do not delete logs. Screenshot or export Supabase logs, access logs, and any relevant data before taking remediation actions that might clear them.

---

## 3. Assessment (Days 1–3)

Answer these questions to determine notification requirements:

| Question | If YES |
|---|---|
| Was private information (as defined above) accessed? | Notification required |
| Was access unauthorized? | Notification required |
| Is the data encrypted and the encryption key uncompromised? | Notification may not be required — consult a NY attorney |
| Fewer than 500 NY residents affected? | AG notice still required but can be simplified |
| More than 500 NY residents affected? | Expedited notification recommended |

---

## 4. Notification Timeline

**30 days from discovery** — hard deadline under NY law.

| Day | Action |
|---|---|
| Day 1 | Contain breach; begin documentation |
| Days 1–5 | Assess scope and affected users |
| Days 5–10 | Draft customer notification email |
| Days 10–20 | Send customer notifications; prepare agency notices |
| Days 20–30 | Submit all agency notices; confirm delivery |

---

## 5. Who to Notify

### A. Affected Customers (required)

Notify every customer whose private information was, or is reasonably believed to have been, acquired by an unauthorized person.

**Method:** Email from connor@tekpair.com  
**Required content:**
- What happened (plain language description)
- What information was involved
- What steps Tekpair is taking
- What customers can do to protect themselves (e.g., change password, monitor accounts)
- How to contact Tekpair with questions: connor@tekpair.com / (518) 279-6823

### B. New York Attorney General (required)

**Online portal:** https://ag.ny.gov/resources/organizations/data-breach-reporting  
**What to include:**
- Business name and contact information
- Date breach was discovered
- Nature of the breach
- Type of private information involved
- Number of NY residents affected (estimate is acceptable)
- Steps taken to contain and notify

### C. New York State Police (required)

**Contact:** https://www.troopers.ny.gov/  
Submit written notice — call the local SP barracks or submit via their website.

### D. New York Department of State / Division of Consumer Protection (required)

**Online portal:** https://dos.ny.gov/consumer-protection  
Submit notice of breach and remediation steps.

### E. Consumer Reporting Agencies (if 5,000+ NY residents affected)

If more than 5,000 NY residents are affected, you must also notify the major consumer reporting agencies (Equifax, Experian, TransUnion) without unreasonable delay.

*This threshold is very unlikely for Tekpair but documented for completeness.*

---

## 6. Customer Notification — Template

Subject: **Important Notice: Tekpair Security Incident**

> Dear [Customer Name],
>
> I'm writing to inform you of a security incident that may have affected your information stored with Tekpair.
>
> **What happened:** [Brief description — e.g., "On [date], we discovered unauthorized access to our booking database."]
>
> **What information was involved:** [e.g., "Names, email addresses, and phone numbers stored in booking records."]
>
> **What we did:** We immediately [contained the breach by…]. We have [rotated credentials / disabled access / etc.].
>
> **What you should do:** We recommend you [change your Tekpair account password / monitor your email for suspicious activity / etc.].
>
> I sincerely apologize for this incident. If you have any questions, please contact me directly at connor@tekpair.com or (518) 279-6823.
>
> — Connor  
> Tekpair · Cohoes, NY · Capital Region

---

## 7. Post-Incident Documentation

After the incident is resolved, record the following and keep on file for at least 3 years:

- [ ] Date of discovery
- [ ] Date breach was contained
- [ ] Number of affected users
- [ ] What private information was exposed
- [ ] Root cause
- [ ] Remediation steps taken
- [ ] Date customer notifications were sent
- [ ] Date agency notices were submitted
- [ ] Copies of all notifications sent
- [ ] Any changes made to prevent recurrence

---

## 8. Prevention Checklist

Review annually and after any incident:

- [ ] Supabase service role key is never exposed in client-side code
- [ ] GitHub repository does not contain live secrets (use environment variables)
- [ ] Supabase RLS (Row Level Security) is enabled on all tables
- [ ] Admin panel is password-protected and not publicly indexed
- [ ] Microsoft Clarity masking is enabled on all sensitive form fields
- [ ] Square API keys are rotated periodically
- [ ] Supabase anon key is rotated if exposed

---

*Last reviewed: June 8, 2026*
