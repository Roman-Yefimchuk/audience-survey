UPDATE Question
SET
text = :text,
type = :type,
data = :data
WHERE @rid = :questionId