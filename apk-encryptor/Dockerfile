FROM maven:3.9.6-eclipse-temurin-17

WORKDIR /app

COPY pom.xml .
COPY src src
COPY libs libs
COPY resources resources

RUN mvn package

EXPOSE 10000
CMD ["java","-jar","target/apkservice-1.0.jar"]
