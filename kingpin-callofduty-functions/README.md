# kingpin api

Api to manage all external 

### Local Development

Create a `.env` file at src/.env and add the values as per `.env.example`

Start a local server

Requires installation of [pipenv](https://pypi.org/project/pipenv/) and [gcloud](https://cloud.google.com/sdk/docs)

```bash
$ ./manage install
$ pipenv shell
$ ./manage serve
```

### Deployment

Deploy to Google Cloud
```bash
$ ./manage deploy
```
