import { api_server } from "../../../../config";

const deleteActivity = async (req, res) => {
  const body = JSON.parse(req.body);
  const id = body.activity_id;

  const payload = {
    weekcontent_id: body.weekcontent_id
  };

  const url = `${api_server}/activities/` + id;
  
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.status !== 200) {
    return res.status(response.status);
  }

  const results = await response.json();
  console.log(results);
  return res.status(200).json({
    data: results,
  });
};

export default deleteActivity;
