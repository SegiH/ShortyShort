# Shorty Short

ShortyShort is a self-hosted URL Shortening service.

The generated short URLs are shown with a link and a QR code.

The goal of this project is to have a private self hosted URL shortening service that is private, very small and fast.

ShortyShort is ~5MB for both the front end client and API and ~125MB in Docker.

## Running ShortyShort

1. Go to Web folder.
1. If you are using Linux/Unix, run `npm run run-unix`.
1. If you are on Windows run `npm run run-windows`.
1. Visit [this link](http://localhost:8080) in your browser.

## Installing ShortyShort

1. Go to Web folder.
1. If you are using Linux/Unix, run 'chmod +x ../buildShortyShort.sh`
1. If you are using Linux/Unix, run `npm run build-unix`.
1. If you are on Windows run `npm run build-windows`.
1. If you want to build a Docker container, add the parameter --docker. You will need to edit the file docker-compose.yml first and adjust it to your needs. 
1. If you do not want to build a Docker container, you can copy the contents of the output folder to your web server.

When ShortyShort ShortCodes expire, they are automatically marked as inactive.

ShortyShort keeps analytics about how many times a short code was used. For privacy reason, the only information that is saved is the time stamp that the short code was accessed at. It is possible to save more information by enabling advanced analytics.

## Configuration

There are options that you can customize in API\.env

Any time you make changes to .env, you have to restart the aopplication to make it take effect.

ADMIN_ENABLED: If you set this to true, it enabled the admin dashboard. You can navigate to /admin and view the existing ShortyShort short codes. The Admin dashboard allow allows you to activate or deactivate a short code or change the expiration date of a short code.

ADMIN_PASSWORD: If ADMIN_ENABLED is true, you must set a password that will be used to access the password admin. The admin allows you yo activate or deactivate ShortyShort codes.

ADVANCED_ANALYTICS: If you set this to true, when a short code is used, the user agent is also saved. There may be additional analytics saved in the future.

ALLOW_DUPLICATES: If you set this to true, when a short code is created, if the URL already exists, then the existing short url will be returned. If it is false, a new ShortyShort short code will be created even if the URL already exists. This is false by default for privacy reasons.

BASE_URL: The base URL used to construct a short URL in the format BASE_URL/short/shortcode.

SHORTCODE_LENGTH: The length of the short code. The default is 4 characters long. The guide below shows how many different combinations there are for each length:

3: 238K
4: 15M
5: 916M
6: 56B

Do not edit database.json while ShortyShort is running or it will cause unpredictable behavior