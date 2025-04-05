```toml
name = 'login'
method = 'POST'
url = 'http://localhost:3000/api/auth/login'
sortWeight = 1000000
id = '5d328c2f-0328-4024-ba7b-cfeb1b9f7550'

[body]
type = 'JSON'
raw = '''
{
  "email": "filip.maslowski@example.com",
  "password": "pass"
}'''
```

### Example

```toml
name = 'New Example'
id = '7a15dbe5-e2f5-4acd-8e28-7cb246e1f23c'

[body]
type = 'JSON'
raw = '''
{
  "email": "alfred.turek@example.com",
  "password": "Pass@123"
}'''
```

### Example

```toml
name = 'SHIFT_SUPERVISOR'
id = 'bc419f52-2d51-407f-a166-7cf118c7484a'

[body]
type = 'JSON'
raw = '''
{
  "email": "barbara.gorny@example.com",
  "password": "Pass@123"
}'''
```

### Example

```toml
name = 'TEAM_LEADER'
id = 'd44804c0-e4ac-4b37-9155-e42da1505218'

[body]
type = 'JSON'
raw = '''
{
  "email": "ksenia.krzeminski@example.com",
  "password": "Pass@123"
}'''
```
