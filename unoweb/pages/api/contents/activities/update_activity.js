import { api_server } from "../../../../config";

const updateActivity = async (req, res) => {
  const body = JSON.parse(req.body);

  const payload = {
    type: body.type,
    title: body.title,
  };

  const url = `${api_server}/activities/` + body.activity_id;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.status !== 200) {
    return res.status(response.status).json({
      error: true,
    });
  }

  const results = await response.json();
  
  return res.status(200).json({
    data: results,
  });
};

export default updateActivity;
