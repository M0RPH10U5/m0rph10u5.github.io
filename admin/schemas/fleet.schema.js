export const FleetSchema = {
  type: "list",

  root: {
    type: "array",
    required: true,

    items: {
      type: "object",
      required: ["name", "manufacturer", "role"],

      shape: {
        name: {
          type: "string",
          required: true
        },

        manufacturer: {
          type: "string",
          required: true
        },

        role: {
          type: "string",
          required: true
        }
      }
    }
  }
};
