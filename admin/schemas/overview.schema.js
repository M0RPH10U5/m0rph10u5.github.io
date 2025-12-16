export const OverviewSchema = {
  type: "list",

  root: {
    type: "array",
    required: true,

    items: {
      type: "object",
      required: ["title", "content"],

      shape: {
        title: {
          type: "string",
          required: true
        },
        content: {
          type: "string",
          required: true
        }
      }
    }
  }
};
