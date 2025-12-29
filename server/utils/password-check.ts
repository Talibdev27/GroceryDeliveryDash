import crypto from "crypto";

/**
 * Check if a password has been exposed in data breaches using Have I Been Pwned API
 * Uses k-anonymity model for privacy (only sends first 5 chars of SHA-1 hash)
 * 
 * @param password - The password to check
 * @returns Promise<boolean> - true if password is found in breach database, false otherwise
 */
export async function checkPasswordBreach(password: string): Promise<boolean> {
  try {
    // SHA-1 hash the password
    const sha1 = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
    const prefix = sha1.substring(0, 5);
    const suffix = sha1.substring(5);

    // Query HIBP API (k-anonymity model - safe! Only sends first 5 chars)
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        "User-Agent": "DiyorMarket-Security-Check/1.0",
      },
    });

    if (!response.ok) {
      // If API fails, don't block registration (graceful degradation)
      console.warn("Password breach check API unavailable, allowing registration");
      return false;
    }

    const text = await response.text();

    // Check if our hash suffix appears in results
    // Format: SUFFIX:COUNT (e.g., "0018A45C4D1DEF81644B54AB7F969B88D65:123456")
    const lines = text.split("\n");
    const isBreached = lines.some((line) => {
      const [hashSuffix] = line.split(":");
      return hashSuffix === suffix;
    });

    return isBreached;
  } catch (error) {
    // Don't block registration if API fails (graceful degradation)
    console.error("Password breach check failed:", error);
    return false;
  }
}

/**
 * Validate password strength and check for breaches
 * @param password - The password to validate
 * @returns Promise<{ isValid: boolean; error?: string }>
 */
export async function validatePasswordSecurity(
  password: string
): Promise<{ isValid: boolean; error?: string }> {
  // Check if password is breached
  const isBreached = await checkPasswordBreach(password);

  if (isBreached) {
    return {
      isValid: false,
      error:
        "This password has been exposed in data breaches. Please choose a different, more secure password.",
    };
  }

  return { isValid: true };
}

