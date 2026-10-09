export const appConfig = {
  name: "QUBE",
  fullName: "Quota Business Environment",
  environment: process.env.NEXT_PUBLIC_APP_ENV ?? "LOCAL_DEV",
  version: process.env.NEXT_PUBLIC_APP_VERSION ?? "2.0.0",
}

// TODO: replace with the authenticated user from the session.
export const mockUser = {
  firstName: "Dheeraj",
  lastName: "Naguru",
  email: "dheeraj.naguru@verizon.com",
  role: "Administrator",
}
