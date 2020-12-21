import { saveSummoners } from "../../../../../backend/dynamodb";
import { RIOT_API_KEY } from "../../../../../backend/secrets";
import { regionToPlatform } from "../../../../../components/regions";

export default async (req, res) => {
  const { ladder, region } = req.query;

  const result = await fetch(`https://${regionToPlatform(region)}.api.riotgames.com/tft/league/v1/${ladder}`, {
    headers: { "X-Riot-Token": RIOT_API_KEY },
  });

  const json = await result.json();

  const leaderboard = json.entries
    .sort((a, b) => b.leaguePoints - a.leaguePoints)
    .map((item, index) => ({ ...item, tier: ladder.toUpperCase(), rank: "I", position: index + 1 }));

  await saveSummoners(region, leaderboard);

  // await ddb
  //   .batchWriteItem({
  //     RequestItems: {
  //       tft: [
  //         {
  //           PutRequest: {
  //             Item: {
  //               partition_key: { S: `r:${region}-tier:challenger` },
  //               created_at: { S: "123" },
  //               leaderboard: { L: leaderboard.map((item) => ({ M: item.PutRequest.Item })) },
  //             },
  //           },
  //         },
  //       ],
  //     },
  //   })
  //   .promise();

  res.statusCode = 200;
  res.json({ message: "success" });
};