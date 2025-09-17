// RecentMatches.js
import { Box, Card, Avatar, Typography } from "@mui/material";

export default function RecentMatches({ matchesData }) {
  // Backend'den gelen real data kullan, yoksa placeholder göster
  const matches = matchesData && matchesData.length > 0 ? matchesData : [
    { 
      _id: "1", 
      user1: { username: "No matches yet" }, 
      user2: { username: "" }, 
      skill: "Start sharing skills to get matches!" 
    }
  ];

  return (
    <Box>
      <Typography variant="h6" mb={2}>Recent Matches</Typography>
      {matches.map((match, index) => (
        <Card key={match._id || index} sx={{ p:2, mb:2, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <Box>
            <Typography variant="subtitle1">
              {match.user1?.username !== "No matches yet" 
                ? `${match.user1?.username} ↔ ${match.user2?.username}`
                : match.user1?.username
              }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {match.skill || "Skill exchange"}
            </Typography>
          </Box>
          <Avatar sx={{ width:48, height:48, bgcolor: 'primary.main' }}>
            {match.user1?.username?.charAt(0)?.toUpperCase() || "?"}
          </Avatar>
        </Card>
      ))}
    </Box>
  );
}
