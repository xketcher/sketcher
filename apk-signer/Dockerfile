FROM eclipse-temurin:17-jdk-jammy

# system tools
RUN apt-get update && \
    apt-get install -y python3 python3-pip wget unzip zip && \
    apt-get clean

# Android command line tools (apksigner)
RUN wget https://dl.google.com/android/repository/commandlinetools-linux-10406996_latest.zip && \
    unzip commandlinetools-linux-*.zip -d /android && \
    rm commandlinetools-linux-*.zip

ENV ANDROID_HOME=/android
ENV PATH=$PATH:/android/cmdline-tools/bin:/android/platform-tools

WORKDIR /app

COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
