FROM ubuntu:22.04

ENV ANDROID_NDK_VERSION=r26d
ENV ANDROID_NDK_HOME=/opt/android-ndk
ENV PATH=$PATH:$ANDROID_NDK_HOME

RUN apt update && apt install -y \
    wget unzip python3 python3-pip openjdk-17-jdk \
    && rm -rf /var/lib/apt/lists/*

# Download Android NDK
RUN wget https://dl.google.com/android/repository/android-ndk-${ANDROID_NDK_VERSION}-linux.zip \
    && unzip android-ndk-${ANDROID_NDK_VERSION}-linux.zip \
    && mv android-ndk-${ANDROID_NDK_VERSION} ${ANDROID_NDK_HOME} \
    && rm android-ndk-${ANDROID_NDK_VERSION}-linux.zip

# Install python deps
WORKDIR /app
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
