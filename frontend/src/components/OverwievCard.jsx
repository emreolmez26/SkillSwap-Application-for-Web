// OverviewCards.js
import { Box, Card, Typography } from "@mui/material";

export default function OverviewCards({ userData, matchesData }) {
  const data = [
    { title: "Skills Shared", value: userData?.skillsToTeach?.length || 0 },
    { title: "Skills Learned", value: userData?.skillsToLearn?.length || 0 },
    { title: "Matches", value: matchesData?.length || 0 },
  ];

  return (
    <Box display="flex" gap={3} mb={4}>
      {data.map((item) => (
        <Card key={item.title} sx={{ p:3, flex:1 }}>
          <Typography variant="h6">{item.title}</Typography>
          <Typography variant="h4" mt={1}>{item.value}</Typography>
        </Card>
      ))}
    </Box>
  );
}
