UPDATE Lecture 
ADD questions = (
    INSERT INTO Question
    SET
    text = :text,
    creationDate = :creationDate,
    type = :type,
    data = :data
)
RETURN AFTER @this.questions WHERE @rid = :lectureId