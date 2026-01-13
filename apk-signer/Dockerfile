FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# System dependencies
RUN apt update && apt install -y \
    openjdk-17-jdk \
    wget \
    unzip \
    zipalign \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Android Build Tools (apksigner)
RUN mkdir -p /opt/android-sdk && \
    wget https://dl.google.com/android/repository/build-tools_r34-linux.zip && \
    unzip build-tools_r34-linux.zip -d /opt/android-sdk && \
    rm build-tools_r34-linux.zip

ENV PATH="/opt/android-sdk/android-14:${PATH}"

WORKDIR /app

COPY requirements.txt .
RUN pip3 install -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
