UPDATE Question
SET
title = :title,
type = :type,
data = :data
WHERE @rid = :questionId