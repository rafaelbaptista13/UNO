# UNO — Deployment Manual

Source: https://github.com/rafaelbaptista13/UNO

## 1. Deployment architecture

This manual describes how to deploy UNO on one Linux server. It assumes that the original domain and application path are available for the new deployment:

```text
https://deti-viola.ua.pt/rb-md-violuno-app-v1
```

Once deployed, the web application can be accessed from multiple browsers and the mobile application from multiple Android devices.

```text
Browsers / Android
        |
      HTTPS
        |
      nginx
      /    \
 Next.js   Node.js API
               |
             MySQL
             /   \
           S3    SNS/FCM
```

## 2. Requirements

- Linux server
- `deti-viola.ua.pt` pointing to the server
- TLS certificate for that domain
- Git, Docker Engine, and Docker Compose
- Optional AWS/Firebase accounts for media and notifications

Clone the project on the server:

```bash
git clone https://github.com/rafaelbaptista13/UNO.git
cd UNO
```

The production URLs are already configured for this domain and do not need to be changed.

## 3. TLS configuration

The original nginx configuration expects these TLS files:

```text
/etc/nginx/ssl/cert.pem
/etc/nginx/ssl/no_passphrase_key.pem
```

Place the domain certificate and private key at those locations.

## 4. Environment variables

Create `.env` beside `docker-compose.yml`:

```env
MYSQL_ROOT_PASSWORD=password
MYSQL_DATABASE=uno
MYSQL_USER=uno
MYSQL_PASSWORD=password

ADMIN_PASSWORD=AdminChangeMe123
JWT_SECRET=replace-with-a-random-string
NODE_ENV=production

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=eu-west-1
AWS_SNS_PLATFORM_APP_ARN=
```

The first API start creates an administrator:

- email: `admin`
- password: the `ADMIN_PASSWORD` value

## 5. Docker Compose

Use the existing `docker-compose.yml`, with these changes:

1. In `api`, replace the old `image:` with `build: ./UNOServer`.
2. In `webapp`, replace the old `image:` with `build: ./unoweb`.
3. Keep the existing `db`, `nginx`, environment variables, health check, and network.

## 6. Deploy

Build and start the services:

```bash
docker compose up -d --build
docker compose ps
```

Open:

```text
https://deti-viola.ua.pt/rb-md-violuno-app-v1
```

The Android release configuration already points to:

```text
https://deti-viola.ua.pt/rb-md-violuno-app-v1/internal-api/api/
```

Build the Android APK in Android Studio and install it on each device. A Firebase `google-services.json` is required under `UNOMobile/app/`.

## 7. Media storage

Media upload and playback require S3. The bucket name `violuno` is hardcoded in the API controllers.

1. Create or recover an S3 bucket named `violuno`.
2. Create an IAM access key with object read/write permission.
3. Add the key, secret, and region to `.env`.
4. Restart the API:

```bash
docker compose up -d --build api
```

If the name `violuno` is unavailable, replace it in the activity and support-material controllers before building.

## 8. Notifications

Notifications require Firebase FCM and AWS SNS:

1. Create a Firebase project for package `com.example.unomobile`.
2. Download `google-services.json` to `UNOMobile/app/`.
3. Create an Android/GCM platform application in AWS SNS.
4. Add its ARN and AWS credentials to `.env`.
5. Rebuild/restart the API.

Without SNS, student registration fails while creating its notification topic. To run without notifications, change `signupStudent` in `UNOServer/app/controllers/auth.controller.js` to skip `req.sns.createTopic(...)` when `AWS_SNS_PLATFORM_APP_ARN` is empty and return the normal success response.

## 9. Basic monitoring

Check the containers:

```bash
docker compose ps
```

View recent logs:

```bash
docker compose logs --tail=100 nginx
docker compose logs --tail=100 webapp
docker compose logs --tail=100 api
docker compose logs --tail=100 db
```

Follow application logs:

```bash
docker compose logs -f api webapp
```

Restart a service when necessary:

```bash
docker compose restart api
docker compose restart webapp
```

Verify after deployment:

- the public URL opens from more than one device
- administrator/teacher login works
- a class can be created
- Android devices can register and load activities
- media works if S3 is configured
- notifications work if SNS/FCM is configured
