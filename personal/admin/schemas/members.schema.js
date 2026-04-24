export const MembersSchema = {
  type: "list",

  root: {
    type: "array",
    required: true,

    items: {
      type: "object",
      required: ["name", "role"],

      shape: {
        name: {
          type: "string",
          required: true
        },

        "sc-name": {
          type: "string",
          required: false
        },

        role: {
          type: "string",
          required: true
        },

        specialty: {
          type: "string",
          required: false
        },

        ship: {
          type: "string",
          required: false
        }
      }
    }
  }
};
