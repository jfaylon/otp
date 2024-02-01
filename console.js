const { Readable } = require("stream");
const readline = require("readline");
class OTPReaderStream extends Readable {
  constructor() {
    super();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    this.rl.on("line", (line) => {
      this.push(line);
    });

    this.rl.on("close", () => {
      this.push(null);
    });
  }

  _read(size) {}

  async readOTP() {
    console.log("Please input the OTP:");
    return new Promise((resolve) => {
      this.rl.once("line", (line) => {
        resolve(line.trim());
      });
    });
  }
}

const main = async () => {
  const Email_OTP_Module = require("./Email_OTP_Module");
  const module = new Email_OTP_Module();

  console.log(await module.generate_OTP_email("test@dso.org.sg"));
  // added console.log to retrieve the OTP. This should be disabled when send_email is actually implemented
  console.log(module);
  const readerStream = new OTPReaderStream();
  console.log(await module.check_OTP(readerStream));
  process.exit(0);
};

main();
