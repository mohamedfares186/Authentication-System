// Tells jest to use nodemailer-mock instead of nodemailer 
jest.mock("nodemailer", () => ({
  createTransport: require("nodemailer-mock").createTransport
}));