const STATUS_CODES = {
  STATUS_EMAIL_OK: "email containing OTP has been sent successfully.",
  STATUS_EMAIL_FAIL:
    "email address does not exist or sending to the email has failed.",
  STATUS_EMAIL_INVALID: "email address is invalid.",
  STATUS_NO_OTP: "no OTP is generated",
  STATUS_OTP_OK: "OTP is valid and checked",
  STATUS_OTP_FAIL: "OTP is wrong after 10 tries",
  STATUS_OTP_TIMEOUT: "timeout after 1 min",
};
class Email_OTP_Module {
  constructor() {
    this.otp = null;
    // allow main domain and subdomains
    this.allowedDomains = [/^([\w-]+\.)?dso\.org\.sg$/];
    this.timeout = 60000;
    this.maxAttempts = 10;
  }

  _generateNumericOTP(length) {
    const digits = "0123456789";
    let otp = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      otp += digits[randomIndex];
    }

    return otp;
  }

  _checkEmail(email) {
    if (!email) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    const [user, emailDomain] = email.split("@");
    for (const allowedDomains of this.allowedDomains) {
      if (allowedDomains.test(emailDomain)) {
        return true;
      }
    }
    // email does not match allowed domains
    return false;
  }

  _generateEmailBody = (otp) => {
    return `Your OTP is ${otp}. The code is valid for 1 minute`;
  };

  async generate_OTP_email(user_email) {
    if (!this._checkEmail(user_email)) {
      return STATUS_CODES.STATUS_EMAIL_INVALID;
    }

    try {
      this.otp = this._generateNumericOTP(6);
      const user_body = this._generateEmailBody(this.otp);
      await this.send_email(user_email, user_body);
      return STATUS_CODES.STATUS_EMAIL_OK;
    } catch (error) {
      return STATUS_CODES.STATUS_EMAIL_FAIL;
    }
  }

  async send_email(user_email, user_body) {
    // assumed already implemented. Left blank
  }

  async check_OTP(input) {
    if (!this.otp) {
      return STATUS_CODES.STATUS_NO_OTP;
    }

    let timeoutId;

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        clearTimeout(timeoutId);
        reject("Timeout: No input received within 60 seconds.");
      }, this.timeout);
    });

    for (let attempts = 0; attempts < this.maxAttempts; attempts++) {
      try {
        const inputOTP = await Promise.race([timeoutPromise, input.readOTP()]);
        if (inputOTP === this.otp) {
          clearTimeout(timeoutId);
          return STATUS_CODES.STATUS_OTP_OK;
        } else {
          console.log("Incorrect OTP. Please try again.");
        }
      } catch (error) {
        return STATUS_CODES.STATUS_OTP_TIMEOUT;
      } finally {
        input.push(null);
      }
    }
    clearTimeout(timeoutId);
    return STATUS_CODES.STATUS_OTP_FAIL;
  }
}

module.exports = Email_OTP_Module;
module.exports.STATUS_CODES = STATUS_CODES;
