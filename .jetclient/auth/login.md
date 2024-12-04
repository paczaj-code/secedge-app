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
  "email": "patryk.broda@example.com",
  "password": "Pass@123"
}'''
```
