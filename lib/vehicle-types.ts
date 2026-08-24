// Pure, client-safe constant. app/actions/driver-application.ts has
// "use server" at the top, and a "use server" file's exports are ALL
// treated as async Server Actions to be proxied for client use — a
// plain array export like this one can't be proxied that way, which is
// what broke the /drive build ("r.map is not a function": the client
// bundle got a broken stand-in instead of the real array). Both the
// action file (for its own validation) and the /drive page (for the
// vehicle-type Select) import the list from here instead.
export const VEHICLE_TYPES = ["Bicycle", "Motorcycle", "Car", "On Foot"] as const;
