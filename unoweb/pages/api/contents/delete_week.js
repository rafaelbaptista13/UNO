import { api_server } from "../../../config";

const deleteWeek = async (req, res) => {
  const body = JSON.parse(req.body);
  const id = body.week_id;

  const url = `${api_server}/contents/weeks/` + id;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status !== 200) {
    return res.status(response.status).json({
      error: true
    });
  }

  const results = await response.json();
  console.log(results);
  return res.status(200).json({
    data: results.data,
  });
};

export default deleteWeek;
