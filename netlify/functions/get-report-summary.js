const { neon } = require("@neondatabase/serverless");
const { buildHistoryAnalytics } = require("../../lib/reportAnalytics");

exports.handler = async function handler(event) {
  try {
    if (event.httpMethod !== "GET") {
      return response(405, { error: "Method not allowed." });
    }

    const id = event.queryStringParameters?.id;
    if (!id) {
      return response(400, { error: "Missing report request id." });
    }

    const sql = neon(process.env.DATABASE_URL);

    const requests = await sql`
      SELECT id, ticker, period, status, original_filename, row_count, created_at
      FROM report_requests
      WHERE id = ${id}
      LIMIT 1
    `;

    if (!requests.length) {
      return response(404, { error: "Report request not found." });
    }

    const request = requests[0];

    const history = await sql`
      SELECT trade_date, open, high, low, close, volume
      FROM stock_history_uploads
      WHERE report_request_id = ${id}
      ORDER BY trade_date ASC
    `;

    const analytics = buildHistoryAnalytics(history);

    return response(200, {
      request,
      analytics,
      narrative: {
        headline: `${request.ticker} preliminary quantitative summary`,
        thesis:
          analytics.investmentView,
        targetRange: {
          low: analytics.impliedRangeLow,
          base: analytics.impliedRangeBase,
          high: analytics.impliedRangeHigh,
        },
      },
    });
  } catch (error) {
    return response(500, { error: error.message || "Server error." });
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
