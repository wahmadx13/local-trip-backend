# Local Trip Backend

NestJS backend starter for `local-trip` with:

- Prisma + PostgreSQL
- Docker Compose inside this backend folder
- Shared config via `.env`
- Shared `common` module and `utils` directory
- Starter `users` module

## Run with Docker

From `local-trip/local-trip-backend`:

```bash
docker compose up
```

To rebuild:

```bash
docker compose up --build
```

URLs:

- API: `http://localhost:3000/api`
- Prisma Studio: `http://localhost:5555`

## Local scripts

```bash
npm install
npm run start:dev
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:migrate:reset
npm run prisma:db:push
npm run prisma:db:pull
npm run prisma:studio
npm run prisma:studio:exposed
```
