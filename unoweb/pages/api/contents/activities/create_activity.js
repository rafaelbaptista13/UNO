import { api_server } from "../../../../config";

const createActivity = async (req, res) => {
  const body = JSON.parse(req.body);

  const payload = {
    type: body.type,
    weekcontent_id: body.weekcontent_id,
    title: body.title,
  };

  const url = `${api_server}/activities`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.status !== 200) {
    return res.status(response.status).json({
      error: true
    });
  }

  const results = await response.json();
  
  return res.status(200).json({
    data: results,
  });
};

export default createActivity;
