# Lessons Learned & QA Audit Findings

## Overview
Based on the QA verification process aligned with ISO/IEC 25010 standards, multiple edge cases in the core logic of the Daily Fortune app were audited and remediated.

## 1. Lunar Calendar Leap Month (윤달) Bug
**File:** `src/sajuCalculator.js`
**Line:** 156
**Characteristic:** Functional Suitability (Accuracy) & Usability
**Severity:** HIGH

**Issue:** 
The `lunar-javascript` library returns a negative number to indicate a leap month (e.g., `-2` for 윤2월). The previous logic mapped this directly to the UI, resulting in invalid unformatted strings like `-2월` instead of `윤2월`. Additionally, the `isLeapMonth` check was simplified as `x !== x`, causing it to consistently fail and return `false`.

**Fix:**
Implemented an absolute value wrapper `Math.abs(lunarMonthRaw)` for calculation values and correctly parsed the negative flag `lunarMonthRaw < 0` to append the '윤' (Leap) prefix dynamically within the `displayKo` and `displayEn` strings.

## 2. Attendance Streak Logic Gap
**File:** `src/attendance.js`
**Line:** 37
**Characteristic:** Reliability (Maturity)
**Severity:** MEDIUM

**Issue:**
The `calculateStreak()` function started iterating backward from the current date. If a user loaded the page and the function was called *before* they officially "checked in" for the day, their entire hard-earned streak from yesterday would temporarily compute to `0` because today's record was momentarily empty.

**Fix:**
Refactored the `calculateStreak()` algorithm to conditionally step back one day if `today` is lacking an entry. This guarantees the streak accurately reflects the user's ongoing consecutive days (up to yesterday), instead of punishing them with a reset just because they haven't physically engaged with the daily check-in UI element yet.
