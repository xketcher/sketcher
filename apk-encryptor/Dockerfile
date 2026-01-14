FROM maven:3.9.6-eclipse-temurin-17

WORKDIR /app

COPY pom.xml .
COPY libs ./libs
COPY src ./src

RUN mvn -e -X package

EXPOSE 10000
CMD ["java","-jar","target/apkservice-1.0.jar"]
