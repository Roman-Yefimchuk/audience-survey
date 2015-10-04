SELECT *
FROM Lecture
WHERE @rid = :lectureId
FETCHPLAN "*:-1 statisticCharts:-2 questions:-2"