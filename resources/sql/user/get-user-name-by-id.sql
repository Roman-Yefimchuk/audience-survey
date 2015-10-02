SELECT @this.name[0] as name
FROM (
  SELECT $profile.name as name
  LET $profile = (
    SELECT expand(profile)
    FROM User
    WHERE @rid = :userId
  )
)