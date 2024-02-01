const Email_OTP_Module = require("./Email_OTP_Module");
const { STATUS_CODES } = require("./Email_OTP_Module");

describe("Email_OTP_Module", () => {
  describe("generate_OTP_email", () => {
    it("should return email address is invalid if email is empty", async () => {
      const module = new Email_OTP_Module();
      const result = await module.generate_OTP_email("");
      expect(result).toEqual(STATUS_CODES.STATUS_EMAIL_INVALID);
    });
    it("should return email address is invalid if email is not in email format", async () => {
      const module = new Email_OTP_Module();
      const result = await module.generate_OTP_email("test@test");
      expect(result).toEqual(STATUS_CODES.STATUS_EMAIL_INVALID);
    });
    it("should return email address is invalid if email is not from the approved domains", async () => {
      const module = new Email_OTP_Module();
      const result = await module.generate_OTP_email("test@test.com");
      expect(result).toEqual(STATUS_CODES.STATUS_EMAIL_INVALID);
    });
    it("should return email sending failed", async () => {
      const module = new Email_OTP_Module();
      jest.spyOn(module, "send_email").mockRejectedValue(new Error());
      const result = await module.generate_OTP_email("test@dso.org.sg");
      expect(result).toEqual(STATUS_CODES.STATUS_EMAIL_FAIL);
    });
    it("should return email containing OTP has been sent successfully", async () => {
      const module = new Email_OTP_Module();
      jest.spyOn(module, "send_email").mockResolvedValue({});
      const result = await module.generate_OTP_email("test@dso.org.sg");
      expect(result).toEqual(STATUS_CODES.STATUS_EMAIL_OK);
      expect(module.send_email).toHaveBeenCalledWith(
        "test@dso.org.sg",
        `Your OTP is ${module.otp}. The code is valid for 1 minute`
      );
    });
  });

  describe("check_OTP", () => {
    it("should return STATUS_NO_OTP message", async () => {
      const module = new Email_OTP_Module();
      const input = { readOTP: jest.fn().mockResolvedValue("123456") };
      const result = await module.check_OTP(input);
      expect(result).toEqual(STATUS_CODES.STATUS_NO_OTP);
    });
    it("should return STATUS_OTP_TIMEOUT", async () => {
      jest.useFakeTimers();
      const module = new Email_OTP_Module();
      module.otp = "123456";
      const input = { readOTP: jest.fn(), push: jest.fn() };
      const resultPromise = module.check_OTP(input);
      jest.advanceTimersByTime(60001);
      const result = await resultPromise;
      expect(result).toEqual(STATUS_CODES.STATUS_OTP_TIMEOUT);
      jest.useRealTimers();
    });
    it("should return STATUS_OTP_FAIL", async () => {
      const module = new Email_OTP_Module();
      module.otp = "123456";
      const input = { readOTP: jest.fn(), push: jest.fn() };
      const result = await module.check_OTP(input);
      expect(result).toEqual(STATUS_CODES.STATUS_OTP_FAIL);
      expect(input.readOTP).toHaveBeenCalledTimes(10);
    });
    it("should return STATUS_OTP_OK", async () => {
      const module = new Email_OTP_Module();
      module.otp = "123456";
      const input = {
        readOTP: jest.fn().mockResolvedValue("123456"),
        push: jest.fn(),
      };
      const resultPromise = module.check_OTP(input);
      const result = await resultPromise;
      expect(result).toEqual(STATUS_CODES.STATUS_OTP_OK);
    });
  });
});
