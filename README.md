## Description

Node version: 18.17.0

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Swagger

While running the server,

```url
http://localhost:3000/api
```

## API

<table>
<tr>
<td> Method </td> <td> Endpoint </td> <td> Description </td> <td> Request Body </td> <td> Response </td>
</tr>
<tr>
<td> POST </td>
<td>

```url
/auth/login
```

</td>
<td> login to get JWT </td>
<td>

```json
{
  "name": "test123",
  "password": "test1234"
},
```

</td>

<td>

```json
{
  "access_token": "string"
}
```

</td>

</tr>
<tr>
<td> GET </td>
<td>

```url
/user
```

</td>
<td> get all users </td>
<td>
</td>
<td>

```json
[
  {
    "id": "473dff46-8eb1-4bc4-811c-163201db294d",
    "name": "test123",
    "email": "test@example.com",
    "password": "$2b$10$LJBJ5U6yYeflRVJn4VaDGO/D7HBZqQ5bVVXwm5uzT2mcs9IY/bUsm"
  },
  {
    "id": "4becb117-6fe4-4e9c-9a16-d645768ffc3c	",
    "name": "test1234",
    "email": "test@example.com",
    "password": "$2b$10$LNBYxj3e0St2p1OmCj/EouKh8yYwt55K48kAbBA4U5.Zrg6e5OMb2"
  }
]
```

</td>

</tr>
<td> GET </td>
<td>

```url
/user/{id}
```

</td>
<td> get user by id </td>
<td>  </td>
<td>

```json
{
  "id": "473dff46-8eb1-4bc4-811c-163201db294d",
  "name": "test123",
  "email": "test@example.com",
  "password": "$2b$10$LJBJ5U6yYeflRVJn4VaDGO/D7HBZqQ5bVVXwm5uzT2mcs9IY/bUsm"
}
```

</td>

</tr>
<td> POST </td>
<td>

```url
/user
```

</td>
<td>create new user </td>
<td>

```json
{
  "name": "test1234",
  "email": "test1234@example.com",
  "password": "test1234"
}
```

</td>
<td>

```json
{
  "id": "473dff46-8eb1-4bc4-811c-163201db294d",
  "name": "test1234",
  "email": "test1234@example.com"
}
```

</td>

</tr>
<td> PATCH </td>
<td>

```url
/user/{id}
```

</td>
<td> update user info </td>
<td>

```json
{
  "name": "test1234",
  "email": "test1234@example.com",
  "password": "test1234"
}
```

</td>

<td>

```json
{
  "id": "473dff46-8eb1-4bc4-811c-163201db294d",
  "name": "test1234",
  "email": "test1234@example.com"
}
```

</td>

</tr>

</tr>
<td> DELETE </td>
<td>

```url
/user/{id}
```

</td>
<td> delete a user</td>
<td>
</td>

<td>

```json
{
  "affected": 0
}
```

</td>

</tr>
</table>
