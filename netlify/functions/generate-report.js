const { neon } = require("@neondatabase/serverless");
const { buildHistoryAnalytics } = require("../../lib/reportAnalytics");
const { generateResearchReport } = require("../../lib/generateResearchReport");

exports.handler = async function (event) {
  try {
    const id = event.queryStringParameters?.id;

    if (!id) {
      return response(400, { error: "Missing request id" });
    }

    const sql = neon(process.env.DATABASE_URL);

    const request = await sql`
      SELECT * FROM report_requests WHERE id = ${id}
    `;

    if (!request.length) {
      return response(404, { error: "Request not found" });
    }

    const history = await sql`
      SELECT trade_date, open, high, low, close, volume
      FROM stock_history_uploads
      WHERE report_request_id = ${id}
      ORDER BY trade_date ASC
    `;

    const analytics = buildHistoryAnalytics(history);

    const aiReport = await generateResearchReport({
      ticker: request[0].ticker,
      analytics,
    });

    return response(200, {
      report: aiReport,
      analytics,
    });

  } catch (error) {
    return response(500, { error: error.message });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}
