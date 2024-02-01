
# OTP Module

## Prerequisites
- Node v20.11.0

## Installation

If you need to run the unit tests
```
npm install
```

## Running the Console application

```
npm run start
```

## Using it as a class Library or Module
- Import the `Email_OTP_Module.js` file

## Unit tests
```
npm run test
```

## Assumptions
- Node v20.11.0 is used. There is no guarantee that the code will work on other versions.
- The `send_email` functionality is assumed implemented so it is left blank.
- for Node.js, the IOStream is a `Readable` Stream with `readOTP` as a function. It can be extended to use other streams such as `process.stdin` or other ways of input such as `socket.io`
- Internal functions are exposed for unit testing purposes.
- Basic Email Address validation and domain check is implemented. If allowed, validation libraries such as `validator` will be installed.

## Possible Improvements
- Configurable timeouts, domains, and attempts
