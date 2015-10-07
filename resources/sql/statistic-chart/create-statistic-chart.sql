UPDATE Lecture 
ADD statisticCharts = (
    INSERT INTO StatisticChart
    SET
    chartPoints = :chartPoints,
    timeline = :timeline,
    startTime = :startTime,
    finishTime = :finishTime
)
RETURN AFTER @this.statisticCharts WHERE @rid = :lectureId