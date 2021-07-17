SELECT *
FROM User
WHERE @rid = :userId
FETCHPLAN *:-1
