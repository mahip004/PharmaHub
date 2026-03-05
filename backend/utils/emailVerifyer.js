const dns = require("dns");
const { promisify } = require("util");

const resolveMxAsync = promisify(dns.resolveMx);

/**
 * Verify if an email has a valid mail server (MX record check).
 * @param {string} email - The email to verify.
 * @returns {Promise<boolean>} - True if valid, False if invalid.
 */


const verifyEmailDNS = async (email) => {
  try {
    const domain = email.split("@")[1]; // Extract domain (e.g., gmail.com)
    const addresses = await resolveMxAsync(domain);

    if (!addresses || addresses.length === 0) {
      console.log(`❌ Invalid Email Domain: ${domain}`);
      return false;
    }

    console.log(`✅ Valid Email Domain: ${domain}`);
    return true;
  } catch (error) {
    console.log(`❌ Error verifying domain: ${error.message}`);
    return false;
  }
};

module.exports = { verifyEmailDNS };
