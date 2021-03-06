CREATE database plocal:audience_survey admin admin plocal graph

CREATE CLASS ChartPoint
CREATE PROPERTY ChartPoint.timestamp LONG
CREATE PROPERTY ChartPoint.presentListeners LONG
CREATE PROPERTY ChartPoint.understandingPercentage LONG

CREATE CLASS Lecture
CREATE PROPERTY Lecture.name STRING
CREATE PROPERTY Lecture.authorId STRING
CREATE PROPERTY Lecture.author STRING
CREATE PROPERTY Lecture.description STRING
CREATE PROPERTY Lecture.statisticCharts EMBEDDEDLIST STRING
CREATE PROPERTY Lecture.additionalLinks STRING
CREATE PROPERTY Lecture.status STRING

CREATE CLASS Question
CREATE PROPERTY Question.title STRING
CREATE PROPERTY Question.lectureId STRING
CREATE PROPERTY Question.creationDate LONG
CREATE PROPERTY Question.type STRING
CREATE PROPERTY Question.data STRING

CREATE CLASS StatisticChart
CREATE PROPERTY StatisticChart.lectureId STRING
CREATE PROPERTY StatisticChart.chartPoints EMBEDDEDLIST STRING
CREATE PROPERTY StatisticChart.timeline EMBEDDEDLIST STRING
CREATE PROPERTY StatisticChart.totalDuration LONG

CREATE CLASS TimeMarker
CREATE PROPERTY TimeMarker.statisticChartId STRING
CREATE PROPERTY TimeMarker.startTime LONG
CREATE PROPERTY TimeMarker.finishTime LONG
CREATE PROPERTY TimeMarker.status STRING

CREATE CLASS User
CREATE PROPERTY User.role STRING
CREATE PROPERTY User.currentLectureId STRING
CREATE PROPERTY User.userId STRING
CREATE PROPERTY User.genericId STRING
CREATE PROPERTY User.displayName STRING
CREATE PROPERTY User.password STRING
CREATE PROPERTY User.email STRING
CREATE PROPERTY User.token STRING
CREATE PROPERTY User.authorizationProvider STRING
CREATE PROPERTY User.avatarUrl STRING
CREATE PROPERTY User.sex STRING
CREATE PROPERTY User.birthday LONG
CREATE PROPERTY User.registeredDate LONG