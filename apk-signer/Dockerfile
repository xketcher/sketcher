FROM eclipse-temurin:17-jdk-jammy

ENV ANDROID_HOME=/android
ENV ANDROID_SDK_ROOT=/android
ENV PATH=$PATH:/android/platform-tools:/android/build-tools/34.0.0

# --------------------
# Install system deps
# --------------------
RUN apt-get update && \
    apt-get install -y python3 python3-pip wget unzip zip && \
    apt-get clean

# --------------------
# Android SDK tools
# --------------------
RUN mkdir -p /android/cmdline-tools && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-10406996_latest.zip && \
    unzip commandlinetools-linux-*.zip -d /android/cmdline-tools && \
    mv /android/cmdline-tools/cmdline-tools /android/cmdline-tools/latest && \
    rm commandlinetools-linux-*.zip

ENV PATH=$PATH:/android/cmdline-tools/latest/bin

# --------------------
# Accept licenses + install build-tools
# --------------------
RUN yes | sdkmanager --licenses && \
    sdkmanager "platform-tools" "build-tools;34.0.0"

# --------------------
# App
# --------------------
WORKDIR /app

COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
