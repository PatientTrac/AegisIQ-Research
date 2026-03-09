const { neon } = require("@neondatabase/serverless");

exports.handler = async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return response(405, { error: "Method not allowed" });
    }

    const sql = neon(process.env.DATABASE_URL);

    const ticker = "UNKNOWN";
    const period = "UNKNOWN";

    const result = await sql`
      INSERT INTO report_requests (ticker, period, status)
      VALUES (${ticker}, ${period}, 'pending')
      RETURNING id
    `;

    return response(200, {
      message: "Report request saved",
      requestId: result[0].id
    });

  } catch (error) {
    return response(500, { error: error.message });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}
