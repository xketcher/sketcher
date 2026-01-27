FROM eclipse-temurin:11-jdk-jammy

# --------------------
# ENV
# --------------------
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV GRADLE_HOME=/opt/gradle
ENV PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$GRADLE_HOME/bin

# --------------------
# System deps + Python
# --------------------
RUN apt-get update && apt-get install -y \
    wget unzip curl git \
    python3 python3-pip \
    libc6 libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# --------------------
# Install Gradle 7.4.2
# --------------------
WORKDIR /opt
RUN wget https://services.gradle.org/distributions/gradle-7.4.2-bin.zip && \
    unzip gradle-7.4.2-bin.zip && \
    rm gradle-7.4.2-bin.zip && \
    mv gradle-7.4.2 gradle

# --------------------
# Android SDK
# --------------------
RUN mkdir -p /opt/android-sdk/cmdline-tools
WORKDIR /opt/android-sdk/cmdline-tools

RUN wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && \
    unzip commandlinetools-linux-*.zip && \
    rm commandlinetools-linux-*.zip && \
    mv cmdline-tools latest

RUN yes | sdkmanager --licenses

RUN sdkmanager \
    "platform-tools" \
    "platforms;android-33" \
    "build-tools;33.0.2"

# --------------------
# App
# --------------------
WORKDIR /app
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
