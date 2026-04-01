# Initialize backend — Briva Diena

This document contains exact, PowerShell-ready steps to initialize the backend for the Briva Diena project using:

- Build tool: Maven
- Java: 21
- Database: MariaDB running in Docker Desktop
- Image storage: local filesystem
- Migrations: Flyway

Prerequisites (locally)

- Java 21 installed and on PATH (java -version should show 21)
- Maven installed (mvn -v)
- Docker Desktop running and Docker CLI available
- PowerShell (you already have it on Windows)

Overview of steps

1. Create `backend/` directory and download Spring Boot starter (Maven) configured for Java 21
2. Add MariaDB JDBC dependency and Flyway is already included from the starter
3. Add Docker Compose file to run MariaDB locally
4. Add application configuration (application.yml) with datasource placeholders
5. Add Flyway initial migration SQL (V1\_\_initial_schema.sql)
6. Create `uploads/` directory for images and configure Spring to serve it as static resources
7. Create initial JPA entities/repositories/controllers (sketch below)
8. Build and run the app locally, verify DB connectivity and static image serving

PowerShell commands — scaffold the starter
Run these commands from the repo root `c:\Users\marti\Desktop\briva-diena\briva-diena`.

```powershell
# 1) create backend directory
mkdir .\backend
cd .\backend

# 2) download Spring Boot starter (Maven) configured for Java 21
$uri = "https://start.spring.io/starter.zip?type=maven-project&language=java&bootVersion=3.2.0&groupId=lv.brivadiena&artifactId=backend&name=backend&description=Brivadiena%20backend&packageName=lv.brivadiena.backend&javaVersion=21&dependencies=web,data-jpa,flyway,mail"
Invoke-WebRequest -Uri $uri -OutFile backend.zip
Expand-Archive backend.zip -DestinationPath .\
Remove-Item backend.zip

# return to repo root
cd ..\
```

Notes:

- The `bootVersion=3.2.0` parameter is an example; `start.spring.io` will accept newer stable versions. If you prefer a different Boot version, adjust that query param.

Add MariaDB JDBC dependency
Open `backend/pom.xml` and add the MariaDB JDBC dependency inside `<dependencies>` if not already present:

```xml
<dependency>
  <groupId>org.mariadb.jdbc</groupId>
  <artifactId>mariadb-java-client</artifactId>
  <version>3.1.4</version>
</dependency>
```

Add Docker Compose for MariaDB (create file `docker-compose.yml` at repo root)

Create `docker-compose.yml` with the following content (place at project root or in `backend/`, here we put it in `backend/`):

```yaml
version: "3.8"
services:
  mariadb:
    image: mariadb:11
    restart: unless-stopped
    environment:
      MARIADB_ROOT_PASSWORD: example-root-pw
      MARIADB_DATABASE: briva
      MARIADB_USER: briva_user
      MARIADB_PASSWORD: briva_pass
    ports:
      - "3307:3306" # map host 3307 -> container 3306 to avoid conflicts
    volumes:
      - mariadb_data:/var/lib/mysql

volumes:
  mariadb_data:
```

PowerShell commands to start MariaDB in Docker Desktop

```powershell
cd .\backend
docker compose up -d

# confirm container running
docker ps --filter "name=mariadb"
```

Sample Spring Boot configuration (`backend/src/main/resources/application.yml`)

Create or replace `application.yml` with the following (using environment variables in production):

```yaml
spring:
  datasource:
    url: jdbc:mariadb://localhost:3307/briva
    username: briva_user
    password: briva_pass
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        format_sql: true
  flyway:
    enabled: true

server:
  port: 8080

app:
  uploads-path: ./uploads

stripe:
  secret-key: ${STRIPE_SECRET:}
  webhook-secret: ${STRIPE_WEBHOOK_SECRET:}

mail:
  from: no-reply@brivadiena.lv
```

Flyway initial migration
Create directory `backend/src/main/resources/db/migration` and add `V1__initial_schema.sql` with this content (MariaDB-compatible SQL):

```sql
CREATE TABLE trips (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price_cents BIGINT NOT NULL,
  currency VARCHAR(3) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trip_images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  trip_id BIGINT,
  path VARCHAR(1024),
  is_background BOOLEAN DEFAULT false,
  sort_order INT,
  CONSTRAINT fk_trip FOREIGN KEY (trip_id) REFERENCES trips(id)
);

CREATE TABLE orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  trip_id BIGINT,
  buyer_email VARCHAR(512) NOT NULL,
  amount_cents BIGINT NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(32) DEFAULT 'PENDING',
  payment_provider_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_trip FOREIGN KEY (trip_id) REFERENCES trips(id)
);

CREATE TABLE payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT,
  provider VARCHAR(32),
  provider_payment_id VARCHAR(255),
  status VARCHAR(32),
  received_at TIMESTAMP,
  CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

Static uploads directory (local images)

Create uploads folder where dev images will live and be served by Spring Boot:

```powershell
cd .\backend
mkdir uploads
# add a simple placeholder so Git will track the folder
New-Item -Path .\backend\uploads\README.txt -ItemType File -Value "Local uploads folder (dev). Place images here."
```

Configure Spring to serve `uploads/` as static resources

In your Spring Boot application (a @Configuration class), add a resource handler mapping. Example (Java):

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${app.uploads-path}")
    private String uploadsPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDir = Paths.get(uploadsPath).toAbsolutePath();
        String uploadPath = "file:" + uploadDir.toString() + "/";
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath);
    }
}
```

This will make images available under `http://localhost:8080/uploads/<filename>`.

Initial entities / repositories / controllers (sketch)

- Entities: `Trip`, `TripImage`, `Order`, `Payment` under `lv.brivadiena.backend.model`
- Repositories: `TripRepository extends JpaRepository<Trip, Long>` and similar
- Controllers:
  - `GET /api/trips` -> list trips
  - `GET /api/trips/{id}` -> trip details (+ image paths)
  - `GET /api/images/background` -> return list of `/uploads/...` URLs marked as background
  - `POST /api/orders` -> { tripId, buyerEmail } create Order row and return order id (later create Stripe session)

Build and run locally

```powershell
cd .\backend
# build
mvn -DskipTests package

# run (ensure docker mariadb is up)
mvn spring-boot:run

# open http://localhost:8080/api/trips (after you implement the controller)
```

How to verify DB and Flyway

- With MariaDB running (docker compose up -d), Flyway will attempt to apply V1 on application startup. Check logs to confirm migrations ran.
- You can also connect with a DB client to `localhost:3307` using the credentials in `docker-compose.yml`.
