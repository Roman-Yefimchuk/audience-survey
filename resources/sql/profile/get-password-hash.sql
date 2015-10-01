SELECT profile.passwordHash AS passwordHash
FROM User
WHERE @rid = :userId