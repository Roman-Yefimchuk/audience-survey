CREATE database plocal:audience_survey admin admin plocal graph

CREATE CLASS Profile
CREATE PROPERTY Profile.name STRING
CREATE PROPERTY Profile.passwordHash STRING
CREATE PROPERTY Profile.email STRING
CREATE PROPERTY Profile.isEmailVerified BOOLEAN
CREATE PROPERTY Profile.authorizationProvider STRING

CREATE CLASS User
CREATE PROPERTY User.genericId STRING
CREATE PROPERTY User.rating FLOAT
CREATE PROPERTY User.registeredDate LONG
CREATE PROPERTY User.profile LINK Profile
CREATE PROPERTY User.role STRING

CREATE CLASS Question
CREATE PROPERTY Question.title STRING
CREATE PROPERTY Question.creationDate LONG
CREATE PROPERTY Question.type STRING
CREATE PROPERTY Question.data STRING

CREATE CLASS Link
CREATE PROPERTY Link.title STRING
CREATE PROPERTY Link.url STRING

CREATE CLASS TimeMarker
CREATE PROPERTY TimeMarker.startTime LONG
CREATE PROPERTY TimeMarker.finishTime LONG
CREATE PROPERTY TimeMarker.status STRING

CREATE CLASS ChartPoint
CREATE PROPERTY ChartPoint.timestamp LONG
CREATE PROPERTY ChartPoint.presentListeners INTEGER
CREATE PROPERTY ChartPoint.understandingPercentage INTEGER

CREATE CLASS StatisticChart
CREATE PROPERTY StatisticChart.chartPoints LINKLIST ChartPoint
CREATE PROPERTY StatisticChart.timeline LINKLIST TimeMarker
CREATE PROPERTY StatisticChart.startTime LONG
CREATE PROPERTY StatisticChart.finishTime LONG

CREATE CLASS Lecture
CREATE PROPERTY Lecture.name STRING
CREATE PROPERTY Lecture.creationDate LONG
CREATE PROPERTY Lecture.lecturer LINK User
CREATE PROPERTY Lecture.description STRING
CREATE PROPERTY Lecture.statisticCharts LINKLIST StatisticChart
CREATE PROPERTY Lecture.links LINKLIST Link
CREATE PROPERTY Lecture.questions LINKLIST Question

CREATE CLASS AuthSession
CREATE PROPERTY AuthSession.token STRING
CREATE PROPERTY AuthSession.userId STRING
CREATE PROPERTY AuthSession.userRole STRING
CREATE PROPERTY AuthSession.expirationDate LONG