import { api_server } from "../../../config";

const createWeek = async (req, res) => {
  const body = JSON.parse(req.body);

  const payload = {
    number_of_videos: body.number_of_videos,
    number_of_exercises: body.number_of_exercises,
  };

  const url = `${api_server}/contents/weeks`;

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

export default createWeek;
